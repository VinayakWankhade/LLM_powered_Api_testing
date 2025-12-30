from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator

from app.config import settings

# 1. Create the engine - the central connection to our DB
# echo=True means it will print every SQL command to our terminal (good for debugging)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True
)

# 2. Create a session maker - a factory that gives us connections
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# 3. Create a dependency - this is what our API routes will use
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function to get a database session.
    
    Why this?
    FastAPI uses this to give each request its own DB connection. 
    The 'yield' ensures the connection is closed automatically after 
     the request is finished.
    """
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
