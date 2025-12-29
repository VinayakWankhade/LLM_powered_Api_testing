from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.endpoint import Endpoint
from app.models.test_case import TestCase
from app.schemas.test_case import TestCaseResponse, TestCaseCreate
from app.services.generator import test_generator

router = APIRouter()

@router.get("/", response_model=List[TestCaseResponse])
async def list_tests(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """
    Lists all test cases for a specific project's endpoints.
    """
    # Join with endpoints to filter by project_id
    result = await db.execute(
        select(TestCase).join(Endpoint).where(Endpoint.project_id == project_id)
    )
    return result.scalars().all()

@router.post("/generate", response_model=TestCaseResponse)
async def generate_test(
    project_id: int,
    test_in: TestCaseCreate,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """
    Generate an AI test case for a specific endpoint.
    """
    # 1. Fetch Endpoint
    result = await db.execute(
        select(Endpoint).where(
            Endpoint.id == test_in.endpoint_id, 
            Endpoint.project_id == project_id
        )
    )
    endpoint = result.scalar_one_or_none()
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")

    # 2. Call AI Generator
    try:
        ai_test = await test_generator.generate_test_for_endpoint(endpoint)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Generation failed: {str(e)}")

    # 3. Save to DB
    test_id = f"TC-{uuid.uuid4().hex[:8].upper()}"
    db_test = TestCase(
        id=test_id,
        endpoint_id=endpoint.id,
        description=ai_test.description,
        status="Draft",
        priority=ai_test.priority,
        test_type=ai_test.test_type,
        code_snippet=ai_test.code
    )
    db.add(db_test)
    await db.commit()
    await db.refresh(db_test)
    
    return db_test
