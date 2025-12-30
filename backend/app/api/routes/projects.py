from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.domain.schemas.project import ProjectCreate
from app.services.project_service import ProjectService
from app.services.analytics_service import AnalyticsService
from app.dependencies.auth import get_current_user
from app.domain.models.user import User
from app.dto.project_dto import ProjectCardDTO, ProjectResponseDTO, adapt_project_to_card, adapt_project_to_detail

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/", response_model=ProjectResponseDTO, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Creates a new project. 
    The current user becomes the owner automatically.
    """
    project = await ProjectService.create_project(db, project_in, current_user.id)
    # Get empty stats for new project
    stats = {"endpoints": 0, "tests": 0, "pass_rate": 0.0}
    return adapt_project_to_detail(project, stats)

@router.get("/", response_model=List[ProjectCardDTO])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lists all projects owned by the current user.
    """
    projects = await ProjectService.list_projects(db, current_user.id)
    
    results = []
    for p in projects:
        # In a real app we'd batch this. For now, use the adapter.
        results.append(adapt_project_to_card(p, endpoints_count=0))
    return results

@router.get("/{project_id}", response_model=ProjectResponseDTO)
async def get_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Gets detailed information about a project if you own it.
    Includes aggregated stats.
    """
    project = await ProjectService.get_project(db, project_id, current_user.id)
    stats_data = await AnalyticsService.get_project_analytics(db, project_id, current_user.id)
    
    stats = {
        "endpoints": stats_data.endpoints if stats_data else 0,
        "tests": stats_data.tests if stats_data else 0,
        "pass_rate": 95.0 # Dummy for now
    }
    
    return adapt_project_to_detail(project, stats)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Removes a project forever. 
    Can only be performed by the owner.
    """
    await ProjectService.delete_project(db, project_id, current_user.id)
    return None

from app.domain.schemas.project import ProjectUpdate

@router.patch("/{project_id}", response_model=ProjectResponseDTO)
async def patch_project(
    project_id: UUID,
    project_update: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Updates specific fields of a project.
    """
    project = await ProjectService.update_project(
        db, 
        project_id, 
        project_update.model_dump(exclude_unset=True), 
        current_user.id
    )
    
    stats_data = await AnalyticsService.get_project_analytics(db, project_id, current_user.id)
    stats = {
        "endpoints": stats_data.endpoints if stats_data else 0,
        "tests": stats_data.tests if stats_data else 0,
        "pass_rate": 95.0
    }
    
    return adapt_project_to_detail(project, stats)
