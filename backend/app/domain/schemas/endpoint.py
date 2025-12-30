from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

from app.domain.schemas.base import BaseSchema

class EndpointBase(BaseSchema):
    method: str
    path: str
    framework: str

class EndpointCreate(EndpointBase):
    project_id: UUID

class EndpointRead(EndpointBase):
    id: UUID
    project_id: UUID
    status: str
    last_scanned: datetime
    created_at: datetime
