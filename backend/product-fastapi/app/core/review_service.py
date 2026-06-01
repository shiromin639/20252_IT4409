import httpx
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from fastapi import HTTPException

from app.models.review import Review, ReviewStatus
from app.models.product import Product
from app.core.config import settings

class ReviewService:
    ORDER_SERVICE_URL = "http://order-service:8000"

    @staticmethod
    async def check_verified_purchase(user_id: int, product_id: int) -> bool:
        """Check if user has a PAID order for this product."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{ReviewService.ORDER_SERVICE_URL}/orders/check-purchase/internal",
                    params={"user_id": user_id, "product_id": product_id},
                    timeout=5.0
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("purchased", False)
                return False
            except httpx.RequestError:
                return False

    @staticmethod
    async def update_product_rating(session: AsyncSession, product_id: int):
        """Recalculate average_rating and total_reviews for a product and save it."""
        product = await session.get(Product, product_id)
        if not product:
            return

        statement = (
            select(
                func.count().label("total_reviews"),
                func.avg(Review.rating).label("average_rating")
            )
            .where(Review.product_id == product_id)
            .where(Review.review_status == ReviewStatus.ACTIVE)
        )
        result = await session.exec(statement)
        row = result.first()
        
        if row and row.total_reviews > 0:
            product.total_reviews = row.total_reviews
            # Round to 1 decimal place
            product.average_rating = round(float(row.average_rating), 1)
        else:
            product.total_reviews = 0
            product.average_rating = 0.0 # Or 5.0 as default, but 0.0 is more accurate for no reviews

        session.add(product)
        await session.commit()
