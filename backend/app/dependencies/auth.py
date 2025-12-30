from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.security.jwt import decode_access_token
from app.domain.models.user import User

# Where the login token comes from in the request headers
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    A "lock" for our routes. 
    It checks if the request has a valid token and returns the user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # 1. Decode token
    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception
    
    user_id: str = payload.get("sub") # "sub" is standard for user ID in tokens
    if not user_id:
        raise credentials_exception
        
    # 2. Fetch user from DB
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise credentials_exception
        
    return user
