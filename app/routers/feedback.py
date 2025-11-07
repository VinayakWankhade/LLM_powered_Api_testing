"""
API router for feedback collection, processing, and integration with RAG and RL components.
"""

from datetime import datetime
from typing import Dict, List, Optional, Any

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

from app.core.feedback_loop import (
    FeedbackLoop,
    FeedbackEntry,
    FeedbackSource,
    FeedbackSeverity
)
from app.dependencies import (
    get_optimizer_service,
    get_generation_service
)

router = APIRouter(tags=["feedback"])


class FeedbackRequest(BaseModel):
    """Request model for feedback submission."""
    source: str
    endpoint: str
    observed_issue: str
    severity: str
    parameters: Optional[Dict] = None
    metadata: Optional[Dict] = None


class FeedbackResponse(BaseModel):
    """Response model for feedback submission."""
    id: str
    status: str
    timestamp: datetime


class SystemStatsResponse(BaseModel):
    """Response model for system statistics."""
    knowledge_base_entries: int
    unique_endpoints: int
    recent_feedback_count: int
    policy_updates: int
    last_update: datetime


class LearningMetricsResponse(BaseModel):
    """Response model for learning system metrics."""
    total_episodes: int
    avg_episode_reward: float
    policy_size: int
    coverage_history: List[float]
    reward_history: List[float]


# Initialize core services with dependency injection
def get_feedback_loop():
    optimizer_service = get_optimizer_service()
    generator_service = get_generation_service()
    return FeedbackLoop(optimizer_service, generator_service)


@router.post("/submit", response_model=FeedbackResponse)
async def submit_feedback(
    feedback: FeedbackRequest,
    background_tasks: BackgroundTasks
) -> FeedbackResponse:
    """Submit feedback from any source."""
    # Validate feedback source
    if feedback.source not in [
        FeedbackSource.TEST_EXECUTION,
        FeedbackSource.USER_REPORT,
        FeedbackSource.PRODUCTION
    ]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid feedback source. Must be one of: {FeedbackSource.TEST_EXECUTION}, "
                  f"{FeedbackSource.USER_REPORT}, {FeedbackSource.PRODUCTION}"
        )

    # Validate severity
    if feedback.severity not in [
        FeedbackSeverity.LOW,
        FeedbackSeverity.MEDIUM,
        FeedbackSeverity.HIGH,
        FeedbackSeverity.CRITICAL
    ]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid severity. Must be one of: {FeedbackSeverity.LOW}, "
                  f"{FeedbackSeverity.MEDIUM}, {FeedbackSeverity.HIGH}, {FeedbackSeverity.CRITICAL}"
        )

    try:
        # Get feedback loop with dependency injection
        feedback_loop = get_feedback_loop()
        # Process feedback asynchronously
        background_tasks.add_task(
            feedback_loop.ingest_feedback,
            source=feedback.source,
            endpoint=feedback.endpoint,
            observed_issue=feedback.observed_issue,
            severity=feedback.severity,
            parameters=feedback.parameters,
            metadata=feedback.metadata
        )
        
        current_time = datetime.now(tz=datetime.UTC)
        return FeedbackResponse(
            id=str(current_time.timestamp()),
            status="accepted",
            timestamp=current_time
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process feedback: {str(e)}"
        )


@router.get("/stats", response_model=SystemStatsResponse)
async def get_system_stats() -> SystemStatsResponse:
    """Get current system statistics."""
    try:
        feedback_loop = get_feedback_loop()
        stats = await feedback_loop.get_knowledge_stats()
        
        return SystemStatsResponse(
            knowledge_base_entries=stats.get("total_entries", 0),
            unique_endpoints=stats.get("unique_endpoints", 0),
            recent_feedback_count=stats.get("recent_feedback", 0),
            policy_updates=stats.get("policy_updates", 0),
            last_update=datetime.fromisoformat(stats.get("last_update", datetime.now(tz=datetime.UTC).isoformat()))
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve system stats: {str(e)}"
        )


@router.get("/learning/metrics", response_model=LearningMetricsResponse)
async def get_learning_metrics() -> LearningMetricsResponse:
    """Get metrics about the learning system's performance."""
    try:
        feedback_loop = get_feedback_loop()
        stats = await feedback_loop.learner.rl_agent.get_stats()
        metrics = stats.get("training_metrics", {})
        
        return LearningMetricsResponse(
            total_episodes=stats.get("total_episodes", 0),
            avg_episode_reward=stats.get("avg_episode_reward", 0.0),
            policy_size=stats.get("policy_size", 0),
            coverage_history=metrics.get("coverage_history", []),
            reward_history=metrics.get("reward_history", [])
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve learning metrics: {str(e)}"
        )


@router.post("/knowledge-base/cleanup")
async def cleanup_knowledge_base(days: int = 30) -> Dict[str, Any]:
    """Clean up old entries from the knowledge base."""
    try:
        feedback_loop = get_feedback_loop()
        removed_count = await feedback_loop.learner.knowledge_base.cleanup_old_entries(days)
        
        return {
            "status": "success",
            "removed_entries": removed_count,
            "cutoff_days": days,
            "timestamp": datetime.now(tz=datetime.UTC)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clean up knowledge base: {str(e)}"
        )