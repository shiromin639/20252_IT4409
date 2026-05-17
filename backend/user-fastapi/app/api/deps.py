from collections.abc import AsyncGenerator
from fastapi import Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Annotated, Any
from app.core.db import engine


async def get_db() -> AsyncGenerator[AsyncSession, Any]:
    async with AsyncSession(engine) as session:
        yield session


SessionDep = Annotated[AsyncSession, Depends(get_db)]
