from fastapi import APIRouter, HTTPException
from sqlmodel import select, func, col
from app.models.user import User, UserPublic, UserRegister, UserCreate, UsersPublic
from app.api.deps import SessionDep, CurrentUser, CurrentSuperUser
from app.core import security

router = APIRouter()

@router.post("/register", response_model=UserPublic)
async def register(session: SessionDep, user_register: UserRegister):
    statement = select(User).where(User.username == user_register.username)
    user = (await session.exec(statement)).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system",
        )
    user_create = UserCreate(
        username=user_register.username,
        password=user_register.password,
        fullname=user_register.full_name,
    )
    user = User.model_validate(
        user_create, update={"hashed_password": security.get_password_hash(user_create.password)}
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user

@router.get("/count", response_model=dict)
async def get_user_count(session: SessionDep):
    count_statement = select(func.count()).select_from(User)
    count = await session.exec(count_statement)
    return {"count": count.one()}

@router.get("/", response_model=UsersPublic)
async def read_users(session: SessionDep, current_user: CurrentSuperUser, skip: int = 0, limit: int = 100):
    count_statement = select(func.count()).select_from(User)
    count = await session.exec(count_statement)
    count = count.one()
    
    statement = select(User).order_by(col(User.created_at).desc()).offset(skip).limit(limit)
    users = (await session.exec(statement)).all()
    return UsersPublic(data=users, count=count)

@router.put("/{user_id}/role", response_model=UserPublic)
async def update_user_role(session: SessionDep, current_user: CurrentSuperUser, user_id: int, is_superuser: bool):
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id and not is_superuser:
        raise HTTPException(status_code=400, detail="Cannot remove your own superuser status")
        
    user.is_superuser = is_superuser
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user

@router.delete("/{user_id}")
async def delete_user(session: SessionDep, current_user: CurrentSuperUser, user_id: int):
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
    await session.delete(user)
    await session.commit()
    return {"message": "User deleted successfully"}
