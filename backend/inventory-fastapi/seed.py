import random
from sqlmodel import Session, select, text
from app.core.db import engine
from app.models.inventory import Inventory

def seed():
    with Session(engine) as session:
        # Check if already seeded
        result = session.execute(select(Inventory).limit(1))
        if result.scalars().first():
            print("Inventory database already seeded. Skipping.")
            return
            
        print("Seeding Inventory for 60 products...")
        random.seed(42) # Deterministic
        
        for product_id in range(1, 61):
            quantity = random.randint(10, 50)
            inventory = Inventory(
                product_id=product_id,
                quantity=quantity,
                reserved_quantity=0
            )
            session.add(inventory)
            
        session.commit()
        
        print("Updating PostgreSQL sequences...")
        session.execute(text("SELECT setval('inventory_id_seq', (SELECT MAX(id) FROM inventory));"))
        session.commit()
        
        print(f"Successfully seeded inventory for 60 products.")

if __name__ == "__main__":
    seed()
