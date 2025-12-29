import asyncio
from app.db.session import engine, Base
from app.models import Project, Endpoint, TestCase, TestRun

async def init_db():
    print("🚀 Initializing database schema on Supabase...")
    async with engine.begin() as conn:
        # Warning: This will drop tables if they exist if you use Base.metadata.drop_all
        # For a clean start, we use create_all
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database schema initialized successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
