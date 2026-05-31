from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select

from app.api.deps import SessionDep, CurrentUser
from app.core import security
from app.core.config import settings
from app.models.user import User
from pydantic import BaseModel

router = APIRouter(tags=["login"])

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

@router.post("/login/access-token")
async def login_access_token(
    session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    import logging
    logger = logging.getLogger(__name__)
    logger.warning(f"Login attempt for username: {form_data.username}")
    
    statement = select(User).where(User.username == form_data.username)
    user = (await session.exec(statement)).first()
    
    if not user:
        logger.warning(f"User lookup failed: {form_data.username} not found in database")
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    logger.warning(f"User found in DB. ID: {user.id}, Username: {user.username}, IsActive: {user.is_active}")
    
    is_password_valid = security.verify_password(form_data.password, user.hashed_password)
    logger.warning(f"Password verification result for {user.username}: {is_password_valid}")
    
    if not is_password_valid:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if not user.is_active:
        logger.warning(f"User {user.username} is inactive")
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=7)
    
    return Token(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        refresh_token=security.create_refresh_token(
            user.id, expires_delta=refresh_token_expires
        )
    )

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/login/refresh")
async def refresh_access_token(
    session: SessionDep, request: RefreshTokenRequest
) -> Token:
    import jwt
    try:
        payload = jwt.decode(
            request.refresh_token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token subject")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = await session.get(User, int(user_id))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Inactive user or user not found")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=7)
    
    return Token(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        refresh_token=security.create_refresh_token(
            user.id, expires_delta=refresh_token_expires
        )
    )

@router.get("/profile", response_model=User)
async def read_users_me(current_user: CurrentUser) -> User:
    return current_user
