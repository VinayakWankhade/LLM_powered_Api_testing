import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
import os

async def test_env_url_6543():
    # Get the URL from settings
    url = settings.DATABASE_URL
    # Swap 5432 for 6543
    url_6543 = url.replace(":5432/", ":6543/")
    
    print(f"Testing connectivity to port 6543 using .env URL...")
    print(f"URL: {url_6543.split('@')[-1]}")
    
    try:
        engine = create_async_engine(url_6543)
        async with engine.connect() as conn:
            print("🚀 SUCCESS! Connected to Supabase on port 6543!")
            # Check a simple query
            from sqlalchemy import text
            await conn.execute(text("SELECT 1"))
            print("🚀 Query successful!")
    except Exception as e:
        print(f"❌ Connection FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test_env_url_6543())
