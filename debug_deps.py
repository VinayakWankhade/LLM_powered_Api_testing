#!/usr/bin/env python3
"""
Debug script to test the dependency injection that the workflow router uses
"""

import sys
import logging
from pathlib import Path

# Add the project root to Python path
sys.path.insert(0, str(Path(__file__).parent))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_dependencies():
    """Test each dependency service one by one."""
    
    try:
        logger.info("Testing ingestion service...")
        from app.dependencies import get_ingestion_service
        ingestion_service = get_ingestion_service()
        logger.info(f"✅ Ingestion service: {type(ingestion_service)}")
    except Exception as e:
        logger.error(f"❌ Ingestion service failed: {e}")
        import traceback
        traceback.print_exc()
    
    try:
        logger.info("Testing generation service...")
        from app.dependencies import get_generation_service
        generation_service = get_generation_service()
        logger.info(f"✅ Generation service: {type(generation_service)}")
    except Exception as e:
        logger.error(f"❌ Generation service failed: {e}")
        import traceback
        traceback.print_exc()
    
    try:
        logger.info("Testing retrieval service...")
        from app.dependencies import get_retrieval_service
        retrieval_service = get_retrieval_service()
        logger.info(f"✅ Retrieval service: {type(retrieval_service)}")
    except Exception as e:
        logger.error(f"❌ Retrieval service failed: {e}")
        import traceback
        traceback.print_exc()
    
    try:
        logger.info("Testing optimizer service...")
        from app.dependencies import get_optimizer_service
        optimizer_service = get_optimizer_service()
        logger.info(f"✅ Optimizer service: {type(optimizer_service)}")
    except Exception as e:
        logger.error(f"❌ Optimizer service failed: {e}")
        import traceback
        traceback.print_exc()
    
    try:
        logger.info("Testing test validator...")
        from app.dependencies import get_test_validator
        test_validator = get_test_validator()
        logger.info(f"✅ Test validator: {type(test_validator)}")
    except Exception as e:
        logger.error(f"❌ Test validator failed: {e}")
        import traceback
        traceback.print_exc()
    
    try:
        logger.info("Testing workflow orchestrator creation...")
        from app.routers.workflow import get_workflow_orchestrator
        
        # Manually get the dependencies first
        from app.dependencies import (
            get_ingestion_service,
            get_generation_service,
            get_retrieval_service,
            get_optimizer_service,
            get_test_validator
        )
        
        orchestrator = get_workflow_orchestrator(
            ingestion_service=get_ingestion_service(),
            generation_service=get_generation_service(),
            retrieval_service=get_retrieval_service(),
            optimizer_service=get_optimizer_service(),
            test_validator=get_test_validator()
        )
        logger.info(f"✅ Workflow orchestrator: {type(orchestrator)}")
        
    except Exception as e:
        logger.error(f"❌ Workflow orchestrator failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_dependencies()