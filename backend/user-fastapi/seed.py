import asyncio
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from app.core.db import engine
from app.models.user import User
from app.core.security import get_password_hash

async def seed():
    async with AsyncSession(engine) as session:
        statement = select(User).where(User.username == "admin")
        result = await session.execute(statement)
        user = result.scalars().first()
        if not user:
            print("Creating admin user...")
            admin_user = User(
                username="admin",
                hashed_password=get_password_hash("admin123"),
                is_active=True,
                is_superuser=True,
                fullname="Admin User"
            )
            session.add(admin_user)
            await session.commit()
            print("Admin user created successfully.")
        else:
            print("Admin user already exists.")

if __name__ == "__main__":
    asyncio.run(seed())
