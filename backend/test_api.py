import httpx
from app.core.config import settings

def test_supabase_api():
    print(f"Testing Supabase API: {settings.SUPABASE_URL}")
    url = f"{settings.SUPABASE_URL}/rest/v1/"
    headers = {
        "apikey": settings.SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_ANON_KEY}"
    }
    
    try:
        response = httpx.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:100]}...")
        if response.status_code == 200:
            print("🚀 Supabase API is reachable and key is valid!")
        else:
            print(f"❌ API check failed with status: {response.status_code}")
    except Exception as e:
        print(f"❌ API check failed: {e}")

if __name__ == "__main__":
    test_supabase_api()
