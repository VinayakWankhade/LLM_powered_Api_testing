from pydantic import BaseModel
from typing import Optional
from uuid import UUID

from app.domain.schemas.base import BaseSchema

class DashboardSummary(BaseSchema):
    total_projects: int
    total_endpoints: int
    total_tests: int
    pass_rate: float
    healed_tests: int

class ProjectAnalytics(BaseSchema):
    project_name: str
    endpoints: int
    tests: int
    last_run_status: Optional[str] = "N/A"
    healing_rate: float

class AIEfficiencyMetrics(BaseSchema):
    avg_generation_time_sec: float
    healing_success_rate: float
    failed_heal_attempts: int
