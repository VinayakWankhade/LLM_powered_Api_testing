from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from uuid import UUID
from datetime import datetime
from app.domain.models.endpoint import Endpoint

class BaseDTO(BaseModel):
    """Base DTO with camelCase alias support."""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )

class EndpointDTO(BaseDTO):
    id: UUID
    method: str
    path: str
    status: str
    last_scanned: str

def adapt_endpoint_to_list_item(endpoint: Endpoint) -> EndpointDTO:
    """
    Adapter: Domain Endpoint -> EndpointDTO
    """
    return EndpointDTO(
        id=endpoint.id,
        method=endpoint.method,
        path=endpoint.path,
        status=endpoint.status or "ACTIVE",
        last_scanned=endpoint.last_scanned.isoformat() if endpoint.last_scanned else endpoint.created_at.isoformat()
    )
