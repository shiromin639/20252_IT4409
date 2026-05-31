from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.config import settings
from app.api.main import api_router
from sqlmodel import SQLModel
from app.core.db import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)
app.include_router(api_router)
