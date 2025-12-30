from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from uuid import UUID
from app.domain.schemas.user import UserCreate, UserUpdate
from app.services.auth_service import AuthService
from app.dependencies.auth import get_current_user
from app.domain.models.user import User
from app.security.jwt import create_access_token
from app.dto.auth_dto import AuthResponseDTO, adapt_user_to_auth

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=AuthResponseDTO, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user account.
    Returns the token and user object immediately.
    """
    user = await AuthService.register_user(db, user_in)
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return adapt_user_to_auth(user, access_token)

@router.post("/login", response_model=AuthResponseDTO)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """
    Login to get an access token.
    FastAPI's OAuth2PasswordRequestForm expects 'username' (we use email) and 'password'.
    """
    user = await AuthService.authenticate_user(db, form_data.username, form_data.password)
    
    # Issue the token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return adapt_user_to_auth(user, access_token)

@router.patch("/me", response_model=AuthResponseDTO)
async def patch_me(
    user_update: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Updates current user's profile.
    """
    user = await AuthService.update_user(
        db, 
        current_user.id, 
        user_update.model_dump(exclude_unset=True)
    )
    # We don't need to re-issue token here, but adapt_user_to_auth expects one
    return adapt_user_to_auth(user, "session_active")

@router.get("/verify", response_model=AuthResponseDTO)
@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Verify token/session or get current profile.
    Alitased to /verify for frontend compatibility.
    """
    # For /verify, we wrap the current user in the adapter. 
    # Use a placeholder for token since the user is already authenticated.
    return adapt_user_to_auth(current_user, "session_active")
