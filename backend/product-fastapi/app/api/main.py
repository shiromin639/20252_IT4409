from fastapi import APIRouter

from app.api.routes import category, product, review, wishlist

api_router = APIRouter()
api_router.include_router(category.router)
api_router.include_router(product.router)
api_router.include_router(review.router)
api_router.include_router(wishlist.router)
