from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from uuid import UUID
from typing import Optional
from app.domain.models.user import User

class BaseDTO(BaseModel):
    """Base DTO with camelCase alias support."""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )

class UserDTO(BaseDTO):
    id: UUID
    first_name: str
    email: str
    role: str = "user"

class AuthResponseDTO(BaseDTO):
    token: str
    user: UserDTO

def adapt_user_to_auth(user: User, token: str) -> AuthResponseDTO:
    """
    Adapter: Domain User -> AuthResponseDTO
    """
    return AuthResponseDTO(
        token=token,
        user=UserDTO(
            id=user.id,
            first_name=user.first_name or "User",
            email=user.email,
            role="user" # Default role as per frontend contract
        )
    )
