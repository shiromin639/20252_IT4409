from fastapi import APIRouter, HTTPException, Header
from sqlmodel import select
from app.api.deps import SessionDep
from app.models.user import User, UserPublic, UserRegister, UserBase
from pydantic import BaseModel
import hmac
import hashlib
import base64
import json
import os

router = APIRouter(tags=["user"])

# A simple fallback secret key. In production, this would be settings.SECRET_KEY
SECRET_KEY = "super-secret-key-for-jwt-techshop"

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    token: str
    user: UserPublic

# JWT Helper functions (Zero-dependency standard JWT)
def create_jwt(payload: dict) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    msg = f"{header_b64}.{payload_b64}"
    sig = hmac.new(SECRET_KEY.encode(), msg.encode(), hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).decode().rstrip("=")
    return f"{msg}.{sig_b64}"

def verify_jwt(token: str) -> dict | None:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        msg = f"{header_b64}.{payload_b64}"
        sig = hmac.new(SECRET_KEY.encode(), msg.encode(), hashlib.sha256).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(sig).decode().rstrip("=")
        if not hmac.compare_digest(sig_b64, expected_sig_b64):
            return None
        rem = len(payload_b64) % 4
        if rem > 0:
            payload_b64 += "=" * (4 - rem)
        payload_data = base64.urlsafe_b64decode(payload_b64.encode()).decode()
        return json.loads(payload_data)
    except Exception:
        return None

# Password Hashing Helpers (PBKDF2-HMAC-SHA256)
def hash_password(password: str) -> str:
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return f"{salt.hex()}:{key.hex()}"

def verify_password(password: str, hashed_password: str) -> bool:
    try:
        salt_hex, key_hex = hashed_password.split(':')
        salt = bytes.fromhex(salt_hex)
        key = bytes.fromhex(key_hex)
        new_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        return new_key == key
    except Exception:
        return False

@router.post("/register", response_model=UserPublic, status_code=201)
async def register(session: SessionDep, user_register: UserRegister):
    # Check if username exists
    statement = select(User).where(User.username == user_register.username)
    result = await session.exec(statement)
    existing_user = result.first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed = hash_password(user_register.password)
    new_user = User(
        username=user_register.username,
        fullname=user_register.full_name,
        hashed_password=hashed,
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenResponse)
async def login(session: SessionDep, login_data: UserLogin):
    statement = select(User).where(User.username == login_data.username)
    result = await session.exec(statement)
    user = result.first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    token = create_jwt({"id": user.id, "username": user.username})
    return {"token": token, "user": user}

@router.post("/verify")
async def verify(token_data: dict):
    token = token_data.get("token")
    if not token:
        return {"valid": False}
    payload = verify_jwt(token)
    if payload:
        return {"valid": True, "userId": payload.get("id")}
    return {"valid": False}

@router.get("/profile", response_model=UserPublic)
async def profile(session: SessionDep, authorization: str | None = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[1]
    payload = verify_jwt(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    user_id = payload.get("id")
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/update", response_model=UserPublic)
async def update_user(session: SessionDep, user_update: UserBase, authorization: str | None = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[1]
    payload = verify_jwt(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    user_id = payload.get("id")
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.username != user.username:
        statement = select(User).where(User.username == user_update.username)
        result = await session.exec(statement)
        duplicate = result.first()
        if duplicate:
            raise HTTPException(status_code=400, detail="Username already exists")
    
    user.username = user_update.username
    user.fullname = user_update.fullname
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user
