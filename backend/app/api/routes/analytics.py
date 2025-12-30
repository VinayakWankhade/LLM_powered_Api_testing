from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.domain.models.user import User
from app.services.analytics_service import AnalyticsService
from app.dto.analytics_dto import AnalyticsDashboardDTO, adapt_analytics_to_dashboard
from app.domain.schemas.analytics import ProjectAnalytics, AIEfficiencyMetrics

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard", response_model=AnalyticsDashboardDTO)
async def get_global_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns a high-level summary of all user's projects and tests.
    """
    stats = await AnalyticsService.get_dashboard_summary(db, current_user.id)
    # Convert Pydantic object to dict for adapter if needed, 
    # but here stats is already a DashboardSummary schema.
    # We can just adapt the fields.
    return adapt_analytics_to_dashboard(stats.model_dump())

@router.get("/projects/{project_id}", response_model=ProjectAnalytics)
async def get_project_dashboard(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns detailed metrics for a specific project.
    """
    stats = await AnalyticsService.get_project_analytics(db, project_id, current_user.id)
    if not stats:
        raise HTTPException(status_code=404, detail="Project not found or unauthorized.")
    return stats

@router.get("/ai-efficiency", response_model=AIEfficiencyMetrics)
async def get_ai_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns metrics on AI generation speed and healing success.
    """
    return await AnalyticsService.get_ai_efficiency(db, current_user.id)
