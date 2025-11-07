from __future__ import annotations

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.schemas.tests import TestCase
from app.dependencies import (
    get_orchestrator,
    get_coverage_aggregator,
    get_execution_scheduler
)


router = APIRouter()


class ExecuteRequest(BaseModel):
    tests: List[TestCase]
    suite_id: Optional[str] = None
    max_parallel: Optional[int] = None
    retry_attempts: Optional[int] = None
    optimize: bool = True


@router.post("/run")
async def run_tests(
    request: ExecuteRequest,
    orchestrator = Depends(get_orchestrator),
    coverage = Depends(get_coverage_aggregator),
    scheduler = Depends(get_execution_scheduler)
) -> Dict[str, Any]:
    """Execute a suite of tests."""
    try:
        if request.optimize:
            # Use RL-based scheduler for optimized execution
            result = await scheduler.schedule_tests(
                tests=request.tests,
                coverage=coverage
            )
        else:
            # Use default orchestrator
            result = await orchestrator.execute_test_suite(
                tests=request.tests,
                suite_id=request.suite_id
            )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/results/{execution_id}")
async def get_execution_results(
    execution_id: str,
    orchestrator = Depends(get_orchestrator)
) -> Dict[str, Any]:
    """Get results for a specific execution."""
    result = orchestrator.get_execution_result(execution_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    return result


@router.get("/results")
async def list_recent_executions(
    limit: int = 10,
    orchestrator = Depends(get_orchestrator)
) -> List[Dict[str, Any]]:
    """List recent test executions."""
    return orchestrator.get_latest_executions(limit=limit)


@router.get("/stats")
async def get_execution_stats(
    scheduler = Depends(get_execution_scheduler)
) -> Dict[str, Any]:
    """Get execution statistics."""
    return scheduler.get_schedule_stats()


@router.post("/optimize")
async def optimize_policy(
    scheduler = Depends(get_execution_scheduler),
    coverage = Depends(get_coverage_aggregator)
) -> Dict[str, Any]:
    """Trigger policy optimization."""
    policy_stats = scheduler.policy_updater.get_policy_stats()
    scheduler.policy_updater.update_policy(
        state=None,  # State will be determined by the agent
        coverage=coverage,
        execution_history=scheduler._execution_history
    )
    return {
        "message": "Policy optimization triggered",
        "previous_stats": policy_stats,
        "current_stats": scheduler.policy_updater.get_policy_stats()
    }
