from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, EmailStr
from infrastructure.database.session import get_db
from infrastructure.database.models import UserDB
import application.utils.security as security

router = APIRouter(prefix="/auth", tags=["Auth"])

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    role: str
    is_approved: bool

@router.post("/register")
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    result = await db.execute(select(UserDB).where(UserDB.email == user_data.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if we should make the first user an admin automatically
    count_result = await db.execute(select(UserDB))
    is_first_user = len(count_result.scalars().all()) == 0

    role = "admin" if is_first_user else "user"
    is_approved = True if is_first_user else False

    new_user = UserDB(
        email=user_data.email,
        password_hash=security.get_password_hash(user_data.password),
        role=role,
        is_approved=is_approved
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return {"message": "User registered successfully", "user_id": str(new_user.id), "role": role, "is_approved": is_approved}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    print(f"DEBUG: Login attempt for email: {form_data.username}")
    result = await db.execute(select(UserDB).where(UserDB.email == form_data.username))
    user = result.scalars().first()
    
    if not user:
        print(f"DEBUG: Login failed - User not found in database.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not security.verify_password(form_data.password, user.password_hash):
        print(f"DEBUG: Login failed - Password mismatch for user: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    print(f"DEBUG: Login SUCCESS for user: {user.email}")
    access_token = security.create_access_token(data={"sub": str(user.id), "role": user.role})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=str(user.id),
        role=user.role,
        is_approved=user.is_approved
    )
