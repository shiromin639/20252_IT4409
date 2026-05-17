from fastapi import APIRouter

from app.api.routes import cart

api_router = APIRouter()
api_router.include_router(cart.router)
