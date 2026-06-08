import urllib.request, json
# Step 1: Create Order
req = urllib.request.Request("http://localhost:8080/v1/orders", data=json.dumps({"user_id": 2, "shipping_address": "123 Test St", "payment_method": "VNPAY", "items": [{"product_id": 1, "quantity": 1}]}).encode("utf-8"), headers={"Content-Type": "application/json"}, method="POST")
try:
    order_data = json.loads(urllib.request.urlopen(req).read().decode("utf-8"))
    print("Order created:", order_data)
    
    # Step 2: Create VNPay URL
    req2 = urllib.request.Request("http://localhost:8080/v1/payments/vnpay/create", data=json.dumps({"order_id": order_data["id"], "amount": float(order_data["total_amount"]), "order_info": f"Test order {order_data['id']}"}).encode("utf-8"), headers={"Content-Type": "application/json"}, method="POST")
    vnpay_data = json.loads(urllib.request.urlopen(req2).read().decode("utf-8"))
    print("VNPay Response:", vnpay_data)
except Exception as e:
    if hasattr(e, 'read'):
        print(e.read().decode("utf-8"))
    else:
        print(e)
