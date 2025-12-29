import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
import urllib.parse
import os

async def test_fixed_url():
    # The password from .env: DJp9?J%3Y-2RJzv
    # Let's try to reconstruct the URL with proper encoding
    raw_password = "DJp9?J%3Y-2RJzv"
    encoded_password = urllib.parse.quote_plus(raw_password)
    
    # Construction parts
    driver = "postgresql+asyncpg"
    user = "postgres"
    host = "db.gkzdzxuvwtzxlfazuzxy.supabase.co"
    port = "5432"
    dbname = "postgres"
    
    url = f"{driver}://{user}:{encoded_password}@{host}:{port}/{dbname}"
    print(f"DEBUG: Reconstructed URL (host only): {host}")
    
    try:
        engine = create_async_engine(url)
        print("Connecting...")
        async with engine.connect() as conn:
            print("🚀 Connection SUCCESSFUL with manual encoding!")
    except Exception as e:
        print(f"❌ Connection FAILED: {e}")
        
        print("\nTrying port 6543 (Transaction Mode)...")
        url_6543 = f"{driver}://{user}:{encoded_password}@{host}:6543/{dbname}"
        try:
            engine_6543 = create_async_engine(url_6543)
            async with engine_6543.connect() as conn:
                print("🚀 Connection SUCCESSFUL on port 6543!")
        except Exception as e2:
            print(f"❌ Connection FAILED on port 6543: {e2}")

if __name__ == "__main__":
    asyncio.run(test_fixed_url())
