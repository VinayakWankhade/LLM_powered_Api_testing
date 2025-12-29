import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
import urllib.parse
import os

async def test_manual():
    # Trying to deduce the password from the .env string if possible, 
    # but let's try assuming the password is exactly "DJp9?J%3Y-2RJzv"
    # or if the string in .env was already partially encoded.
    
    raw_password = "DJp9?J%3Y-2RJzv"
    encoded_password = urllib.parse.quote_plus(raw_password)
    
    # Construction parts
    driver = "postgresql+asyncpg"
    user = "postgres"
    host = "db.gkzdzxuvwtzxlfazuzxy.supabase.co"
    port = "5432"
    dbname = "postgres"
    
    url = f"{driver}://{user}:{encoded_password}@{host}:{port}/{dbname}"
    
    print(f"Trying encoded password: {encoded_password}")
    
    try:
        engine = create_async_engine(url)
        async with engine.connect() as conn:
            print("🚀 Manual connection with encoding successful!")
            return
    except Exception as e:
        print(f"❌ Manual connection with encoding failed: {e}")

    # Trial 2: Maybe %3Y was already encoded? 
    # Let's try raw string as is from .env (which I already did in test_conn.py and it failed)
    
    # Trial 3: Use the password exactly as provided but encoded differently?
    # Some people copy-paste passwords and they have hidden chars.
    
if __name__ == "__main__":
    asyncio.run(test_manual())
