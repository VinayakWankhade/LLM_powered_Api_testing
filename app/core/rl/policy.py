from __future__ import annotations

import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime
import json

from app.schemas.tests import TestCase
from app.core.rl.agent import RLAgent
from app.core.rl.environment import TestState
from app.core.coverage_aggregator import CoverageMetrics


class PolicyEntry:
    def __init__(
        self,
        test_id: str,
        priority: float,
        execution_count: int = 0,
        success_rate: float = 1.0,
        last_execution: Optional[datetime] = None
    ):
        self.test_id = test_id
        self.priority = priority
        self.execution_count = execution_count
        self.success_rate = success_rate
        self.last_execution = last_execution or datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "test_id": self.test_id,
            "priority": self.priority,
            "execution_count": self.execution_count,
            "success_rate": self.success_rate,
            "last_execution": self.last_execution.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> PolicyEntry:
        return cls(
            test_id=data["test_id"],
            priority=data["priority"],
            execution_count=data["execution_count"],
            success_rate=data["success_rate"],
            last_execution=datetime.fromisoformat(data["last_execution"])
        )


class PolicyTable:
    def __init__(self):
        self.entries: Dict[str, PolicyEntry] = {}
        self.last_update = datetime.now()

    def update_entry(
        self,
        test_id: str,
        priority: float,
        success: Optional[bool] = None
    ) -> None:
        """Update or create a policy entry."""
        if test_id not in self.entries:
            self.entries[test_id] = PolicyEntry(test_id=test_id, priority=priority)
        else:
            entry = self.entries[test_id]
            entry.priority = priority
            entry.execution_count += 1
            if success is not None:
                entry.success_rate = (
                    (entry.success_rate * (entry.execution_count - 1) + int(success))
                    / entry.execution_count
                )
            entry.last_execution = datetime.now()

    def get_entry(self, test_id: str) -> Optional[PolicyEntry]:
        """Get policy entry for a test."""
        return self.entries.get(test_id)

    def save(self, path: str) -> None:
        """Save policy table to file."""
        data = {
            "last_update": self.last_update.isoformat(),
            "entries": {k: v.to_dict() for k, v in self.entries.items()}
        }
        with open(path, "w") as f:
            json.dump(data, f, indent=2)

    def load(self, path: str) -> None:
        """Load policy table from file."""
        with open(path, "r") as f:
            data = json.load(f)
        
        # Handle different policy file formats
        if "last_update" in data and "entries" in data:
            # Our expected format
            self.last_update = datetime.fromisoformat(data["last_update"])
            self.entries = {
                k: PolicyEntry.from_dict(v) for k, v in data["entries"].items()
            }
        else:
            # Legacy or different format - initialize empty
            self.last_update = datetime.now()
            self.entries = {}


class PolicyUpdater:
    def __init__(
        self,
        agent: RLAgent,
        policy_path: Optional[str] = None,
        update_threshold: float = 0.1
    ):
        self.agent = agent
        self.policy_table = PolicyTable()
        self.policy_path = policy_path
        self.update_threshold = update_threshold
        
        if policy_path:
            try:
                self.policy_table.load(policy_path)
            except FileNotFoundError:
                pass

    def update_policy(
        self,
        state: TestState,
        coverage: CoverageMetrics,
        execution_history: Dict[str, Any]
    ) -> Dict[str, float]:
        """Update policy based on RL agent recommendations."""
        # Get priorities from RL agent
        priorities = self.agent.update_priorities(coverage, execution_history)
        
        # Update policy table
        for test_id, priority in priorities.items():
            success = execution_history.get(test_id, {}).get("last_result", None)
            self.policy_table.update_entry(test_id, priority, success)
        
        # Save updated policy
        if self.policy_path:
            self.policy_table.save(self.policy_path)
        
        return priorities

    def get_test_priority(self, test: TestCase) -> float:
        """Get priority for a test case."""
        entry = self.policy_table.get_entry(test.test_id)
        return entry.priority if entry else 0.5

    def should_update_policy(
        self,
        current_coverage: float,
        last_coverage: float
    ) -> bool:
        """Determine if policy should be updated."""
        return abs(current_coverage - last_coverage) > self.update_threshold

    def get_execution_order(self, tests: List[TestCase]) -> List[TestCase]:
        """Get optimal execution order based on current policy."""
        # Sort tests by priority
        return sorted(
            tests,
            key=lambda t: self.get_test_priority(t),
            reverse=True
        )

    def get_parallelization_factor(
        self,
        test: TestCase,
        available_resources: int
    ) -> int:
        """Determine optimal parallelization factor for a test."""
        entry = self.policy_table.get_entry(test.test_id)
        if not entry:
            return 1
            
        # Higher parallelization for:
        # 1. Higher priority tests
        # 2. Tests with good success rate
        # 3. Tests that haven't been executed recently
        base_factor = int(entry.priority * entry.success_rate * 3) + 1
        time_factor = (datetime.now() - entry.last_execution).total_seconds() / 3600
        
        parallel_factor = min(
            base_factor + int(time_factor),
            available_resources
        )
        return max(1, parallel_factor)

    def get_policy_stats(self) -> Dict[str, Any]:
        """Get current policy statistics."""
        if not self.policy_table.entries:
            return {}
            
        priorities = [e.priority for e in self.policy_table.entries.values()]
        success_rates = [e.success_rate for e in self.policy_table.entries.values()]
        
        return {
            "total_tests": len(self.policy_table.entries),
            "avg_priority": np.mean(priorities),
            "avg_success_rate": np.mean(success_rates),
            "last_update": self.policy_table.last_update.isoformat()
        }