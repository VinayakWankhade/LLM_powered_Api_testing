from __future__ import annotations

import asyncio
from typing import Dict, List, Optional, Set
import logging
from datetime import datetime

from app.schemas.tests import TestCase, TestType
from app.core.executor.http_runner import HTTPXRunner
from app.core.executor.result_types import TestResult, ExecutionMetrics
from app.core.executor.retry_handler import RetryHandler

logger = logging.getLogger(__name__)

class HybridExecutor:
    def __init__(self, max_parallel: int = 10, retry_attempts: int = 3):
        self.max_parallel = max_parallel
        self.http_runner = HTTPXRunner()
        self.retry_handler = RetryHandler(max_attempts=retry_attempts)
        
    def _group_tests_by_dependency(self, tests: List[TestCase]) -> Dict[str, List[TestCase]]:
        """Group tests by their dependency requirements."""
        groups: Dict[str, List[TestCase]] = {
            "sequential": [],  # Tests that must run in sequence
            "parallel": []     # Tests that can run in parallel
        }
        
        for test in tests:
            # Functional and security tests often have dependencies
            if test.type in {TestType.functional, TestType.security}:
                if self._has_dependencies(test):
                    groups["sequential"].append(test)
                    continue
            # Performance and edge tests usually can run in parallel
            groups["parallel"].append(test)
            
        return groups
    
    def _has_dependencies(self, test: TestCase) -> bool:
        """Check if a test has dependencies on other tests."""
        # Implement dependency detection logic
        # For example: auth requirements, data setup needs, etc.
        auth_keywords = {"authentication", "authorization", "login", "token"}
        return any(kw in test.description.lower() for kw in auth_keywords)
    
    async def _execute_sequential(self, tests: List[TestCase]) -> List[TestResult]:
        """Execute tests that must run in sequence."""
        results = []
        for test in tests:
            try:
                result = await self.http_runner.execute_test(test)
                if not result.success:
                    result = await self.retry_handler.retry(self.http_runner.execute_test, test)
                results.append(result)
            except Exception as e:
                logger.error(f"Error executing test {test.test_id}: {str(e)}")
                results.append(TestResult(
                    test_id=test.test_id,
                    success=False,
                    error=str(e),
                    start_time=datetime.now(),
                    end_time=datetime.now()
                ))
        return results
    
    async def _execute_parallel(self, tests: List[TestCase]) -> List[TestResult]:
        """Execute tests that can run in parallel."""
        semaphore = asyncio.Semaphore(self.max_parallel)
        async def bounded_execute(test: TestCase) -> TestResult:
            async with semaphore:
                try:
                    result = await self.http_runner.execute_test(test)
                    if not result.success:
                        result = await self.retry_handler.retry(self.http_runner.execute_test, test)
                    return result
                except Exception as e:
                    logger.error(f"Error executing test {test.test_id}: {str(e)}")
                    return TestResult(
                        test_id=test.test_id,
                        success=False,
                        error=str(e),
                        start_time=datetime.now(),
                        end_time=datetime.now()
                    )
        
        return await asyncio.gather(*(bounded_execute(test) for test in tests))
    
    async def execute(self, tests: List[TestCase]) -> ExecutionMetrics:
        """Main execution method combining sequential and parallel execution."""
        start_time = datetime.now()
        
        # Group tests by execution strategy
        grouped_tests = self._group_tests_by_dependency(tests)
        
        # Execute sequential tests first
        sequential_results = await self._execute_sequential(grouped_tests["sequential"])
        
        # Then execute parallel tests
        parallel_results = await self._execute_parallel(grouped_tests["parallel"])
        
        # Combine all results
        all_results = sequential_results + parallel_results
        
        end_time = datetime.now()
        
        # Calculate execution metrics
        total = len(all_results)
        successful = sum(1 for r in all_results if r.success)
        failed = total - successful
        
        return ExecutionMetrics(
            total_tests=total,
            successful_tests=successful,
            failed_tests=failed,
            execution_time=(end_time - start_time).total_seconds(),
            results=all_results
        )