from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List

from app.domain.schemas.base import BaseSchema

class ApiKeyBase(BaseSchema):
    name: str

class ApiKeyCreate(ApiKeyBase):
    pass

class ApiKeyRead(ApiKeyBase):
    id: UUID
    key_preview: str
    is_active: bool
    created_at: datetime
    last_used_at: Optional[datetime] = None

class ApiKeyGenerated(ApiKeyRead):
    secret_key: str # Only shown once on creation
