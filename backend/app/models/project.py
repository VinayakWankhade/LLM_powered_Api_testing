from sqlalchemy import Column, String, Integer, DateTime, Boolean, text
from sqlalchemy.orm import relationship
from app.db.session import Base
from datetime import datetime

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    icon = Column(String, default="📁")
    status = Column(String, default="Active") # Active, Scanning, Failed, Error
    status_color = Column(String, default="green")
    
    # Supabase User ID
    owner_id = Column(String, index=True, nullable=False)
    
    git_url = Column(String)
    local_path = Column(String)
    api_base_url = Column(String)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    endpoints = relationship("Endpoint", back_populates="project", cascade="all, delete-orphan")
    test_runs = relationship("TestRun", back_populates="project", cascade="all, delete-orphan")
