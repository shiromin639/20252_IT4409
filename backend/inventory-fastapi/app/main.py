from fastapi import FastAPI
from app.core.config import settings
from app.api.main import api_router
import uvicorn

app = FastAPI(title=settings.PROJECT_NAME)
app.include_router(api_router)
