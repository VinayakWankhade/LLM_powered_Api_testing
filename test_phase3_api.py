#!/usr/bin/env python3
"""
Test Phase 3 API endpoints to verify execution functionality
"""

import asyncio
import httpx
import json
from datetime import datetime

async def test_phase3_endpoints():
    """Test Phase 3 execution API endpoints"""
    
    base_url = "http://localhost:8000"
    
    # Test data - sample test cases for execution
    test_execution_payload = {
        "tests": [
            {
                "test_id": "api_test_001",
                "type": "functional",
                "description": "Test health endpoint",
                "endpoint": "/health",
                "method": "GET",
                "input_data": {},
                "expected_output": {"status_code": 200}
            },
            {
                "test_id": "api_test_002", 
                "type": "functional",
                "description": "Test OpenAPI spec endpoint",
                "endpoint": "/openapi.json",
                "method": "GET",
                "input_data": {},
                "expected_output": {"status_code": 200}
            }
        ],
        "max_parallel": 2,
        "retry_attempts": 2,
        "optimize": False
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("🔍 TESTING PHASE 3 API ENDPOINTS")
        print("=" * 60)
        
        # Test 1: Execute tests
        print("\n1. Testing /execute/run endpoint...")
        try:
            response = await client.post(
                f"{base_url}/execute/run",
                json=test_execution_payload
            )
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Execution successful")
                print(f"   Execution ID: {result.get('execution_id', 'N/A')}")
                print(f"   Total tests: {result.get('metrics', {}).get('total_tests', 'N/A')}")
                print(f"   Successful: {result.get('metrics', {}).get('successful_tests', 'N/A')}")
                print(f"   Failed: {result.get('metrics', {}).get('failed_tests', 'N/A')}")
            else:
                print(f"   ❌ Failed with status {response.status_code}")
                print(f"   Response: {response.text}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        # Test 2: Get execution results
        print("\n2. Testing /execute/results endpoint...")
        try:
            response = await client.get(f"{base_url}/execute/results")
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                results = response.json()
                print(f"   ✅ Retrieved {len(results)} execution records")
                if results:
                    latest = results[0]
                    print(f"   Latest execution: {latest.get('execution_id', 'N/A')}")
                    print(f"   Start time: {latest.get('start_time', 'N/A')}")
            else:
                print(f"   ❌ Failed with status {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        # Test 3: Get execution stats
        print("\n3. Testing /execute/stats endpoint...")
        try:
            response = await client.get(f"{base_url}/execute/stats")
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                stats = response.json()
                print(f"   ✅ Execution stats retrieved")
                print(f"   Stats: {json.dumps(stats, indent=2)[:200]}...")
            else:
                print(f"   ❌ Failed with status {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        # Test 4: Test health endpoint (used in our test cases)
        print("\n4. Testing target /health endpoint...")
        try:
            response = await client.get(f"{base_url}/health")
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                print(f"   ✅ Health endpoint working")
                print(f"   Response: {response.json()}")
            else:
                print(f"   ❌ Failed with status {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error: {e}")

if __name__ == "__main__":
    print("Phase 3 API Endpoint Testing")
    print("Note: This requires the FastAPI server to be running")
    print("Run: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    print()
    
    try:
        asyncio.run(test_phase3_endpoints())
    except Exception as e:
        print(f"❌ Could not connect to API server: {e}")
        print("Make sure the server is running with: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")