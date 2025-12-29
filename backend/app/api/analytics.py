from fastapi import APIRouter, Depends
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/global")
async def get_global_analytics(user = Depends(get_current_user)):
    return {"avg_coverage": 85, "total_tests": 1200}

@router.get("/project/{project_id}")
async def get_project_analytics(project_id: int, user = Depends(get_current_user)):
    return {"project_id": project_id, "coverage": 92}
