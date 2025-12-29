import asyncio
import asyncpg
from app.core.config import settings

async def test_direct_asyncpg_v2():
    print("Testing direct asyncpg connection to port 6543...")
    
    # EXACT string from user's .env for password: DJp9?J%3Y-2RJzv
    # Note: If %3Y was intended to be part of the password, asyncpg might think it's an escape.
    # Let's try both the raw string and a potentially fixed one.
    
    password = "DJp9?J%3Y-2RJzv"
    
    try:
        conn = await asyncpg.connect(
            user='postgres',
            password=password,
            database='postgres',
            host='db.gkzdzxuvwtzxlfazuzxy.supabase.co',
            port=6543
        )
        print("🚀 SUCCESS! Direct asyncpg connection successful!")
        await conn.close()
    except Exception as e:
        print(f"❌ FAILED with raw password: {e}")
        
    # Try with another variant if common pitfalls exist
    # (Sometimes passwords have leading/trailing spaces when copied)

if __name__ == "__main__":
    asyncio.run(test_direct_asyncpg_v2())
