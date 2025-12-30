from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List

from app.db.session import get_db
from app.services.project_service import ProjectService
from app.domain.models.endpoint import Endpoint
from app.dependencies.auth import get_current_user
from app.domain.models.user import User
from app.workers.scan_job import run_scan
from app.dto.endpoint_dto import EndpointDTO, adapt_endpoint_to_list_item

router = APIRouter(prefix="/projects", tags=["Scanning"])

@router.get("/{project_id}/endpoints", response_model=List[EndpointDTO])
async def list_endpoints(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all endpoints found in a project.
    """
    await ProjectService.get_project(db, project_id, current_user.id)
    query = select(Endpoint).where(Endpoint.project_id == project_id)
    result = await db.execute(query)
    endpoints = result.scalars().all()
    
    return [adapt_endpoint_to_list_item(e) for e in endpoints]

@router.post("/{project_id}/endpoints/scan", status_code=status.HTTP_202_ACCEPTED)
async def trigger_scan(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Triggers a codebase scan for a project using Celery.
    Returns scanId for frontend compatibility.
    """
    project = await ProjectService.get_project(db, project_id, current_user.id)
    task = run_scan.delay(str(project_id), project.git_url)
    
    return {
        "scanId": task.id,
        "status": "Started", 
        "message": "Scan initiated successfully."
    }

@router.get("/scan/status/{job_id}")
async def get_scan_status(job_id: str):
    """
    Check if a background scan is finished.
    """
    from celery.result import AsyncResult
    from app.workers.celery_app import celery_app
    
    result = AsyncResult(job_id, app=celery_app)
    
    return {
        "scanId": job_id,
        "status": result.status, 
        "result": result.result if result.ready() else None
    }
