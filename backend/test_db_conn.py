import asyncio
from sqlalchemy import text
from app.db.session import engine

async def test_connection():
    """
    Simple script to test if we can talk to the database.
    """
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            print(f"Connection successful! DB result: {result.scalar()}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
