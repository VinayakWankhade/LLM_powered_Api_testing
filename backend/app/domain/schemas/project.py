from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Optional

from app.domain.schemas.base import BaseSchema

class ProjectBase(BaseSchema):
    """Common fields for a project."""
    name: str
    git_url: str
    description: Optional[str] = None
    api_base_url: Optional[str] = None

class ProjectCreate(ProjectBase):
    """Fields required to create a project."""
    pass

class ProjectUpdate(BaseSchema):
    """Fields that can be updated for a project."""
    name: Optional[str] = None
    git_url: Optional[str] = None
    description: Optional[str] = None
    api_base_url: Optional[str] = None

class ProjectShort(BaseSchema):
    """Summarized view for listing multiple projects."""
    id: UUID
    name: str
    status: str = "Active"
    endpoints: int = 0
    coverage: float = 0.0
    trend: str = "stable"
    last_activity: str = "N/A"
    icon: str = "🚀"

class ProjectStats(BaseSchema):
    """Detailed analytics for a single project."""
    endpoints: int
    tests: int
    pass_rate: float

from app.domain.schemas.test_run import TestRunRead

class ProjectRead(ProjectBase):
    """Detailed view of a project."""
    id: UUID
    status: str
    icon: str
    stats: Optional[ProjectStats] = None
    recent_runs: List[TestRunRead] = [] 
    created_at: datetime

class ProjectResponse(BaseSchema):
    """Wrapped response for single project operations."""
    project: ProjectRead
