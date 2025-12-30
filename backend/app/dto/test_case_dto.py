from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from uuid import UUID
from typing import List, Optional, Any
from app.domain.models.test_case import TestCase

class BaseDTO(BaseModel):
    """Base DTO with camelCase alias support."""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )

class TestCaseListItemDTO(BaseDTO):
    id: UUID
    description: str
    status: str
    priority: str
    type: str

class TestCaseDetailDTO(BaseDTO):
    id: UUID
    code: str
    input_data: Any
    expected_output: Any
    assertions: List[str]

def adapt_test_case_to_list_item(test_case: TestCase) -> TestCaseListItemDTO:
    """
    Adapter: Domain TestCase -> TestCaseListItemDTO
    """
    return TestCaseListItemDTO(
        id=test_case.id,
        description=test_case.description,
        status=test_case.status or "DRAFT",
        priority=test_case.priority or "MEDIUM",
        type="API" # Default as per contract
    )

def adapt_test_case_to_detail(test_case: TestCase) -> TestCaseDetailDTO:
    """
    Adapter: Domain TestCase -> TestCaseDetailDTO
    """
    return TestCaseDetailDTO(
        id=test_case.id,
        code=test_case.test_code,
        input_data={}, # Mock or extracted from metadata
        expected_output={}, # Mock or extracted from metadata
        assertions=[] # Mock or extracted from metadata
    )
