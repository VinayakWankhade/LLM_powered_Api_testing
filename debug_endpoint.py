#!/usr/bin/env python3
"""
Debug script to test the mern-scan-only endpoint directly
"""

import asyncio
import sys
import logging
from pathlib import Path

# Add the project root to Python path
sys.path.insert(0, str(Path(__file__).parent))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_mern_scan_endpoint():
    """Test the mern-scan-only endpoint directly."""
    
    try:
        # Import what we need
        from app.routers.workflow import get_workflow_orchestrator
        from app.dependencies import (
            get_ingestion_service,
            get_generation_service,
            get_retrieval_service,
            get_optimizer_service,
            get_test_validator
        )
        from app.core.workflow_orchestrator import WorkflowConfig
        
        logger.info("Creating orchestrator...")
        orchestrator = get_workflow_orchestrator(
            ingestion_service=get_ingestion_service(),
            generation_service=get_generation_service(),
            retrieval_service=get_retrieval_service(),
            optimizer_service=get_optimizer_service(),
            test_validator=get_test_validator()
        )
        
        logger.info("Creating config...")
        config = WorkflowConfig(
            mern_app_path="C:\\Users\\wankh\\Downloads\\Api_Test",
            target_api_running=False,
            max_test_cases=0,  # No test generation
            enable_self_healing=False,
            enable_rl_optimization=False,
            generate_final_report=False
        )
        
        logger.info("Calling _phase1_mern_analysis...")
        scan_results = await orchestrator._phase1_mern_analysis(config)
        
        logger.info("Creating response...")
        response = {
            "message": "MERN application scan completed",
            "scan_results": scan_results,
            "summary": {
                "endpoints_discovered": len(scan_results.get("endpoints", [])),
                "components_discovered": len(scan_results.get("components", [])),
                "frameworks_detected": scan_results.get("summary", {}).get("frameworks_detected", []),
                "security_score": scan_results.get("summary", {}).get("security_score", 0),
                "recommendations": scan_results.get("recommendations", [])
            }
        }
        
        logger.info(f"✅ Endpoint test successful!")
        logger.info(f"Response keys: {list(response.keys())}")
        logger.info(f"Endpoints found: {response['summary']['endpoints_discovered']}")
        logger.info(f"Components found: {response['summary']['components_discovered']}")
        
        return response
        
    except Exception as e:
        logger.error(f"❌ Endpoint test failed: {e}")
        import traceback
        traceback.print_exc()
        return None

async def main():
    result = await test_mern_scan_endpoint()
    if result:
        print("✅ Test passed! The endpoint logic works correctly.")
    else:
        print("❌ Test failed!")

if __name__ == "__main__":
    asyncio.run(main())