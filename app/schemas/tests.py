from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class TestType(str, Enum):
    functional = "functional"
    security = "security"
    performance = "performance"
    edge = "edge"


class TestCase(BaseModel):
    test_id: str
    type: TestType
    description: str
    input_data: Dict[str, Any] = Field(default_factory=dict)
    expected_output: Dict[str, Any] = Field(default_factory=dict)
    endpoint: Optional[str] = None
    method: Optional[str] = None
    tags: List[str] = Field(default_factory=list)


class GenerateRequest(BaseModel):
    endpoint: str
    method: str = "GET"
    parameters: Dict[str, Any] = Field(default_factory=dict)
    context_query: Optional[str] = None
    top_k: int = 6


class GenerateResponse(BaseModel):
    total: int
    tests: List[TestCase]
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


