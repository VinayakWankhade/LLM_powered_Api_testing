from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from uuid import UUID
from typing import List

from app.domain.models.project import Project
from app.domain.schemas.project import ProjectCreate

class ProjectService:
    """
    Project Service Layer
    ---------------------
    Handles all business logic related to projects. 
    Crucially, it always checks for the 'owner_id' to ensure security.
    """
    
    @staticmethod
    async def create_project(db: AsyncSession, project_in: ProjectCreate, owner_id: UUID) -> Project:
        """Creates a new project owned by the current user."""
        db_project = Project(
            name=project_in.name,
            description=project_in.description,
            git_url=project_in.git_url,
            api_base_url=project_in.api_base_url,
            owner_id=owner_id
        )
        db.add(db_project)
        await db.commit()
        await db.refresh(db_project)
        return db_project

    @staticmethod
    async def list_projects(db: AsyncSession, owner_id: UUID) -> List[Project]:
        """Lists all projects belonging to the specific user."""
        query = select(Project).where(Project.owner_id == owner_id).order_by(Project.created_at.desc())
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_project(db: AsyncSession, project_id: UUID, owner_id: UUID) -> Project:
        """Fetches a specific project, verifying ownership."""
        query = select(Project).where(
            Project.id == project_id, 
            Project.owner_id == owner_id
        )
        result = await db.execute(query)
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found or you don't have access."
            )
        return project

    @staticmethod
    async def delete_project(db: AsyncSession, project_id: UUID, owner_id: UUID) -> bool:
        """Deletes a project after ensuring the user owns it."""
        project = await ProjectService.get_project(db, project_id, owner_id)
        
        await db.delete(project)
        await db.commit()
        return True

    @staticmethod
    async def update_project(db: AsyncSession, project_id: UUID, project_update: dict, owner_id: UUID) -> Project:
        """Updates a project after verifying ownership."""
        project = await ProjectService.get_project(db, project_id, owner_id)
        
        for field, value in project_update.items():
            if value is not None:
                setattr(project, field, value)
        
        await db.commit()
        await db.refresh(project)
        return project
