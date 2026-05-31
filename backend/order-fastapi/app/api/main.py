from fastapi import APIRouter

from app.api.routes import order, payment, admin

api_router = APIRouter()
api_router.include_router(order.router)
api_router.include_router(payment.router, prefix="/payments")
api_router.include_router(admin.router, prefix="/admin")
