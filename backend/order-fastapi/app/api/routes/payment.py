from datetime import datetime
import hashlib
import hmac
import urllib.parse
from fastapi import APIRouter, HTTPException, Request, Response, BackgroundTasks
from fastapi.responses import RedirectResponse
from app.services.email_client import email_client
from app.api.deps import SessionDep
from app.core.config import settings
from app.models.order import Order
from pydantic import BaseModel

router = APIRouter(tags=["payment"])

class VNPayCreateRequest(BaseModel):
    order_id: int
    amount: float
    ip_addr: str = "127.0.0.1"
    order_info: str = "Thanh toan don hang"

def generate_vnpay_url(
    order_id: str,
    amount: float,
    ip_addr: str,
    order_info: str
) -> str:
    vnp_TmnCode = settings.VNPAY_TMN_CODE
    vnp_HashSecret = settings.VNPAY_HASH_SECRET
    vnp_ReturnUrl = settings.VNPAY_RETURN_URL
    vnp_Url = settings.VNPAY_PAYMENT_URL

    vnp_TxnRef = str(order_id)
    vnp_OrderInfo = order_info
    vnp_OrderType = "billpayment"
    vnp_Amount = int(amount * 100) # VNPay amount format
    vnp_Locale = "vn"
    vnp_CreateDate = datetime.now().strftime('%Y%m%d%H%M%S')
    vnp_IpAddr = ip_addr

    vnpay_data = {
        "vnp_Version": "2.1.0",
        "vnp_Command": "pay",
        "vnp_TmnCode": vnp_TmnCode,
        "vnp_Amount": str(vnp_Amount),
        "vnp_CurrCode": "VND",
        "vnp_TxnRef": vnp_TxnRef,
        "vnp_OrderInfo": vnp_OrderInfo,
        "vnp_OrderType": vnp_OrderType,
        "vnp_Locale": vnp_Locale,
        "vnp_CreateDate": vnp_CreateDate,
        "vnp_IpAddr": vnp_IpAddr,
        "vnp_ReturnUrl": vnp_ReturnUrl,
    }

    # sort alphabetically
    sorted_keys = sorted(vnpay_data.keys())
    hash_data = []
    query_data = []
    
    for key in sorted_keys:
        val = str(vnpay_data[key])
        if val:
            hash_data.append(f"{key}={urllib.parse.quote_plus(val)}")
            query_data.append(f"{key}={urllib.parse.quote_plus(val)}")

    hash_data_str = "&".join(hash_data)
    query_data_str = "&".join(query_data)
    
    # create secure hash
    h = hmac.new(vnp_HashSecret.encode("utf-8"), hash_data_str.encode("utf-8"), hashlib.sha512)
    vnp_SecureHash = h.hexdigest()
    
    payment_url = f"{vnp_Url}?{query_data_str}&vnp_SecureHash={vnp_SecureHash}"
    return payment_url

@router.post("/vnpay/create")
def create_vnpay_payment(request: Request, body: VNPayCreateRequest, session: SessionDep):
    # Verify order exists
    order = session.get(Order, body.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    client_ip = request.client.host if request.client else "127.0.0.1"
    
    payment_url = generate_vnpay_url(
        order_id=str(order.id),
        amount=body.amount,
        ip_addr=client_ip,
        order_info=body.order_info
    )
    
    return {"payment_url": payment_url}

@router.get("/vnpay/return")
def vnpay_return(request: Request, session: SessionDep, background_tasks: BackgroundTasks):
    input_data = dict(request.query_params)
    vnp_SecureHash = input_data.pop("vnp_SecureHash", "")
    
    if "vnp_SecureHashType" in input_data:
        input_data.pop("vnp_SecureHashType")
        
    # Re-calculate hash
    sorted_keys = sorted(input_data.keys())
    hash_data = []
    for key in sorted_keys:
        val = input_data[key]
        if val:
            hash_data.append(f"{key}={urllib.parse.quote_plus(val)}")
            
    hash_data_str = "&".join(hash_data)
    vnp_HashSecret = settings.VNPAY_HASH_SECRET
    h = hmac.new(vnp_HashSecret.encode("utf-8"), hash_data_str.encode("utf-8"), hashlib.sha512)
    expected_hash = h.hexdigest()
    
    if vnp_SecureHash != expected_hash:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/payment/vnpay/return?success=false&error=invalid_signature")
        
    response_code = input_data.get("vnp_ResponseCode", "")
    transaction_status = input_data.get("vnp_TransactionStatus", "")
    order_id = input_data.get("vnp_TxnRef", "")
    
    if response_code == "00" and transaction_status == "00":
        # Usually IPN handles DB updates, but we can do it here for dev
        order = session.get(Order, int(order_id))
        if order and order.payment_status != "PAID":
            order.payment_status = "PAID"
            order.status = "CONFIRMED"
            order.paid_at = datetime.now()
            order.payment_transaction_id = input_data.get("vnp_TransactionNo")
            session.add(order)
            session.commit()
            
            # Send payment success email
            email_payload = {
                "order_id": str(order.id),
                "recipient": order.shipping_address if order.shipping_address and "@" in order.shipping_address else f"user{order.user_id}@example.com",
                "customer_name": f"Customer {order.user_id}",
                "amount": float(order.total_amount),
                "transaction_id": input_data.get("vnp_TransactionNo")
            }
            background_tasks.add_task(email_client.send_payment_success, email_payload)
            
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/payment/vnpay/return?success=true&order_id={order_id}")
    else:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/payment/vnpay/return?success=false&order_id={order_id}&error_code={response_code}")

@router.get("/vnpay/ipn")
def vnpay_ipn(request: Request, session: SessionDep, background_tasks: BackgroundTasks):
    input_data = dict(request.query_params)
    vnp_SecureHash = input_data.pop("vnp_SecureHash", "")
    
    if "vnp_SecureHashType" in input_data:
        input_data.pop("vnp_SecureHashType")
        
    sorted_keys = sorted(input_data.keys())
    hash_data = []
    for key in sorted_keys:
        val = input_data[key]
        if val:
            hash_data.append(f"{key}={urllib.parse.quote_plus(val)}")
            
    hash_data_str = "&".join(hash_data)
    vnp_HashSecret = settings.VNPAY_HASH_SECRET
    h = hmac.new(vnp_HashSecret.encode("utf-8"), hash_data_str.encode("utf-8"), hashlib.sha512)
    expected_hash = h.hexdigest()
    
    if vnp_SecureHash != expected_hash:
        return {"RspCode": "97", "Message": "Invalid Checksum"}
        
    response_code = input_data.get("vnp_ResponseCode", "")
    transaction_status = input_data.get("vnp_TransactionStatus", "")
    order_id = input_data.get("vnp_TxnRef", "")
    
    order = session.get(Order, int(order_id))
    if not order:
        return {"RspCode": "01", "Message": "Order not found"}
        
    if order.payment_status == "PAID":
        return {"RspCode": "02", "Message": "Order already confirmed"}
        
    if response_code == "00" and transaction_status == "00":
        order.payment_status = "PAID"
        order.status = "CONFIRMED"
        order.paid_at = datetime.now()
        order.payment_transaction_id = input_data.get("vnp_TransactionNo")
        session.add(order)
        session.commit()
        
        # Send payment success email
        email_payload = {
            "order_id": str(order.id),
            "recipient": order.shipping_address if order.shipping_address and "@" in order.shipping_address else f"user{order.user_id}@example.com",
            "customer_name": f"Customer {order.user_id}",
            "amount": float(order.total_amount),
            "transaction_id": input_data.get("vnp_TransactionNo")
        }
        background_tasks.add_task(email_client.send_payment_success, email_payload)
        
        return {"RspCode": "00", "Message": "Confirm Success"}
    else:
        order.payment_status = "FAILED"
        session.add(order)
        session.commit()
        return {"RspCode": "00", "Message": "Confirm Success"}
