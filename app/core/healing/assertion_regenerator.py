from __future__ import annotations

import json
from typing import Dict, List, Optional, Any
from datetime import datetime

from app.schemas.tests import TestCase, TestType
from app.core.executor.result_types import TestResult
from app.services.embeddings import EmbeddingModel
from app.services.knowledge_base import KnowledgeBase
from app.services.generation import GenerationService


class AssertionTemplate:
    def __init__(self, template_type: str, validations: List[Dict[str, Any]]):
        self.template_type = template_type
        self.validations = validations


class AssertionRegenerator:
    def __init__(
        self,
        kb: KnowledgeBase,
        embed: EmbeddingModel,
        generation_service: GenerationService,
        min_confidence: float = 0.8
    ):
        self.kb = kb
        self.embed = embed
        self.generation_service = generation_service
        self.min_confidence = min_confidence
        self.templates = self._load_assertion_templates()

    def _load_assertion_templates(self) -> Dict[str, AssertionTemplate]:
        """Load predefined assertion templates."""
        templates = {
            "status": AssertionTemplate("status", [
                {"type": "equals", "field": "status_code", "expected": [200, 201, 204]},
            ]),
            "content_type": AssertionTemplate("content_type", [
                {"type": "contains", "field": "headers", "key": "content-type"},
            ]),
            "schema": AssertionTemplate("schema", [
                {"type": "schema", "field": "response", "schema": "{}"},
            ]),
            "security": AssertionTemplate("security", [
                {"type": "auth", "field": "headers", "required": True},
                {"type": "encryption", "field": "data", "required": True},
            ]),
            "performance": AssertionTemplate("performance", [
                {"type": "less_than", "field": "response_time", "max_ms": 1000},
            ])
        }
        return templates

    async def regenerate_assertions(
        self,
        test_case: TestCase,
        failed_result: TestResult,
        context: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Regenerate assertions for a failed test case."""
        # Extract API response patterns
        response_patterns = self._analyze_response(failed_result)
        
        # Get relevant context from KB
        kb_context = await self._get_kb_context(test_case)
        
        # Merge contexts
        full_context = {**context, **kb_context, "response_patterns": response_patterns}
        
        # Generate new assertions
        assertions = await self._generate_assertions(test_case, full_context)
        
        if not assertions:
            return None
            
        # Validate generated assertions
        if not self._validate_assertions(assertions, test_case):
            return None
            
        return assertions

    def _analyze_response(self, result: TestResult) -> Dict[str, Any]:
        """Analyze the test result to extract response patterns."""
        patterns = {
            "status_code": result.status_code,
            "headers": dict(result.headers) if result.headers else {},
            "content_type": result.headers.get("content-type", ""),
            "response_time": result.response_time,
            "response_structure": self._extract_response_structure(result.response_data),
        }
        return patterns

    def _extract_response_structure(self, response_data: Any) -> Dict[str, str]:
        """Extract the structure of the response data."""
        if not response_data:
            return {}
            
        def _get_type(value: Any) -> str:
            if isinstance(value, dict):
                return "object"
            elif isinstance(value, list):
                return "array"
            return type(value).__name__

        def _extract_structure(data: Any) -> Dict[str, str]:
            if isinstance(data, dict):
                return {k: _get_type(v) for k, v in data.items()}
            elif isinstance(data, list) and data:
                return {"items": _get_type(data[0])}
            return {"value": _get_type(data)}

        return _extract_structure(response_data)

    async def _get_kb_context(self, test_case: TestCase) -> Dict[str, Any]:
        """Get relevant context from knowledge base."""
        # Query for API specifications
        spec_query = f"{test_case.endpoint} {test_case.method} specification"
        spec_docs = await self.kb.search(
            self.embed.embed_query(spec_query),
            limit=3
        )
        
        # Query for similar test cases
        test_query = f"{test_case.endpoint} {test_case.method} test case"
        test_docs = await self.kb.search(
            self.embed.embed_query(test_query),
            limit=3
        )
        
        return {
            "api_specs": spec_docs,
            "similar_tests": test_docs
        }

    async def _generate_assertions(
        self,
        test_case: TestCase,
        context: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Generate new assertions using LLM."""
        # Prepare prompt for LLM
        prompt = self._prepare_generation_prompt(test_case, context)
        
        # Generate assertions using LLM
        response = await self.generation_service.generate(
            prompt,
            temperature=0.3,  # Lower temperature for more focused generation
            max_tokens=500
        )
        
        try:
            # Parse and validate generated assertions
            assertions = json.loads(response)
            return assertions if isinstance(assertions, dict) else None
        except json.JSONDecodeError:
            return None

    def _prepare_generation_prompt(
        self,
        test_case: TestCase,
        context: Dict[str, Any]
    ) -> str:
        """Prepare prompt for assertion generation."""
        template = f"""
Generate assertions for an API test case with the following details:

Endpoint: {test_case.endpoint}
Method: {test_case.method}
Test Type: {test_case.type}

API Specification:
{json.dumps(context.get('api_specs', []), indent=2)}

Response Patterns:
{json.dumps(context.get('response_patterns', {}), indent=2)}

Requirements:
1. Include status code validation
2. Include response structure validation
3. {"Include security checks" if test_case.type == TestType.security else ""}
4. {"Include performance thresholds" if test_case.type == TestType.performance else ""}

Generate assertions in JSON format that validate the API response according to the specification and patterns.
"""
        return template

    def _validate_assertions(
        self,
        assertions: Dict[str, Any],
        test_case: TestCase
    ) -> bool:
        """Validate generated assertions."""
        required_checks = {
            TestType.functional: ["status_code", "response"],
            TestType.security: ["status_code", "response", "security"],
            TestType.performance: ["status_code", "response", "performance"],
            TestType.load: ["status_code", "response", "performance"],
        }
        
        # Get required checks for test type
        checks = required_checks.get(test_case.type, ["status_code", "response"])
        
        # Validate that all required checks are present
        assertion_keys = set(assertions.keys())
        return all(check in assertion_keys for check in checks)

    def get_template(self, template_type: str) -> Optional[AssertionTemplate]:
        """Get assertion template by type."""
        return self.templates.get(template_type)