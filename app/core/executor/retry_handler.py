from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Any, Callable, TypeVar

from app.core.executor.result_types import TestResult
from app.schemas.tests import TestCase

T = TypeVar('T')

class RetryHandler:
    def __init__(self, max_attempts: int = 3, base_delay: float = 1.0):
        self.max_attempts = max_attempts
        self.base_delay = base_delay
        
    async def retry(
        self,
        func: Callable[[TestCase], TestResult],
        test_case: TestCase
    ) -> TestResult:
        """Retry a failed test with exponential backoff."""
        last_error = None
        
        for attempt in range(self.max_attempts):
            try:
                result = await func(test_case)
                if result.success:
                    return result
                last_error = result.error
            except Exception as e:
                last_error = str(e)
            
            if attempt < self.max_attempts - 1:
                delay = self.base_delay * (2 ** attempt)  # Exponential backoff
                await asyncio.sleep(delay)
        
        # If we get here, all attempts failed
        return TestResult(
            test_id=test_case.test_id,
            success=False,
            error=f"All retry attempts failed. Last error: {last_error}",
            start_time=datetime.now(),
            end_time=datetime.now()
        )