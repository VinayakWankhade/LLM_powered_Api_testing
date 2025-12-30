from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.services.project_service import ProjectService
from app.dependencies.auth import get_current_user
from app.domain.models.user import User
from app.domain.models.test_case import TestCase
from app.workers.generation_job import batch_generate_tests
from app.workers.healing_job import run_self_healing
from app.dto.test_case_dto import TestCaseListItemDTO, TestCaseDetailDTO, adapt_test_case_to_list_item, adapt_test_case_to_detail
from app.dto.auth_dto import BaseDTO

router = APIRouter(prefix="/projects", tags=["Tests"])

class GenerateTestsRequest(BaseDTO):
    endpoint_ids: List[UUID]

@router.get("/{project_id}/test-cases", response_model=List[TestCaseListItemDTO])
async def list_test_cases(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all test cases for a project.
    """
    await ProjectService.get_project(db, project_id, current_user.id)
    query = select(TestCase).join(TestCase.endpoint).where(TestCase.endpoint.has(project_id=project_id))
    result = await db.execute(query)
    test_cases = result.scalars().all()
    
    return [adapt_test_case_to_list_item(tc) for tc in test_cases]

@router.get("/{project_id}/tests/{test_case_id}", response_model=TestCaseDetailDTO)
async def get_test_case(
    project_id: UUID,
    test_case_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed information about a specific test case.
    """
    await ProjectService.get_project(db, project_id, current_user.id)
    query = select(TestCase).where(TestCase.id == test_case_id)
    result = await db.execute(query)
    test_case = result.scalar_one_or_none()
    if not test_case:
        raise HTTPException(status_code=404, detail="Test case not found.")
    
    return adapt_test_case_to_detail(test_case)

@router.post("/{project_id}/tests/generate", status_code=status.HTTP_202_ACCEPTED)
async def generate_tests(
    project_id: UUID,
    request: GenerateTestsRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Triggers AI test generation for specific endpoints.
    """
    await ProjectService.get_project(db, project_id, current_user.id)
    
    ep_id_strs = [str(eid) for eid in request.endpoint_ids]
    task = batch_generate_tests.delay(str(project_id), ep_id_strs)
    
    return {
        "jobId": task.id,
        "status": "queued",
        "message": f"AI Generation started for {len(ep_id_strs)} endpoints."
    }

@router.post("/{project_id}/tests/{test_case_id}/heal", status_code=status.HTTP_202_ACCEPTED)
async def heal_test(
    project_id: UUID,
    test_case_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Triggers self-healing for a specific failed test.
    """
    await ProjectService.get_project(db, project_id, current_user.id)
    task = run_self_healing.delay(str(project_id), str(test_case_id))
    
    return {
        "jobId": task.id,
        "status": "queued",
        "message": "Self-healing process has been enqueued."
    }
