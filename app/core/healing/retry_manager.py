from __future__ import annotations

import asyncio
import logging
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.schemas.tests import TestCase
from app.core.executor.http_runner import HTTPRunner
from app.core.healing.orchestrator import HealingResult, HealingStrategy
from app.services.knowledge_base import KnowledgeBase
from app.core.executor.result_types import TestResult


logger = logging.getLogger(__name__)


class RetryPolicy:
    def __init__(
        self,
        max_retries: int = 3,
        initial_delay: float = 1.0,
        max_delay: float = 30.0,
        backoff_factor: float = 2.0
    ):
        self.max_retries = max_retries
        self.initial_delay = initial_delay
        self.max_delay = max_delay
        self.backoff_factor = backoff_factor

    def get_delay(self, retry_count: int) -> float:
        """Calculate delay for the current retry attempt."""
        delay = self.initial_delay * (self.backoff_factor ** retry_count)
        return min(delay, self.max_delay)


class RetryResult(BaseModel):
    test_case: TestCase
    healing_result: HealingResult
    success: bool
    retry_count: int
    final_result: Optional[TestResult] = None
    error: Optional[str] = None
    timestamp: datetime = datetime.now()


class RetryManager:
    def __init__(
        self,
        http_runner: HTTPRunner,
        kb: KnowledgeBase,
        default_policy: Optional[RetryPolicy] = None
    ):
        self.http_runner = http_runner
        self.kb = kb
        self.default_policy = default_policy or RetryPolicy()
        self.retry_history: List[RetryResult] = []
        self.type_policies = {
            "timeout": RetryPolicy(max_retries=5, initial_delay=2.0),
            "rate_limit": RetryPolicy(max_retries=3, initial_delay=5.0),
            "connection": RetryPolicy(max_retries=4, initial_delay=2.0),
            "server_error": RetryPolicy(max_retries=3, initial_delay=3.0)
        }

    async def retry_tests(
        self,
        healing_results: List[HealingResult]
    ) -> List[RetryResult]:
        """Retry healed test cases according to their strategies."""
        retry_tasks = []
        
        for healing_result in healing_results:
            if healing_result.strategy in [HealingStrategy.RETRY, HealingStrategy.REGENERATE]:
                task = self._retry_test(healing_result)
                retry_tasks.append(task)
        
        if not retry_tasks:
            return []
            
        results = await asyncio.gather(*retry_tasks, return_exceptions=True)
        return [r for r in results if isinstance(r, RetryResult)]

    async def _retry_test(self, healing_result: HealingResult) -> RetryResult:
        """Retry a single test case with appropriate policy."""
        test_case = healing_result.test_case
        policy = self._get_retry_policy(test_case, healing_result)
        
        retry_count = 0
        last_error = None
        last_result = None
        
        while retry_count < policy.max_retries:
            try:
                # Wait according to retry policy
                if retry_count > 0:
                    delay = policy.get_delay(retry_count)
                    await asyncio.sleep(delay)
                
                # Execute test case
                result = await self._execute_test(test_case, healing_result)
                
                # Check if test passed
                if result.success:
                    retry_result = RetryResult(
                        test_case=test_case,
                        healing_result=healing_result,
                        success=True,
                        retry_count=retry_count + 1,
                        final_result=result
                    )
                    self.retry_history.append(retry_result)
                    await self._update_knowledge_base(retry_result)
                    return retry_result
                
                last_result = result
                
            except Exception as e:
                last_error = str(e)
                logger.error(f"Retry {retry_count + 1} failed: {last_error}")
            
            retry_count += 1
        
        # All retries failed
        retry_result = RetryResult(
            test_case=test_case,
            healing_result=healing_result,
            success=False,
            retry_count=retry_count,
            final_result=last_result,
            error=last_error
        )
        self.retry_history.append(retry_result)
        await self._update_knowledge_base(retry_result)
        return retry_result

    def _get_retry_policy(
        self,
        test_case: TestCase,
        healing_result: HealingResult
    ) -> RetryPolicy:
        """Get appropriate retry policy based on test case and healing result."""
        if healing_result.error_message:
            error_type = self._categorize_error(healing_result.error_message)
            if error_type in self.type_policies:
                return self.type_policies[error_type]
        
        return self.default_policy

    def _categorize_error(self, error_message: str) -> str:
        """Categorize error message to determine retry policy."""
        error_message = error_message.lower()
        
        if any(word in error_message for word in ["timeout", "timed out"]):
            return "timeout"
        elif any(word in error_message for word in ["rate limit", "too many requests"]):
            return "rate_limit"
        elif any(word in error_message for word in ["connection", "network"]):
            return "connection"
        elif any(word in error_message for word in ["500", "server error"]):
            return "server_error"
        
        return "default"

    async def _execute_test(
        self,
        test_case: TestCase,
        healing_result: HealingResult
    ) -> TestResult:
        """Execute a test case with potential modifications from healing."""
        # Apply healed assertions if available
        if healing_result.new_assertions:
            test_case.assertions = healing_result.new_assertions
        
        # Execute test
        return await self.http_runner.execute_test(test_case)

    async def _update_knowledge_base(self, retry_result: RetryResult) -> None:
        """Update knowledge base with retry results for future reference."""
        if not retry_result.final_result:
            return
            
        # Prepare retry metadata
        retry_data = {
            "test_id": retry_result.test_case.test_id,
            "endpoint": retry_result.test_case.endpoint,
            "method": retry_result.test_case.method,
            "retry_count": retry_result.retry_count,
            "success": retry_result.success,
            "timestamp": retry_result.timestamp.isoformat(),
            "healing_strategy": retry_result.healing_result.strategy.value,
            "final_status": retry_result.final_result.status_code
        }
        
        # Add to knowledge base
        await self.kb.add(
            id=f"retry_{retry_result.test_case.test_id}_{retry_result.timestamp.timestamp()}",
            metadata=retry_data,
            content=str(retry_data)
        )

    def get_retry_history(
        self,
        test_id: Optional[str] = None,
        time_window: Optional[timedelta] = None
    ) -> List[RetryResult]:
        """Get retry history, optionally filtered by test ID and time window."""
        results = self.retry_history
        
        if test_id:
            results = [r for r in results if r.test_case.test_id == test_id]
            
        if time_window:
            cutoff = datetime.now() - time_window
            results = [r for r in results if r.timestamp >= cutoff]
            
        return results

    def get_success_rate(
        self,
        test_id: Optional[str] = None,
        time_window: Optional[timedelta] = None
    ) -> float:
        """Calculate success rate of retries."""
        history = self.get_retry_history(test_id, time_window)
        if not history:
            return 0.0
            
        successful = sum(1 for r in history if r.success)
        return successful / len(history)