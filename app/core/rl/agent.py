from __future__ import annotations

import numpy as np
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
import json
from dataclasses import dataclass
# Optional dependencies for advanced RL features
try:
    from stable_baselines3 import PPO, DQN
    from stable_baselines3.common.callbacks import BaseCallback
    HAS_STABLE_BASELINES = True
except ImportError:
    # Fallback implementations
    PPO = None
    DQN = None
    BaseCallback = None
    HAS_STABLE_BASELINES = False

from app.core.rl.environment import TestEnvironment, TestState
from app.schemas.tests import TestCase
from app.core.coverage_aggregator import CoverageMetrics


@dataclass
class Experience:
    """Experience tuple for RL training."""
    state: np.ndarray
    action: int
    reward: float
    next_state: np.ndarray
    done: bool


class Policy:
    """Policy class combining PPO and Q-learning approaches."""
    
    def __init__(self, state_dim: int, action_dim: int):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.q_table = {}  # Sparse Q-table for memory efficiency
        self.ppo_policy = None  # PPO policy for complex scenarios
        
    def get_action(
        self,
        state: np.ndarray,
        use_ppo: bool = False,
        epsilon: float = 0.1
    ) -> int:
        """Get action using either PPO or Q-learning policy."""
        if use_ppo and self.ppo_policy:
            return self.ppo_policy.predict(state, deterministic=True)[0]
        
        if np.random.random() < epsilon:
            return np.random.randint(self.action_dim)
        
        state_key = self._get_state_key(state)
        if state_key not in self.q_table:
            self.q_table[state_key] = np.zeros(self.action_dim)
        
        return np.argmax(self.q_table[state_key])
    
    def update(
        self,
        state: np.ndarray,
        action: int,
        td_error: float,
        learning_rate: float = 0.1
    ) -> None:
        """Update Q-learning policy."""
        state_key = self._get_state_key(state)
        if state_key not in self.q_table:
            self.q_table[state_key] = np.zeros(self.action_dim)
        
        self.q_table[state_key][action] += learning_rate * td_error
    
    def _get_state_key(self, state: np.ndarray) -> str:
        """Convert state array to hashable key."""
        return json.dumps(state.tolist())


class TestExecutionCallback:
    """Custom callback for logging training metrics."""
    
    def __init__(self, verbose: int = 0):
        if HAS_STABLE_BASELINES and BaseCallback:
            super().__init__(verbose)
        self.verbose = verbose
        self.coverage_history: List[float] = []
        self.reward_history: List[float] = []
        self.execution_times: List[float] = []

    def _on_step(self) -> bool:
        """Called after each step in training."""
        self.coverage_history.append(float(self.training_env.get_attr('coverage_history')[-1]))
        self.reward_history.append(float(self.locals['rewards']))
        return True


class RLAgent:
    """Enhanced RL agent combining PPO and Q-learning approaches."""
    
    def __init__(
        self,
        algorithm: str = "hybrid",  # "ppo", "dqn", or "hybrid"
        learning_rate: float = 0.0003,
        n_steps: int = 2048,
        batch_size: int = 64,
        buffer_size: int = 10000,
        gamma: float = 0.99,
        state_dim: int = 5,  # [coverage, failure_rate, exec_time, resources, priority]
        action_dim: int = 3   # [execute, skip, prioritize]
    ):
        # Core parameters
        self.algorithm = algorithm
        self.learning_rate = learning_rate
        self.n_steps = n_steps
        self.batch_size = batch_size
        self.buffer_size = buffer_size
        self.gamma = gamma
        self.state_dim = state_dim
        self.action_dim = action_dim
        
        # Initialize components
        self.model = None  # PPO/DQN model
        self.callback = TestExecutionCallback()
        self.policy = Policy(state_dim, action_dim)
        self.experience_buffer: List[Experience] = []
        
        # Stats tracking
        self.updates = 0
        self.total_reward = 0
        self.episode_rewards: List[float] = []

    def create_model(self, env: TestEnvironment) -> None:
        """Create RL model based on chosen algorithm."""
        if not HAS_STABLE_BASELINES:
            # Fallback to basic policy-based approach
            self.model = None
            return
            
        if self.algorithm in ["ppo", "hybrid"] and PPO:
            self.model = PPO(
                "MlpPolicy",
                env,
                learning_rate=self.learning_rate,
                n_steps=self.n_steps,
                batch_size=self.batch_size,
                tensorboard_log="./tensorboard_logs/"
            )
        elif self.algorithm == "dqn" and DQN:
            self.model = DQN(
                "MlpPolicy",
                env,
                learning_rate=self.learning_rate,
                batch_size=self.batch_size,
                tensorboard_log="./tensorboard_logs/"
            )

    async def update(
        self,
        state: np.ndarray,
        action: int,
        reward: float,
        next_state: Optional[np.ndarray] = None,
        done: bool = False
    ) -> None:
        """Update agent with new experience."""
        # Store experience
        if next_state is None:
            next_state = np.zeros_like(state)
            done = True
        
        self.experience_buffer.append(Experience(
            state=state,
            action=action,
            reward=reward,
            next_state=next_state,
            done=done
        ))
        
        # Limit buffer size
        if len(self.experience_buffer) > self.buffer_size:
            self.experience_buffer.pop(0)
        
        # Update tracking stats
        self.total_reward += reward
        if done:
            self.episode_rewards.append(self.total_reward)
            self.total_reward = 0
        
        # Perform learning update if enough experiences
        if len(self.experience_buffer) >= self.batch_size:
            await self._learn()
    
    async def _learn(self) -> None:
        """Perform learning update using experience replay."""
        if len(self.experience_buffer) < self.batch_size:
            return
        
        # Use numpy's Generator for improved random number generation
        rng = np.random.default_rng()
        batch_indices = rng.choice(
            len(self.experience_buffer),
            size=self.batch_size,
            replace=False
        )
        batch = [self.experience_buffer[i] for i in batch_indices]
        
        for experience in batch:
            # Calculate TD error
            current_q = self._get_q_value(experience.state, experience.action)
            
            if experience.done:
                target_q = experience.reward
            else:
                next_q = self._get_max_q_value(experience.next_state)
                target_q = experience.reward + self.gamma * next_q
            
            td_error = target_q - current_q
            
            # Update policy
            self.policy.update(
                state=experience.state,
                action=experience.action,
                td_error=td_error,
                learning_rate=self.learning_rate
            )
        
        self.updates += 1
    
    def _get_q_value(self, state: np.ndarray, action: int) -> float:
        """Get Q-value for state-action pair."""
        state_key = self.policy._get_state_key(state)
        if state_key not in self.policy.q_table:
            self.policy.q_table[state_key] = np.zeros(self.action_dim)
        return self.policy.q_table[state_key][action]
    
    def _get_max_q_value(self, state: np.ndarray) -> float:
        """Get maximum Q-value for state."""
        state_key = self.policy._get_state_key(state)
        if state_key not in self.policy.q_table:
            self.policy.q_table[state_key] = np.zeros(self.action_dim)
        return np.max(self.policy.q_table[state_key])

    def train(
        self,
        total_timesteps: int,
        test_pool: List[TestCase]
    ) -> Dict[str, Any]:
        """Train the agent using PPO on test execution environment."""
        env = TestEnvironment(test_pool)
        if not self.model:
            self.create_model(env)
            
        start_time = datetime.now()
        self.model.learn(
            total_timesteps=total_timesteps,
            callback=self.callback,
            progress_bar=True
        )
        training_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "training_time": training_time,
            "final_coverage": self.callback.coverage_history[-1],
            "mean_reward": np.mean(self.callback.reward_history),
            "coverage_history": self.callback.coverage_history,
            "reward_history": self.callback.reward_history,
            "algorithm": self.algorithm,
            "policy_updates": self.updates
        }

    def predict(
        self,
        state: Union[TestState, np.ndarray],
        deterministic: bool = True
    ) -> int:
        """Predict action using hybrid approach."""
        if isinstance(state, TestState):
            state_array = np.array([
                state.coverage.endpoint_coverage,
                state.failure_rate,
                state.execution_time,
                state.resource_usage,
                state.priority_score
            ])
        else:
            state_array = state

        if self.algorithm == "hybrid":
            # Use PPO for complex states, Q-learning for simple ones
            state_complexity = np.sum(np.abs(state_array))
            use_ppo = state_complexity > 2.0  # Threshold for using PPO
            return self.policy.get_action(state_array, use_ppo=use_ppo)
        elif self.algorithm == "ppo" and self.model:
            action, _ = self.model.predict(state_array, deterministic=deterministic)
            return int(action)
        else:
            return self.policy.get_action(state_array)

    async def get_policy(self) -> Policy:
        """Get current policy."""
        return self.policy
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get comprehensive agent statistics."""
        training_metrics = self.get_training_metrics()
        
        return {
            "algorithm": self.algorithm,
            "updates": self.updates,
            "experiences": len(self.experience_buffer),
            "total_episodes": len(self.episode_rewards),
            "avg_episode_reward": np.mean(self.episode_rewards[-100:]) if self.episode_rewards else 0,
            "policy_size": len(self.policy.q_table),
            "ppo_trained": self.model is not None,
            "training_metrics": training_metrics,
            "last_update": datetime.utcnow().isoformat()
        }

    def get_training_metrics(self) -> Dict[str, Any]:
        """Get training metrics and history."""
        if not self.callback:
            return {}
            
        return {
            "coverage_history": self.callback.coverage_history,
            "reward_history": self.callback.reward_history,
            "execution_times": self.callback.execution_times
        }

    def update_priorities(
        self,
        coverage: CoverageMetrics,
        execution_history: Dict[str, Any]
    ) -> Dict[str, float]:
        """Update test priorities based on current state and learning history."""
        if not execution_history:
            return {}
            
        priorities: Dict[str, float] = {}
        
        for test_id, history in execution_history.items():
            # Enhanced priority calculation incorporating feedback
            # 1. Historical failure rate
            failure_rate = history.get("failure_rate", 0.0)
            
            # 2. Coverage contribution
            coverage_contribution = history.get("coverage_delta", 0.0)
            
            # 3. Execution time efficiency
            execution_time = history.get("avg_execution_time", 1.0)
            time_factor = 1.0 / (1.0 + execution_time)
            
            # 4. Last execution result
            last_result = history.get("last_result", True)
            result_factor = 0.5 if last_result else 1.0
            
            # 5. Feedback-based priority boost
            feedback_boost = history.get("feedback_score", 0.0)
            
            # 6. Learning-based adjustment
            if len(self.episode_rewards) > 0:
                learning_factor = np.tanh(np.mean(self.episode_rewards[-10:]))
            else:
                learning_factor = 0.0
            
            # Combine factors with weights
            priority = (
                0.3 * failure_rate +
                0.2 * coverage_contribution +
                0.15 * time_factor +
                0.1 * result_factor +
                0.15 * feedback_boost +
                0.1 * learning_factor
            )
            
            priorities[test_id] = min(max(priority, 0.0), 1.0)
            
        return priorities

    def save(self, path: str) -> None:
        """Save both PPO model and Q-learning policy."""
        if self.model:
            self.model.save(f"{path}_ppo")
        
        # Save Q-learning policy
        policy_data = {
            "q_table": self.policy.q_table,
            "state_dim": self.policy.state_dim,
            "action_dim": self.policy.action_dim
        }
        with open(f"{path}_qlearning.json", "w") as f:
            json.dump(policy_data, f)

    def load(self, path: str, env: Optional[TestEnvironment] = None) -> None:
        """Load both PPO model and Q-learning policy."""
        if env and (self.algorithm in ["ppo", "hybrid"]):
            self.model = PPO.load(f"{path}_ppo", env=env)
        elif env and self.algorithm == "dqn":
            self.model = DQN.load(f"{path}_ppo", env=env)
        
        # Load Q-learning policy
        try:
            with open(f"{path}_qlearning.json", "r") as f:
                policy_data = json.load(f)
                self.policy = Policy(
                    state_dim=policy_data["state_dim"],
                    action_dim=policy_data["action_dim"]
                )
                self.policy.q_table = policy_data["q_table"]
        except FileNotFoundError:
            pass  # Q-learning policy not saved yet