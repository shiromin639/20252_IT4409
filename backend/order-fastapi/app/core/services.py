import json
import urllib.request
import urllib.error
from decimal import Decimal

class ProductService:
    BASE_URL = "http://product-service:8000/products"

    @classmethod
    def get_product_price(cls, product_id: int) -> Decimal:
        url = f"{cls.BASE_URL}/{product_id}"
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as response:
                product_data = json.loads(response.read().decode())
                return Decimal(str(product_data["price"]))
        except Exception as e:
            raise ValueError(f"Failed to verify price for product {product_id}: {str(e)}")

    @classmethod
    def get_product(cls, product_id: int) -> dict | None:
        url = f"{cls.BASE_URL}/{product_id}"
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode())
        except Exception as e:
            print(f"Warning: Failed to fetch product {product_id}: {str(e)}")
            return None

    @classmethod
    def increment_sales(cls, product_id: int, quantity: int):
        url = f"{cls.BASE_URL}/{product_id}/increment-sales"
        payload = json.dumps({"quantity": quantity}).encode("utf-8")
        try:
            req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
            urllib.request.urlopen(req)
        except Exception as e:
            print(f"Warning: Failed to increment sales for product {product_id}: {str(e)}")

    @classmethod
    def get_all_products(cls):
        url = f"{cls.BASE_URL}?limit=1000"
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode())
        except Exception as e:
            print(f"Warning: Failed to fetch all products: {str(e)}")
            return {"data": [], "count": 0}

class UserService:
    BASE_URL = "http://user-service:8000/users"

    @classmethod
    def get_total_users(cls) -> int:
        url = f"{cls.BASE_URL}/count"
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                return data.get("count", 0)
        except Exception as e:
            print(f"Warning: Failed to fetch total users: {str(e)}")
            return 0

class InventoryService:
    BASE_URL = "http://inventory-service:8000/inventory"

    @classmethod
    def reserve(cls, product_id: int, amount: int):
        url = f"{cls.BASE_URL}/reserve"
        payload = json.dumps({"product_id": product_id, "amount": amount}).encode("utf-8")
        try:
            req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req):
                pass
        except urllib.error.HTTPError as e:
            if e.code == 400:
                raise ValueError(f"Not enough inventory for product {product_id}")
            raise RuntimeError(f"Inventory service error: {str(e)}")
        except Exception as e:
            raise RuntimeError(f"Failed to contact inventory service: {str(e)}")

    @classmethod
    def release(cls, product_id: int, amount: int):
        url = f"{cls.BASE_URL}/release"
        payload = json.dumps({"product_id": product_id, "amount": amount}).encode("utf-8")
        try:
            req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
            urllib.request.urlopen(req)
        except Exception:
            pass # Best effort

    @classmethod
    def commit(cls, product_id: int, amount: int):
        url = f"{cls.BASE_URL}/commit"
        payload = json.dumps({"product_id": product_id, "amount": amount}).encode("utf-8")
        try:
            req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
            urllib.request.urlopen(req)
        except Exception:
            pass # Best effort

    @classmethod
    def get_low_stock(cls, threshold: int = 10) -> list:
        url = f"{cls.BASE_URL}/low-stock?threshold={threshold}"
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode())
        except Exception as e:
            print(f"Warning: Failed to fetch low stock inventory: {str(e)}")
            return []
