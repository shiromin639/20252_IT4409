from fastapi import APIRouter
from app.api.routes import payment

api_router = APIRouter()
api_router.include_router(payment.router)
