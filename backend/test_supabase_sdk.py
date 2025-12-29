from supabase import create_client, Client
from app.core.config import settings
import os

def test_supabase_sdk():
    print(f"Testing Supabase SDK for: {settings.SUPABASE_URL}")
    try:
        supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        # Try a simple auth check or list storage
        res = supabase.auth.get_session()
        print("🚀 Supabase SDK reachable! Session checked.")
    except Exception as e:
        print(f"❌ Supabase SDK failed: {e}")

if __name__ == "__main__":
    test_supabase_sdk()
