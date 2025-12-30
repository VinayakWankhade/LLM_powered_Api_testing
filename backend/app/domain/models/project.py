import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

class Project(Base):
    """
    A project groups together multiple API tests for a repository.
    """
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    git_url: Mapped[str] = mapped_column(String, nullable=False)
    api_base_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="Active") # Active, Scanning, Failed, Error
    icon: Mapped[str] = mapped_column(String, default="🚀")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    owner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="projects")
    endpoints: Mapped[list["Endpoint"]] = relationship("Endpoint", back_populates="project", cascade="all, delete-orphan")
    test_runs: Mapped[list["TestRun"]] = relationship("TestRun", back_populates="project", cascade="all, delete-orphan")
