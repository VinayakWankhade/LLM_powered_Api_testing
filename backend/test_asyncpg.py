import asyncio
import asyncpg
from app.core.config import settings

async def test_direct_asyncpg():
    print(f"Testing direct asyncpg connection...")
    # Manual construction with potential escaping
    # Based on .env: postgresql+asyncpg://postgres:DJp9?J%3Y-2RJzv@db.gkzdzxuvwtzxlfazuzxy.supabase.co:5432/postgres
    
    # Let's try to connect using the individual parameters
    try:
        conn = await asyncpg.connect(
            user='postgres',
            password='DJp9?J%3Y-2RJzv',
            database='postgres',
            host='db.gkzdzxuvwtzxlfazuzxy.supabase.co',
            port=5432
        )
        print("🚀 Direct asyncpg connection successful!")
        await conn.close()
    except Exception as e:
        print(f"❌ Direct asyncpg connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_direct_asyncpg())
