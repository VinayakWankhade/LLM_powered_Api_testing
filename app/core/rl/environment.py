from __future__ import annotations

import numpy as np
from typing import Dict, List, Any, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
# Optional gym dependency
try:
    import gym
    from gym import spaces
    HAS_GYM = True
except ImportError:
    gym = None
    spaces = None
    HAS_GYM = False
    
    # Fallback implementations
    class MockEnv:
        def __init__(self):
            pass
    
    class MockSpaces:
        @staticmethod
        def Discrete(n):
            return None
        
        @staticmethod
        def Box(low, high, dtype):
            return None

from app.schemas.tests import TestCase, TestType
from app.core.executor.result_types import TestResult
from app.core.coverage_aggregator import CoverageMetrics


class TestAction(Enum):
    EXECUTE = "execute"
    SKIP = "skip"
    RETRY = "retry"
    PARALLEL = "parallel"


@dataclass
class TestState:
    coverage: CoverageMetrics
    failure_rate: float
    execution_time: float
    resource_usage: float
    priority_score: float


class TestEnvironment:
    """Custom Environment for test execution optimization."""
    
    def __init__(self, test_pool: List[TestCase]):
        if HAS_GYM and gym:
            # Initialize gym environment if available
            pass
        
        self.test_pool = test_pool
        self.current_test_idx = 0
        self.executed_tests: List[str] = []
        self.results: Dict[str, TestResult] = {}
        self.coverage_history: List[float] = []
        
        # Define action space:
        # 0: Execute, 1: Skip, 2: Retry, 3: Parallel
        if HAS_GYM and spaces:
            self.action_space = spaces.Discrete(4)
            # Define observation space:
            # [coverage, failure_rate, execution_time, resource_usage, priority]
            self.observation_space = spaces.Box(
                low=np.array([0, 0, 0, 0, 0]),
                high=np.array([1, 1, np.inf, 1, 1]),
                dtype=np.float32
            )
        else:
            self.action_space = None
            self.observation_space = None

    def reset(self) -> np.ndarray:
        """Reset environment to initial state."""
        self.current_test_idx = 0
        self.executed_tests = []
        self.results = {}
        self.coverage_history = []
        
        return self._get_observation()

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, Dict]:
        """Execute one step in the environment."""
        if self.current_test_idx >= len(self.test_pool):
            return self._get_observation(), 0, True, {}
            
        current_test = self.test_pool[self.current_test_idx]
        action_type = TestAction(action)
        
        # Execute action
        reward = self._execute_action(action_type, current_test)
        
        # Move to next test
        self.current_test_idx += 1
        done = self.current_test_idx >= len(self.test_pool)
        
        return self._get_observation(), reward, done, {}

    def _execute_action(self, action: TestAction, test: TestCase) -> float:
        """Execute action and return reward."""
        if action == TestAction.EXECUTE:
            return self._handle_execute(test)
        elif action == TestAction.SKIP:
            return self._handle_skip(test)
        elif action == TestAction.RETRY:
            return self._handle_retry(test)
        elif action == TestAction.PARALLEL:
            return self._handle_parallel(test)
        return 0.0

    def _handle_execute(self, test: TestCase) -> float:
        """Handle test execution action."""
        self.executed_tests.append(test.test_id)
        coverage_before = self._calculate_coverage()
        
        # Simulate test execution (in real system, this would be actual execution)
        success_prob = 0.8 if test.type == TestType.functional else 0.7
        success = np.random.random() < success_prob
        
        if success:
            coverage_after = coverage_before + (1 - coverage_before) * 0.1
            self.coverage_history.append(coverage_after)
            return self._calculate_reward(
                coverage_delta=coverage_after - coverage_before,
                execution_time=1.0,
                success=True
            )
        
        return self._calculate_reward(
            coverage_delta=0,
            execution_time=1.0,
            success=False
        )

    def _handle_skip(self, test: TestCase) -> float:
        """Handle test skip action."""
        # Small negative reward for skipping to discourage excessive skipping
        return -0.1

    def _handle_retry(self, test: TestCase) -> float:
        """Handle test retry action."""
        if test.test_id not in self.executed_tests:
            return -0.2  # Penalty for retrying non-executed test
            
        # Higher success probability for retry
        success_prob = 0.9
        success = np.random.random() < success_prob
        
        if success:
            return 0.5  # Reward for successful retry
        return -0.3  # Penalty for failed retry

    def _handle_parallel(self, test: TestCase) -> float:
        """Handle parallel execution action."""
        # Simulate parallel execution benefits/costs
        resource_usage = np.random.random()  # Simulate resource usage
        if resource_usage > 0.8:
            return -0.2  # Penalty for high resource usage
        return 0.3  # Reward for efficient parallel execution

    def _get_observation(self) -> np.ndarray:
        """Get current state observation."""
        if not self.executed_tests:
            return np.zeros(5, dtype=np.float32)
            
        coverage = self._calculate_coverage()
        failure_rate = self._calculate_failure_rate()
        execution_time = len(self.executed_tests)
        resource_usage = np.random.random()  # Simulate resource usage
        priority = self._calculate_priority()
        
        return np.array([
            coverage,
            failure_rate,
            min(execution_time / 100.0, 1.0),  # Normalize
            resource_usage,
            priority
        ], dtype=np.float32)

    def _calculate_coverage(self) -> float:
        """Calculate current test coverage."""
        if not self.coverage_history:
            return 0.0
        return self.coverage_history[-1]

    def _calculate_failure_rate(self) -> float:
        """Calculate current failure rate."""
        if not self.results:
            return 0.0
        failures = sum(1 for r in self.results.values() if not r.success)
        return failures / len(self.results)

    def _calculate_priority(self) -> float:
        """Calculate priority score based on current state."""
        if not self.executed_tests:
            return 1.0
            
        coverage = self._calculate_coverage()
        failure_rate = self._calculate_failure_rate()
        
        # Higher priority for:
        # - Lower coverage (more room for improvement)
        # - Higher failure rate (needs attention)
        priority = (1 - coverage) * 0.7 + failure_rate * 0.3
        return min(max(priority, 0.0), 1.0)

    def _calculate_reward(
        self,
        coverage_delta: float,
        execution_time: float,
        success: bool
    ) -> float:
        """Calculate reward based on multiple factors."""
        coverage_weight = 0.4
        time_weight = 0.3
        success_weight = 0.3
        
        coverage_reward = coverage_delta * 10  # Scale up the small deltas
        time_penalty = -execution_time / 10  # Normalize time penalty
        success_reward = 1.0 if success else -1.0
        
        total_reward = (
            coverage_weight * coverage_reward +
            time_weight * time_penalty +
            success_weight * success_reward
        )
        
        return total_reward