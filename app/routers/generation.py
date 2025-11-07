from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, Depends
from openai import OpenAI  # type: ignore

from app.schemas.tests import GenerateRequest, GenerateResponse, TestCase
from app.services.retrieval import RetrievalService
from app.services.generation import GenerationService
from app.services.optimizer import OptimizerService
from app.dependencies import (
    get_knowledge_base,
    get_embedding_model,
    get_retrieval_service,
    get_generation_service,
    get_optimizer_service,
    get_context_optimizer,
    get_test_validator
)


router = APIRouter()


def get_openai_client() -> OpenAI:
    return OpenAI()


@router.post("/tests", response_model=GenerateResponse)
async def generate_tests(
    req: GenerateRequest,
    retrieval: RetrievalService = Depends(get_retrieval_service),
    generator: GenerationService = Depends(get_generation_service),
    optimizer: OptimizerService = Depends(get_optimizer_service),
    validator: TestValidator = Depends(get_test_validator),
    openai_client: OpenAI = Depends(get_openai_client),
) -> GenerateResponse:
    """Generate comprehensive test cases using enhanced LLM + RAG integration."""
    
    # Phase 2: Enhanced RAG Context Retrieval & Optimization
    query = req.context_query or f"Generate tests for {req.method} {req.endpoint}"
    
    # Retrieve raw context documents
    result = retrieval.retrieve(query, k=req.top_k)
    context_docs: List[str] = []
    docs = result.get("documents") or []
    for column in docs:
        for doc in column:
            if isinstance(doc, str) and doc.strip():
                context_docs.append(doc)
    
    # Phase 2: Enhanced Test Generation with LLM Integration
    raw_tests: List[TestCase] = generator.generate(
        endpoint=req.endpoint,
        method=req.method,
        parameters=req.parameters,
        context_docs=context_docs,
        target_count=max(8, req.top_k)  # Generate more tests for better selection
    )
    
    # Phase 2: Comprehensive Test Validation & Enhancement
    validation_result = validator.validate_test_suite(raw_tests)
    validated_tests = validation_result["valid_tests"]
    
    # Phase 2: Advanced Optimization with Coverage & Quality Analysis
    if validated_tests:
        responses = ["200", "400", "401", "403", "404", "422", "500"]
        optimized_tests, coverage_info = optimizer.optimize(validated_tests, req.parameters, responses)
    else:
        # Fallback if validation fails
        optimized_tests = raw_tests
        coverage_info = {"warning": "Tests generated without validation"}
    
    # Prepare comprehensive response
    response_data = {
        "total": len(optimized_tests),
        "tests": optimized_tests,
        "metadata": {
            "generation_stats": {
                "raw_generated": len(raw_tests),
                "validated": len(validated_tests) if validated_tests else 0,
                "final_optimized": len(optimized_tests)
            },
            "validation_summary": validation_result.get("summary", {}),
            "coverage_analysis": validation_result.get("coverage_analysis", {}),
            "quality_analysis": validation_result.get("quality_analysis", {}),
            "recommendations": validation_result.get("recommendations", []),
            "context_used": len(context_docs),
            "optimizer_coverage": coverage_info
        }
    }
    
    return GenerateResponse(**response_data)


