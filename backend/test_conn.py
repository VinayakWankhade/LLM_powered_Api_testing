import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
import urllib.parse

async def test_conn():
    # If the database URL in .env is already string, try to fix it if it has special characters
    # This is a common issue with passwords containing symbols
    db_url = settings.DATABASE_URL
    print(f"Testing connection to: {db_url.split('@')[-1]}") # Hide password in logs
    
    try:
        engine = create_async_engine(db_url)
        async with engine.connect() as conn:
            print("🚀 Connection successful!")
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_conn())
