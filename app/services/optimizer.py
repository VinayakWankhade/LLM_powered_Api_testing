from __future__ import annotations

import json
from typing import Any, Dict, List, Tuple, Set, Optional
from dataclasses import dataclass
import math

import numpy as np  # type: ignore

from app.schemas.tests import TestCase, TestType
from app.services.embeddings import EmbeddingService


@dataclass
class TestRiskScore:
    """Risk scoring for test prioritization."""
    complexity_risk: float = 0.0
    security_risk: float = 0.0
    performance_risk: float = 0.0
    business_impact: float = 0.0
    coverage_value: float = 0.0
    
    @property
    def total_score(self) -> float:
        """Calculate weighted total risk score."""
        return (
            self.complexity_risk * 0.2 +
            self.security_risk * 0.3 +
            self.performance_risk * 0.2 +
            self.business_impact * 0.15 +
            self.coverage_value * 0.15
        )


class OptimizerService:
    """Advanced test optimization service with risk scoring and intelligent prioritization."""
    
    def __init__(self, embed: EmbeddingService) -> None:
        self.embed = embed
        
        # Risk assessment patterns
        self.security_patterns = {
            "high_risk": ["admin", "root", "password", "token", "auth", "login"],
            "sql_injection": ["union", "select", "drop", "insert", "'", "--"],
            "xss": ["script", "javascript", "alert", "onerror", "onload"],
            "path_traversal": ["../", "..\\", "/etc/", "C:\\"],
        }
        
        self.performance_indicators = {
            "load_testing": ["concurrent", "load", "stress", "bulk"],
            "timing": ["timeout", "latency", "response_time", "speed"],
            "resource": ["memory", "cpu", "bandwidth", "throughput"]
        }
        
        self.business_impact_keywords = {
            "high": ["payment", "transaction", "order", "user", "account", "profile"],
            "medium": ["search", "filter", "list", "view", "display"],
            "low": ["health", "status", "info", "metadata"]
        }

    def calculate_risk_score(self, test: TestCase) -> TestRiskScore:
        """Calculate comprehensive risk score for test prioritization."""
        score = TestRiskScore()
        
        # Analyze test content
        content = f"{test.description} {json.dumps(test.input_data, default=str)}".lower()
        
        # Security risk assessment
        score.security_risk = self._assess_security_risk(content, test.type)
        
        # Performance risk assessment
        score.performance_risk = self._assess_performance_risk(content, test.type)
        
        # Business impact assessment
        score.business_impact = self._assess_business_impact(content, test.endpoint or "")
        
        # Complexity assessment
        score.complexity_risk = self._assess_complexity(test)
        
        # Coverage value assessment
        score.coverage_value = self._assess_coverage_value(test)
        
        return score
    
    def _assess_security_risk(self, content: str, test_type: TestType) -> float:
        """Assess security risk level of test."""
        base_score = 0.1
        
        if test_type == TestType.security:
            base_score = 0.8
        
        # Check for security patterns
        for pattern_type, patterns in self.security_patterns.items():
            matches = sum(1 for pattern in patterns if pattern in content)
            if pattern_type == "high_risk":
                base_score += matches * 0.15
            else:
                base_score += matches * 0.1
        
        return min(1.0, base_score)
    
    def _assess_performance_risk(self, content: str, test_type: TestType) -> float:
        """Assess performance impact risk."""
        base_score = 0.1
        
        if test_type == TestType.performance:
            base_score = 0.7
        
        for indicator_type, indicators in self.performance_indicators.items():
            matches = sum(1 for indicator in indicators if indicator in content)
            base_score += matches * 0.1
        
        return min(1.0, base_score)
    
    def _assess_business_impact(self, content: str, endpoint: str) -> float:
        """Assess business impact of the test."""
        base_score = 0.3  # Default medium impact
        
        full_content = f"{content} {endpoint}".lower()
        
        for impact_level, keywords in self.business_impact_keywords.items():
            matches = sum(1 for keyword in keywords if keyword in full_content)
            if impact_level == "high" and matches > 0:
                base_score += 0.4
            elif impact_level == "medium" and matches > 0:
                base_score += 0.2
            elif impact_level == "low" and matches > 0:
                base_score -= 0.1
        
        return max(0.0, min(1.0, base_score))
    
    def _assess_complexity(self, test: TestCase) -> float:
        """Assess technical complexity of the test."""
        complexity = 0.3  # Base complexity
        
        # Input data complexity
        if test.input_data:
            complexity += min(0.3, len(test.input_data) * 0.05)
            
            # Nested structure complexity
            complexity += self._calculate_nesting_complexity(test.input_data) * 0.2
        
        # Expected output complexity
        if test.expected_output:
            complexity += min(0.2, len(test.expected_output) * 0.03)
        
        # Description complexity (longer descriptions often indicate complex scenarios)
        if test.description:
            desc_complexity = min(0.2, len(test.description.split()) * 0.01)
            complexity += desc_complexity
        
        return min(1.0, complexity)
    
    def _calculate_nesting_complexity(self, data: Any, depth: int = 0) -> float:
        """Calculate complexity based on data structure nesting."""
        if depth > 5:  # Prevent infinite recursion
            return 1.0
        
        complexity = 0.0
        
        if isinstance(data, dict):
            complexity = len(data) * 0.1
            for value in data.values():
                complexity += self._calculate_nesting_complexity(value, depth + 1) * 0.5
        elif isinstance(data, list):
            complexity = len(data) * 0.05
            for item in data:
                complexity += self._calculate_nesting_complexity(item, depth + 1) * 0.5
        
        return min(1.0, complexity)
    
    def _assess_coverage_value(self, test: TestCase) -> float:
        """Assess how much coverage value this test provides."""
        value = 0.5  # Base value
        
        # Type-specific value
        type_values = {
            TestType.security: 0.9,
            TestType.functional: 0.7,
            TestType.performance: 0.6,
            TestType.edge: 0.8
        }
        value = type_values.get(test.type, 0.5)
        
        # Method-specific adjustments
        if test.method:
            if test.method.upper() in ["POST", "PUT", "DELETE"]:
                value += 0.1  # State-changing operations are more valuable
        
        return min(1.0, value)
    
    def advanced_deduplicate(
        self, 
        tests: List[TestCase], 
        semantic_threshold: float = 0.85,
        functional_threshold: float = 0.95
    ) -> List[TestCase]:
        """Advanced deduplication with semantic and functional analysis."""
        if len(tests) <= 1:
            return tests
        
        # Create semantic embeddings
        semantic_corpus = [f"{t.description} {t.type.value}" for t in tests]
        semantic_vectors = np.array(self.embed.embed(semantic_corpus))
        
        # Create functional signatures
        functional_signatures = []
        for test in tests:
            signature = {
                "endpoint": test.endpoint,
                "method": test.method,
                "input_keys": tuple(sorted(test.input_data.keys())) if test.input_data else (),
                "expected_status": test.expected_output.get("status_code") if test.expected_output else None
            }
            functional_signatures.append(signature)
        
        keep_indices: List[int] = []
        
        for i, test in enumerate(tests):
            is_duplicate = False
            
            for kept_idx in keep_indices:
                # Check semantic similarity
                semantic_sim = self._cosine_similarity_single(
                    semantic_vectors[i], semantic_vectors[kept_idx]
                )
                
                # Check functional similarity
                functional_sim = self._functional_similarity(
                    functional_signatures[i], functional_signatures[kept_idx]
                )
                
                # Combined similarity check
                if (semantic_sim > semantic_threshold and 
                    functional_sim > functional_threshold):
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                keep_indices.append(i)
        
        return [tests[i] for i in keep_indices]
    
    def _functional_similarity(self, sig1: Dict[str, Any], sig2: Dict[str, Any]) -> float:
        """Calculate functional similarity between test signatures."""
        similarity = 0.0
        
        # Endpoint similarity
        if sig1["endpoint"] == sig2["endpoint"]:
            similarity += 0.3
        
        # Method similarity
        if sig1["method"] == sig2["method"]:
            similarity += 0.2
        
        # Input structure similarity
        keys1, keys2 = sig1["input_keys"], sig2["input_keys"]
        if keys1 and keys2:
            jaccard = len(set(keys1) & set(keys2)) / len(set(keys1) | set(keys2))
            similarity += jaccard * 0.3
        elif keys1 == keys2:  # Both empty
            similarity += 0.3
        
        # Expected status similarity
        if sig1["expected_status"] == sig2["expected_status"]:
            similarity += 0.2
        
        return similarity

    def enhanced_coverage_analysis(
        self, 
        tests: List[TestCase], 
        parameters: Dict[str, Any], 
        responses: List[str]
    ) -> Dict[str, Any]:
        """Enhanced coverage analysis with detailed metrics."""
        
        # Parameter coverage
        param_coverage = {}
        for param in parameters.keys():
            coverage_tests = []
            for test in tests:
                if test.input_data and param in test.input_data:
                    coverage_tests.append({
                        "test_id": test.test_id,
                        "type": test.type.value,
                        "value": test.input_data[param]
                    })
            param_coverage[param] = {
                "covered": len(coverage_tests) > 0,
                "test_count": len(coverage_tests),
                "covering_tests": coverage_tests
            }
        
        # Response code coverage
        response_coverage = {}
        for code in responses:
            covering_tests = []
            for test in tests:
                if (test.expected_output and 
                    str(test.expected_output.get("status_code")) == str(code)):
                    covering_tests.append({
                        "test_id": test.test_id,
                        "type": test.type.value
                    })
            response_coverage[code] = {
                "covered": len(covering_tests) > 0,
                "test_count": len(covering_tests),
                "covering_tests": covering_tests
            }
        
        # Test type distribution
        type_distribution = {}
        for test_type in TestType:
            count = sum(1 for test in tests if test.type == test_type)
            type_distribution[test_type.value] = {
                "count": count,
                "percentage": (count / len(tests)) * 100 if tests else 0
            }
        
        # Coverage gaps analysis
        uncovered_params = [p for p, info in param_coverage.items() if not info["covered"]]
        uncovered_responses = [r for r, info in response_coverage.items() if not info["covered"]]
        
        return {
            "parameter_coverage": param_coverage,
            "response_coverage": response_coverage,
            "type_distribution": type_distribution,
            "coverage_gaps": {
                "uncovered_parameters": uncovered_params,
                "uncovered_responses": uncovered_responses
            },
            "overall_metrics": {
                "total_tests": len(tests),
                "parameter_coverage_rate": len([p for p in param_coverage.values() if p["covered"]]) / len(parameters) if parameters else 1.0,
                "response_coverage_rate": len([r for r in response_coverage.values() if r["covered"]]) / len(responses) if responses else 1.0
            }
        }
    
    def intelligent_prioritize(self, tests: List[TestCase]) -> List[TestCase]:
        """Intelligent prioritization using risk scoring."""
        if not tests:
            return tests
        
        # Calculate risk scores for all tests
        test_scores = []
        for test in tests:
            risk_score = self.calculate_risk_score(test)
            test_scores.append((test, risk_score.total_score))
        
        # Sort by total risk score (highest first)
        test_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Return prioritized tests
        return [test for test, score in test_scores]
    
    def optimize(
        self, 
        tests: List[TestCase], 
        parameters: Dict[str, Any], 
        responses: List[str],
        max_tests: Optional[int] = None
    ) -> Tuple[List[TestCase], Dict[str, Any]]:
        """Comprehensive optimization with advanced algorithms."""
        
        if not tests:
            return [], {"error": "No tests provided"}
        
        optimization_log = []
        
        # Step 1: Advanced deduplication
        optimization_log.append(f"Initial tests: {len(tests)}")
        deduped = self.advanced_deduplicate(tests)
        optimization_log.append(f"After deduplication: {len(deduped)}")
        
        # Step 2: Enhanced coverage analysis
        coverage_info = self.enhanced_coverage_analysis(deduped, parameters, responses)
        
        # Step 3: Intelligent prioritization
        prioritized = self.intelligent_prioritize(deduped)
        optimization_log.append(f"Tests prioritized by risk score")
        
        # Step 4: Limit tests if specified
        if max_tests and len(prioritized) > max_tests:
            # Use coverage-aware selection for final subset
            final_tests = self._coverage_aware_selection(prioritized, max_tests, parameters, responses)
            optimization_log.append(f"Coverage-aware selection to {len(final_tests)} tests")
        else:
            final_tests = prioritized
        
        # Prepare comprehensive metadata
        metadata = {
            "optimization_log": optimization_log,
            "coverage_analysis": coverage_info,
            "risk_scores": [
                {
                    "test_id": test.test_id,
                    "risk_score": self.calculate_risk_score(test).total_score,
                    "type": test.type.value
                }
                for test in final_tests[:10]  # Top 10 for performance
            ],
            "optimization_metrics": {
                "deduplication_ratio": len(deduped) / len(tests),
                "final_selection_ratio": len(final_tests) / len(tests),
                "average_risk_score": sum(self.calculate_risk_score(test).total_score for test in final_tests) / len(final_tests)
            }
        }
        
        return final_tests, metadata
    
    def _coverage_aware_selection(
        self, 
        prioritized_tests: List[TestCase], 
        max_tests: int,
        parameters: Dict[str, Any],
        responses: List[str]
    ) -> List[TestCase]:
        """Select tests with coverage awareness."""
        
        selected = []
        covered_params = set()
        covered_responses = set()
        
        for test in prioritized_tests:
            if len(selected) >= max_tests:
                break
            
            # Calculate coverage contribution
            new_param_coverage = set()
            if test.input_data:
                new_param_coverage = set(test.input_data.keys()) - covered_params
            
            new_response_coverage = set()
            if test.expected_output and "status_code" in test.expected_output:
                status_code = str(test.expected_output["status_code"])
                if status_code in responses and status_code not in covered_responses:
                    new_response_coverage.add(status_code)
            
            # Always include if it adds significant coverage or is high priority
            coverage_value = len(new_param_coverage) + len(new_response_coverage)
            risk_score = self.calculate_risk_score(test).total_score
            
            if coverage_value > 0 or risk_score > 0.7 or len(selected) < max_tests // 2:
                selected.append(test)
                covered_params.update(new_param_coverage)
                covered_responses.update(new_response_coverage)
        
        return selected
    
    def _cosine_similarity_single(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors."""
        # Normalize vectors
        v1_norm = vec1 / (np.linalg.norm(vec1) + 1e-12)
        v2_norm = vec2 / (np.linalg.norm(vec2) + 1e-12)
        
        # Calculate cosine similarity
        return float(np.dot(v1_norm, v2_norm))

    def _cosine_similarity(self, vec: np.ndarray, others_idx: List[int] | np.ndarray, all_vectors: np.ndarray) -> np.ndarray:
        """Original cosine similarity method for backward compatibility."""
        # Convert to numpy array of int indices if needed
        if isinstance(others_idx, list):
            others_idx = np.array(others_idx, dtype=int)
        else:
            others_idx = others_idx.astype(int)
            
        others = all_vectors[others_idx]
        # normalize
        v = vec / (np.linalg.norm(vec) + 1e-12)
        o = others / (np.linalg.norm(others, axis=1, keepdims=True) + 1e-12)
        return o @ v


