from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from app.domain.models.project import Project

class BaseDTO(BaseModel):
    """Base DTO with camelCase alias support."""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )

class ProjectCardDTO(BaseDTO):
    id: UUID
    name: str
    status: str
    endpoints: int
    coverage: float
    trend: str
    last_activity: str

class ProjectStatsDTO(BaseDTO):
    endpoints: int
    tests: int
    pass_rate: float

class ProjectDetailDTO(BaseDTO):
    id: UUID
    name: str
    stats: ProjectStatsDTO
    recent_runs: List[dict] = []

class ProjectResponseDTO(BaseDTO):
    project: ProjectDetailDTO

def adapt_project_to_card(project: Project, endpoints_count: int = 0) -> ProjectCardDTO:
    """
    Adapter: Domain Project -> ProjectCardDTO
    """
    return ProjectCardDTO(
        id=project.id,
        name=project.name,
        status=project.status or "Active",
        endpoints=endpoints_count,
        coverage=0.0, # Computed at runtime or from analytics
        trend="stable",
        last_activity=project.created_at.isoformat()
    )

def adapt_project_to_detail(project: Project, stats: dict) -> ProjectResponseDTO:
    """
    Adapter: Domain Project -> ProjectResponseDTO (Nested)
    """
    return ProjectResponseDTO(
        project=ProjectDetailDTO(
            id=project.id,
            name=project.name,
            stats=ProjectStatsDTO(
                endpoints=stats.get("endpoints", 0),
                tests=stats.get("tests", 0),
                pass_rate=stats.get("pass_rate", 0.0)
            ),
            recent_runs=[] # To be populated by TestRun adapters
        )
    )
