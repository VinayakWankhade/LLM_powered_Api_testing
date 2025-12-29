from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter()

@router.get("/me")
async def get_me(user = Depends(get_current_user)):
    """
    Returns the current authenticated user details from Supabase.
    """
    return {
        "id": user.id,
        "email": user.email,
        "user_metadata": user.user_metadata,
        "role": user.role
    }

@router.post("/logout")
async def logout():
    """
    Logout placeholder. Frontend handles local session clearing.
    """
    return {"message": "Successfully logged out"}
