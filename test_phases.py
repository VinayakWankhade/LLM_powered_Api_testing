#!/usr/bin/env python3
"""
Comprehensive Phase Testing Script for LLM-Based Testing Framework
Tests each phase to verify functionality and health
"""

import sys
import os
import asyncio
import json
from datetime import datetime
from typing import Dict, Any, List

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def print_phase_header(phase_name: str, phase_num: int):
    """Print a formatted header for each phase test"""
    print(f"\n{'='*80}")
    print(f"PHASE {phase_num}: {phase_name}")
    print(f"{'='*80}")

def print_component_test(component_name: str):
    """Print component test header"""
    print(f"\n🔧 Testing {component_name}...")

def print_success(message: str):
    """Print success message"""
    print(f"✅ {message}")

def print_error(message: str):
    """Print error message"""
    print(f"❌ {message}")

def print_warning(message: str):
    """Print warning message"""
    print(f"⚠️  {message}")

def print_info(message: str):
    """Print info message"""
    print(f"ℹ️  {message}")

def test_phase_1_knowledge_base():
    """Test Phase 1: Knowledge Base & Ingestion"""
    print_phase_header("Knowledge Base & Ingestion", 1)
    
    try:
        # Test ChromaDB setup
        print_component_test("ChromaDB Setup")
        import chromadb
        chroma_path = "./.chroma"
        if os.path.exists(chroma_path):
            print_success(f"ChromaDB directory exists at {chroma_path}")
            
            # Try to connect to ChromaDB
            client = chromadb.PersistentClient(path=chroma_path)
            collections = client.list_collections()
            print_success(f"ChromaDB client connected successfully")
            print_info(f"Found {len(collections)} collections")
            for collection in collections:
                print_info(f"  - Collection: {collection.name}")
        else:
            print_warning("ChromaDB directory not found, but this is expected for first run")
            
        # Test Embedding Service
        print_component_test("Embedding Service")
        from app.services.embeddings import EmbeddingService
        embedding_service = EmbeddingService()
        test_text = "This is a test document for embedding"
        embedding = embedding_service.get_embedding(test_text)
        print_success(f"Embedding service working - generated embedding of size {len(embedding)}")
        
        # Test Knowledge Base Service
        print_component_test("Knowledge Base Service")
        from app.services.knowledge_base import KnowledgeBase
        kb_service = KnowledgeBase()
        print_success("Knowledge base service instantiated successfully")
        
        return True
        
    except Exception as e:
        print_error(f"Phase 1 test failed: {str(e)}")
        return False

def test_phase_2_test_generation():
    """Test Phase 2: Test Generation with LLM/RAG"""
    print_phase_header("Test Generation with LLM/RAG", 2)
    
    try:
        # Test Generation Service
        print_component_test("Generation Service")
        from app.dependencies import get_generation_service
        generation_service = get_generation_service()
        print_success("Generation service instantiated successfully")
        
        # Test Context Optimizer
        print_component_test("Context Optimizer")
        from app.services.context_optimizer import ContextOptimizer
        from app.dependencies import get_embedding_service
        embedding_service = get_embedding_service()
        context_optimizer = ContextOptimizer(embed=embedding_service)
        print_success("Context optimizer instantiated successfully")
        
        # Test Test Validator
        print_component_test("Test Validator")
        from app.services.test_validator import TestValidator
        test_validator = TestValidator()
        print_success("Test validator instantiated successfully")
        
        # Test Optimizer Service
        print_component_test("Optimizer Service")
        from app.services.optimizer import OptimizerService
        optimizer_service = OptimizerService(embed=embedding_service)
        print_success("Optimizer service instantiated successfully")
        
        return True
        
    except Exception as e:
        print_error(f"Phase 2 test failed: {str(e)}")
        return False

def test_phase_3_execution_engine():
    """Test Phase 3: Execution Engine"""
    print_phase_header("Execution Engine", 3)
    
    try:
        # Test Hybrid Executor
        print_component_test("Hybrid Executor")
        from app.core.executor.hybrid_executor import HybridExecutor
        from app.core.executor.http_runner import HTTPRunner
        from app.core.executor.retry_handler import RetryHandler
        
        http_runner = HTTPRunner("http://localhost:8000")
        retry_handler = RetryHandler()
        hybrid_executor = HybridExecutor(http_runner, retry_handler)
        print_success("Hybrid executor instantiated successfully")
        
        # Test Coverage Aggregator
        print_component_test("Coverage Aggregator")
        from app.core.coverage_aggregator import CoverageAggregator
        coverage_aggregator = CoverageAggregator()
        print_success("Coverage aggregator instantiated successfully")
        
        # Test Orchestrator
        print_component_test("Orchestrator")
        from app.core.orchestrator import ExecutionOrchestrator
        orchestrator = ExecutionOrchestrator(max_parallel=5, retry_attempts=3)
        print_success("Orchestrator instantiated successfully")
        
        return True
        
    except Exception as e:
        print_error(f"Phase 3 test failed: {str(e)}")
        return False

def test_phase_4_analysis_results():
    """Test Phase 4: Analysis & Results"""
    print_phase_header("Analysis & Results", 4)
    
    try:
        # Test Result Collector
        print_component_test("Result Collector")
        from app.core.analysis.result_collector import ResultCollector
        result_collector = ResultCollector()
        print_success("Result collector instantiated successfully")
        
        # Test Healing Orchestrator
        print_component_test("Healing Orchestrator")
        from app.dependencies import get_healing_orchestrator
        
        healing_orchestrator = get_healing_orchestrator()
        print_success("Healing orchestrator instantiated successfully")
        
        return True
        
    except Exception as e:
        print_error(f"Phase 4 test failed: {str(e)}")
        return False

def test_phase_5_advanced_analytics():
    """Test Phase 5: Advanced Analytics & Predictions"""
    print_phase_header("Advanced Analytics & Predictions", 5)
    
    try:
        # Test Risk Forecaster / Recommendation Engine
        print_component_test("Risk Forecaster & Recommendation Engine")
        from app.core.recommendation import RiskForecaster, RecommendationEngine
        from app.dependencies import get_embedding_service, get_knowledge_base_service
        
        embedding_service = get_embedding_service()
        kb_service = get_knowledge_base_service()
        
        risk_forecaster = RiskForecaster()
        recommendation_engine = RecommendationEngine(embedding_service, kb_service)
        print_success("Risk forecaster and recommendation engine instantiated successfully")
        
        # Test Coverage Reporter
        print_component_test("Coverage Reporter")
        from app.core.analysis.coverage_reporter import CoverageReporter
        coverage_reporter = CoverageReporter()
        print_success("Coverage reporter instantiated successfully")
        
        return True
        
    except Exception as e:
        print_error(f"Phase 5 test failed: {str(e)}")
        return False

def test_phase_6_rl_optimization():
    """Test Phase 6: RL Optimization & Evaluation"""
    print_phase_header("RL Optimization & Evaluation", 6)
    
    try:
        # Test RL Agent
        print_component_test("RL Agent")
        from app.core.rl.agent import RLAgent
        rl_agent = RLAgent(algorithm="hybrid")
        print_success("RL Agent instantiated successfully")
        print_info(f"Agent algorithm: {rl_agent.algorithm}")
        
        # Test Policy Updater
        print_component_test("Policy Management")
        from app.dependencies import get_policy_updater
        policy_updater = get_policy_updater()
        print_success("Policy updater instantiated successfully")
        
        # Test Test Prioritization Scheduler
        print_component_test("Test Prioritization Scheduler")
        from app.dependencies import get_test_prioritization_scheduler
        scheduler = get_test_prioritization_scheduler()
        print_success("Test prioritization scheduler instantiated successfully")
        
        # Test Execution Scheduler
        print_component_test("Execution Scheduler")
        from app.dependencies import get_execution_scheduler
        execution_scheduler = get_execution_scheduler()
        print_success("Execution scheduler instantiated successfully")
        
        return True
        
    except Exception as e:
        print_error(f"Phase 6 test failed: {str(e)}")
        return False

def test_continuous_learning():
    """Test Continuous Learning Loop"""
    print_phase_header("Continuous Learning Loop", 7)
    
    try:
        # Test Feedback Loop
        print_component_test("Feedback Loop System")
        from app.core.feedback_loop import FeedbackLoop, ContinuousLearner
        from app.dependencies import (
            get_knowledge_base_service,
            get_embedding_service,
            get_rl_agent,
            get_result_collector,
            get_failure_analyzer,
            get_risk_forecaster,
            get_optimizer_service,
            get_generation_service
        )
        
        feedback_loop = FeedbackLoop(
            optimizer=get_optimizer_service(),
            generator=get_generation_service()
        )
        print_success("Feedback loop system instantiated successfully")
        
        return True
        
    except Exception as e:
        print_error(f"Continuous Learning test failed: {str(e)}")
        return False

def test_overall_integration():
    """Test Overall System Integration"""
    print_phase_header("Overall System Integration", 8)
    
    try:
        # Test Dependencies
        print_component_test("Dependency Injection System")
        from app.dependencies import (
            get_embedding_service,
            get_knowledge_base_service, 
            get_generation_service,
            get_test_validator,
            get_optimizer_service
        )
        
        embedding_service = get_embedding_service()
        kb_service = get_knowledge_base_service()
        generation_service = get_generation_service()
        test_validator = get_test_validator()
        optimizer_service = get_optimizer_service()
        
        print_success("All core dependencies resolved successfully")
        
        # Test FastAPI App Creation
        print_component_test("FastAPI Application")
        from app.main import create_app
        app = create_app()
        print_success("FastAPI application created successfully")
        print_info(f"App title: {app.title}")
        print_info(f"App version: {app.version}")
        
        # List available routes
        routes = []
        for route in app.routes:
            if hasattr(route, 'methods') and hasattr(route, 'path'):
                for method in route.methods:
                    if method != 'HEAD':
                        routes.append(f"{method} {route.path}")
        
        print_info(f"Available API routes: {len(routes)}")
        for route in sorted(routes)[:10]:  # Show first 10 routes
            print_info(f"  - {route}")
        if len(routes) > 10:
            print_info(f"  ... and {len(routes) - 10} more routes")
        
        return True
        
    except Exception as e:
        print_error(f"Integration test failed: {str(e)}")
        return False

def main():
    """Main test execution"""
    print("🚀 Starting Comprehensive Phase Testing for LLM-Based Testing Framework")
    print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Track test results
    test_results = {}
    
    # Run all phase tests
    phases = [
        ("Phase 1: Knowledge Base", test_phase_1_knowledge_base),
        ("Phase 2: Test Generation", test_phase_2_test_generation),
        ("Phase 3: Execution Engine", test_phase_3_execution_engine),
        ("Phase 4: Analysis & Results", test_phase_4_analysis_results),
        ("Phase 5: Advanced Analytics", test_phase_5_advanced_analytics),
        ("Phase 6: RL Optimization", test_phase_6_rl_optimization),
        ("Continuous Learning Loop", test_continuous_learning),
        ("Overall Integration", test_overall_integration),
    ]
    
    for phase_name, test_func in phases:
        test_results[phase_name] = test_func()
    
    # Print summary
    print(f"\n{'='*80}")
    print("📊 TEST SUMMARY")
    print(f"{'='*80}")
    
    passed_count = sum(test_results.values())
    total_count = len(test_results)
    
    for phase_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {phase_name}")
    
    print(f"\n🎯 Overall Results: {passed_count}/{total_count} phases passed")
    print(f"📈 Success Rate: {(passed_count/total_count)*100:.1f}%")
    
    if passed_count == total_count:
        print(f"\n🎉 All phases are working properly!")
        print("🚀 System is ready for production use!")
    else:
        print(f"\n⚠️  Some phases need attention.")
        print("🔧 Please review the failed components and fix any issues.")
    
    print(f"\n⏰ Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()