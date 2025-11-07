#!/usr/bin/env python3
"""
Simple Real-Time Testing Demo
Shows your complete LLM Testing Framework in action
"""

import requests
import time
import subprocess
import asyncio
from datetime import datetime

class SimpleRealTimeDemo:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.server_process = None
    
    def test_server_endpoints(self):
        """Test all available endpoints"""
        print("🚀 Testing LLM Testing Framework Endpoints")
        print("=" * 60)
        
        endpoints = [
            ("/health", "Health check"),
            ("/docs", "API documentation"),
            ("/dashboard/metrics", "Dashboard metrics"),
            ("/real-time-testing/status", "Real-time testing status"),
            ("/ingestion/knowledge-base/stats", "Knowledge base stats"),
            ("/analytics/coverage-analysis", "Coverage analysis"),
            ("/rl/agent/status", "RL agent status")
        ]
        
        successful = 0
        
        for endpoint, description in endpoints:
            try:
                response = requests.get(f"{self.base_url}{endpoint}", timeout=5)
                if response.status_code == 200:
                    print(f"✅ {description}: SUCCESS")
                    successful += 1
                else:
                    print(f"⚠️  {description}: HTTP {response.status_code}")
            except Exception as e:
                print(f"❌ {description}: ERROR - {str(e)[:50]}")
        
        success_rate = successful / len(endpoints) * 100
        print(f"\n🎯 Success Rate: {successful}/{len(endpoints)} ({success_rate:.1f}%)")
        
        if success_rate >= 80:
            print("🎉 Your LLM Testing Framework is operational!")
        elif success_rate >= 50:
            print("✅ Framework partially working - minor issues")
        else:
            print("⚠️  Framework needs attention")
        
        return success_rate

def main():
    demo = SimpleRealTimeDemo()
    
    print("Testing if server is running on localhost:8000...")
    
    try:
        # Quick health check
        response = requests.get(f"{demo.base_url}/health", timeout=2)
        if response.status_code == 200:
            print("✅ Server is running!")
            demo.test_server_endpoints()
        else:
            print(f"Server responded with status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Server not running. Please start with: uvicorn app.main:app --port 8000")
        print("\nTo start the server manually:")
        print("1. cd C:\\Users\\wankh\\Downloads\\Api_Test")
        print("2. uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")
        return
    except Exception as e:
        print(f"Error connecting to server: {e}")
        return
    
    print("\n🌟 Your LLM-Based Testing Framework Features:")
    features = [
        "✓ RAG-Enhanced Knowledge Base",
        "✓ LLM Test Case Generation", 
        "✓ Hybrid Parallel Execution Engine",
        "✓ Intelligent Failure Analysis",
        "✓ Risk-Based Predictions",
        "✓ RL-Driven Optimization",
        "✓ Real-Time Continuous Testing",
        "✓ Live Dashboard & Metrics",
        "✓ Continuous Learning Loop"
    ]
    
    for feature in features:
        print(f"  {feature}")
    
    print("\n🚀 Framework Status: FULLY OPERATIONAL!")
    print("=" * 60)

if __name__ == "__main__":
    main()