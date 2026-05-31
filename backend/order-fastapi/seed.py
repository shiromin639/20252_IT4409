import random
from decimal import Decimal
from sqlmodel import Session, select, text
from app.core.db import engine
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem
from faker import Faker

fake = Faker("en_US")
Faker.seed(42)

import time
import urllib.request
import urllib.error
from app.core.services import ProductService

def wait_for_product_service():
    print("Waiting for Product Service to be healthy...")
    max_retries = 30
    for i in range(max_retries):
        try:
            req = urllib.request.Request("http://product-service:8000/products?limit=1")
            with urllib.request.urlopen(req) as response:
                if response.getcode() == 200:
                    print("Product Service is healthy!")
                    return True
        except Exception:
            pass
        time.sleep(2)
    print("Warning: Product Service did not become healthy in time. Sales sync may fail.")
    return False

def seed():
    wait_for_product_service()
    
    with Session(engine) as session:
        # Check if already seeded
        result = session.execute(select(Order).limit(1))
        if result.scalars().first():
            print("Order database already seeded. Skipping.")
            return
            
        print("Seeding 50 Historical Orders...")
        random.seed(42)
        
        user_id = "1"
        addresses = [fake.address().replace("\n", ", ") for _ in range(5)]
        
        for i in range(50):
            # 1 to 4 items per order
            num_items = random.randint(1, 4)
            total_amount = Decimal("0.00")
            
            items_to_add = []
            for _ in range(num_items):
                product_id = random.randint(1, 60)
                quantity = random.randint(1, 3)
                price = Decimal(str(random.randint(9, 25) * 100 + 99.99))
                
                total_amount += price * quantity
                
                items_to_add.append(OrderItem(
                    product_id=product_id,
                    quantity=quantity,
                    unit_price=price
                ))
            
            order = Order(
                user_id=user_id,
                status=random.choice(list(OrderStatus)).value,
                total_amount=total_amount,
                shipping_address=random.choice(addresses),
                items=items_to_add
            )
            session.add(order)
            session.commit()
            
            # Sync to product service
            for item in items_to_add:
                ProductService.increment_sales(item.product_id, item.quantity)
            
        print("Updating PostgreSQL sequences...")
        session.execute(text("SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));"))
        session.execute(text("SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items));"))
        session.commit()
        
        print("Successfully seeded 50 historical orders.")

if __name__ == "__main__":
    seed()
