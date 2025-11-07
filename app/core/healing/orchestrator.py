from __future__ import annotations

from enum import Enum
from typing import Dict, List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field

from app.schemas.tests import TestCase, TestType
from app.core.executor.result_types import TestResult
from app.core.analysis.failure_analyzer import FailurePattern
from app.services.retrieval import RetrievalService
from app.services.embeddings import EmbeddingModel
from app.services.knowledge_base import KnowledgeBase


class HealingStrategy(Enum):
    RETRY = "retry"  # For transient errors
    REGENERATE = "regenerate"  # For assertion/contract changes
    MANUAL = "manual"  # Needs human review


class HealingResult(BaseModel):
    test_case: TestCase
    strategy: HealingStrategy
    healed: bool = False
    retry_count: int = 0
    new_assertions: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    
    class Config:
        use_enum_values = True


class HealingOrchestrator:
    def __init__(
        self,
        kb: KnowledgeBase,
        embed: EmbeddingModel,
        max_retries: int = 3,
        assertion_confidence_threshold: float = 0.8
    ):
        self.kb = kb
        self.embed = embed
        self.retrieval = RetrievalService(kb, embed)
        self.max_retries = max_retries
        self.assertion_confidence_threshold = assertion_confidence_threshold
        self.healing_history: List[HealingResult] = []

    async def orchestrate_healing(
        self,
        failed_tests: List[TestCase],
        failure_patterns: List[FailurePattern]
    ) -> List[HealingResult]:
        """Orchestrate the healing process for failed tests."""
        results: List[HealingResult] = []
        
        for test in failed_tests:
            # Find matching failure pattern
            pattern = self._find_matching_pattern(test, failure_patterns)
            
            # Determine healing strategy
            strategy = self._determine_strategy(test, pattern)
            
            # Create healing result
            result = HealingResult(test_case=test, strategy=strategy)
            
            try:
                if strategy == HealingStrategy.RETRY:
                    await self._handle_retry(result)
                elif strategy == HealingStrategy.REGENERATE:
                    await self._handle_regeneration(result, pattern)
                else:  # MANUAL
                    result.error_message = "Requires manual review"
            except Exception as e:
                result.error_message = str(e)
            
            results.append(result)
            self.healing_history.append(result)
            
        return results

    def _find_matching_pattern(
        self,
        test: TestCase,
        patterns: List[FailurePattern]
    ) -> Optional[FailurePattern]:
        """Find matching failure pattern for a test."""
        for pattern in patterns:
            if (
                test.endpoint in pattern.affected_endpoints
                and test.method in pattern.affected_methods
                and any(param in test.input_data for param in pattern.common_parameters)
            ):
                return pattern
        return None

    def _determine_strategy(
        self,
        test: TestCase,
        pattern: Optional[FailurePattern]
    ) -> HealingStrategy:
        """Determine the healing strategy based on test and failure pattern."""
        if not pattern:
            return HealingStrategy.RETRY  # Default to retry if no pattern
            
        error_type = pattern.error_type.lower()
        
        # Transient errors should be retried
        if any(t in error_type for t in ["timeout", "connection", "temporary"]):
            return HealingStrategy.RETRY
            
        # Contract/assertion mismatches should regenerate
        if any(t in error_type for t in ["validation", "schema", "assertion"]):
            return HealingStrategy.REGENERATE
            
        # Security tests or complex failures need manual review
        if test.type == TestType.security or "security" in error_type:
            return HealingStrategy.MANUAL
            
        # High frequency patterns with same root cause need regeneration
        if pattern.frequency >= 3 and pattern.probable_cause:
            return HealingStrategy.REGENERATE
            
        return HealingStrategy.MANUAL

    async def _handle_retry(self, result: HealingResult) -> None:
        """Handle retry strategy for a test case."""
        # Retry logic is handled by RetryManager
        result.healed = True  # Mark for retry
        result.retry_count = 0  # Will be incremented by RetryManager

    async def _handle_regeneration(
        self,
        result: HealingResult,
        pattern: Optional[FailurePattern]
    ) -> None:
        """Handle assertion regeneration strategy."""
        test = result.test_case
        
        # Get relevant context from knowledge base
        context = await self._get_regeneration_context(test, pattern)
        
        # Generate new assertions using LLM
        new_assertions = await self._generate_assertions(test, context)
        
        if new_assertions and self._validate_assertions(new_assertions, test):
            result.new_assertions = new_assertions
            result.healed = True
        else:
            result.error_message = "Failed to generate valid assertions"
            result.strategy = HealingStrategy.MANUAL

    async def _get_regeneration_context(
        self,
        test: TestCase,
        pattern: Optional[FailurePattern]
    ) -> Dict[str, Any]:
        """Get context for assertion regeneration."""
        # Query knowledge base for relevant context
        query = f"{test.method} {test.endpoint} {test.description}"
        result = self.retrieval.retrieve(query, k=3)
        
        context = {
            "api_spec": result.get("documents", []),
            "historical_patterns": pattern.probable_cause if pattern else None,
            "test_metadata": {
                "type": test.type,
                "endpoint": test.endpoint,
                "method": test.method,
                "parameters": test.input_data
            }
        }
        return context

    async def _generate_assertions(
        self,
        test: TestCase,
        context: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Generate new assertions using LLM."""
        # TODO: Implement LLM-based assertion generation
        # This would use an LLM to generate new assertions based on:
        # 1. The API specification
        # 2. Historical patterns
        # 3. Test metadata
        return None

    def _validate_assertions(
        self,
        assertions: Dict[str, Any],
        test: TestCase
    ) -> bool:
        """Validate generated assertions."""
        if not assertions:
            return False
            
        # Ensure critical validations are preserved
        if test.type == TestType.security:
            security_checks = {"authentication", "authorization", "input_validation"}
            if not any(check in str(assertions) for check in security_checks):
                return False
                
        # Ensure performance assertions for performance tests
        if test.type == TestType.performance:
            if "response_time" not in str(assertions):
                return False
                
        return True

    def get_healing_history(
        self,
        test_id: Optional[str] = None
    ) -> List[HealingResult]:
        """Get healing history, optionally filtered by test ID."""
        if test_id:
            return [r for r in self.healing_history if r.test_case.test_id == test_id]
        return self.healing_history