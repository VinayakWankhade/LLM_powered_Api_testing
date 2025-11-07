"""
Hybrid Reinforcement Learning Optimization System
Combines Deep Q-Learning with Policy Gradient methods to optimize test coverage,
execution efficiency, and resource utilization in the MERN AI Testing Platform.
"""

import numpy as np
import json
import logging
import asyncio
from typing import Any, Dict, List, Optional, Tuple, Union
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from collections import deque
import random

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    import torch.nn.functional as F
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False


@dataclass
class RLState:
    """State representation for RL agent."""
    # Test coverage metrics (0-1 normalized)
    endpoint_coverage: float
    method_coverage: float
    parameter_coverage: float
    response_coverage: float
    
    # Performance metrics (0-1 normalized)
    success_rate: float
    avg_response_time: float  # normalized
    error_rate: float
    
    # Resource utilization (0-1 normalized)
    cpu_usage: float
    memory_usage: float
    network_usage: float
    
    # Test suite characteristics
    test_count: int  # normalized to 0-1
    duplicate_ratio: float
    
    # Historical performance
    recent_improvements: float
    learning_trend: float
    
    def to_vector(self) -> np.ndarray:
        """Convert state to numpy vector for neural network input."""
        return np.array([
            self.endpoint_coverage,
            self.method_coverage,
            self.parameter_coverage,
            self.response_coverage,
            self.success_rate,
            self.avg_response_time,
            self.error_rate,
            self.cpu_usage,
            self.memory_usage,
            self.network_usage,
            self.test_count,
            self.duplicate_ratio,
            self.recent_improvements,
            self.learning_trend
        ], dtype=np.float32)
    
    @classmethod
    def from_metrics(cls, metrics: Dict[str, Any]) -> 'RLState':
        """Create state from execution metrics."""
        return cls(
            endpoint_coverage=min(1.0, metrics.get('endpoint_coverage', {}).get('percentage', 0.0)),
            method_coverage=min(1.0, metrics.get('method_coverage', {}).get('percentage', 0.0)),
            parameter_coverage=min(1.0, metrics.get('parameter_coverage', {}).get('percentage', 0.0)),
            response_coverage=min(1.0, metrics.get('response_coverage', {}).get('percentage', 0.0)),
            success_rate=min(1.0, metrics.get('success_rate', 0.0)),
            avg_response_time=min(1.0, metrics.get('avg_response_time', 0.0) / 5000.0),  # normalize to 5s max
            error_rate=min(1.0, metrics.get('error_rate', 0.0)),
            cpu_usage=min(1.0, metrics.get('cpu_usage', 0.0) / 100.0),
            memory_usage=min(1.0, metrics.get('memory_usage', 0.0) / 100.0),
            network_usage=min(1.0, metrics.get('network_usage', 0.0) / 100.0),
            test_count=min(1.0, metrics.get('test_count', 0) / 1000.0),  # normalize to 1000 max
            duplicate_ratio=min(1.0, metrics.get('duplicate_ratio', 0.0)),
            recent_improvements=metrics.get('recent_improvements', 0.0),
            learning_trend=metrics.get('learning_trend', 0.0)
        )


@dataclass
class RLAction:
    """Action representation for RL agent."""
    # Test generation actions
    generate_more_tests: float  # 0-1, how many more tests to generate
    focus_on_coverage_gaps: float  # 0-1, priority for coverage gaps
    increase_parameter_diversity: float  # 0-1, parameter variation
    
    # Test selection actions
    prioritize_failed_areas: float  # 0-1, focus on previously failed endpoints
    remove_duplicates: float  # 0-1, deduplication aggressiveness
    
    # Execution optimization actions
    adjust_concurrency: float  # 0-1, concurrency level adjustment
    modify_timeout: float  # 0-1, timeout adjustment
    
    # Learning rate adjustments
    exploration_rate: float  # 0-1, exploration vs exploitation
    
    def to_vector(self) -> np.ndarray:
        """Convert action to numpy vector."""
        return np.array([
            self.generate_more_tests,
            self.focus_on_coverage_gaps,
            self.increase_parameter_diversity,
            self.prioritize_failed_areas,
            self.remove_duplicates,
            self.adjust_concurrency,
            self.modify_timeout,
            self.exploration_rate
        ], dtype=np.float32)
    
    @classmethod
    def from_vector(cls, vector: np.ndarray) -> 'RLAction':
        """Create action from numpy vector."""
        return cls(
            generate_more_tests=float(vector[0]),
            focus_on_coverage_gaps=float(vector[1]),
            increase_parameter_diversity=float(vector[2]),
            prioritize_failed_areas=float(vector[3]),
            remove_duplicates=float(vector[4]),
            adjust_concurrency=float(vector[5]),
            modify_timeout=float(vector[6]),
            exploration_rate=float(vector[7])
        )


class QNetwork(nn.Module):
    """Deep Q-Network for value function approximation."""
    
    def __init__(self, state_dim: int, action_dim: int, hidden_dim: int = 128):
        super(QNetwork, self).__init__()
        self.fc1 = nn.Linear(state_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
        self.fc3 = nn.Linear(hidden_dim, hidden_dim)
        self.fc4 = nn.Linear(hidden_dim, action_dim)
        self.dropout = nn.Dropout(0.2)
        
    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = F.relu(self.fc2(x))
        x = self.dropout(x)
        x = F.relu(self.fc3(x))
        x = self.fc4(x)
        return torch.sigmoid(x)  # Actions are in [0, 1] range


class PolicyNetwork(nn.Module):
    """Policy network for policy gradient methods."""
    
    def __init__(self, state_dim: int, action_dim: int, hidden_dim: int = 128):
        super(PolicyNetwork, self).__init__()
        self.fc1 = nn.Linear(state_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
        self.fc3 = nn.Linear(hidden_dim, action_dim)
        self.dropout = nn.Dropout(0.2)
        
    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = F.relu(self.fc2(x))
        x = torch.sigmoid(self.fc3(x))  # Actions in [0, 1] range
        return x


@dataclass
class Experience:
    """Experience tuple for replay buffer."""
    state: RLState
    action: RLAction
    reward: float
    next_state: RLState
    done: bool
    timestamp: datetime


class HybridRLOptimizer:
    """
    Hybrid Reinforcement Learning optimizer that combines:
    1. Deep Q-Learning (DQN) for value-based decisions
    2. Policy Gradient (REINFORCE) for policy optimization
    3. Experience replay for sample efficiency
    4. Target networks for stability
    """
    
    def __init__(
        self,
        state_dim: int = 14,
        action_dim: int = 8,
        hidden_dim: int = 128,
        learning_rate: float = 0.001,
        gamma: float = 0.95,
        epsilon: float = 0.1,
        epsilon_decay: float = 0.995,
        buffer_size: int = 10000,
        batch_size: int = 32,
        target_update_freq: int = 100,
        use_gpu: bool = False
    ):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.learning_rate = learning_rate
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.batch_size = batch_size
        self.target_update_freq = target_update_freq
        self.logger = logging.getLogger(__name__)
        
        # Device setup
        if HAS_TORCH:
            self.device = torch.device("cuda" if use_gpu and torch.cuda.is_available() else "cpu")
            
            # Initialize networks
            self.q_network = QNetwork(state_dim, action_dim, hidden_dim).to(self.device)
            self.target_q_network = QNetwork(state_dim, action_dim, hidden_dim).to(self.device)
            self.policy_network = PolicyNetwork(state_dim, action_dim, hidden_dim).to(self.device)
            
            # Copy parameters to target network
            self.target_q_network.load_state_dict(self.q_network.state_dict())
            
            # Optimizers
            self.q_optimizer = optim.Adam(self.q_network.parameters(), lr=learning_rate)
            self.policy_optimizer = optim.Adam(self.policy_network.parameters(), lr=learning_rate)
        
        # Experience replay buffer
        self.experience_buffer = deque(maxlen=buffer_size)
        
        # Training statistics
        self.training_step = 0
        self.total_reward = 0.0
        self.episode_rewards = deque(maxlen=100)
        
        # Performance history
        self.performance_history = deque(maxlen=1000)
        self.action_history = deque(maxlen=100)
        
        # Fallback simple optimizer for when PyTorch is not available
        self.simple_weights = np.random.randn(state_dim, action_dim) * 0.1
        
    async def get_action(self, state: RLState, exploration: bool = True) -> RLAction:
        """Get action from the hybrid RL system."""
        if HAS_TORCH and hasattr(self, 'q_network'):
            return await self._get_neural_action(state, exploration)
        else:
            return await self._get_simple_action(state, exploration)
    
    async def _get_neural_action(self, state: RLState, exploration: bool = True) -> RLAction:
        """Get action using neural networks."""
        state_tensor = torch.FloatTensor(state.to_vector()).unsqueeze(0).to(self.device)
        
        if exploration and random.random() < self.epsilon:
            # Epsilon-greedy exploration
            action_vector = np.random.uniform(0, 1, self.action_dim)
        else:
            # Get action from policy network (primary) with Q-network validation
            with torch.no_grad():
                policy_action = self.policy_network(state_tensor).cpu().numpy()[0]
                q_values = self.q_network(state_tensor).cpu().numpy()[0]
                
                # Combine policy and Q-network outputs (weighted average)
                action_vector = 0.7 * policy_action + 0.3 * q_values
                action_vector = np.clip(action_vector, 0, 1)
        
        action = RLAction.from_vector(action_vector)
        self.action_history.append(action)
        
        return action
    
    async def _get_simple_action(self, state: RLState, exploration: bool = True) -> RLAction:
        """Fallback simple action selection without neural networks."""
        state_vector = state.to_vector()
        
        if exploration and random.random() < self.epsilon:
            # Random action
            action_vector = np.random.uniform(0, 1, self.action_dim)
        else:
            # Simple linear policy
            action_vector = np.dot(state_vector, self.simple_weights)
            action_vector = np.tanh(action_vector)  # Scale to [-1, 1]
            action_vector = (action_vector + 1) / 2  # Scale to [0, 1]
        
        return RLAction.from_vector(action_vector)
    
    async def update_policy(
        self, 
        state: RLState, 
        action: RLAction, 
        reward: float, 
        next_state: RLState, 
        done: bool = False
    ) -> Dict[str, Any]:
        """Update the RL policy based on experience."""
        
        # Store experience
        experience = Experience(state, action, reward, next_state, done, datetime.now())
        self.experience_buffer.append(experience)
        
        # Update total reward
        self.total_reward += reward
        
        if done:
            self.episode_rewards.append(self.total_reward)
            self.total_reward = 0.0
        
        # Performance tracking
        self.performance_history.append({
            'timestamp': datetime.now(),
            'reward': reward,
            'state_coverage': (state.endpoint_coverage + state.method_coverage) / 2,
            'success_rate': state.success_rate
        })
        
        update_info = {
            'experiences_collected': len(self.experience_buffer),
            'current_epsilon': self.epsilon,
            'recent_reward': reward,
            'buffer_size': len(self.experience_buffer)
        }
        
        # Train networks if we have enough experiences
        if len(self.experience_buffer) >= self.batch_size:
            if HAS_TORCH and hasattr(self, 'q_network'):
                train_info = await self._train_networks()
                update_info.update(train_info)
            else:
                train_info = await self._train_simple_policy(state, action, reward, next_state)
                update_info.update(train_info)
        
        # Decay exploration rate
        self.epsilon = max(0.01, self.epsilon * self.epsilon_decay)
        
        return update_info
    
    async def _train_networks(self) -> Dict[str, Any]:
        """Train neural networks using experience replay."""
        # Sample batch from experience buffer
        batch = random.sample(self.experience_buffer, self.batch_size)
        
        states = torch.FloatTensor([exp.state.to_vector() for exp in batch]).to(self.device)
        actions = torch.FloatTensor([exp.action.to_vector() for exp in batch]).to(self.device)
        rewards = torch.FloatTensor([exp.reward for exp in batch]).to(self.device)
        next_states = torch.FloatTensor([exp.next_state.to_vector() for exp in batch]).to(self.device)
        dones = torch.BoolTensor([exp.done for exp in batch]).to(self.device)
        
        # Train Q-network (DQN)
        current_q_values = self.q_network(states).gather(1, actions.argmax(1).unsqueeze(1)).squeeze(1)
        next_q_values = self.target_q_network(next_states).max(1)[0].detach()
        target_q_values = rewards + (self.gamma * next_q_values * ~dones)
        
        q_loss = F.mse_loss(current_q_values, target_q_values)
        
        self.q_optimizer.zero_grad()
        q_loss.backward()
        torch.nn.utils.clip_grad_norm_(self.q_network.parameters(), 1.0)
        self.q_optimizer.step()
        
        # Train Policy network (REINFORCE)
        policy_actions = self.policy_network(states)
        action_log_probs = torch.log(policy_actions + 1e-8)
        policy_loss = -(action_log_probs * actions * rewards.unsqueeze(1)).sum(dim=1).mean()
        
        self.policy_optimizer.zero_grad()
        policy_loss.backward()
        torch.nn.utils.clip_grad_norm_(self.policy_network.parameters(), 1.0)
        self.policy_optimizer.step()
        
        # Update target network periodically
        self.training_step += 1
        if self.training_step % self.target_update_freq == 0:
            self.target_q_network.load_state_dict(self.q_network.state_dict())
        
        return {
            'q_loss': q_loss.item(),
            'policy_loss': policy_loss.item(),
            'training_step': self.training_step
        }
    
    async def _train_simple_policy(self, state: RLState, action: RLAction, reward: float, next_state: RLState) -> Dict[str, Any]:
        """Simple policy update without neural networks."""
        # Simple gradient-based update
        state_vector = state.to_vector()
        action_vector = action.to_vector()
        
        # Calculate gradient (simplified)
        gradient = np.outer(state_vector, action_vector) * reward * self.learning_rate
        
        # Update weights
        self.simple_weights += gradient
        
        # Clip weights to prevent explosion
        self.simple_weights = np.clip(self.simple_weights, -1.0, 1.0)
        
        return {
            'simple_update': True,
            'gradient_norm': np.linalg.norm(gradient),
            'weights_norm': np.linalg.norm(self.simple_weights)
        }
    
    def calculate_reward(
        self,
        previous_metrics: Dict[str, Any],
        current_metrics: Dict[str, Any],
        action: RLAction,
        execution_time: float
    ) -> float:
        """Calculate reward based on performance improvement."""
        
        # Coverage improvement reward
        prev_coverage = (
            previous_metrics.get('endpoint_coverage', 0) +
            previous_metrics.get('method_coverage', 0) +
            previous_metrics.get('parameter_coverage', 0)
        ) / 3
        
        curr_coverage = (
            current_metrics.get('endpoint_coverage', 0) +
            current_metrics.get('method_coverage', 0) +
            current_metrics.get('parameter_coverage', 0)
        ) / 3
        
        coverage_reward = (curr_coverage - prev_coverage) * 10  # Scale reward
        
        # Success rate improvement reward
        prev_success = previous_metrics.get('success_rate', 0)
        curr_success = current_metrics.get('success_rate', 0)
        success_reward = (curr_success - prev_success) * 5
        
        # Efficiency reward (inverse of execution time, normalized)
        efficiency_reward = max(0, 1.0 - (execution_time / 300.0)) * 2  # 300s = 5min baseline
        
        # Penalty for too many tests (resource efficiency)
        test_count = current_metrics.get('test_count', 0)
        if test_count > 100:
            test_penalty = (test_count - 100) * 0.01
        else:
            test_penalty = 0
        
        # Exploration bonus
        exploration_bonus = action.exploration_rate * 0.5
        
        # Total reward
        total_reward = coverage_reward + success_reward + efficiency_reward - test_penalty + exploration_bonus
        
        # Normalize reward to reasonable range
        total_reward = np.clip(total_reward, -10.0, 10.0)
        
        return float(total_reward)
    
    async def get_optimization_recommendations(self, state: RLState) -> Dict[str, Any]:
        """Get optimization recommendations based on current state."""
        action = await self.get_action(state, exploration=False)
        
        recommendations = []
        
        # Coverage recommendations
        if state.endpoint_coverage < 0.8 and action.focus_on_coverage_gaps > 0.7:
            recommendations.append({
                'type': 'coverage',
                'priority': 'high',
                'message': 'Focus on improving endpoint coverage',
                'action': 'Generate tests for uncovered endpoints'
            })
        
        # Performance recommendations
        if state.success_rate < 0.9 and action.prioritize_failed_areas > 0.6:
            recommendations.append({
                'type': 'performance',
                'priority': 'high',
                'message': 'Address failing test areas',
                'action': 'Apply self-healing to failed tests'
            })
        
        # Efficiency recommendations
        if state.duplicate_ratio > 0.3 and action.remove_duplicates > 0.5:
            recommendations.append({
                'type': 'efficiency',
                'priority': 'medium',
                'message': 'Remove duplicate tests',
                'action': 'Apply deduplication with higher threshold'
            })
        
        # Resource recommendations
        if state.cpu_usage > 0.8 and action.adjust_concurrency < 0.5:
            recommendations.append({
                'type': 'resource',
                'priority': 'medium',
                'message': 'Reduce resource usage',
                'action': 'Lower concurrency level'
            })
        
        return {
            'recommendations': recommendations,
            'predicted_action': asdict(action),
            'confidence': min(1.0, len(self.experience_buffer) / 1000.0),
            'learning_progress': len(self.episode_rewards)
        }
    
    def get_performance_statistics(self) -> Dict[str, Any]:
        """Get comprehensive performance statistics."""
        if not self.episode_rewards:
            return {'status': 'no_data'}
        
        recent_rewards = list(self.episode_rewards)
        performance_data = list(self.performance_history)
        
        return {
            'episodes_completed': len(recent_rewards),
            'average_episode_reward': np.mean(recent_rewards),
            'reward_std': np.std(recent_rewards),
            'best_episode_reward': np.max(recent_rewards),
            'recent_improvement_trend': np.mean(recent_rewards[-10:]) - np.mean(recent_rewards[-20:-10]) if len(recent_rewards) >= 20 else 0,
            'exploration_rate': self.epsilon,
            'experience_buffer_size': len(self.experience_buffer),
            'training_steps': self.training_step,
            'has_neural_networks': HAS_TORCH and hasattr(self, 'q_network'),
            'average_coverage_improvement': np.mean([p.get('state_coverage', 0) for p in performance_data[-100:]]) if performance_data else 0,
            'average_success_rate': np.mean([p.get('success_rate', 0) for p in performance_data[-100:]]) if performance_data else 0
        }
    
    async def save_model(self, filepath: str) -> None:
        """Save the trained models."""
        if HAS_TORCH and hasattr(self, 'q_network'):
            torch.save({
                'q_network_state_dict': self.q_network.state_dict(),
                'policy_network_state_dict': self.policy_network.state_dict(),
                'q_optimizer_state_dict': self.q_optimizer.state_dict(),
                'policy_optimizer_state_dict': self.policy_optimizer.state_dict(),
                'training_step': self.training_step,
                'epsilon': self.epsilon,
                'episode_rewards': list(self.episode_rewards)
            }, filepath)
        else:
            # Save simple weights
            np.save(filepath, {
                'simple_weights': self.simple_weights,
                'epsilon': self.epsilon,
                'episode_rewards': list(self.episode_rewards)
            })
    
    async def load_model(self, filepath: str) -> None:
        """Load trained models."""
        try:
            if HAS_TORCH and hasattr(self, 'q_network'):
                checkpoint = torch.load(filepath, map_location=self.device)
                self.q_network.load_state_dict(checkpoint['q_network_state_dict'])
                self.policy_network.load_state_dict(checkpoint['policy_network_state_dict'])
                self.q_optimizer.load_state_dict(checkpoint['q_optimizer_state_dict'])
                self.policy_optimizer.load_state_dict(checkpoint['policy_optimizer_state_dict'])
                self.training_step = checkpoint.get('training_step', 0)
                self.epsilon = checkpoint.get('epsilon', 0.1)
                self.episode_rewards = deque(checkpoint.get('episode_rewards', []), maxlen=100)
            else:
                # Load simple weights
                data = np.load(filepath, allow_pickle=True).item()
                self.simple_weights = data['simple_weights']
                self.epsilon = data.get('epsilon', 0.1)
                self.episode_rewards = deque(data.get('episode_rewards', []), maxlen=100)
        except Exception as e:
            self.logger.warning(f"Failed to load model: {e}")


class RLPolicyManager:
    """Manager for RL policies and optimization strategies."""
    
    def __init__(self):
        self.optimizer = HybridRLOptimizer()
        self.current_state = None
        self.previous_metrics = None
        
    async def update_policy(
        self,
        execution_results: Dict[str, Any],
        coverage_target: float = 0.8
    ) -> Dict[str, Any]:
        """Update RL policy based on execution results."""
        
        # Extract metrics from execution results
        current_metrics = execution_results.get('metrics', {})
        
        # Create current state
        current_state = RLState.from_metrics(current_metrics)
        
        if self.current_state is not None and self.previous_metrics is not None:
            # Calculate reward based on improvement
            reward = self.optimizer.calculate_reward(
                self.previous_metrics,
                current_metrics,
                await self.optimizer.get_action(self.current_state, exploration=False),
                execution_results.get('total_execution_time', 0)
            )
            
            # Update policy
            update_info = await self.optimizer.update_policy(
                self.current_state,
                await self.optimizer.get_action(self.current_state, exploration=False),
                reward,
                current_state,
                done=False
            )
        else:
            update_info = {'status': 'initial_state'}
        
        # Update state and metrics for next iteration
        self.current_state = current_state
        self.previous_metrics = current_metrics
        
        # Get recommendations
        recommendations = await self.optimizer.get_optimization_recommendations(current_state)
        
        # Get performance statistics
        performance_stats = self.optimizer.get_performance_statistics()
        
        return {
            'policy_updates': update_info.get('training_step', 0),
            'learning_rate': self.optimizer.learning_rate,
            'reward_improvement': update_info.get('recent_reward', 0),
            'coverage_improvement': recommendations.get('confidence', 0) * 10,  # Convert to percentage
            'recommendations': recommendations['recommendations'],
            'performance_stats': performance_stats,
            'current_state': asdict(current_state)
        }