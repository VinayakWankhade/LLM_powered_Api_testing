from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.db.session import Base
from datetime import datetime

class Endpoint(Base):
    __tablename__ = "endpoints"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    method = Column(String, nullable=False) # GET, POST, PUT, DELETE, etc.
    path = Column(String, nullable=False)
    
    status = Column(String, default="Unscanned") # Scanned, Unscanned, Error, Warning
    status_color = Column(String, default="gray")
    
    last_scanned = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="endpoints")
    test_cases = relationship("TestCase", back_populates="endpoint", cascade="all, delete-orphan")
