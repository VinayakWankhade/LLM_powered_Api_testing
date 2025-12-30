from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

from app.domain.schemas.base import BaseSchema

class TestRunBase(BaseSchema):
    status: str = "RUNNING"

class TestRunCreate(TestRunBase):
    project_id: UUID

class TestRunRead(TestRunBase):
    id: UUID
    project_id: UUID
    started_at: datetime
    finished_at: Optional[datetime] = None
    pass_rate: float = 0.0
    healed_count: int = 0
    duration_ms: int = 0
