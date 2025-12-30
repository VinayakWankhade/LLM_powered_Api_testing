from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import Optional

class BaseDTO(BaseModel):
    """Base DTO with camelCase alias support."""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )

class AnalyticsDashboardDTO(BaseDTO):
    total_projects: int
    total_endpoints: int
    total_tests: int
    pass_rate: float
    healed_tests: int

def adapt_analytics_to_dashboard(stats: dict) -> AnalyticsDashboardDTO:
    """
    Adapter: Aggregated Stats -> AnalyticsDashboardDTO
    """
    return AnalyticsDashboardDTO(
        total_projects=stats.get("total_projects", 0),
        total_endpoints=stats.get("total_endpoints", 0),
        total_tests=stats.get("total_tests", 0),
        pass_rate=stats.get("pass_rate", 0.0),
        healed_tests=stats.get("healed_tests", 0)
    )
