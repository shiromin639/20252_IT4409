from fastapi import APIRouter, HTTPException
from sqlmodel import select
from app.api.deps import SessionDep
from app.models.payment import Payment, PaymentCreate, PaymentPublic, PaymentUpdate
import uuid

router = APIRouter(tags=["payment"])

@router.post("/payments", response_model=PaymentPublic, status_code=201)
def process_payment(session: SessionDep, payment_in: PaymentCreate):
    # Simulate processing payment
    # Generate a dummy transaction ID if not provided
    transaction_id = payment_in.transaction_id or f"txn_{uuid.uuid4().hex[:12]}"
    
    # Simple simulation rule
    status = "COMPLETED"
    if payment_in.amount <= 0:
        status = "FAILED"
        
    payment = Payment(
        order_id=payment_in.order_id,
        amount=payment_in.amount,
        status=status,
        payment_method=payment_in.payment_method,
        transaction_id=transaction_id,
    )
    session.add(payment)
    session.commit()
    session.refresh(payment)
    return payment

@router.get("/payments/{payment_id}", response_model=PaymentPublic)
def get_payment(session: SessionDep, payment_id: int):
    payment = session.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@router.get("/payments/order/{order_id}", response_model=PaymentPublic)
def get_payment_by_order(session: SessionDep, order_id: int):
    statement = select(Payment).where(Payment.order_id == order_id)
    payment = session.exec(statement).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment for this order not found")
    return payment

@router.put("/payments/{payment_id}", response_model=PaymentPublic)
def update_payment_status(session: SessionDep, payment_id: int, payment_update: PaymentUpdate):
    payment = session.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment.status = payment_update.status
    if payment_update.transaction_id:
        payment.transaction_id = payment_update.transaction_id
        
    session.add(payment)
    session.commit()
    session.refresh(payment)
    return payment
