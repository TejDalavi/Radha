from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import List, Optional
from infrastructure.database.session import get_db
from infrastructure.database.models import UserDB, LLMConfigDB
from presentation.api.dependencies import require_admin
import uuid

router = APIRouter(prefix="/admin", tags=["Admin"])

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    is_approved: bool
    created_at: str

class ApprovalUpdate(BaseModel):
    is_approved: bool

class LLMConfigRequest(BaseModel):
    provider_name: str
    model_name: str
    api_key: str
    temperature: float = 0.7
    max_tokens: int = 2000

@router.get("/users", response_model=List[UserResponse])
async def get_users(db: AsyncSession = Depends(get_db), admin: UserDB = Depends(require_admin)):
    result = await db.execute(select(UserDB))
    users = result.scalars().all()
    
    return [
        UserResponse(
            id=str(u.id), 
            email=u.email, 
            role=u.role, 
            is_approved=u.is_approved,
            created_at=str(u.created_at)
        ) for u in users
    ]

class RoleUpdate(BaseModel):
    role: str

@router.patch("/users/{user_id}/approve")
async def approve_user(user_id: str, update_data: ApprovalUpdate, db: AsyncSession = Depends(get_db), admin: UserDB = Depends(require_admin)):
    user = await db.get(UserDB, uuid.UUID(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_approved = update_data.is_approved
    await db.commit()
    return {"message": "User approval status updated", "is_approved": user.is_approved}

@router.patch("/users/{user_id}/role")
async def update_user_role(user_id: str, update_data: RoleUpdate, db: AsyncSession = Depends(get_db), admin: UserDB = Depends(require_admin)):
    user = await db.get(UserDB, uuid.UUID(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if update_data.role not in ["admin", "user"]:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    user.role = update_data.role
    await db.commit()
    return {"message": "User role updated", "role": user.role}

@router.get("/llm-config")
async def get_llm_config(db: AsyncSession = Depends(get_db), admin: UserDB = Depends(require_admin)):
    result = await db.execute(select(LLMConfigDB).where(LLMConfigDB.user_id == None))
    config = result.scalars().first()
    
    if not config:
        return {"provider_name": "openrouter", "model_name": "google/gemini-2.0-flash-001", "api_key": ""}
        
    return {
        "provider_name": config.provider_name,
        "model_name": config.model_name,
        "api_key": config.api_key,
        "temperature": config.temperature,
        "max_tokens": config.max_tokens
    }

@router.post("/llm-config")
async def set_llm_config(config_data: LLMConfigRequest, db: AsyncSession = Depends(get_db), admin: UserDB = Depends(require_admin)):
    result = await db.execute(select(LLMConfigDB).where(LLMConfigDB.user_id == None))
    config = result.scalars().first()
    
    if config:
        config.provider_name = config_data.provider_name
        config.model_name = config_data.model_name
        config.api_key = config_data.api_key
        config.temperature = config_data.temperature
        config.max_tokens = config_data.max_tokens
    else:
        config = LLMConfigDB(
            user_id=None,
            provider_name=config_data.provider_name,
            model_name=config_data.model_name,
            api_key=config_data.api_key,
            temperature=config_data.temperature,
            max_tokens=config_data.max_tokens
        )
        db.add(config)
        
    await db.commit()
    return {"message": "Global LLM configuration saved"}
