from fastapi import APIRouter

from app.api.routes import order, payment

api_router = APIRouter()
api_router.include_router(order.router)
api_router.include_router(payment.router, prefix="/payments")
