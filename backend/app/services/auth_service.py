from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.domain.models.user import User
from app.domain.schemas.user import UserCreate
from app.security.password import get_password_hash, verify_password
from app.security.jwt import create_access_token

class AuthService:
    """
    The brain of our authentication system.
    
    It knows how to talk to the DB to save users and verify tokens.
    """
    @staticmethod
    async def register_user(db: AsyncSession, user_in: UserCreate) -> User:
        """
        Creates a new user record in the database.
        """
        # 1. Check if user already exists
        query = select(User).where(User.email == user_in.email)
        result = await db.execute(query)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_MESSAGE,
                detail="A user with this email already exists."
            )
        
        # 2. Hash the password
        hashed_password = get_password_hash(user_in.password)
        
        # 3. Create the user object
        db_user = User(
            email=user_in.email,
            hashed_password=hashed_password,
            first_name=user_in.first_name,
            last_name=user_in.last_name
        )
        
        # 4. Save to DB
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        
        return db_user

    @staticmethod
    async def update_user(db: AsyncSession, user_id: UUID, updates: dict) -> User:
        """
        Updates an existing user's profile information.
        """
        query = select(User).where(User.id == user_id)
        result = await db.execute(query)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
            
        for key, value in updates.items():
            if hasattr(user, key):
                setattr(user, key, value)
                
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
        """
        Checks credentials and returns the user object.
        """
        # 1. Look for the user
        query = select(User).where(User.email == email)
        result = await db.execute(query)
        user = result.scalar_one_or_none()
        
        # 2. Verify existence and password
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user
