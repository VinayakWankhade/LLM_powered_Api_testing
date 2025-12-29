import asyncio
import asyncpg
from app.core.config import settings

async def test_pooler_username():
    print("Testing pooler-specific username format...")
    
    # Format: user.project_ref
    user = "postgres.gkzdzxuvwtzxlfazuzxy"
    password = "DJp9?J%3Y-2RJzv"
    host = "db.gkzdzxuvwtzxlfazuzxy.supabase.co"
    port = 6543
    
    try:
        conn = await asyncpg.connect(
            user=user,
            password=password,
            database='postgres',
            host=host,
            port=port
        )
        print(f"🚀 SUCCESS! Connected with username: {user}")
        await conn.close()
    except Exception as e:
        print(f"❌ FAILED with pooler username: {e}")

if __name__ == "__main__":
    asyncio.run(test_pooler_username())
