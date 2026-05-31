from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.config import settings
from app.api.main import api_router
from sqlmodel import SQLModel
from app.core.db import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically create tables on startup
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)
app.include_router(api_router)
