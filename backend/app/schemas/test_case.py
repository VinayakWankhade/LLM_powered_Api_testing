from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TestCaseBase(BaseModel):
    description: str
    priority: str
    test_type: str
    code_snippet: Optional[str] = None

class TestCaseCreate(BaseModel):
    endpoint_id: int

class TestCaseResponse(TestCaseBase):
    id: str
    endpoint_id: int
    status: str
    last_modified: datetime
    created_at: datetime

    class Config:
        from_attributes = True
