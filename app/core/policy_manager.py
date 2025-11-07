from typing import Any, Dict, List
from app.core.rl_optimizer import RLPolicyManager


class PolicyManager:
    def __init__(self):
        # Initialize the RL policy manager
        self.rl_policy_manager = RLPolicyManager()
        
    def choose_tests(self, candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Enhanced test selection using RL policy
        # For now, return as-is but in future can apply RL-based prioritization
        return candidates
    
    async def update_policy(
        self,
        execution_results: Dict[str, Any],
        coverage_target: float = 0.8
    ) -> Dict[str, Any]:
        """Update RL policy based on execution results."""
        return await self.rl_policy_manager.update_policy(execution_results, coverage_target)

