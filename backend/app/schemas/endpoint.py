from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class EndpointBase(BaseModel):
    method: str
    path: str

class EndpointCreate(EndpointBase):
    pass

class EndpointResponse(EndpointBase):
    id: int
    project_id: int
    status: str
    status_color: str
    last_scanned: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
