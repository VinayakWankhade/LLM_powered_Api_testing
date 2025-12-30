from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from typing import List

from app.domain.models.project import Project
from app.domain.models.endpoint import Endpoint
from app.domain.models.test_case import TestCase
from app.domain.models.test_run import TestRun
from app.domain.schemas.analytics import DashboardSummary, ProjectAnalytics, AIEfficiencyMetrics

class AnalyticsService:
    """
    Service Layer for Data Aggregation.
    
    Why this?
    Dashboard data involves counting and averaging across multiple tables.
    We use optimized SQL queries here to keep the UI fast.
    """

    @staticmethod
    async def get_dashboard_summary(db: AsyncSession, user_id: UUID) -> DashboardSummary:
        # 1. Count Projects
        p_query = select(func.count(Project.id)).where(Project.owner_id == user_id)
        p_count = (await db.execute(p_query)).scalar() or 0

        # 2. Count Endpoints (via projects)
        e_query = select(func.count(Endpoint.id)).join(Project).where(Project.owner_id == user_id)
        e_count = (await db.execute(e_query)).scalar() or 0

        # 3. Count Tests
        t_query = select(func.count(TestCase.id)).join(Endpoint).join(Project).where(Project.owner_id == user_id)
        t_count = (await db.execute(t_query)).scalar() or 0

        # 4. Count Healed Tests
        h_query = select(func.count(TestCase.id)).join(Endpoint).join(Project).where(
            Project.owner_id == user_id, 
            TestCase.status == "HEALED"
        )
        h_count = (await db.execute(h_query)).scalar() or 0

        return DashboardSummary(
            total_projects=p_count,
            total_endpoints=e_count,
            total_tests=t_count,
            pass_rate=95.0, # Dummy for now, would be calculated from TestRun
            healed_tests=h_count
        )

    @staticmethod
    async def get_project_analytics(db: AsyncSession, project_id: UUID, user_id: UUID) -> ProjectAnalytics:
        # 1. Get Project info
        p_query = select(Project).where(Project.id == project_id, Project.owner_id == user_id)
        project = (await db.execute(p_query)).scalar()
        if not project:
            return None

        # 2. Endpoints count
        e_count_query = select(func.count(Endpoint.id)).where(Endpoint.project_id == project_id)
        e_count = (await db.execute(e_count_query)).scalar() or 0

        # 3. Tests count
        t_count_query = select(func.count(TestCase.id)).join(Endpoint).where(Endpoint.project_id == project_id)
        t_count = (await db.execute(t_count_query)).scalar() or 0
        
        # 4. Healing Rate
        h_count_query = select(func.count(TestCase.id)).join(Endpoint).where(
            Endpoint.project_id == project_id, 
            TestCase.status == "HEALED"
        )
        h_count = (await db.execute(h_count_query)).scalar() or 0
        healing_rate = (h_count / t_count * 100) if t_count > 0 else 0

        return ProjectAnalytics(
            project_name=project.name,
            endpoints=e_count,
            tests=t_count,
            last_run_status="SUCCESS",
            healing_rate=healing_rate
        )

    @staticmethod
    async def get_ai_efficiency(db: AsyncSession, user_id: UUID) -> AIEfficiencyMetrics:
        # Mocking these as they require time-tracking logic we might add later
        return AIEfficiencyMetrics(
            avg_generation_time_sec=4.2,
            healing_success_rate=88.5,
            failed_heal_attempts=2
        )
