import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

class TestCase(Base):
    """
    An AI-generated test for a specific API endpoint.
    """
    __tablename__ = "test_cases"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    description: Mapped[str] = mapped_column(String, nullable=False)
    priority: Mapped[str] = mapped_column(String, default="MEDIUM") # HIGH, MEDIUM, LOW
    test_code: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String, default="DRAFT") # DRAFT, ACTIVE, BROKEN
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    endpoint_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("endpoints.id"), nullable=False)

    # Relationships
    endpoint: Mapped["Endpoint"] = relationship("Endpoint", back_populates="test_cases")
