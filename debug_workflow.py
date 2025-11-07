#!/usr/bin/env python3
"""
Debug script to test the workflow orchestrator directly
"""

import asyncio
import sys
import logging
from pathlib import Path

# Add the project root to Python path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.workflow_orchestrator import WorkflowOrchestrator, WorkflowConfig
from app.dependencies import (
    get_ingestion_service,
    get_generation_service,
    get_retrieval_service,
    get_optimizer_service,
    get_test_validator
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_phase1_only():
    """Test only Phase 1 (MERN analysis) to isolate the issue."""
    logger.info("Testing Phase 1 MERN Analysis...")
    
    try:
        # Get services
        ingestion_service = get_ingestion_service()
        generation_service = get_generation_service()
        retrieval_service = get_retrieval_service()
        optimizer_service = get_optimizer_service()
        test_validator = get_test_validator()
        
        # Create mock components for the ones that might not exist
        class MockExecutionEngine:
            async def execute_tests(self, tests, base_url, timeout=300):
                return {"mock": "execution"}
        
        class MockFeedbackLoop:
            async def analyze_and_enhance(self, executed_tests, results, coverage):
                return executed_tests
        
        class MockPolicyManager:
            async def update_policy(self, execution_results, coverage_target):
                return {"mock": "policy"}
        
        execution_engine = MockExecutionEngine()
        feedback_loop = MockFeedbackLoop()
        policy_manager = MockPolicyManager()
        
        # Create orchestrator
        orchestrator = WorkflowOrchestrator(
            ingestion_service=ingestion_service,
            generation_service=generation_service,
            retrieval_service=retrieval_service,
            optimizer_service=optimizer_service,
            test_validator=test_validator,
            execution_engine=execution_engine,
            feedback_loop=feedback_loop,
            policy_manager=policy_manager
        )
        
        # Create config
        config = WorkflowConfig(
            mern_app_path="C:\\Users\\wankh\\Downloads\\Api_Test",
            target_api_running=False
        )
        
        # Test Phase 1
        result = await orchestrator._phase1_mern_analysis(config)
        logger.info(f"Phase 1 completed successfully: {result}")
        return True
        
    except Exception as e:
        logger.error(f"Phase 1 failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    success = await test_phase1_only()
    if success:
        print("✅ Debug test passed!")
    else:
        print("❌ Debug test failed!")

if __name__ == "__main__":
    asyncio.run(main())