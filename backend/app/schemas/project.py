from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = "📁"
    git_url: Optional[str] = None
    local_path: Optional[str] = None
    api_base_url: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    status_color: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    owner_id: str
    status: str
    status_color: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
