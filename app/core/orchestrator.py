from __future__ import annotations

from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from app.core.executor.hybrid_executor import HybridExecutor
from app.core.coverage_aggregator import CoverageAggregator, CoverageMetrics
from app.core.executor.result_types import ExecutionMetrics
from app.schemas.tests import TestCase
from app.core.feedback_loop import FeedbackLoop


class ExecutionResult(BaseModel):
    execution_id: str
    start_time: datetime
    end_time: datetime
    metrics: ExecutionMetrics
    coverage: CoverageMetrics


class ExecutionOrchestrator:
    def __init__(self, max_parallel: int = 10, retry_attempts: int = 3):
        self.executor = HybridExecutor(max_parallel=max_parallel, retry_attempts=retry_attempts)
        self.coverage_aggregator = CoverageAggregator()
        self.executions: Dict[str, ExecutionResult] = {}

    async def execute_test_suite(
        self,
        tests: List[TestCase],
        suite_id: Optional[str] = None
    ) -> ExecutionResult:
        """Execute a suite of tests and aggregate results."""
        start_time = datetime.now()
        
        # Execute tests
        metrics = await self.executor.execute(tests)
        
        # Analyze coverage
        coverage = self.coverage_aggregator.analyze_coverage(tests, metrics.results)
        
        # Create execution result
        execution_id = suite_id or datetime.now().strftime("%Y%m%d_%H%M%S")
        result = ExecutionResult(
            execution_id=execution_id,
            start_time=start_time,
            end_time=datetime.now(),
            metrics=metrics,
            coverage=coverage
        )
        
        # Store result
        self.executions[execution_id] = result
        
        return result
    
    def get_execution_result(self, execution_id: str) -> Optional[ExecutionResult]:
        """Retrieve results for a specific execution."""
        return self.executions.get(execution_id)
    
    def get_latest_executions(self, limit: int = 10) -> List[ExecutionResult]:
        """Get the most recent test executions."""
        sorted_executions = sorted(
            self.executions.values(),
            key=lambda x: x.start_time,
            reverse=True
        )
        return sorted_executions[:limit]

    async def enhance_test_suite(
        self,
        execution_result: ExecutionResult,
        feedback_loop: FeedbackLoop
    ) -> List[TestCase]:
        """Use feedback loop to enhance test suite based on execution results."""
        return await feedback_loop.analyze_and_enhance(
            executed_tests=execution_result.metrics.results,
            results=execution_result.metrics.results,
            coverage=execution_result.coverage
        )