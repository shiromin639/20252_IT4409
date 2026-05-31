import random
from sqlmodel import Session, select, text
from app.core.db import engine
from app.models.cart import Cart
from app.models.cart_item import CartItem

def seed():
    with Session(engine) as session:
        # Check if already seeded
        result = session.execute(select(Cart).limit(1))
        if result.scalars().first():
            print("Cart database already seeded. Skipping.")
            return
            
        print("Seeding Cart...")
        random.seed(42)
        
        user_id = "1"
        
        cart = Cart(user_id=user_id)
        
        for _ in range(2):
            product_id = random.randint(1, 60)
            quantity = random.randint(1, 2)
            cart.items.append(CartItem(
                product_id=product_id,
                quantity=quantity
            ))
            
        session.add(cart)
        session.commit()
        
        print("Updating PostgreSQL sequences...")
        session.execute(text("SELECT setval('carts_id_seq', (SELECT MAX(id) FROM carts));"))
        session.execute(text("SELECT setval('cart_items_id_seq', (SELECT MAX(id) FROM cart_items));"))
        session.commit()
        
        print("Successfully seeded cart for user 1.")

if __name__ == "__main__":
    seed()
