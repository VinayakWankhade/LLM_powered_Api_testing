import secrets
import hashlib
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Tuple

from app.domain.models.api_key import ApiKey
from app.domain.schemas.api_key import ApiKeyCreate

class ApiKeyService:
    @staticmethod
    def generate_key_string() -> str:
        """Generates a random secure API key string."""
        return f"sk_live_{secrets.token_urlsafe(32)}"

    @staticmethod
    def hash_key(key: str) -> str:
        """Hashes the API key for secure storage."""
        return hashlib.sha256(key.encode()).hexdigest()

    @staticmethod
    async def create_api_key(db: AsyncSession, user_id: UUID, key_in: ApiKeyCreate) -> Tuple[ApiKey, str]:
        """Creates a new API key and returns the model + plain secret string."""
        secret_key = ApiKeyService.generate_key_string()
        key_hash = ApiKeyService.hash_key(secret_key)
        
        # Preview is something like "sk_live_...abcd"
        key_preview = f"{secret_key[:12]}...{secret_key[-4:]}"
        
        db_key = ApiKey(
            name=key_in.name,
            key_hash=key_hash,
            key_prefix="sk_live_",
            key_preview=key_preview,
            user_id=user_id
        )
        
        db.add(db_key)
        await db.commit()
        await db.refresh(db_key)
        
        return db_key, secret_key

    @staticmethod
    async def list_api_keys(db: AsyncSession, user_id: UUID) -> List[ApiKey]:
        """Lists all API keys for a user."""
        query = select(ApiKey).where(ApiKey.user_id == user_id).order_by(ApiKey.created_at.desc())
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def revoke_api_key(db: AsyncSession, user_id: UUID, key_id: UUID) -> bool:
        """Revokes (deletes) an API key."""
        query = select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == user_id)
        result = await db.execute(query)
        db_key = result.scalar_one_or_none()
        
        if not db_key:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API Key not found.")
            
        await db.delete(db_key)
        await db.commit()
        return True
