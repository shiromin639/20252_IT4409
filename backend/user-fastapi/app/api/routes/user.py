from fastapi import APIRouter

from app.models.user import UserPublic, UserRegister
from app.api.deps import SessionDep

router = APIRouter()

@router.post("/register", response_model=UserPublic)
async def register(session: SessionDep, user_register:UserRegister):
    
