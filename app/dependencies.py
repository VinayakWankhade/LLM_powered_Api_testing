from functools import lru_cache

from app.core.orchestrator import ExecutionOrchestrator
from app.core.execution_engine import ExecutionEngine
from app.services.knowledge_base import KnowledgeBase
from app.services.embeddings import EmbeddingService
from app.services.ingestion import IngestionService
from app.services.generation import GenerationService
from app.services.retrieval import RetrievalService
from app.services.optimizer import OptimizerService
from app.services.context_optimizer import ContextOptimizer
from app.services.test_validator import TestValidator
from app.services.real_time_data import RealTimeDataService
from app.core.coverage_aggregator import CoverageAggregator
from app.core.analysis.result_collector import ResultCollector
from app.core.analysis.failure_analyzer import FailureAnalyzer
from app.core.analysis.coverage_reporter import CoverageReporter
from app.core.recommendation import RecommendationEngine, RiskForecaster
from app.core.healing.orchestrator import HealingOrchestrator
from app.core.healing.assertion_regenerator import AssertionRegenerator
from app.core.healing.retry_manager import RetryManager
from app.core.executor.http_runner import HTTPRunner
from app.core.rl.agent import RLAgent
from app.core.rl.scheduler import ExecutionScheduler
from app.core.rl.policy import PolicyUpdater
from app.core.test_prioritization_scheduler import TestPrioritizationScheduler


@lru_cache(maxsize=1)
def get_orchestrator() -> ExecutionOrchestrator:
    return ExecutionOrchestrator()


@lru_cache(maxsize=1)
def get_knowledge_base() -> KnowledgeBase:
    return KnowledgeBase()


@lru_cache(maxsize=1)
def get_embedding_model() -> EmbeddingService:
    return EmbeddingService()


# Aliases for backward compatibility
get_embedding_service = get_embedding_model
get_knowledge_base_service = get_knowledge_base


@lru_cache(maxsize=1)
def get_coverage_aggregator() -> CoverageAggregator:
    return CoverageAggregator()


@lru_cache(maxsize=1)
def get_result_collector() -> ResultCollector:
    return ResultCollector()


@lru_cache(maxsize=1)
def get_failure_analyzer() -> FailureAnalyzer:
    return FailureAnalyzer()


@lru_cache(maxsize=1)
def get_coverage_reporter() -> CoverageReporter:
    return CoverageReporter()


def get_ingestion_service() -> IngestionService:
    return IngestionService(get_knowledge_base(), get_embedding_model())


@lru_cache(maxsize=1)
def get_http_runner() -> HTTPRunner:
    return HTTPRunner()


@lru_cache(maxsize=1)
def get_healing_orchestrator() -> HealingOrchestrator:
    return HealingOrchestrator(
        kb=get_knowledge_base(),
        embed=get_embedding_model()
    )


@lru_cache(maxsize=1)
def get_context_optimizer() -> ContextOptimizer:
    return ContextOptimizer(
        embed=get_embedding_model()
    )


@lru_cache(maxsize=1)
def get_test_validator() -> TestValidator:
    return TestValidator()


@lru_cache(maxsize=1)
def get_generation_service() -> GenerationService:
    try:
        from openai import OpenAI
        client = OpenAI()  # Uses OPENAI_API_KEY env var
    except (ImportError, Exception):
        # Fallback for testing without OpenAI
        client = None
    return GenerationService(client, embed=get_embedding_model())


@lru_cache(maxsize=1)
def get_assertion_regenerator() -> AssertionRegenerator:
    return AssertionRegenerator(
        kb=get_knowledge_base(),
        embed=get_embedding_model(),
        generation_service=get_generation_service()
    )


@lru_cache(maxsize=1)
def get_retry_manager() -> RetryManager:
    return RetryManager(
        http_runner=get_http_runner(),
        kb=get_knowledge_base()
    )


@lru_cache(maxsize=1)
def get_execution_engine() -> ExecutionEngine:
    return ExecutionEngine()


@lru_cache(maxsize=1)
def get_retrieval_service() -> RetrievalService:
    return RetrievalService(
        kb=get_knowledge_base(),
        embed=get_embedding_model()
    )


@lru_cache(maxsize=1)
def get_optimizer_service() -> OptimizerService:
    return OptimizerService(
        embed=get_embedding_model()
    )


@lru_cache(maxsize=1)
def get_risk_forecaster() -> RiskForecaster:
    return RiskForecaster(
        model_path="models/risk_forecaster",
        use_deep_learning=True
    )


@lru_cache(maxsize=1)
def get_recommendation_engine() -> RecommendationEngine:
    return RecommendationEngine(
        risk_forecaster=get_risk_forecaster()
    )


@lru_cache(maxsize=1)
def get_rl_agent() -> RLAgent:
    return RLAgent()


@lru_cache(maxsize=1)
def get_policy_updater() -> PolicyUpdater:
    return PolicyUpdater(
        agent=get_rl_agent(),
        policy_path="data/policy.json"
    )


@lru_cache(maxsize=1)
def get_execution_scheduler() -> ExecutionScheduler:
    return ExecutionScheduler(
        policy_updater=get_policy_updater(),
        execution_engine=get_execution_engine()
    )


@lru_cache(maxsize=1)
def get_real_time_data_service() -> RealTimeDataService:
    return RealTimeDataService(
        knowledge_base=get_knowledge_base(),
        result_collector=get_result_collector(),
        coverage_aggregator=get_coverage_aggregator()
    )


@lru_cache(maxsize=1)
def get_test_prioritization_scheduler() -> TestPrioritizationScheduler:
    return TestPrioritizationScheduler(
        knowledge_base=get_knowledge_base(),
        rl_agent=get_rl_agent(),
        coverage_aggregator=get_coverage_aggregator(),
        max_parallel_batches=5
    )
