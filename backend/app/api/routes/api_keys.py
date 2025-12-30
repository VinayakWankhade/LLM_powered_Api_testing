from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.services.api_key_service import ApiKeyService
from app.dependencies.auth import get_current_user
from app.domain.models.user import User
from app.domain.schemas.api_key import ApiKeyCreate, ApiKeyRead, ApiKeyGenerated

router = APIRouter(prefix="/auth/api-keys", tags=["API Keys"])

@router.post("/", response_model=ApiKeyGenerated, status_code=status.HTTP_201_CREATED)
async def create_key(
    key_in: ApiKeyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generates a new API key."""
    db_key, secret_key = await ApiKeyService.create_api_key(db, current_user.id, key_in)
    
    return {
        "id": db_key.id,
        "name": db_key.name,
        "key_preview": db_key.key_preview,
        "is_active": db_key.is_active,
        "created_at": db_key.created_at,
        "last_used_at": db_key.last_used_at,
        "secret_key": secret_key
    }

@router.get("/", response_model=List[ApiKeyRead])
async def list_keys(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists all API keys for the current user."""
    keys = await ApiKeyService.list_api_keys(db, current_user.id)
    return keys

@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_key(
    key_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Revokes (deletes) an API key."""
    await ApiKeyService.revoke_api_key(db, current_user.id, key_id)
    return None
