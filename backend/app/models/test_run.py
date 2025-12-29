from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.db.session import Base
from datetime import datetime

class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(String, primary_key=True, index=True) # run_a4b...
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    status = Column(String, default="Running") # Success, Failed, Running, Partial, Cancelled
    status_color = Column(String, default="cyan")
    
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    duration = Column(String) # e.g., "1m 45s"
    
    pass_rate = Column(Float, default=0.0)
    pass_count = Column(Integer, default=0)
    fail_count = Column(Integer, default=0)
    
    triggered_by = Column(String) # User name
    
    self_healing_summary = Column(String, default="N/A")
    healed_count = Column(Integer, default=0)

    # Relationships
    project = relationship("Project", back_populates="test_runs")
