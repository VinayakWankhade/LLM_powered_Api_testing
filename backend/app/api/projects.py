from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter()

@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """
    Lists all projects owned by the authenticated user.
    """
    result = await db.execute(
        select(Project).where(Project.owner_id == user.id)
    )
    return result.scalars().all()

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """
    Creates a new project.
    """
    project = Project(
        **project_in.model_dump(),
        owner_id=user.id
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project

@router.get("/{id}", response_model=ProjectResponse)
async def get_project(
    id: int,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """
    Fetches details of a specific project.
    """
    result = await db.execute(
        select(Project).where(Project.id == id, Project.owner_id == user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.patch("/{id}", response_model=ProjectResponse)
async def update_project(
    id: int,
    project_in: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """
    Updates a project.
    """
    result = await db.execute(
        select(Project).where(Project.id == id, Project.owner_id == user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    await db.commit()
    await db.refresh(project)
    return project

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    id: int,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """
    Deletes a project.
    """
    result = await db.execute(
        select(Project).where(Project.id == id, Project.owner_id == user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    await db.delete(project)
    await db.commit()
    return None
