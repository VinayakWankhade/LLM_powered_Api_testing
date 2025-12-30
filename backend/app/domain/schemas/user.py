from pydantic import BaseModel, EmailStr, ConfigDict, Field
from pydantic.alias_generators import to_camel
from uuid import UUID
from datetime import datetime
from typing import Optional, Dict

from app.domain.schemas.base import BaseSchema

class UserBase(BaseSchema):
    """Base fields shared across all user schemas."""
    email: EmailStr

class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str
    first_name: str
    last_name: str

class UserUpdate(BaseSchema):
    """Schema for updating user data."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    mfa_enabled: Optional[bool] = None
    notification_preferences: Optional[Dict[str, bool]] = None

class UserRead(UserBase):
    """Schema for returning user data (no password!)."""
    id: UUID
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str = "user"
    is_active: bool
    mfa_enabled: bool = False
    notification_preferences: Dict[str, bool] = {}
    created_at: datetime

class Token(BaseSchema):
    """Schema for the JWT login response."""
    token: str = Field(..., alias="access_token")
    token_type: str = "bearer"

class AuthResponse(BaseSchema):
    """Unified response for login and registration."""
    token: str
    user: UserRead
