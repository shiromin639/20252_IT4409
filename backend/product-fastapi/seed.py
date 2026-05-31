import asyncio
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, text
from app.core.db import engine
from app.models.category import Category
from app.models.product import Product
from app.seed.fixtures import get_categories
from app.seed.factories import generate_products

async def seed():
    async with AsyncSession(engine) as session:
        # Check if already seeded idempotently
        result = await session.execute(select(Category).limit(1))
        if result.scalars().first():
            print("Product database already seeded. Skipping.")
            return

        print("Seeding Categories...")
        categories_data = get_categories()
        for cat_data in categories_data:
            category = Category(**cat_data)
            session.add(category)
        
        await session.commit()

        print("Seeding Products...")
        laptops_data = generate_products(count=60)
        
        for laptop_data in laptops_data:
            product = Product(**laptop_data)
            session.add(product)
            
        await session.commit()
        
        print("Updating PostgreSQL sequences...")
        await session.execute(text("SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));"))
        await session.execute(text("SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));"))
        await session.commit()
        
        print(f"Successfully seeded {len(categories_data)} categories and {len(laptops_data)} laptops.")

if __name__ == "__main__":
    asyncio.run(seed())
