from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Any

from app.domain.schemas.base import BaseSchema

class TestCaseBase(BaseSchema):
    description: str
    priority: str = "MEDIUM"
    status: str = "DRAFT"
    type: str = "Functional"

class TestCaseCreate(TestCaseBase):
    endpoint_id: UUID
    code: str = Field(..., alias="test_code")

class TestCaseUpdate(BaseSchema):
    description: Optional[str] = None
    priority: Optional[str] = None
    code: Optional[str] = Field(None, alias="test_code")
    status: Optional[str] = None

class TestCaseRead(TestCaseBase):
    id: UUID
    endpoint_id: UUID
    code: str = Field(..., serialization_alias="code", validation_alias="test_code")
    input_data: Optional[Any] = None
    expected_output: Optional[Any] = None
    assertions: List[str] = []
    created_at: datetime
