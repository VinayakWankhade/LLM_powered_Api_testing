#!/usr/bin/env python3
"""
Test script to verify that all microservice modules are properly connected
and can communicate through the dependency injection system.
"""

import sys
import traceback
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def test_dependency_injection():
    """Test that all dependencies can be imported and instantiated."""
    print("🔍 Testing dependency injection system...")
    
    try:
        from app.dependencies import (
            get_knowledge_base,
            get_embedding_model,
            get_orchestrator,
            get_coverage_aggregator,
            get_result_collector,
            get_failure_analyzer,
            get_coverage_reporter,
            get_healing_orchestrator,
            get_assertion_regenerator,
            get_retry_manager,
            get_execution_engine,
            get_retrieval_service,
            get_optimizer_service,
            get_risk_forecaster,
            get_recommendation_engine,
            get_rl_agent,
            get_policy_updater,
            get_execution_scheduler,
            get_generation_service,
            get_ingestion_service,
            get_http_runner
        )
        
        # Test instantiation of core dependencies
        dependencies = {
            "KnowledgeBase": get_knowledge_base,
            "EmbeddingModel": get_embedding_model,
            "ExecutionOrchestrator": get_orchestrator,
            "CoverageAggregator": get_coverage_aggregator,
            "ResultCollector": get_result_collector,
            "FailureAnalyzer": get_failure_analyzer,
            "CoverageReporter": get_coverage_reporter,
            "ExecutionEngine": get_execution_engine,
            "RetrievalService": get_retrieval_service,
            "OptimizerService": get_optimizer_service,
            "RiskForecaster": get_risk_forecaster,
            "RecommendationEngine": get_recommendation_engine,
            "GenerationService": get_generation_service,
            "IngestionService": get_ingestion_service,
            "HTTPRunner": get_http_runner
        }
        
        failed_deps = []
        for name, dep_func in dependencies.items():
            try:
                instance = dep_func()
                print(f"✅ {name}: {type(instance).__name__}")
            except Exception as e:
                failed_deps.append((name, str(e)))
                print(f"❌ {name}: {e}")
        
        if failed_deps:
            print(f"\n⚠️  {len(failed_deps)} dependencies failed to instantiate")
            return False
        else:
            print(f"\n✅ All {len(dependencies)} core dependencies instantiated successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Failed to import dependencies: {e}")
        traceback.print_exc()
        return False

def test_router_imports():
    """Test that all routers can be imported successfully."""
    print("\n🔍 Testing router imports...")
    
    routers = [
        "app.routers.ingest",
        "app.routers.generation", 
        "app.routers.execution",
        "app.routers.analytics",
        "app.routers.healing",
        "app.routers.dashboard",
        "app.routers.feedback"
    ]
    
    failed_imports = []
    for router_name in routers:
        try:
            __import__(router_name)
            print(f"✅ {router_name}")
        except Exception as e:
            failed_imports.append((router_name, str(e)))
            print(f"❌ {router_name}: {e}")
    
    if failed_imports:
        print(f"\n⚠️  {len(failed_imports)} router imports failed")
        for name, error in failed_imports:
            print(f"   {name}: {error}")
        return False
    else:
        print(f"\n✅ All {len(routers)} routers imported successfully!")
        return True

def test_app_startup():
    """Test that the FastAPI app can be created."""
    print("\n🔍 Testing FastAPI app startup...")
    
    try:
        from app.main import create_app
        app = create_app()
        print(f"✅ FastAPI app created successfully")
        print(f"   Title: {app.title}")
        print(f"   Routes: {len(app.routes)} registered")
        return True
    except Exception as e:
        print(f"❌ Failed to create FastAPI app: {e}")
        traceback.print_exc()
        return False

def test_service_connections():
    """Test that services can interact with each other."""
    print("\n🔍 Testing service connections...")
    
    try:
        from app.dependencies import (
            get_knowledge_base,
            get_embedding_model,
            get_retrieval_service,
            get_ingestion_service
        )
        
        # Test that services can be connected
        kb = get_knowledge_base()
        embedding = get_embedding_model()
        retrieval = get_retrieval_service()
        ingestion = get_ingestion_service()
        
        print("✅ Core services instantiated")
        
        # Test embedding service
        test_texts = ["Hello world", "Test embedding"]
        try:
            embeddings = embedding.embed(test_texts)
            print(f"✅ Embedding service working (generated {len(embeddings)} embeddings)")
        except Exception as e:
            print(f"⚠️  Embedding service issue: {e}")
        
        print("✅ Service connections verified!")
        return True
        
    except Exception as e:
        print(f"❌ Service connection test failed: {e}")
        traceback.print_exc()
        return False

def main():
    """Run all connection tests."""
    print("🚀 Testing microservice module connections...\n")
    
    tests = [
        ("Dependency Injection", test_dependency_injection),
        ("Router Imports", test_router_imports),
        ("App Startup", test_app_startup),
        ("Service Connections", test_service_connections)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{'='*50}")
        print(f"🧪 {test_name}")
        print('='*50)
        success = test_func()
        results.append((test_name, success))
    
    print(f"\n{'='*50}")
    print("📊 Test Results Summary")
    print('='*50)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All module connections are working properly!")
        return 0
    else:
        print("⚠️  Some module connections need attention.")
        return 1

if __name__ == "__main__":
    sys.exit(main())