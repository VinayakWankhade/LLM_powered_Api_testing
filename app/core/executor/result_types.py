from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class TestResult(BaseModel):
    test_id: str
    success: bool
    status_code: Optional[int] = None
    response_time: Optional[float] = None
    response_body: Optional[Any] = None
    headers: Optional[Dict[str, str]] = None
    error: Optional[str] = None
    start_time: datetime
    end_time: datetime


class ExecutionMetrics(BaseModel):
    total_tests: int
    successful_tests: int
    failed_tests: int
    execution_time: float
    results: List[TestResult]