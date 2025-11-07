from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime, timedelta

from app.dependencies import (
    get_healing_orchestrator,
    get_assertion_regenerator,
    get_retry_manager
)
from app.core.healing.orchestrator import HealingOrchestrator, HealingResult
from app.core.healing.assertion_regenerator import AssertionRegenerator
from app.core.healing.retry_manager import RetryManager, RetryResult
from app.schemas.tests import TestCase
from app.core.analysis.failure_analyzer import FailurePattern


router = APIRouter(prefix="/healing", tags=["healing"])


@router.post("/orchestrate", response_model=List[HealingResult])
async def orchestrate_healing(
    failed_tests: List[TestCase],
    failure_patterns: List[FailurePattern],
    orchestrator: HealingOrchestrator = Depends(get_healing_orchestrator)
):
    """Orchestrate the healing process for failed tests."""
    try:
        results = await orchestrator.orchestrate_healing(failed_tests, failure_patterns)
        return results
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to orchestrate healing: {str(e)}"
        )


@router.post("/regenerate-assertions")
async def regenerate_assertions(
    test_case: TestCase,
    regenerator: AssertionRegenerator = Depends(get_assertion_regenerator)
):
    """Regenerate assertions for a test case."""
    try:
        assertions = await regenerator.regenerate_assertions(
            test_case=test_case,
            failed_result=test_case.last_result,
            context={}  # Add context if available
        )
        if not assertions:
            raise HTTPException(
                status_code=422,
                detail="Failed to generate valid assertions"
            )
        return assertions
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to regenerate assertions: {str(e)}"
        )


@router.post("/retry", response_model=List[RetryResult])
async def retry_tests(
    healing_results: List[HealingResult],
    retry_manager: RetryManager = Depends(get_retry_manager)
):
    """Retry healed test cases."""
    try:
        results = await retry_manager.retry_tests(healing_results)
        return results
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retry tests: {str(e)}"
        )


@router.get("/history")
async def get_healing_history(
    test_id: Optional[str] = None,
    orchestrator: HealingOrchestrator = Depends(get_healing_orchestrator)
):
    """Get healing history for tests."""
    return orchestrator.get_healing_history(test_id)


@router.get("/retry-history")
async def get_retry_history(
    test_id: Optional[str] = None,
    hours: Optional[float] = None,
    retry_manager: RetryManager = Depends(get_retry_manager)
):
    """Get retry history for tests."""
    time_window = timedelta(hours=hours) if hours else None
    return retry_manager.get_retry_history(test_id, time_window)


@router.get("/retry-success-rate")
async def get_retry_success_rate(
    test_id: Optional[str] = None,
    hours: Optional[float] = None,
    retry_manager: RetryManager = Depends(get_retry_manager)
):
    """Get success rate of retries."""
    time_window = timedelta(hours=hours) if hours else None
    return {
        "success_rate": retry_manager.get_success_rate(test_id, time_window)
    }