from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from application.utils.security import SECRET_KEY, ALGORITHM
from infrastructure.database.session import get_db
from infrastructure.database.models import UserDB

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

import uuid
import traceback

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> UserDB:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    unapproved_exception = HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Account pending admin approval",
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        
        # FIX: Must cast string ID to UUID object for SQLAlchemy lookup
        user_id = uuid.UUID(user_id_str)
        
        user = await db.get(UserDB, user_id)
        if user is None:
            raise credentials_exception
            
        if not user.is_approved:
            raise unapproved_exception
            
        return user
    except Exception as e:
        print(f"CRITICAL ERROR in get_current_user: {str(e)}")
        print(traceback.format_exc())
        raise credentials_exception

async def require_admin(current_user: UserDB = Depends(get_current_user)) -> UserDB:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user
