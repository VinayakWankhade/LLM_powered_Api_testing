"""
Intelligent Test Prioritization Scheduler - Phase 6 from flowchart
Implements RL-based test prioritization and scheduling optimization.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from app.schemas.tests import TestCase, TestType
from app.core.coverage_aggregator import CoverageMetrics, CoverageAggregator
from app.core.rl.agent import RLAgent
from app.core.rl.environment import TestEnvironment
from app.services.knowledge_base import KnowledgeBase

logger = logging.getLogger(__name__)


class TestPriority(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass
class PrioritizedTestCase:
    test_case: TestCase
    priority: TestPriority
    priority_score: float
    risk_score: float
    coverage_impact: float
    estimated_execution_time: float
    dependencies: List[str]


@dataclass
class ExecutionBatch:
    batch_id: str
    tests: List[PrioritizedTestCase]
    estimated_duration: float
    parallelizable: bool
    dependency_level: int


class TestPrioritizationScheduler:
    """
    Intelligent scheduler that uses RL and risk analysis to prioritize and schedule tests
    according to the flowchart Phase 6 design.
    """
    
    def __init__(
        self,
        knowledge_base: KnowledgeBase,
        rl_agent: RLAgent,
        coverage_aggregator: CoverageAggregator,
        max_parallel_batches: int = 5
    ):
        self.kb = knowledge_base
        self.rl_agent = rl_agent
        self.coverage_aggregator = coverage_aggregator
        self.max_parallel_batches = max_parallel_batches
        
        # Historical data for learning
        self.execution_history: List[Dict[str, Any]] = []
        self.priority_feedback: List[Dict[str, Any]] = []
        
    async def prioritize_and_schedule(
        self,
        tests: List[TestCase],
        current_coverage: Optional[CoverageMetrics] = None,
        time_budget: Optional[float] = None
    ) -> List[ExecutionBatch]:
        """
        Main method to prioritize and schedule tests based on RL optimization
        and risk analysis.
        """
        logger.info(f"Prioritizing and scheduling {len(tests)} tests...")
        
        # Step 1: Calculate priority scores for each test
        prioritized_tests = await self._calculate_test_priorities(tests, current_coverage)
        
        # Step 2: Apply RL-based optimization
        optimized_tests = await self._apply_rl_optimization(prioritized_tests, current_coverage)
        
        # Step 3: Create execution batches considering dependencies
        execution_batches = await self._create_execution_batches(optimized_tests, time_budget)
        
        # Step 4: Final scheduling optimization
        scheduled_batches = await self._optimize_batch_scheduling(execution_batches)
        
        logger.info(f"Created {len(scheduled_batches)} execution batches")
        return scheduled_batches
    
    async def _calculate_test_priorities(
        self,
        tests: List[TestCase],
        current_coverage: Optional[CoverageMetrics]
    ) -> List[PrioritizedTestCase]:
        """Calculate priority scores for each test case."""
        prioritized_tests = []
        
        for test in tests:
            # Base priority factors
            risk_score = await self._calculate_risk_score(test)
            coverage_impact = await self._calculate_coverage_impact(test, current_coverage)
            execution_time = await self._estimate_execution_time(test)
            
            # Combined priority score using weighted factors
            priority_score = (
                risk_score * 0.4 +
                coverage_impact * 0.3 +
                self._get_type_priority_weight(test.type) * 0.2 +
                (1.0 / max(execution_time, 0.1)) * 0.1  # Favor faster tests slightly
            )
            
            # Determine priority category
            priority = self._score_to_priority(priority_score)
            
            # Get dependencies
            dependencies = await self._analyze_dependencies(test)
            
            prioritized_tests.append(PrioritizedTestCase(
                test_case=test,
                priority=priority,
                priority_score=priority_score,
                risk_score=risk_score,
                coverage_impact=coverage_impact,
                estimated_execution_time=execution_time,
                dependencies=dependencies
            ))
        
        # Sort by priority score (highest first)
        prioritized_tests.sort(key=lambda x: x.priority_score, reverse=True)
        return prioritized_tests
    
    async def _apply_rl_optimization(
        self,
        prioritized_tests: List[PrioritizedTestCase],
        current_coverage: Optional[CoverageMetrics]
    ) -> List[PrioritizedTestCase]:
        """Apply RL-based optimization to the prioritized test list."""
        if not self.rl_agent or len(prioritized_tests) <= 1:
            return prioritized_tests
        
        try:
            # Create environment state
            state = self._create_rl_state(prioritized_tests, current_coverage)
            
            # Get RL recommendations for test ordering
            if hasattr(self.rl_agent, 'predict_action'):
                # Use RL agent to optimize test ordering
                for i in range(min(len(prioritized_tests), 10)):  # Optimize top 10 tests
                    action = await self.rl_agent.predict_action(state)
                    if action and 0 <= action < len(prioritized_tests):
                        # Swap tests based on RL recommendation
                        if action != i:
                            prioritized_tests[i], prioritized_tests[action] = \
                                prioritized_tests[action], prioritized_tests[i]
            
        except Exception as e:
            logger.warning(f"RL optimization failed, using basic prioritization: {e}")
        
        return prioritized_tests
    
    async def _create_execution_batches(
        self,
        prioritized_tests: List[PrioritizedTestCase],
        time_budget: Optional[float]
    ) -> List[ExecutionBatch]:
        """Create execution batches considering dependencies and parallelization."""
        batches = []
        remaining_tests = prioritized_tests.copy()
        batch_counter = 0
        dependency_levels: Dict[str, int] = {}
        
        while remaining_tests and (time_budget is None or time_budget > 0):
            batch_counter += 1
            batch_id = f"batch_{batch_counter}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Find tests that can be executed in this batch
            current_batch_tests = []
            current_batch_duration = 0.0
            
            # First, add tests with no dependencies
            no_dep_tests = [t for t in remaining_tests if not t.dependencies]
            
            for test in no_dep_tests[:self.max_parallel_batches]:
                if time_budget is None or current_batch_duration + test.estimated_execution_time <= time_budget:
                    current_batch_tests.append(test)
                    current_batch_duration += test.estimated_execution_time
                    remaining_tests.remove(test)
            
            # Then add tests whose dependencies are satisfied
            satisfied_dep_tests = []
            for test in remaining_tests:
                if all(dep in dependency_levels for dep in test.dependencies):
                    satisfied_dep_tests.append(test)
            
            for test in satisfied_dep_tests:
                if len(current_batch_tests) < self.max_parallel_batches:
                    if time_budget is None or current_batch_duration + test.estimated_execution_time <= time_budget:
                        current_batch_tests.append(test)
                        current_batch_duration += test.estimated_execution_time
                        remaining_tests.remove(test)
            
            if not current_batch_tests:
                # If no tests can be added, break to avoid infinite loop
                logger.warning("No more tests can be scheduled due to dependency constraints")
                break
            
            # Determine if batch can be parallelized
            parallelizable = len(current_batch_tests) > 1 and all(
                not test.dependencies or 
                all(dep in dependency_levels for dep in test.dependencies)
                for test in current_batch_tests
            )
            
            # Calculate dependency level for this batch
            max_dep_level = 0
            if current_batch_tests:
                max_dep_level = max(
                    max([dependency_levels.get(dep, 0) for dep in test.dependencies] + [0])
                    for test in current_batch_tests
                ) + 1
            
            batch = ExecutionBatch(
                batch_id=batch_id,
                tests=current_batch_tests,
                estimated_duration=current_batch_duration,
                parallelizable=parallelizable,
                dependency_level=max_dep_level
            )
            
            batches.append(batch)
            
            # Update dependency levels for completed tests
            for test in current_batch_tests:
                dependency_levels[test.test_case.test_id] = max_dep_level
            
            # Update remaining time budget
            if time_budget is not None:
                time_budget -= current_batch_duration
        
        return batches
    
    async def _optimize_batch_scheduling(self, batches: List[ExecutionBatch]) -> List[ExecutionBatch]:
        """Final optimization of batch scheduling order."""
        # Sort batches by priority and dependency levels
        def batch_priority(batch: ExecutionBatch) -> Tuple[int, float, bool]:
            avg_priority = sum(test.priority_score for test in batch.tests) / len(batch.tests)
            return (
                -batch.dependency_level,  # Lower dependency level first (negative for desc order)
                -avg_priority,           # Higher priority first (negative for desc order)
                -batch.parallelizable    # Parallelizable batches first
            )
        
        optimized_batches = sorted(batches, key=batch_priority)
        
        # Log scheduling decisions
        logger.info("Batch scheduling optimization completed:")
        for i, batch in enumerate(optimized_batches):
            logger.info(f"  Batch {i+1}: {len(batch.tests)} tests, "
                       f"level {batch.dependency_level}, "
                       f"parallel={batch.parallelizable}, "
                       f"duration={batch.estimated_duration:.2f}s")
        
        return optimized_batches
    
    async def _calculate_risk_score(self, test: TestCase) -> float:
        """Calculate risk score for a test case based on historical data and patterns."""
        try:
            # Get historical failure data from knowledge base
            query_result = self.kb.query(
                query_embeddings=None,
                where={"endpoint": test.endpoint, "method": test.method},
                n_results=10
            )
            
            base_risk = 0.3  # Base risk score
            
            # Adjust based on test type
            type_risk_multipliers = {
                TestType.security: 1.5,
                TestType.performance: 1.2,
                TestType.functional: 1.0,
                TestType.edge: 1.3
            }
            
            risk_score = base_risk * type_risk_multipliers.get(test.type, 1.0)
            
            # Adjust based on endpoint complexity
            if test.endpoint:
                path_segments = len(test.endpoint.split('/'))
                risk_score += min(path_segments * 0.05, 0.3)
            
            return min(risk_score, 1.0)
            
        except Exception as e:
            logger.warning(f"Risk calculation failed for {test.test_id}: {e}")
            return 0.5  # Default medium risk
    
    async def _calculate_coverage_impact(
        self,
        test: TestCase,
        current_coverage: Optional[CoverageMetrics]
    ) -> float:
        """Calculate how much this test would improve overall coverage."""
        if not current_coverage:
            return 0.8  # High impact if no existing coverage
        
        impact_score = 0.0
        
        # Endpoint coverage impact
        if test.endpoint and test.endpoint not in current_coverage.covered_endpoints:
            impact_score += 0.4
        
        # Method coverage impact
        if test.method and test.method not in current_coverage.covered_methods:
            impact_score += 0.3
        
        # Parameter coverage impact
        if test.input_data:
            uncovered_params = set(test.input_data.keys()) - current_coverage.covered_parameters
            if uncovered_params:
                impact_score += min(len(uncovered_params) * 0.1, 0.3)
        
        return min(impact_score, 1.0)
    
    async def _estimate_execution_time(self, test: TestCase) -> float:
        """Estimate execution time for a test case."""
        base_time = 1.0  # Base 1 second
        
        # Adjust based on test type
        type_multipliers = {
            TestType.performance: 3.0,  # Performance tests take longer
            TestType.security: 2.0,     # Security tests may be complex
            TestType.functional: 1.0,   # Standard functional tests
            TestType.edge: 1.5          # Edge cases may need more time
        }
        
        estimated_time = base_time * type_multipliers.get(test.type, 1.0)
        
        # Adjust based on input complexity
        if test.input_data:
            estimated_time += len(test.input_data) * 0.1
        
        return estimated_time
    
    def _get_type_priority_weight(self, test_type: TestType) -> float:
        """Get priority weight based on test type."""
        weights = {
            TestType.security: 1.0,     # Highest priority
            TestType.functional: 0.8,   # High priority
            TestType.edge: 0.6,         # Medium priority
            TestType.performance: 0.4   # Lower priority (run after functional)
        }
        return weights.get(test_type, 0.5)
    
    def _score_to_priority(self, score: float) -> TestPriority:
        """Convert numerical score to priority enum."""
        if score >= 0.8:
            return TestPriority.CRITICAL
        elif score >= 0.6:
            return TestPriority.HIGH
        elif score >= 0.4:
            return TestPriority.MEDIUM
        else:
            return TestPriority.LOW
    
    async def _analyze_dependencies(self, test: TestCase) -> List[str]:
        """Analyze test dependencies."""
        dependencies = []
        
        # Check for authentication dependencies
        if any(keyword in test.description.lower() 
               for keyword in ["auth", "login", "token", "credential"]):
            dependencies.append("authentication_setup")
        
        # Check for data dependencies
        if any(keyword in test.description.lower() 
               for keyword in ["create", "update", "delete"]):
            if "delete" in test.description.lower():
                dependencies.append("data_creation")
            elif "update" in test.description.lower():
                dependencies.append("data_creation")
        
        return dependencies
    
    def _create_rl_state(
        self,
        prioritized_tests: List[PrioritizedTestCase],
        current_coverage: Optional[CoverageMetrics]
    ) -> Dict[str, Any]:
        """Create state representation for RL agent."""
        state = {
            "test_count": len(prioritized_tests),
            "avg_priority": sum(t.priority_score for t in prioritized_tests) / len(prioritized_tests) if prioritized_tests else 0,
            "high_priority_ratio": sum(1 for t in prioritized_tests if t.priority in [TestPriority.CRITICAL, TestPriority.HIGH]) / len(prioritized_tests) if prioritized_tests else 0,
            "current_coverage": {
                "endpoint": current_coverage.endpoint_coverage if current_coverage else 0,
                "method": current_coverage.method_coverage if current_coverage else 0,
                "parameter": current_coverage.parameter_coverage if current_coverage else 0,
                "security": current_coverage.security_coverage if current_coverage else 0
            } if current_coverage else {},
            "test_type_distribution": self._get_test_type_distribution(prioritized_tests)
        }
        return state
    
    def _get_test_type_distribution(self, tests: List[PrioritizedTestCase]) -> Dict[str, float]:
        """Get distribution of test types."""
        if not tests:
            return {}
        
        type_counts = {}
        for test in tests:
            test_type = test.test_case.type.value
            type_counts[test_type] = type_counts.get(test_type, 0) + 1
        
        total = len(tests)
        return {k: v / total for k, v in type_counts.items()}
    
    async def update_execution_feedback(
        self,
        batch_id: str,
        execution_results: List[Dict[str, Any]],
        actual_duration: float
    ):
        """Update the scheduler with execution feedback for learning."""
        feedback = {
            "batch_id": batch_id,
            "timestamp": datetime.now(),
            "results": execution_results,
            "actual_duration": actual_duration,
            "success_rate": sum(1 for r in execution_results if r.get("success", False)) / len(execution_results) if execution_results else 0
        }
        
        self.execution_history.append(feedback)
        
        # Keep only recent feedback (last 1000 entries)
        if len(self.execution_history) > 1000:
            self.execution_history = self.execution_history[-1000:]
        
        # Update RL agent if available
        if hasattr(self.rl_agent, 'update'):
            try:
                # Calculate reward based on execution success
                reward = feedback["success_rate"] * 2 - 1  # Scale to [-1, 1]
                await self.rl_agent.update(
                    state=None,  # Would need proper state representation
                    action=0,    # Would need action representation
                    reward=reward
                )
            except Exception as e:
                logger.warning(f"Failed to update RL agent: {e}")
    
    def get_scheduling_statistics(self) -> Dict[str, Any]:
        """Get statistics about scheduling performance."""
        if not self.execution_history:
            return {"message": "No execution history available"}
        
        recent_executions = self.execution_history[-50:]  # Last 50 executions
        
        avg_success_rate = sum(e["success_rate"] for e in recent_executions) / len(recent_executions)
        avg_duration_accuracy = sum(
            abs(e.get("estimated_duration", 0) - e["actual_duration"]) / max(e["actual_duration"], 0.1)
            for e in recent_executions if "estimated_duration" in e
        ) / len(recent_executions)
        
        return {
            "total_executions": len(self.execution_history),
            "recent_avg_success_rate": round(avg_success_rate, 3),
            "avg_duration_accuracy": round(1 - min(avg_duration_accuracy, 1), 3),
            "last_execution": self.execution_history[-1]["timestamp"].isoformat() if self.execution_history else None
        }