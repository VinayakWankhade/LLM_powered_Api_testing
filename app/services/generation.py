from __future__ import annotations

import json
import re
from typing import Any, Dict, List, Optional, Tuple

from openai import OpenAI  # type: ignore

from app.schemas.tests import TestCase, TestType
from app.services.context_optimizer import ContextOptimizer
from app.services.embeddings import EmbeddingService
from app.services.knowledge_base import KnowledgeBase
from app.services.reranker import RerankerService
from app.services.knowledge_base import KnowledgeBase
from app.services.reranker import RerankerService


# Enhanced prompts for different test types
BASE_PROMPT = """
You are an expert API test generator with deep knowledge of software testing methodologies.
Generate comprehensive, production-ready test cases for the given API endpoint.

Return ONLY a valid JSON array with test case objects. Each object must have:
- test_id: unique identifier (string)
- type: one of "functional", "security", "performance", "edge" (string)
- description: clear, descriptive test name (string)
- input_data: request data/parameters (object)
- expected_output: expected response structure (object)

Ensure all JSON is valid with proper quotes and no trailing commas.
"""

FUNCTIONAL_PROMPT = """
For FUNCTIONAL tests, focus on:
- Valid request scenarios with correct parameters
- Invalid parameter combinations and validation
- Required vs optional field testing
- Data type validation
- Business logic verification
"""

SECURITY_PROMPT = """
For SECURITY tests, focus on:
- Authentication bypass attempts
- Authorization boundary testing
- SQL injection in parameters
- XSS in request data
- CSRF protection verification
- Input sanitization testing
- Rate limiting validation
"""

PERFORMANCE_PROMPT = """
For PERFORMANCE tests, focus on:
- Response time measurement
- Concurrent request handling
- Large payload processing
- Resource consumption monitoring
- Timeout behavior
- Load capacity testing
"""

EDGE_PROMPT = """
For EDGE tests, focus on:
- Boundary value testing
- Null/empty input handling
- Malformed request data
- Unexpected data types
- Missing required fields
- Oversized inputs
- Character encoding issues
"""


class GenerationService:
    """Enhanced Generation service implementing RAG pattern from the diagram workflow."""
    
    def __init__(
        self, 
        openai_client: OpenAI = None, 
        embed: EmbeddingService = None,
        knowledge_base: KnowledgeBase = None,
        reranker: RerankerService = None
    ) -> None:
        self.client = openai_client
        self.embedding_service = embed
        self.knowledge_base = knowledge_base
        self.reranker = reranker or RerankerService()
        self.context_optimizer = ContextOptimizer(embed) if embed else None
        
        # Test type distribution for balanced generation
        self.type_distribution = {
            "functional": 0.4,  # 40% functional tests
            "security": 0.25,   # 25% security tests
            "performance": 0.2, # 20% performance tests
            "edge": 0.15        # 15% edge case tests
        }

    def build_enhanced_prompt(
        self, 
        endpoint: str, 
        method: str, 
        parameters: Dict[str, Any], 
        context_docs: List[str],
        test_type: Optional[str] = None,
        context_metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Build enhanced prompt with optimized context and type-specific guidance."""
        
        # Optimize context if optimizer is available
        if self.context_optimizer and context_docs:
            optimized_docs, metadata = self.context_optimizer.optimize_context(
                f"Generate {test_type or 'comprehensive'} tests",
                context_docs,
                endpoint,
                method
            )
            context_text = "\n\n--- CONTEXT DOCUMENT ---\n".join(optimized_docs)
            if context_metadata is None:
                context_metadata = metadata
        else:
            context_text = "\n\n--- CONTEXT DOCUMENT ---\n".join(context_docs)
        
        # Build parameter description
        param_descriptions = self._analyze_parameters(parameters)
        
        # Select appropriate prompt guidance
        type_guidance = ""
        if test_type:
            type_map = {
                "functional": FUNCTIONAL_PROMPT,
                "security": SECURITY_PROMPT, 
                "performance": PERFORMANCE_PROMPT,
                "edge": EDGE_PROMPT
            }
            type_guidance = type_map.get(test_type, "")
        else:
            type_guidance = f"{FUNCTIONAL_PROMPT}\n{SECURITY_PROMPT}\n{PERFORMANCE_PROMPT}\n{EDGE_PROMPT}"
        
        # Build comprehensive prompt
        template = f"""{BASE_PROMPT}

{type_guidance}

=== API SPECIFICATION ===
Endpoint: {method} {endpoint}
Parameters: {param_descriptions}

=== CONTEXT INFORMATION ===
{context_text}

=== GENERATION REQUIREMENTS ===
- Generate {8 if not test_type else 6} diverse test cases
- Include both positive and negative scenarios
- Use realistic data values
- Ensure each test has clear expected outcomes
- Focus on practical, executable test cases

Generate comprehensive test cases as a JSON array:
"""
        
        return template
    
    def _analyze_parameters(self, parameters: Dict[str, Any]) -> str:
        """Analyze and format parameters for better LLM understanding."""
        if not parameters:
            return "No parameters specified"
        
        analysis = []
        for param, config in parameters.items():
            if isinstance(config, dict):
                param_type = config.get('type', 'unknown')
                required = config.get('required', False)
                description = config.get('description', 'No description')
                example = config.get('example', 'N/A')
                
                analysis.append(
                    f"- {param} ({param_type}){'*' if required else ''}: {description} (example: {example})"
                )
            else:
                analysis.append(f"- {param}: {config}")
        
        return "\n".join(analysis)

    def generate(
        self, 
        endpoint: str, 
        method: str, 
        parameters: Dict[str, Any], 
        context_docs: List[str],
        target_types: Optional[List[str]] = None,
        target_count: int = 8
    ) -> List[TestCase]:
        """Generate comprehensive test cases with enhanced LLM integration."""
        
        if not self.client:
            return self._generate_fallback_tests(endpoint, method, parameters)
        
        all_tests: List[TestCase] = []
        
        # Generate by type for better coverage
        if target_types:
            types_to_generate = target_types
        else:
            types_to_generate = ["functional", "security", "performance", "edge"]
        
        for test_type in types_to_generate:
            type_tests = self._generate_type_specific_tests(
                endpoint, method, parameters, context_docs, test_type
            )
            all_tests.extend(type_tests)
        
        # Generate additional comprehensive tests if needed
        if len(all_tests) < target_count:
            additional_tests = self._generate_comprehensive_tests(
                endpoint, method, parameters, context_docs, target_count - len(all_tests)
            )
            all_tests.extend(additional_tests)
        
        # Validate and enhance generated tests
        validated_tests = self._validate_and_enhance_tests(all_tests, endpoint, method)
        
        return validated_tests[:target_count]  # Limit to target count
    
    async def generate_with_rag(
        self,
        query: str,
        endpoint: str = None,
        method: str = None,
        parameters: Dict[str, Any] = None,
        target_types: Optional[List[str]] = None,
        target_count: int = 8
    ) -> Tuple[List[TestCase], Dict[str, Any]]:
        """Generate test cases using RAG (Retrieval Augmented Generation) workflow.
        
        This follows the diagram workflow:
        1. Query -> Embedding Model -> Vector Embeddings
        2. Vector DB -> Top-k Retrieval
        3. Re-ranker Model -> Reranked Chunks
        4. LLM Generation with context -> Answer
        """
        if not self.knowledge_base or not self.embedding_service:
            # Fallback to standard generation
            return await self._generate_fallback_rag(query, endpoint, method, parameters, target_count)
        
        try:
            # Step 1: Query Processing and Embedding
            rag_context = await self._process_rag_query(
                query, endpoint, method, parameters
            )
            
            # Step 2: Context-aware test generation
            test_cases = await self._generate_with_context(
                rag_context, target_types, target_count
            )
            
            # Step 3: Return results with RAG metadata
            rag_metadata = {
                'rag_enabled': True,
                'retrieved_documents': len(rag_context.get('source_documents', [])),
                'context_length': rag_context.get('context_length', 0),
                'retrieval_query': rag_context.get('query', query),
                'knowledge_base_stats': await self.knowledge_base.get_stats()
            }
            
            return test_cases, rag_metadata
            
        except Exception as e:
            print(f"RAG generation error: {e}")
            # Fallback to standard generation
            return await self._generate_fallback_rag(query, endpoint, method, parameters, target_count)
    
    async def _process_rag_query(
        self,
        query: str,
        endpoint: str = None,
        method: str = None,
        parameters: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Process query through RAG pipeline: Embedding -> Retrieval -> Reranking."""
        
        # Build enriched query with context
        enriched_query = self._build_enriched_query(query, endpoint, method, parameters)
        
        # Step 1: Get initial retrieval results (top-k)
        initial_results = await self.knowledge_base.retrieve_top_k(
            enriched_query, k=10
        )
        
        # Step 2: Apply reranking for better relevance
        if self.reranker and initial_results:
            reranked_docs = await self.reranker.rerank_documents(
                enriched_query, initial_results, top_k=5
            )
            
            # Convert back to dict format for context building
            processed_docs = [
                {
                    'id': doc.id,
                    'text': doc.text,
                    'metadata': doc.metadata,
                    'distance': doc.original_score,
                    'rerank_score': doc.rerank_score,
                    'ranking_factors': doc.ranking_factors
                }
                for doc in reranked_docs
            ]
        else:
            processed_docs = initial_results[:5]
        
        # Step 3: Build optimized context
        context_data = await self.knowledge_base.get_context_for_query(
            enriched_query, max_context_length=4000
        )
        
        # Add reranking information to context
        context_data['reranked_documents'] = processed_docs
        context_data['original_query'] = query
        context_data['enriched_query'] = enriched_query
        
        return context_data
    
    def _build_enriched_query(
        self,
        query: str,
        endpoint: str = None,
        method: str = None,
        parameters: Dict[str, Any] = None
    ) -> str:
        """Build enriched query with additional context for better retrieval."""
        query_parts = [query]
        
        if endpoint:
            query_parts.append(f"endpoint: {endpoint}")
        
        if method:
            query_parts.append(f"method: {method}")
        
        if parameters:
            param_desc = ', '.join(parameters.keys())
            query_parts.append(f"parameters: {param_desc}")
        
        # Add domain-specific terms for better retrieval
        query_parts.append("API testing MERN application")
        
        return ' '.join(query_parts)
    
    async def _generate_with_context(
        self,
        rag_context: Dict[str, Any],
        target_types: Optional[List[str]] = None,
        target_count: int = 8
    ) -> List[TestCase]:
        """Generate test cases using retrieved context."""
        
        if not self.client:
            return self._generate_context_fallback_tests(rag_context, target_count)
        
        context_text = rag_context.get('context', '')
        source_docs = rag_context.get('source_documents', [])
        query = rag_context.get('original_query', '')
        
        # Build RAG-enhanced prompt
        rag_prompt = self._build_rag_prompt(
            query, context_text, source_docs, target_types, target_count
        )
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert API test generator using RAG. Use the provided context to generate relevant, comprehensive test cases."
                    },
                    {"role": "user", "content": rag_prompt}
                ],
                temperature=0.3,
                max_tokens=3000
            )
            
            raw_text = response.choices[0].message.content or "[]"
            test_data = self._extract_json_from_response(raw_text)
            
            # Parse and enhance tests with context metadata
            tests = self._parse_test_data(test_data, 
                                        endpoint=self._extract_endpoint_from_context(rag_context),
                                        method=self._extract_method_from_context(rag_context))
            
            # Add RAG metadata to tests
            for test in tests:
                if not hasattr(test, 'metadata'):
                    test.metadata = {}
                test.metadata.update({
                    'rag_generated': True,
                    'context_sources': len(source_docs),
                    'context_length': len(context_text)
                })
            
            return tests
            
        except Exception as e:
            print(f"Error in RAG generation: {e}")
            return self._generate_context_fallback_tests(rag_context, target_count)
    
    def _build_rag_prompt(
        self,
        query: str,
        context: str,
        source_docs: List[Dict[str, Any]],
        target_types: Optional[List[str]] = None,
        target_count: int = 8
    ) -> str:
        """Build RAG-enhanced prompt with retrieved context."""
        
        type_guidance = ""
        if target_types:
            type_map = {
                "functional": FUNCTIONAL_PROMPT,
                "security": SECURITY_PROMPT, 
                "performance": PERFORMANCE_PROMPT,
                "edge": EDGE_PROMPT
            }
            type_guidance = "\n".join([type_map.get(t, "") for t in target_types])
        else:
            type_guidance = f"{FUNCTIONAL_PROMPT}\n{SECURITY_PROMPT}\n{PERFORMANCE_PROMPT}\n{EDGE_PROMPT}"
        
        # Build source document references
        doc_refs = ""
        if source_docs:
            doc_refs = "\n=== RETRIEVED KNOWLEDGE ===\n"
            for i, doc in enumerate(source_docs[:3], 1):
                score_info = f" (score: {doc.get('rerank_score', doc.get('distance', 'N/A'))})"
                doc_refs += f"Document {i}{score_info}:\n{doc.get('text', '')[:500]}...\n\n"
        
        prompt = f"""{BASE_PROMPT}

{type_guidance}

=== USER QUERY ===
{query}

{doc_refs}
=== CONTEXT INFORMATION ===
{context}

=== GENERATION REQUIREMENTS ===
- Generate {target_count} comprehensive test cases
- Use the retrieved knowledge and context to inform test generation
- Ensure tests are relevant to the query and context
- Include both positive and negative scenarios
- Focus on practical, executable test cases
- Reference context information where relevant

Generate test cases as a JSON array:"""
        
        return prompt
    
    def _extract_endpoint_from_context(self, rag_context: Dict[str, Any]) -> str:
        """Extract endpoint information from RAG context."""
        # Look for endpoint in source documents
        for doc in rag_context.get('source_documents', []):
            metadata = doc.get('metadata', {})
            if 'endpoint' in metadata:
                return metadata['endpoint']
        
        # Fallback: try to parse from context text
        context_text = rag_context.get('context', '')
        endpoint_match = re.search(r'(?:GET|POST|PUT|DELETE|PATCH)\s+([/\w\-_{}]+)', context_text)
        if endpoint_match:
            return endpoint_match.group(1)
        
        return "/api/unknown"
    
    def _extract_method_from_context(self, rag_context: Dict[str, Any]) -> str:
        """Extract HTTP method from RAG context."""
        # Look for method in source documents
        for doc in rag_context.get('source_documents', []):
            metadata = doc.get('metadata', {})
            if 'method' in metadata:
                return metadata['method']
        
        # Fallback: try to parse from context text
        context_text = rag_context.get('context', '')
        method_match = re.search(r'\b(GET|POST|PUT|DELETE|PATCH)\b', context_text)
        if method_match:
            return method_match.group(1)
        
        return "GET"
    
    def _generate_context_fallback_tests(
        self, 
        rag_context: Dict[str, Any], 
        target_count: int
    ) -> List[TestCase]:
        """Generate fallback tests when LLM is unavailable but context is available."""
        endpoint = self._extract_endpoint_from_context(rag_context)
        method = self._extract_method_from_context(rag_context)
        
        # Create basic tests with context information
        tests = [
            TestCase(
                test_id="rag-fallback-1",
                type=TestType.functional,
                description=f"Context-informed {method} request to {endpoint}",
                input_data={"context_based": True},
                expected_output={"status_code": 200},
                endpoint=endpoint,
                method=method,
                tags=["functional", "rag-fallback", method.lower()]
            )
        ]
        
        return tests[:target_count]
    
    async def _generate_fallback_rag(
        self,
        query: str,
        endpoint: str = None,
        method: str = None,
        parameters: Dict[str, Any] = None,
        target_count: int = 8
    ) -> Tuple[List[TestCase], Dict[str, Any]]:
        """Fallback RAG generation when knowledge base is unavailable."""
        
        # Use standard generation as fallback
        tests = self.generate(
            endpoint or "/api/query",
            method or "GET",
            parameters or {},
            [query],  # Use query as context
            target_count=target_count
        )
        
        metadata = {
            'rag_enabled': False,
            'fallback_reason': 'Knowledge base or embedding service unavailable',
            'retrieved_documents': 0,
            'context_length': len(query)
        }
        
        return tests, metadata
    
    def _generate_type_specific_tests(
        self, 
        endpoint: str, 
        method: str, 
        parameters: Dict[str, Any], 
        context_docs: List[str],
        test_type: str
    ) -> List[TestCase]:
        """Generate tests focused on a specific type."""
        
        prompt = self.build_enhanced_prompt(
            endpoint, method, parameters, context_docs, test_type
        )
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert API test generator. Generate only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4 if test_type in ["security", "edge"] else 0.3,
                max_tokens=2000,
            )
            
            raw_text = response.choices[0].message.content or "[]"
            test_data = self._extract_json_from_response(raw_text)
            
            return self._parse_test_data(test_data, endpoint, method, test_type)
            
        except Exception as e:
            print(f"Error generating {test_type} tests: {e}")
            return []
    
    def _generate_comprehensive_tests(
        self, 
        endpoint: str, 
        method: str, 
        parameters: Dict[str, Any], 
        context_docs: List[str],
        count: int
    ) -> List[TestCase]:
        """Generate additional comprehensive tests."""
        
        prompt = self.build_enhanced_prompt(endpoint, method, parameters, context_docs)
        prompt += f"\n\nGenerate exactly {count} additional diverse test cases."
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert API test generator. Generate diverse, comprehensive test cases."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=2500,
            )
            
            raw_text = response.choices[0].message.content or "[]"
            test_data = self._extract_json_from_response(raw_text)
            
            return self._parse_test_data(test_data, endpoint, method)
            
        except Exception as e:
            print(f"Error generating comprehensive tests: {e}")
            return []
    
    def _extract_json_from_response(self, raw_text: str) -> List[Dict[str, Any]]:
        """Extract JSON from LLM response with multiple fallback strategies."""
        try:
            # Try direct parsing first
            return json.loads(raw_text)
        except json.JSONDecodeError:
            pass
        
        # Try to find JSON array in response
        json_match = re.search(r'\[.*\]', raw_text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        
        # Try to find and fix common JSON issues
        cleaned_text = self._clean_json_response(raw_text)
        try:
            return json.loads(cleaned_text)
        except json.JSONDecodeError:
            pass
        
        # Last resort: try to extract individual objects
        return self._extract_individual_json_objects(raw_text)
    
    def _clean_json_response(self, text: str) -> str:
        """Clean common JSON formatting issues."""
        # Remove trailing commas
        text = re.sub(r',\s*}', '}', text)
        text = re.sub(r',\s*]', ']', text)
        
        # Fix unquoted keys
        text = re.sub(r'(\w+)\s*:', r'"\1":', text)
        
        # Fix single quotes
        text = text.replace("'", '"')
        
        return text
    
    def _extract_individual_json_objects(self, text: str) -> List[Dict[str, Any]]:
        """Extract individual JSON objects from malformed array."""
        objects = []
        object_pattern = r'\{[^{}]*\}'
        
        for match in re.finditer(object_pattern, text, re.DOTALL):
            try:
                obj_text = match.group()
                obj_text = self._clean_json_response(obj_text)
                obj = json.loads(obj_text)
                objects.append(obj)
            except json.JSONDecodeError:
                continue
        
        return objects
    
    def _parse_test_data(
        self, 
        test_data: List[Dict[str, Any]], 
        endpoint: str, 
        method: str,
        preferred_type: Optional[str] = None
    ) -> List[TestCase]:
        """Parse raw test data into TestCase objects with validation."""
        
        tests: List[TestCase] = []
        
        for i, item in enumerate(test_data):
            try:
                # Extract and validate fields
                test_id = str(item.get("test_id", f"gen-{len(tests)}"))
                test_type = item.get("type", preferred_type or "functional")
                description = item.get("description", f"Test {test_id}")
                input_data = item.get("input_data", {})
                expected_output = item.get("expected_output", {})
                
                # Validate test type
                if test_type not in ["functional", "security", "performance", "edge"]:
                    test_type = preferred_type or "functional"
                
                # Ensure input_data and expected_output are dicts
                if not isinstance(input_data, dict):
                    input_data = {}
                if not isinstance(expected_output, dict):
                    expected_output = {"status_code": 200}
                
                # Create test case
                test = TestCase(
                    test_id=test_id,
                    type=TestType(test_type),
                    description=description,
                    input_data=input_data,
                    expected_output=expected_output,
                    endpoint=endpoint,
                    method=method,
                    tags=[test_type, method.lower()]
                )
                
                tests.append(test)
                
            except Exception as e:
                print(f"Error parsing test case {i}: {e}")
                continue
        
        return tests
    
    def _validate_and_enhance_tests(
        self, 
        tests: List[TestCase], 
        endpoint: str, 
        method: str
    ) -> List[TestCase]:
        """Validate and enhance generated test cases."""
        
        enhanced_tests: List[TestCase] = []
        
        for test in tests:
            # Validate basic fields
            if not test.description or not test.test_id:
                continue
            
            # Enhance expected output if minimal
            if not test.expected_output or test.expected_output == {}:
                test.expected_output = self._generate_default_expected_output(test.type, method)
            
            # Add default status code if missing
            if "status_code" not in test.expected_output:
                test.expected_output["status_code"] = self._get_default_status_code(test.type)
            
            # Ensure test has appropriate tags
            if not test.tags:
                test.tags = [test.type.value, method.lower()]
            
            enhanced_tests.append(test)
        
        return enhanced_tests
    
    def _generate_fallback_tests(self, endpoint: str, method: str, parameters: Dict[str, Any]) -> List[TestCase]:
        """Generate basic fallback tests when LLM is not available."""
        
        fallback_tests = [
            TestCase(
                test_id="fallback-functional-1",
                type=TestType.functional,
                description=f"Successful {method} request to {endpoint}",
                input_data=self._generate_sample_input(parameters),
                expected_output={"status_code": 200},
                endpoint=endpoint,
                method=method,
                tags=["functional", method.lower()]
            ),
            TestCase(
                test_id="fallback-edge-1",
                type=TestType.edge,
                description=f"Empty request to {endpoint}",
                input_data={},
                expected_output={"status_code": 400},
                endpoint=endpoint,
                method=method,
                tags=["edge", method.lower()]
            ),
        ]
        
        # Add security test for non-GET methods
        if method.upper() != "GET":
            fallback_tests.append(
                TestCase(
                    test_id="fallback-security-1",
                    type=TestType.security,
                    description=f"Unauthorized {method} request to {endpoint}",
                    input_data=self._generate_sample_input(parameters),
                    expected_output={"status_code": 401},
                    endpoint=endpoint,
                    method=method,
                    tags=["security", method.lower()]
                )
            )
        
        return fallback_tests
    
    def _generate_sample_input(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Generate sample input based on parameters."""
        sample_input = {}
        
        for param, config in parameters.items():
            if isinstance(config, dict):
                param_type = config.get('type', 'string')
                example = config.get('example')
                
                if example:
                    sample_input[param] = example
                elif param_type == 'integer':
                    sample_input[param] = 123
                elif param_type == 'boolean':
                    sample_input[param] = True
                else:
                    sample_input[param] = "test_value"
            else:
                sample_input[param] = config
        
        return sample_input
    
    def _generate_default_expected_output(self, test_type: TestType, method: str) -> Dict[str, Any]:
        """Generate default expected output based on test type and method."""
        base_output = {"status_code": self._get_default_status_code(test_type)}
        
        if test_type == TestType.security:
            base_output.update({
                "error_message": "Access denied or validation failed",
                "security_validated": True
            })
        elif test_type == TestType.performance:
            base_output.update({
                "response_time_ms": "< 1000",
                "performance_acceptable": True
            })
        elif method.upper() in ["POST", "PUT", "PATCH"]:
            base_output.update({
                "created": True,
                "id": "generated_id"
            })
        
        return base_output
    
    def _get_default_status_code(self, test_type: TestType) -> int:
        """Get default status code based on test type."""
        if test_type == TestType.security:
            return 401  # Unauthorized
        elif test_type == TestType.edge:
            return 400  # Bad Request
        else:
            return 200  # OK


