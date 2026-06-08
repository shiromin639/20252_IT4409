from fastapi import APIRouter

from app.api.routes import category, product, review, wishlist, admin_search

api_router = APIRouter()
api_router.include_router(category.router)
api_router.include_router(product.router)
api_router.include_router(review.router)
api_router.include_router(wishlist.router)
api_router.include_router(admin_search.router, prefix="/admin/search", tags=["admin-search"])
