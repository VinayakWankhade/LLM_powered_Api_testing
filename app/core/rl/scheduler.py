from typing import List, Dict, Any, Optional
import logging
from datetime import datetime, timedelta

from app.schemas.tests import TestCase
from app.core.rl.policy import PolicyUpdater
from app.core.coverage_aggregator import CoverageMetrics
from app.core.execution_engine import ExecutionEngine

logger = logging.getLogger(__name__)


class ExecutionScheduler:
    def __init__(
        self,
        policy_updater: PolicyUpdater,
        execution_engine: ExecutionEngine,
        max_parallel_tests: int = 5,
        min_coverage_increase: float = 0.01,
        max_retries: int = 3,
        cooldown_period: int = 3600  # 1 hour in seconds
    ):
        self.policy_updater = policy_updater
        self.execution_engine = execution_engine
        self.max_parallel_tests = max_parallel_tests
        self.min_coverage_increase = min_coverage_increase
        self.max_retries = max_retries
        self.cooldown_period = cooldown_period
        
        self._last_coverage = 0.0
        self._coverage_history: List[float] = []
        self._execution_history: Dict[str, Any] = {}

    async def schedule_tests(
        self,
        tests: List[TestCase],
        coverage: CoverageMetrics
    ) -> Dict[str, Any]:
        """Schedule and execute tests optimally."""
        # Get execution order from policy
        ordered_tests = self.policy_updater.get_execution_order(tests)
        
        # Track results
        results = {}
        executed_count = 0
        total_coverage = 0.0
        
        # Process tests in batches based on priority and resources
        current_batch: List[TestCase] = []
        remaining_resources = self.max_parallel_tests
        
        for test in ordered_tests:
            # Skip recently executed tests in cooldown
            if self._in_cooldown(test):
                continue
                
            # Determine parallelization factor
            parallel_factor = self.policy_updater.get_parallelization_factor(
                test, remaining_resources
            )
            
            if parallel_factor <= remaining_resources:
                current_batch.append(test)
                remaining_resources -= parallel_factor
                
                # Execute batch if we're out of resources
                if remaining_resources == 0:
                    batch_results = await self._execute_batch(current_batch, coverage)
                    results.update(batch_results)
                    executed_count += len(current_batch)
                    current_batch = []
                    remaining_resources = self.max_parallel_tests
        
        # Execute any remaining tests
        if current_batch:
            batch_results = await self._execute_batch(current_batch, coverage)
            results.update(batch_results)
            executed_count += len(current_batch)
        
        # Update coverage history
        total_coverage = coverage.get_total_coverage()
        self._coverage_history.append(total_coverage)
        
        # Update policy if needed
        if self.policy_updater.should_update_policy(
            total_coverage,
            self._last_coverage
        ):
            self.policy_updater.update_policy(
                None,  # State will be determined by the agent
                coverage,
                self._execution_history
            )
            self._last_coverage = total_coverage
        
        return {
            "executed_tests": executed_count,
            "total_tests": len(tests),
            "coverage": total_coverage,
            "results": results
        }

    async def _execute_batch(
        self,
        batch: List[TestCase],
        coverage: CoverageMetrics
    ) -> Dict[str, Any]:
        """Execute a batch of tests."""
        results = {}
        
        # Execute tests in batch
        for test in batch:
            retry_count = 0
            success = False
            
            while not success and retry_count < self.max_retries:
                try:
                    result = await self.execution_engine.execute_test(test)
                    success = result["status"] == "success"
                    
                    # Update execution history
                    self._execution_history[test.test_id] = {
                        "last_execution": datetime.now(),
                        "last_result": success,
                        "retry_count": retry_count
                    }
                    
                    results[test.test_id] = result
                except Exception as e:
                    logger.error(f"Error executing test {test.test_id}: {str(e)}")
                    retry_count += 1
            
            # Log if max retries exceeded
            if retry_count >= self.max_retries:
                logger.warning(f"Max retries exceeded for test {test.test_id}")
                
        return results

    def _in_cooldown(self, test: TestCase) -> bool:
        """Check if test is in cooldown period."""
        last_execution = self._execution_history.get(test.test_id, {}).get(
            "last_execution"
        )
        if not last_execution:
            return False
            
        time_since_last = (datetime.now() - last_execution).total_seconds()
        return time_since_last < self.cooldown_period

    def get_schedule_stats(self) -> Dict[str, Any]:
        """Get scheduling statistics."""
        return {
            "coverage_improvement": max(0, self._last_coverage - (self._coverage_history[0] if self._coverage_history else 0)) * 100,
            "execution_time_saved": len(self._execution_history) * 0.5,  # Mock time saved
            "resource_efficiency": 1.2,  # Mock efficiency multiplier
            "policy_updates": len(self._coverage_history) // 10  # Update every 10 executions
        }

    def get_resource_utilization(self) -> Dict[str, List[float]]:
        """Get resource utilization metrics."""
        # Mock resource utilization data
        import random
        timestamps = []
        cpu_usage = []
        memory_usage = []
        
        for i in range(24):  # 24 hours of data
            timestamps.append(f"{i:02d}:00")
            cpu_usage.append(30 + random.random() * 40)  # 30-70% CPU
            memory_usage.append(40 + random.random() * 30)  # 40-70% Memory
        
        return {
            "cpu_usage": cpu_usage,
            "memory_usage": memory_usage,
            "timestamps": timestamps
        }