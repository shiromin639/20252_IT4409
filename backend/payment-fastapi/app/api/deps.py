from collections.abc import Generator
from fastapi import Depends
from sqlmodel import Session
from typing import Annotated, Any
from app.core.db import engine


def get_db() -> Generator[Session, Any, Any]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
