from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import settings
from supabase import create_client, Client

security = HTTPBearer()
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verifies the Supabase JWT token and returns the user information.
    """
    try:
        # Note: If you have the SUPABASE_JWT_SECRET, you can verify locally.
        # Otherwise, you can use the Supabase SDK to verify the token.
        # For now, we'll implement a placeholder for JWT verification.
        # In a real app, use jwt.decode(token.credentials, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"])
        
        # Using Supabase SDK to get user
        user = supabase.auth.get_user(token.credentials)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )
        return user.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
        )
