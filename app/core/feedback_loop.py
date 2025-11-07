from __future__ import annotations
from datetime import datetime
from typing import Dict, List, Optional, Any, Set
import numpy as np
from pydantic import BaseModel

from app.core.executor.result_types import TestResult
from app.core.coverage_aggregator import CoverageMetrics
from app.schemas.tests import TestCase
from app.services.optimizer import OptimizerService
from app.services.generation import GenerationService
from app.services.knowledge_base import KnowledgeBase
from app.services.embeddings import EmbeddingService
from app.core.rl.agent import RLAgent
from app.core.analysis.result_collector import ResultCollector
from app.core.analysis.failure_analyzer import FailureAnalyzer
from app.core.recommendation import RiskForecaster


class FeedbackSource:
    TEST_EXECUTION = "test_execution"
    USER_REPORT = "user_report"
    PRODUCTION = "production"


class FeedbackSeverity:
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class FeedbackEntry(BaseModel):
    """Standardized feedback entry structure."""
    source: str
    endpoint: str
    parameters: Optional[Dict]
    observed_issue: str
    timestamp: datetime
    severity: str
    metadata: Optional[Dict] = {}


class ContinuousLearner:
    """Manages continuous learning and adaptation of the system."""
    
    def __init__(
        self,
        knowledge_base: KnowledgeBase,
        embedding_service: EmbeddingService,
        rl_agent: RLAgent,
        result_collector: ResultCollector,
        failure_analyzer: FailureAnalyzer,
        risk_forecaster: RiskForecaster,
        optimizer: OptimizerService,
        generator: GenerationService
    ):
        self.knowledge_base = knowledge_base
        self.embedding_service = embedding_service
        self.rl_agent = rl_agent
        self.result_collector = result_collector
        self.failure_analyzer = failure_analyzer
        self.risk_forecaster = risk_forecaster
        self.optimizer = optimizer
        self.generator = generator
        self.feedback_buffer: List[FeedbackEntry] = []

    async def process_feedback(self, feedback: FeedbackEntry) -> None:
        """Process a single feedback entry."""
        self.feedback_buffer.append(feedback)
        
        # Update knowledge base with new feedback
        await self._update_knowledge_base(feedback)
        
        # Update RL policy based on feedback
        await self._update_rl_policy(feedback)
        
        # Update risk models if needed
        await self._update_risk_models(feedback)

    async def analyze_and_enhance(
        self,
        executed_tests: List[TestCase],
        results: List[TestResult],
        coverage: CoverageMetrics
    ) -> List[TestCase]:
        """Analyze test results and generate additional tests if needed."""
        
        # Process test execution feedback
        for test, result in zip(executed_tests, results):
            if not result.success:
                await self.process_feedback(FeedbackEntry(
                    source=FeedbackSource.TEST_EXECUTION,
                    endpoint=test.endpoint,
                    parameters=test.parameters,
                    observed_issue=str(result.error) if result.error else "Test failed",
                    timestamp=datetime.utcnow(),
                    severity=FeedbackSeverity.HIGH if result.error else FeedbackSeverity.MEDIUM,
                    metadata={"test_id": test.id}
                ))
        
        # Identify gaps in coverage
        # Get all potential endpoints/methods from executed tests
        all_endpoints = {test.endpoint for test in executed_tests if test.endpoint}
        all_methods = {test.method for test in executed_tests if test.method}
        all_parameters = set()
        for test in executed_tests:
            if test.input_data:
                all_parameters.update(test.input_data.keys())
        
        # Find missing coverage
        missing_endpoints = all_endpoints - set(coverage.covered_endpoints)
        missing_methods = all_methods - set(coverage.covered_methods)
        low_coverage_params = all_parameters - set(coverage.covered_parameters)
        
        # Generate additional tests for missing coverage
        additional_tests: List[TestCase] = []
        
        # For each missing endpoint/method combination
        for endpoint in missing_endpoints:
            for method in missing_methods:
                # Get relevant knowledge base entries
                context = await self.knowledge_base.search(
                    query=f"endpoint:{endpoint} method:{method}",
                    limit=5
                )
                
                # Generate new tests with enhanced context
                failed_tests = [
                    t for t, r in zip(executed_tests, results)
                    if not r.success and t.endpoint == endpoint
                ]
                
                context_docs = [
                    *[entry.text for entry in context],
                    *[t.description for t in failed_tests]
                ]
                
                parameters = {
                    param: "string" for param in low_coverage_params
                }
                
                new_tests = await self.generator.generate(
                    endpoint=endpoint,
                    method=method,
                    parameters=parameters,
                    context_docs=context_docs
                )
                additional_tests.extend(new_tests)
        
        # Optimize combined test suite using RL policy
        if additional_tests:
            all_tests = executed_tests + additional_tests
            optimized_tests = await self.optimizer.deduplicate(all_tests)
            return await self.optimizer.prioritize(
                optimized_tests,
                policy=await self.rl_agent.get_policy()
            )
        
        return executed_tests

    async def _update_knowledge_base(self, feedback: FeedbackEntry) -> None:
        """Update RAG knowledge base with new feedback."""
        # Convert feedback to embeddings
        embedding = await self.embedding_service.create_embedding(
            f"{feedback.endpoint} {feedback.observed_issue}"
        )
        
        # Add to knowledge base with metadata
        await self.knowledge_base.add_entry(
            text=feedback.observed_issue,
            embedding=embedding,
            metadata={
                "endpoint": feedback.endpoint,
                "severity": feedback.severity,
                "source": feedback.source,
                "timestamp": feedback.timestamp.isoformat()
            }
        )

    async def _update_rl_policy(self, feedback: FeedbackEntry) -> None:
        """Update RL agent's policy based on feedback."""
        # Convert feedback to state-action-reward format
        state = self._feedback_to_state(feedback)
        action = self._get_action_from_feedback(feedback)
        reward = self._calculate_feedback_reward(feedback)
        
        # Update RL agent
        await self.rl_agent.update(state, action, reward)

    async def _update_risk_models(self, feedback: FeedbackEntry) -> None:
        """Update risk prediction models with new feedback."""
        if feedback.source in [FeedbackSource.TEST_EXECUTION, FeedbackSource.PRODUCTION]:
            await self.risk_forecaster.update_models(
                endpoint=feedback.endpoint,
                severity=feedback.severity,
                issue_type=feedback.observed_issue
            )

    def _feedback_to_state(self, feedback: FeedbackEntry) -> np.ndarray:
        """Convert feedback to RL state representation."""
        # Create state vector based on feedback attributes
        severity_map = {
            FeedbackSeverity.LOW: 0.25,
            FeedbackSeverity.MEDIUM: 0.5,
            FeedbackSeverity.HIGH: 0.75,
            FeedbackSeverity.CRITICAL: 1.0
        }
        
        source_map = {
            FeedbackSource.TEST_EXECUTION: [1, 0, 0],
            FeedbackSource.USER_REPORT: [0, 1, 0],
            FeedbackSource.PRODUCTION: [0, 0, 1]
        }
        
        state = np.array([
            severity_map[feedback.severity],
            *source_map[feedback.source]
        ])
        
        return state

    def _get_action_from_feedback(self, feedback: FeedbackEntry) -> int:
        """Map feedback to RL action space."""
        # Example mapping based on feedback type
        action_map = {
            FeedbackSource.TEST_EXECUTION: 0,
            FeedbackSource.USER_REPORT: 1,
            FeedbackSource.PRODUCTION: 2
        }
        return action_map[feedback.source]

    def _calculate_feedback_reward(self, feedback: FeedbackEntry) -> float:
        """Calculate reward signal based on feedback."""
        severity_rewards = {
            FeedbackSeverity.LOW: -0.1,
            FeedbackSeverity.MEDIUM: -0.3,
            FeedbackSeverity.HIGH: -0.7,
            FeedbackSeverity.CRITICAL: -1.0
        }
        
        source_multipliers = {
            FeedbackSource.TEST_EXECUTION: 1.0,
            FeedbackSource.USER_REPORT: 1.5,
            FeedbackSource.PRODUCTION: 2.0
        }
        
        base_reward = severity_rewards[feedback.severity]
        multiplier = source_multipliers[feedback.source]
        
        return base_reward * multiplier


class SelfHealingMechanism:
    """Self-healing mechanism for automatic test repair and improvement."""
    
    def __init__(self, generator: GenerationService, optimizer: OptimizerService):
        self.generator = generator
        self.optimizer = optimizer
        self.healing_patterns = {
            "timeout": self._heal_timeout_failure,
            "validation_error": self._heal_validation_failure,
            "auth_error": self._heal_auth_failure,
            "server_error": self._heal_server_error,
            "network_error": self._heal_network_failure
        }
        
    async def heal_failed_tests(
        self, 
        failed_tests: List[TestCase], 
        failure_reasons: List[str],
        context_docs: List[str] = None
    ) -> List[TestCase]:
        """Automatically heal failed tests based on failure patterns."""
        healed_tests = []
        
        for test, failure_reason in zip(failed_tests, failure_reasons):
            # Identify failure pattern
            failure_type = self._classify_failure(failure_reason)
            
            # Apply appropriate healing strategy
            if failure_type in self.healing_patterns:
                healed_test = await self.healing_patterns[failure_type](
                    test, failure_reason, context_docs or []
                )
                if healed_test:
                    healed_tests.append(healed_test)
            else:
                # Generic healing approach
                healed_test = await self._generic_healing(test, failure_reason, context_docs or [])
                if healed_test:
                    healed_tests.append(healed_test)
        
        return healed_tests
    
    def _classify_failure(self, failure_reason: str) -> str:
        """Classify failure into healing patterns."""
        failure_lower = failure_reason.lower()
        
        if "timeout" in failure_lower or "timed out" in failure_lower:
            return "timeout"
        elif "validation" in failure_lower or "invalid" in failure_lower:
            return "validation_error"
        elif "auth" in failure_lower or "unauthorized" in failure_lower or "forbidden" in failure_lower:
            return "auth_error"
        elif "500" in failure_reason or "internal server" in failure_lower:
            return "server_error"
        elif "network" in failure_lower or "connection" in failure_lower:
            return "network_error"
        else:
            return "unknown"
    
    async def _heal_timeout_failure(self, test: TestCase, failure_reason: str, context: List[str]) -> Optional[TestCase]:
        """Heal timeout failures by adjusting test parameters."""
        # Create a new test with adjusted timeout and retry settings
        healed_test = TestCase(
            endpoint=test.endpoint,
            method=test.method,
            test_data=test.test_data,
            expected_response=test.expected_response,
            metadata={**getattr(test, 'metadata', {}), "healed": True, "original_failure": "timeout"}
        )
        return healed_test
    
    async def _heal_validation_failure(self, test: TestCase, failure_reason: str, context: List[str]) -> Optional[TestCase]:
        """Heal validation failures by fixing test data."""
        # Generate new test data based on validation error
        improved_tests = await self.generator.generate(
            endpoint=test.endpoint,
            method=test.method,
            parameters=getattr(test, 'parameters', {}),
            context_docs=context + [f"Previous validation error: {failure_reason}"],
            target_count=1
        )
        
        if improved_tests:
            healed_test = improved_tests[0]
            healed_test.metadata = {**getattr(healed_test, 'metadata', {}), "healed": True, "original_failure": "validation"}
            return healed_test
        return None
    
    async def _heal_auth_failure(self, test: TestCase, failure_reason: str, context: List[str]) -> Optional[TestCase]:
        """Heal authentication failures by adding/fixing auth headers."""
        # Add or fix authentication headers
        headers = getattr(test, 'headers', {}) or {}
        if 'Authorization' not in headers:
            headers['Authorization'] = 'Bearer test-token'
        
        healed_test = TestCase(
            endpoint=test.endpoint,
            method=test.method,
            test_data=test.test_data,
            expected_response=test.expected_response,
            headers=headers,
            metadata={**getattr(test, 'metadata', {}), "healed": True, "original_failure": "auth"}
        )
        return healed_test
    
    async def _heal_server_error(self, test: TestCase, failure_reason: str, context: List[str]) -> Optional[TestCase]:
        """Heal server errors by adjusting test expectations."""
        # Adjust expected response to handle server errors gracefully
        expected_response = getattr(test, 'expected_response', {}) or {}
        expected_response['status_code'] = [200, 500]  # Accept both success and server error
        
        healed_test = TestCase(
            endpoint=test.endpoint,
            method=test.method,
            test_data=test.test_data,
            expected_response=expected_response,
            metadata={**getattr(test, 'metadata', {}), "healed": True, "original_failure": "server_error"}
        )
        return healed_test
    
    async def _heal_network_failure(self, test: TestCase, failure_reason: str, context: List[str]) -> Optional[TestCase]:
        """Heal network failures by adding retry logic."""
        healed_test = TestCase(
            endpoint=test.endpoint,
            method=test.method,
            test_data=test.test_data,
            expected_response=test.expected_response,
            metadata={
                **getattr(test, 'metadata', {}), 
                "healed": True, 
                "original_failure": "network",
                "retry_count": 3,
                "retry_delay": 2.0
            }
        )
        return healed_test
    
    async def _generic_healing(self, test: TestCase, failure_reason: str, context: List[str]) -> Optional[TestCase]:
        """Generic healing approach for unknown failures."""
        # Generate alternative tests based on failure context
        improved_tests = await self.generator.generate(
            endpoint=test.endpoint,
            method=test.method,
            parameters=getattr(test, 'parameters', {}),
            context_docs=context + [f"Previous failure: {failure_reason}", "Generate more robust test case"],
            target_count=1
        )
        
        if improved_tests:
            healed_test = improved_tests[0]
            healed_test.metadata = {**getattr(healed_test, 'metadata', {}), "healed": True, "original_failure": "generic"}
            return healed_test
        return None


class FeedbackLoop:
    def __init__(self, optimizer: OptimizerService, generator: GenerationService):
        # Initialize core services
        self.knowledge_base = KnowledgeBase()
        self.embedding_service = EmbeddingService()
        self.rl_agent = RLAgent()
        self.result_collector = ResultCollector()
        self.failure_analyzer = FailureAnalyzer()
        self.risk_forecaster = RiskForecaster()
        self.optimizer = optimizer
        self.generator = generator
        
        # Initialize self-healing mechanism
        self.self_healing = SelfHealingMechanism(generator, optimizer)
        
        # Initialize continuous learner
        self.learner = ContinuousLearner(
            knowledge_base=self.knowledge_base,
            embedding_service=self.embedding_service,
            rl_agent=self.rl_agent,
            result_collector=self.result_collector,
            failure_analyzer=self.failure_analyzer,
            risk_forecaster=self.risk_forecaster,
            optimizer=optimizer,
            generator=generator
        )

    async def analyze_and_enhance(
        self,
        executed_tests: List[TestCase],
        results: List[TestResult],
        coverage: CoverageMetrics
    ) -> List[TestCase]:
        """Enhanced version that uses continuous learning and self-healing."""
        
        # First, identify failed tests
        failed_tests = []
        failure_reasons = []
        
        for test, result in zip(executed_tests, results):
            if not getattr(result, 'success', True):  # Handle different result formats
                failed_tests.append(test)
                error_msg = getattr(result, 'error', None) or getattr(result, 'error_message', 'Unknown error')
                failure_reasons.append(str(error_msg))
        
        # Apply self-healing to failed tests
        healed_tests = []
        if failed_tests:
            # Get context for healing
            context_docs = []
            for test in executed_tests:
                if hasattr(test, 'description') and test.description:
                    context_docs.append(test.description)
            
            healed_tests = await self.self_healing.heal_failed_tests(
                failed_tests, failure_reasons, context_docs
            )
        
        # Run the original learning enhancement
        enhanced_tests = await self.learner.analyze_and_enhance(executed_tests, results, coverage)
        
        # Combine original successful tests, enhanced tests, and healed tests
        successful_tests = [
            test for test, result in zip(executed_tests, results)
            if getattr(result, 'success', True)
        ]
        
        # Deduplicate and return combined test suite
        all_tests = successful_tests + enhanced_tests + healed_tests
        
        # Remove duplicates based on endpoint and method
        seen = set()
        deduplicated_tests = []
        for test in all_tests:
            key = (test.endpoint, test.method, str(getattr(test, 'test_data', {})))
            if key not in seen:
                seen.add(key)
                deduplicated_tests.append(test)
        
        return deduplicated_tests

    async def ingest_feedback(
        self,
        source: str,
        endpoint: str,
        observed_issue: str,
        severity: str,
        parameters: Optional[Dict] = None,
        metadata: Optional[Dict] = None
    ) -> None:
        """Ingest feedback from any source into the system."""
        feedback = FeedbackEntry(
            source=source,
            endpoint=endpoint,
            parameters=parameters or {},
            observed_issue=observed_issue,
            timestamp=datetime.utcnow(),
            severity=severity,
            metadata=metadata or {}
        )
        
        await self.learner.process_feedback(feedback)

    async def get_knowledge_stats(self) -> Dict[str, Any]:
        """Get statistics about the knowledge base."""
        stats = await self.knowledge_base.get_stats()
        policy_stats = await self.rl_agent.get_stats()
        
        return {
            **stats,
            "policy_updates": policy_stats.get("updates", 0),
            "recent_feedback": len(self.learner.feedback_buffer)
        }