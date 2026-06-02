from fastapi import APIRouter

from app.api.routes import emails

api_router = APIRouter()
api_router.include_router(emails.router)
