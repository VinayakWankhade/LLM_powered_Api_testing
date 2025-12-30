from fastapi import APIRouter
from app.config import settings

# Create a "router" - like a mini-folder for certain routes
router = APIRouter()

@router.get("/health", tags=["System"])
async def health_check():
    """
    Health check endpoint.
    
    Why this?
    It allows us to quickly verify if the backend is alive 
    and what environment it is running in.
    """
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "environment": settings.ENV,
        "debug_mode": settings.DEBUG
    }
