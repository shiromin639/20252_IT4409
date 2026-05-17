from fastapi import APIRouter

from app.api.routes import order

api_router = APIRouter()
api_router.include_router(order.router)
