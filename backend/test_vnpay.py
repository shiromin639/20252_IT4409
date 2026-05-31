import hashlib
import hmac
import urllib.parse
from datetime import datetime

vnp_HashSecret = "SECRET"

vnpay_data = {
    "vnp_Version": "2.1.0",
    "vnp_Command": "pay",
    "vnp_TmnCode": "TMM_CODE",
    "vnp_Amount": "1000000",
    "vnp_CurrCode": "VND",
    "vnp_TxnRef": "123",
    "vnp_OrderInfo": "Test",
    "vnp_OrderType": "billpayment",
    "vnp_Locale": "vn",
    "vnp_CreateDate": "20240101120000",
    "vnp_IpAddr": "127.0.0.1",
    "vnp_ReturnUrl": "http://localhost",
}

sorted_keys = sorted(vnpay_data.keys())
hash_data = []
for key in sorted_keys:
    val = str(vnpay_data[key])
    hash_data.append(f"{key}={urllib.parse.quote_plus(val)}")
    
hash_data_str = "&".join(hash_data)
print("Hash String:", hash_data_str)

h = hmac.new(vnp_HashSecret.encode("utf-8"), hash_data_str.encode("utf-8"), hashlib.sha512)
vnp_SecureHash = h.hexdigest()

print("Secure Hash:", vnp_SecureHash)
