from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.main import api_router
import os

app = FastAPI(title=settings.PROJECT_NAME)

# Ensure static directory exists
os.makedirs("static/images", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(api_router)
