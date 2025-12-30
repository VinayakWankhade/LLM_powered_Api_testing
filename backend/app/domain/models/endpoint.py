import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

class Endpoint(Base):
    """
    Represents an API route discovered in a project's codebase.
    """
    __tablename__ = "endpoints"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    method: Mapped[str] = mapped_column(String, nullable=False) # GET, POST, etc.
    path: Mapped[str] = mapped_column(String, nullable=False)
    framework: Mapped[str] = mapped_column(String, nullable=False) # FastAPI, Express, etc.
    status: Mapped[str] = mapped_column(String, default="Scanned") # Scanned, Unscanned, Error, Warning
    last_scanned: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("projects.id"), nullable=False)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="endpoints")
    test_cases: Mapped[list["TestCase"]] = relationship("TestCase", back_populates="endpoint", cascade="all, delete-orphan")
