from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base
from datetime import datetime

class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(String, primary_key=True, index=True) # TC-08152 etc.
    endpoint_id = Column(Integer, ForeignKey("endpoints.id"), nullable=False)
    
    description = Column(String, nullable=False)
    status = Column(String, default="Draft") # Approved, Draft, Pending Review, Blocked
    priority = Column(String, default="Medium") # High, Medium, Low
    test_type = Column(String) # Functional, Security, Performance, UI/UX
    
    code_snippet = Column(Text) # The actual AI generated test code
    input_data = Column(Text) # JSON string of input data
    expected_output = Column(Text)
    
    last_modified = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    endpoint = relationship("Endpoint", back_populates="test_cases")
