from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """
    Base class for all our database models.
    
    Why this?
    Every table we create needs to inherit from this. It helps SQLAlchemy 
    track all our tables and their relationships.
    """
    pass
