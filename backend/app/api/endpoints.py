from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.project import Project
from app.models.endpoint import Endpoint
from app.schemas.endpoint import EndpointResponse
from app.services.scanner import scanner
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[EndpointResponse])
async def list_endpoints(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """
    Lists all endpoints for a specific project.
    """
    result = await db.execute(
        select(Endpoint).where(Endpoint.project_id == project_id)
    )
    return result.scalars().all()

@router.post("/scan", response_model=List[EndpointResponse])
async def scan_codebase(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """
    Trigger a scan of the project's local codebase to find API endpoints.
    """
    # 1. Fetch Project
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not project.local_path:
        raise HTTPException(
            status_code=400, 
            detail="Project local path is not configured. Please set the 'local_path' field."
        )

    # 2. Run Scanner
    found_endpoints = scanner.scan_directory(project.local_path)
    
    # 3. Update Project Status
    project.status = "Scanning"
    project.status_color = "blue"
    await db.commit()

    # 4. Save Endpoints
    # For now, we clear old endpoints and add new ones (or we could merge)
    await db.execute(delete(Endpoint).where(Endpoint.project_id == project_id))
    
    new_endpoints = []
    for e in found_endpoints:
        db_endpoint = Endpoint(
            project_id=project_id,
            method=e['method'],
            path=e['path'],
            status="Scanned",
            status_color="green",
            last_scanned=datetime.utcnow()
        )
        db.add(db_endpoint)
        new_endpoints.append(db_endpoint)

    project.status = "Active"
    project.status_color = "green"
    await db.commit()
    
    # Refresh to get IDs
    for e in new_endpoints:
        await db.refresh(e)
        
    return new_endpoints
