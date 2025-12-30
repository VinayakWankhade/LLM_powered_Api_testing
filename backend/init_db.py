import asyncio
from app.db.base import Base
from app.db.session import engine

# Import all models here so that Base knows about them
from app.domain.models.user import User
from app.domain.models.project import Project
from app.domain.models.endpoint import Endpoint
from app.domain.models.test_case import TestCase
from app.domain.models.test_run import TestRun

async def init_db():
    """
    Creates all tables in the database.
    
    Warning: This is for development only! In production, 
    we use 'Alembic' for migrations.
    """
    async with engine.begin() as conn:
        print("Creating tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("Tables created successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
