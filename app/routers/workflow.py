"""
Comprehensive Workflow Router
Exposes the complete MERN AI Testing Platform workflow endpoints
"""

from fastapi import APIRouter, Depends, Form, HTTPException
from typing import Dict, List, Any, Optional
from pathlib import Path

from app.core.workflow_orchestrator import (
    WorkflowOrchestrator, 
    WorkflowResult
)
from app.dependencies import (
    get_ingestion_service,
    get_generation_service,
    get_retrieval_service,
    get_optimizer_service,
    get_test_validator
)
from app.core.workflow_orchestrator import WorkflowConfig
from app.services.ingestion import IngestionService
from app.services.generation import GenerationService
from app.services.retrieval import RetrievalService
from app.services.optimizer import OptimizerService
from app.services.test_validator import TestValidator
from app.core.execution_engine import ExecutionEngine
from app.core.feedback_loop import FeedbackLoop
from app.core.policy_manager import PolicyManager
from app.services.rag_orchestrator import RAGOrchestrator


router = APIRouter()

# Simple test endpoint to verify router is working
@router.get("/test")
async def test_endpoint() -> Dict[str, str]:
    """Simple test endpoint to verify router functionality."""
    return {"status": "ok", "message": "Workflow router is working"}

# Debug endpoint to test form handling
@router.post("/debug-form")
async def debug_form_endpoint(
    mern_app_path: str = Form(..., description="Path to the MERN application root directory")
) -> Dict[str, Any]:
    """Debug endpoint to test form handling."""
    return {"received_path": mern_app_path, "path_exists": str(Path(mern_app_path).exists())}

# Global orchestrator instances (in production, use dependency injection)
_orchestrator_instance: Optional[WorkflowOrchestrator] = None
_rag_orchestrator_instance: Optional[RAGOrchestrator] = None


def get_workflow_orchestrator(
    ingestion_service: IngestionService = Depends(get_ingestion_service),
    generation_service: GenerationService = Depends(get_generation_service),
    retrieval_service: RetrievalService = Depends(get_retrieval_service),
    optimizer_service: OptimizerService = Depends(get_optimizer_service),
    test_validator: TestValidator = Depends(get_test_validator)
) -> WorkflowOrchestrator:
    """Get or create workflow orchestrator instance."""
    global _orchestrator_instance
    
    if _orchestrator_instance is None:
        # Create mock instances for components that might not exist yet
        execution_engine = MockExecutionEngine()
        feedback_loop = MockFeedbackLoop()
        policy_manager = MockPolicyManager()
        
        _orchestrator_instance = WorkflowOrchestrator(
            ingestion_service=ingestion_service,
            generation_service=generation_service,
            retrieval_service=retrieval_service,
            optimizer_service=optimizer_service,
            test_validator=test_validator,
            execution_engine=execution_engine,
            feedback_loop=feedback_loop,
            policy_manager=policy_manager
        )
    
    return _orchestrator_instance


def get_rag_orchestrator() -> RAGOrchestrator:
    """Get or create RAG orchestrator instance."""
    global _rag_orchestrator_instance
    
    if _rag_orchestrator_instance is None:
        _rag_orchestrator_instance = RAGOrchestrator()
    
    return _rag_orchestrator_instance


# Mock classes for components that might not exist yet
class MockExecutionEngine:
    """Mock execution engine for testing workflow."""
    
    async def execute_tests(self, tests: List, base_url: str, timeout: int = 300) -> Dict[str, Any]:
        """Mock test execution."""
        import random
        results = []
        
        for i, test in enumerate(tests[:10]):  # Limit to 10 for demo
            # Simulate execution with random success/failure
            status = "success" if random.random() > 0.3 else "failure"
            results.append({
                "test_id": f"test_{i}",
                "endpoint": getattr(test, 'endpoint', '/unknown'),
                "method": getattr(test, 'method', 'GET'),
                "status": status,
                "response_time": random.uniform(100, 1000),
                "status_code": 200 if status == "success" else random.choice([400, 404, 500])
            })
        
        return {
            "total_tests": len(tests),
            "executed": len(results),
            "results": results,
            "summary": {
                "success_rate": sum(1 for r in results if r["status"] == "success") / max(1, len(results)),
                "avg_response_time": sum(r["response_time"] for r in results) / max(1, len(results))
            }
        }


class MockFeedbackLoop:
    """Mock feedback loop for testing workflow."""
    
    async def analyze_and_enhance(self, executed_tests: List, results: List, coverage: Dict) -> List:
        """Mock test enhancement."""
        # Return the same tests for now
        return executed_tests[:5]  # Simulate some enhancement


class MockPolicyManager:
    """Mock policy manager for testing workflow."""
    
    async def update_policy(self, execution_results: Dict, coverage_target: float) -> Dict[str, Any]:
        """Mock policy updates."""
        return {
            "policy_updates": 3,
            "learning_rate": 0.001,
            "reward_improvement": 12.5,
            "coverage_improvement": 8.2
        }


@router.post("/execute-complete")
async def execute_complete_workflow(
    mern_app_path: str = Form(..., description="Path to the MERN application root directory"),
    target_api_url: Optional[str] = Form(default=None, description="URL of the target API if running"),
    target_api_running: bool = Form(default=False, description="Whether the target API is currently running"),
    max_test_cases: int = Form(default=50, description="Maximum number of test cases to generate"),
    enable_self_healing: bool = Form(default=True, description="Enable self-healing mechanism"),
    enable_rl_optimization: bool = Form(default=True, description="Enable RL optimization"),
    test_execution_timeout: int = Form(default=300, description="Test execution timeout in seconds"),
    coverage_threshold: float = Form(default=0.8, description="Target coverage threshold"),
    generate_final_report: bool = Form(default=True, description="Generate comprehensive final report")
) -> Dict[str, Any]:
    """
    Execute the complete MERN AI Testing Platform workflow.
    
    This endpoint orchestrates all phases:
    1. MERN Application Analysis (Codebase Scanner + Extract Endpoints)
    2. Knowledge Base Ingestion
    3. Test Case Generation (LLM + RAG)
    4. Test Execution Engine
    5. Self-Healing Mechanism & RL Optimization
    6. Coverage & Results Analysis
    7. Final Report Generation
    """
    
    # Validate MERN app path
    if not Path(mern_app_path).exists():
        raise HTTPException(
            status_code=400, 
            detail=f"MERN application path does not exist: {mern_app_path}"
        )
    
    # Create orchestrator directly to avoid dependency injection issues
    try:
        orchestrator = get_workflow_orchestrator(
            ingestion_service=get_ingestion_service(),
            generation_service=get_generation_service(),
            retrieval_service=get_retrieval_service(),
            optimizer_service=get_optimizer_service(),
            test_validator=get_test_validator()
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize workflow orchestrator: {str(e)}"
        )
    
    # Create workflow configuration
    config = WorkflowConfig(
        mern_app_path=mern_app_path,
        target_api_url=target_api_url,
        target_api_running=target_api_running,
        max_test_cases=max_test_cases,
        enable_self_healing=enable_self_healing,
        enable_rl_optimization=enable_rl_optimization,
        test_execution_timeout=test_execution_timeout,
        coverage_threshold=coverage_threshold,
        generate_final_report=generate_final_report
    )
    
    # Execute the complete workflow
    result = await orchestrator.execute_complete_workflow(config)
    
    # Return comprehensive results
    return {
        "workflow_id": result.workflow_id,
        "status": "completed" if result.final_report else "partial",
        "execution_time": result.total_execution_time,
        "success_rate": result.success_rate,
        "executive_summary": {
            "endpoints_discovered": len(result.endpoints_discovered),
            "components_discovered": len(result.components_discovered),
            "tests_generated": len(result.generated_tests),
            "coverage_achieved": result.coverage_analysis.get("overall_coverage", 0.0),
            "recommendations_count": len(result.recommendations)
        },
        "detailed_results": {
            "scan_results": result.scan_results,
            "ingestion_results": result.ingestion_results,
            "generation_metadata": result.generation_metadata,
            "execution_results": result.execution_results,
            "healing_actions": result.healing_actions,
            "optimization_metrics": result.optimization_metrics,
            "coverage_analysis": result.coverage_analysis,
            "final_report": result.final_report,
            "recommendations": result.recommendations
        }
    }


@router.get("/workflow/{workflow_id}/status")
async def get_workflow_status(
    workflow_id: str,
    orchestrator: WorkflowOrchestrator = Depends(get_workflow_orchestrator)
) -> Dict[str, Any]:
    """Get the current status of a workflow execution."""
    status = orchestrator.get_workflow_status(workflow_id)
    
    if not status:
        raise HTTPException(
            status_code=404,
            detail=f"Workflow {workflow_id} not found"
        )
    
    return status


@router.get("/workflow/{workflow_id}/report")
async def get_workflow_report(
    workflow_id: str,
    orchestrator: WorkflowOrchestrator = Depends(get_workflow_orchestrator)
) -> Dict[str, Any]:
    """Get the final report for a completed workflow."""
    workflow = orchestrator.active_workflows.get(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=404,
            detail=f"Workflow {workflow_id} not found"
        )
    
    if not workflow.final_report:
        raise HTTPException(
            status_code=400,
            detail=f"Workflow {workflow_id} has not completed yet"
        )
    
    return workflow.final_report


@router.post("/mern-scan-only")
async def scan_mern_application_only(
    mern_app_path: str = Form(..., description="Path to the MERN application root directory"),
    target_api_url: Optional[str] = Form(default=None, description="URL of the target API if running"),
    target_api_running: bool = Form(default=False, description="Whether the target API is currently running")
) -> Dict[str, Any]:
    """
    Perform only the MERN application scanning phase.
    Useful for quick analysis without full test generation and execution.
    """
    
    # Validate MERN app path
    if not Path(mern_app_path).exists():
        raise HTTPException(
            status_code=400, 
            detail=f"MERN application path does not exist: {mern_app_path}"
        )
    
    # Create orchestrator directly to avoid dependency injection issues
    try:
        orchestrator = get_workflow_orchestrator(
            ingestion_service=get_ingestion_service(),
            generation_service=get_generation_service(),
            retrieval_service=get_retrieval_service(),
            optimizer_service=get_optimizer_service(),
            test_validator=get_test_validator()
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize workflow orchestrator: {str(e)}"
        )
    
    # Create minimal config for scanning only
    config = WorkflowConfig(
        mern_app_path=mern_app_path,
        target_api_url=target_api_url,
        target_api_running=target_api_running,
        max_test_cases=0,  # No test generation
        enable_self_healing=False,
        enable_rl_optimization=False,
        generate_final_report=False
    )
    
    # Execute only Phase 1
    scan_results = await orchestrator._phase1_mern_analysis(config)
    
    return {
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


@router.post("/generate-tests-only")
async def generate_tests_only(
    endpoint: str = Form(..., description="Endpoint path to generate tests for"),
    method: str = Form(..., description="HTTP method (GET, POST, PUT, DELETE, etc.)"),
    parameters: str = Form(default="", description="Comma-separated list of parameters"),
    max_tests: int = Form(default=10, description="Maximum number of tests to generate"),
    orchestrator: WorkflowOrchestrator = Depends(get_workflow_orchestrator)
) -> Dict[str, Any]:
    """
    Generate test cases for a specific endpoint without full workflow execution.
    Useful for focused test generation.
    """
    
    # Parse parameters
    param_list = [p.strip() for p in parameters.split(",") if p.strip()] if parameters else []
    
    # Create mock MERN endpoint
    from app.services.mern_scanner import MERNEndpoint
    mock_endpoint = MERNEndpoint(
        path=endpoint,
        method=method.upper(),
        function_name="test_function",
        file_path="mock_file.js",
        line_number=1,
        framework="Express.js",
        middleware=[],
        authentication=None,
        validation_schema=None,
        response_schema=None,
        database_models=[],
        parameters=[{"name": p, "type": "string", "required": False} for p in param_list],
        headers=[],
        dependencies=[],
        docstring=None,
        comments=[],
        security_annotations=[]
    )
    
    # Create minimal config
    config = WorkflowConfig(
        mern_app_path="/mock",  # Not used for this operation
        max_test_cases=max_tests
    )
    
    # Execute test generation only
    generation_results = await orchestrator._phase3_test_generation([mock_endpoint], config)
    
    return {
        "message": f"Test generation completed for {method} {endpoint}",
        "tests_generated": len(generation_results["tests"]),
        "tests": [
            {
                "endpoint": test.endpoint if hasattr(test, 'endpoint') else endpoint,
                "method": test.method if hasattr(test, 'method') else method,
                "test_data": test.test_data if hasattr(test, 'test_data') else {},
                "expected_response": test.expected_response if hasattr(test, 'expected_response') else {}
            }
            for test in generation_results["tests"]
        ],
        "generation_metadata": generation_results["metadata"]
    }


@router.get("/active-workflows")
async def list_active_workflows(
    orchestrator: WorkflowOrchestrator = Depends(get_workflow_orchestrator)
) -> Dict[str, Any]:
    """List all active workflows and their current status."""
    
    workflows = []
    for workflow_id, workflow in orchestrator.active_workflows.items():
        status = orchestrator.get_workflow_status(workflow_id)
        if status:
            workflows.append(status)
    
    return {
        "total_workflows": len(workflows),
        "workflows": workflows
    }


@router.delete("/workflow/{workflow_id}")
async def cancel_workflow(
    workflow_id: str,
    orchestrator: WorkflowOrchestrator = Depends(get_workflow_orchestrator)
) -> Dict[str, Any]:
    """Cancel or remove a workflow from active workflows."""
    
    if workflow_id not in orchestrator.active_workflows:
        raise HTTPException(
            status_code=404,
            detail=f"Workflow {workflow_id} not found"
        )
    
    # Remove from active workflows
    del orchestrator.active_workflows[workflow_id]
    
    return {
        "message": f"Workflow {workflow_id} has been cancelled/removed",
        "workflow_id": workflow_id
    }


@router.get("/workflow-templates")
async def get_workflow_templates() -> Dict[str, Any]:
    """Get predefined workflow templates for different use cases."""
    
    templates = {
        "quick_scan": {
            "name": "Quick MERN Scan",
            "description": "Fast scan of MERN application without test execution",
            "config": {
                "max_test_cases": 0,
                "enable_self_healing": False,
                "enable_rl_optimization": False,
                "generate_final_report": False
            }
        },
        "comprehensive_testing": {
            "name": "Comprehensive Testing",
            "description": "Full workflow with test generation, execution, and optimization",
            "config": {
                "max_test_cases": 100,
                "enable_self_healing": True,
                "enable_rl_optimization": True,
                "test_execution_timeout": 600,
                "coverage_threshold": 0.85,
                "generate_final_report": True
            }
        },
        "security_focused": {
            "name": "Security-Focused Testing",
            "description": "Focused on security testing with enhanced validation",
            "config": {
                "max_test_cases": 50,
                "enable_self_healing": True,
                "enable_rl_optimization": False,
                "coverage_threshold": 0.9,
                "generate_final_report": True
            }
        },
        "performance_testing": {
            "name": "Performance Testing",
            "description": "Optimized for performance and load testing",
            "config": {
                "max_test_cases": 200,
                "enable_self_healing": False,
                "enable_rl_optimization": True,
                "test_execution_timeout": 900,
                "coverage_threshold": 0.75,
                "generate_final_report": True
            }
        }
    }
    
    return {
        "message": "Available workflow templates",
        "templates": templates
    }


# RAG-specific endpoints

@router.post("/rag/initialize")
async def initialize_rag_system(
    rag_orchestrator: RAGOrchestrator = Depends(get_rag_orchestrator)
) -> Dict[str, Any]:
    """Initialize the RAG system and return status."""
    result = await rag_orchestrator.initialize()
    return result


@router.post("/rag/ingest-mern-app")
async def ingest_mern_application_for_rag(
    mern_app_path: str = Form(..., description="Path to the MERN application root directory"),
    rag_orchestrator: RAGOrchestrator = Depends(get_rag_orchestrator)
) -> Dict[str, Any]:
    """Ingest a MERN application into the RAG system for knowledge base population."""
    if not Path(mern_app_path).exists():
        raise HTTPException(
            status_code=400,
            detail=f"MERN application path does not exist: {mern_app_path}"
        )
    
    result = await rag_orchestrator.ingest_mern_application(mern_app_path)
    return result


@router.post("/rag/query")
async def query_rag_system(
    query: str = Form(..., description="Question or query for the RAG system"),
    max_results: int = Form(default=5, description="Maximum number of results to return"),
    include_ranking_details: bool = Form(default=False, description="Include detailed ranking information"),
    rag_orchestrator: RAGOrchestrator = Depends(get_rag_orchestrator)
) -> Dict[str, Any]:
    """Query the RAG system with a question and get an AI-generated answer."""
    result = await rag_orchestrator.query_rag_system(
        query=query,
        max_results=max_results,
        include_ranking_details=include_ranking_details
    )
    return result


@router.post("/rag/generate-tests")
async def generate_tests_with_rag(
    query: str = Form(..., description="Query or description for test generation"),
    endpoint: Optional[str] = Form(default=None, description="Specific endpoint to target"),
    method: Optional[str] = Form(default=None, description="HTTP method"),
    parameters: str = Form(default="", description="JSON string of parameters"),
    target_count: int = Form(default=8, description="Number of tests to generate"),
    rag_orchestrator: RAGOrchestrator = Depends(get_rag_orchestrator)
) -> Dict[str, Any]:
    """Generate test cases using RAG-enhanced generation."""
    # Parse parameters if provided
    param_dict = {}
    if parameters:
        try:
            import json
            param_dict = json.loads(parameters)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=400,
                detail="Invalid JSON format for parameters"
            )
    
    test_cases, rag_metadata = await rag_orchestrator.generate_tests_with_rag(
        query=query,
        endpoint=endpoint,
        method=method,
        parameters=param_dict,
        target_count=target_count
    )
    
    return {
        "message": "RAG-enhanced test generation completed",
        "tests_generated": len(test_cases),
        "rag_metadata": rag_metadata,
        "tests": [
            {
                "test_id": test.test_id,
                "type": test.type.value if hasattr(test.type, 'value') else str(test.type),
                "description": test.description,
                "endpoint": test.endpoint,
                "method": test.method,
                "input_data": test.input_data,
                "expected_output": test.expected_output,
                "tags": test.tags
            }
            for test in test_cases
        ]
    }


@router.get("/rag/search")
async def search_knowledge_base(
    query: str,
    source_type: Optional[str] = None,
    limit: int = 10,
    rag_orchestrator: RAGOrchestrator = Depends(get_rag_orchestrator)
) -> Dict[str, Any]:
    """Search the RAG knowledge base directly without LLM generation."""
    filters = {}
    if source_type:
        filters["source_type"] = source_type
    
    result = await rag_orchestrator.search_knowledge_base(
        query=query,
        filters=filters if filters else None,
        limit=limit
    )
    return result


@router.get("/rag/stats")
async def get_rag_statistics(
    rag_orchestrator: RAGOrchestrator = Depends(get_rag_orchestrator)
) -> Dict[str, Any]:
    """Get comprehensive RAG system statistics."""
    return await rag_orchestrator.get_rag_stats()


@router.post("/rag/ingest-test-results")
async def ingest_test_results_to_rag(
    test_results: str = Form(..., description="JSON string of test execution results"),
    rag_orchestrator: RAGOrchestrator = Depends(get_rag_orchestrator)
) -> Dict[str, Any]:
    """Ingest test execution results into the RAG system for learning."""
    try:
        import json
        results_dict = json.loads(test_results)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Invalid JSON format for test results"
        )
    
    result = await rag_orchestrator.ingest_test_results(results_dict)
    return result
