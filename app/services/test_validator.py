from __future__ import annotations

import re
import json
from typing import Any, Dict, List, Optional, Tuple, Set
from dataclasses import dataclass
from enum import Enum

from app.schemas.tests import TestCase, TestType


class ValidationSeverity(str, Enum):
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


@dataclass
class ValidationIssue:
    """Represents a validation issue found in a test case."""
    severity: ValidationSeverity
    message: str
    field: Optional[str] = None
    suggestion: Optional[str] = None


@dataclass
class ValidationResult:
    """Result of test case validation."""
    is_valid: bool
    issues: List[ValidationIssue]
    enhanced_test: Optional[TestCase] = None
    quality_score: float = 0.0


class TestValidator:
    """Comprehensive test case validator with enhancement capabilities."""
    
    def __init__(self):
        # Quality scoring weights
        self.quality_weights = {
            "description_quality": 0.2,
            "input_completeness": 0.25,
            "output_specificity": 0.25,
            "test_type_alignment": 0.15,
            "executability": 0.15
        }
        
        # Security test patterns
        self.security_patterns = {
            "sql_injection": [
                "' OR '1'='1", "'; DROP TABLE", "UNION SELECT", 
                "1=1", "admin'--", "' UNION"
            ],
            "xss": [
                "<script>", "javascript:", "onerror=", 
                "alert(", "<img src=x", "onload="
            ],
            "auth_bypass": [
                "admin", "root", "guest", "bypass", 
                "null", "undefined", "Bearer fake"
            ],
            "injection": [
                "../", "..\\", "/etc/passwd", "cmd.exe",
                "system(", "exec("
            ]
        }
        
        # Performance test indicators
        self.performance_indicators = [
            "concurrent", "load", "stress", "throughput", 
            "latency", "response_time", "timeout", "bulk"
        ]
        
        # Required fields by test type
        self.type_requirements = {
            TestType.functional: {
                "input_fields": ["valid parameters", "business logic"],
                "output_fields": ["status_code", "response_data"]
            },
            TestType.security: {
                "input_fields": ["malicious payload", "auth token"],
                "output_fields": ["status_code", "security_error"]
            },
            TestType.performance: {
                "input_fields": ["load parameters", "concurrent users"],
                "output_fields": ["response_time", "throughput"]
            },
            TestType.edge: {
                "input_fields": ["boundary values", "invalid data"],
                "output_fields": ["error_handling", "status_code"]
            }
        }

    def validate_test(self, test: TestCase) -> ValidationResult:
        """Comprehensive validation of a single test case."""
        issues: List[ValidationIssue] = []
        
        # Basic validation
        issues.extend(self._validate_basic_structure(test))
        
        # Type-specific validation
        issues.extend(self._validate_test_type_alignment(test))
        
        # Content quality validation
        issues.extend(self._validate_content_quality(test))
        
        # Executability validation
        issues.extend(self._validate_executability(test))
        
        # Calculate quality score
        quality_score = self._calculate_quality_score(test, issues)
        
        # Determine if test is valid (no errors)
        has_errors = any(issue.severity == ValidationSeverity.ERROR for issue in issues)
        is_valid = not has_errors
        
        # Enhance test if valid
        enhanced_test = self._enhance_test(test, issues) if is_valid else None
        
        return ValidationResult(
            is_valid=is_valid,
            issues=issues,
            enhanced_test=enhanced_test,
            quality_score=quality_score
        )

    def validate_test_suite(self, tests: List[TestCase]) -> Dict[str, Any]:
        """Validate entire test suite and provide comprehensive analysis."""
        results = [self.validate_test(test) for test in tests]
        
        valid_tests = [r.enhanced_test for r in results if r.is_valid and r.enhanced_test]
        invalid_tests = [tests[i] for i, r in enumerate(results) if not r.is_valid]
        
        # Coverage analysis
        coverage_analysis = self._analyze_coverage(valid_tests)
        
        # Quality analysis
        quality_analysis = self._analyze_quality(results)
        
        # Diversity analysis
        diversity_analysis = self._analyze_diversity(valid_tests)
        
        return {
            "summary": {
                "total_tests": len(tests),
                "valid_tests": len(valid_tests),
                "invalid_tests": len(invalid_tests),
                "average_quality": sum(r.quality_score for r in results) / len(results) if results else 0.0
            },
            "valid_tests": valid_tests,
            "invalid_tests": invalid_tests,
            "validation_results": results,
            "coverage_analysis": coverage_analysis,
            "quality_analysis": quality_analysis,
            "diversity_analysis": diversity_analysis,
            "recommendations": self._generate_recommendations(results, coverage_analysis)
        }

    def _validate_basic_structure(self, test: TestCase) -> List[ValidationIssue]:
        """Validate basic test structure and required fields."""
        issues = []
        
        # Test ID validation
        if not test.test_id or not test.test_id.strip():
            issues.append(ValidationIssue(
                severity=ValidationSeverity.ERROR,
                message="Test ID is required and cannot be empty",
                field="test_id",
                suggestion="Provide a unique, descriptive test identifier"
            ))
        elif not re.match(r'^[a-zA-Z0-9_-]+$', test.test_id):
            issues.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                message="Test ID should only contain alphanumeric characters, underscores, and hyphens",
                field="test_id"
            ))
        
        # Description validation
        if not test.description or not test.description.strip():
            issues.append(ValidationIssue(
                severity=ValidationSeverity.ERROR,
                message="Test description is required",
                field="description",
                suggestion="Provide a clear, descriptive test name"
            ))
        elif len(test.description) < 10:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                message="Test description is too short to be meaningful",
                field="description",
                suggestion="Provide a more detailed description"
            ))
        
        # Endpoint validation
        if not test.endpoint:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.ERROR,
                message="Endpoint is required",
                field="endpoint"
            ))
        elif not test.endpoint.startswith('/'):
            issues.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                message="Endpoint should start with '/'",
                field="endpoint"
            ))
        
        # Method validation
        valid_methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]
        if not test.method or test.method.upper() not in valid_methods:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.ERROR,
                message=f"HTTP method must be one of: {', '.join(valid_methods)}",
                field="method"
            ))
        
        return issues

    def _validate_test_type_alignment(self, test: TestCase) -> List[ValidationIssue]:
        """Validate that test content aligns with its declared type."""
        issues = []
        
        if test.type == TestType.security:
            issues.extend(self._validate_security_test(test))
        elif test.type == TestType.performance:
            issues.extend(self._validate_performance_test(test))
        elif test.type == TestType.edge:
            issues.extend(self._validate_edge_test(test))
        elif test.type == TestType.functional:
            issues.extend(self._validate_functional_test(test))
        
        return issues

    def _validate_security_test(self, test: TestCase) -> List[ValidationIssue]:
        """Validate security-specific test requirements."""
        issues = []
        
        # Check for security patterns in input data
        has_security_pattern = False
        input_str = json.dumps(test.input_data, default=str).lower()
        description_lower = test.description.lower()
        
        for pattern_type, patterns in self.security_patterns.items():
            for pattern in patterns:
                if pattern.lower() in input_str or pattern.lower() in description_lower:
                    has_security_pattern = True
                    break
            if has_security_pattern:
                break
        
        security_keywords = ["auth", "security", "unauthorized", "forbidden", "injection", "xss", "bypass"]
        has_security_keyword = any(keyword in description_lower for keyword in security_keywords)
        
        if not has_security_pattern and not has_security_keyword:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                message="Security test should include security-related patterns or keywords",
                field="type",
                suggestion="Include malicious payloads, auth bypass attempts, or security validations"
            ))
        
        # Expected output should include security-related status codes
        if test.expected_output:
            status_code = test.expected_output.get("status_code")
            if status_code not in [401, 403, 422, 400, 429]:  # Common security-related codes
                issues.append(ValidationIssue(
                    severity=ValidationSeverity.INFO,
                    message="Security tests typically expect 401, 403, 400, 422, or 429 status codes",
                    field="expected_output"
                ))
        
        return issues

    def _validate_performance_test(self, test: TestCase) -> List[ValidationIssue]:
        """Validate performance-specific test requirements."""
        issues = []
        
        description_lower = test.description.lower()
        has_perf_indicator = any(indicator in description_lower for indicator in self.performance_indicators)
        
        if not has_perf_indicator:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                message="Performance test should include performance-related keywords",
                field="description",
                suggestion="Include terms like 'load', 'concurrent', 'response_time', 'throughput', etc."
            ))
        
        # Check for performance-related expected outputs
        if test.expected_output:
            perf_fields = ["response_time", "throughput", "latency", "concurrent_users"]
            has_perf_output = any(field in test.expected_output for field in perf_fields)
            
            if not has_perf_output:
                issues.append(ValidationIssue(
                    severity=ValidationSeverity.INFO,
                    message="Performance test should include performance metrics in expected output",
                    field="expected_output",
                    suggestion="Add response_time, throughput, or other performance metrics"
                ))
        
        return issues

    def _validate_edge_test(self, test: TestCase) -> List[ValidationIssue]:
        """Validate edge case test requirements."""
        issues = []
        
        edge_keywords = ["edge", "boundary", "limit", "null", "empty", "invalid", "malformed", "missing"]
        description_lower = test.description.lower()
        has_edge_keyword = any(keyword in description_lower for keyword in edge_keywords)
        
        if not has_edge_keyword:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                message="Edge test should include edge case keywords in description",
                field="description",
                suggestion="Include terms like 'boundary', 'null', 'empty', 'invalid', etc."
            ))
        
        # Edge tests should often expect error status codes
        if test.expected_output:
            status_code = test.expected_output.get("status_code")
            if status_code == 200:
                issues.append(ValidationIssue(
                    severity=ValidationSeverity.INFO,
                    message="Edge tests often expect error status codes (400, 404, 422, etc.)",
                    field="expected_output"
                ))
        
        return issues

    def _validate_functional_test(self, test: TestCase) -> List[ValidationIssue]:
        """Validate functional test requirements."""
        issues = []
        
        # Functional tests should have meaningful input data for non-GET requests
        if test.method and test.method.upper() in ["POST", "PUT", "PATCH"]:
            if not test.input_data or not test.input_data:
                issues.append(ValidationIssue(
                    severity=ValidationSeverity.WARNING,
                    message=f"Functional {test.method} test should include input data",
                    field="input_data"
                ))
        
        return issues

    def _validate_content_quality(self, test: TestCase) -> List[ValidationIssue]:
        """Validate content quality and completeness."""
        issues = []
        
        # Input data validation
        if test.input_data is not None:
            try:
                json.dumps(test.input_data)
            except (TypeError, ValueError):
                issues.append(ValidationIssue(
                    severity=ValidationSeverity.ERROR,
                    message="Input data is not JSON serializable",
                    field="input_data"
                ))
        
        # Expected output validation
        if test.expected_output is not None:
            try:
                json.dumps(test.expected_output)
            except (TypeError, ValueError):
                issues.append(ValidationIssue(
                    severity=ValidationSeverity.ERROR,
                    message="Expected output is not JSON serializable",
                    field="expected_output"
                ))
            
            # Check for status code
            if "status_code" not in test.expected_output:
                issues.append(ValidationIssue(
                    severity=ValidationSeverity.WARNING,
                    message="Expected output should include status_code",
                    field="expected_output",
                    suggestion="Add 'status_code' field with expected HTTP status"
                ))
        
        return issues

    def _validate_executability(self, test: TestCase) -> List[ValidationIssue]:
        """Validate that test is executable."""
        issues = []
        
        # Check if test has minimum required information for execution
        if not test.endpoint or not test.method:
            issues.append(ValidationIssue(
                severity=ValidationSeverity.ERROR,
                message="Test lacks basic execution requirements (endpoint, method)",
                field="executability"
            ))
        
        # Check for placeholder values that might indicate incomplete generation
        placeholders = ["placeholder", "example", "sample", "test_value", "TODO", "FIXME"]
        
        def check_placeholders(data: Any, field_name: str) -> None:
            if isinstance(data, dict):
                for key, value in data.items():
                    check_placeholders(value, f"{field_name}.{key}")
            elif isinstance(data, list):
                for i, item in enumerate(data):
                    check_placeholders(item, f"{field_name}[{i}]")
            elif isinstance(data, str):
                if any(placeholder in data.lower() for placeholder in placeholders):
                    issues.append(ValidationIssue(
                        severity=ValidationSeverity.WARNING,
                        message=f"Field contains placeholder value: {data}",
                        field=field_name,
                        suggestion="Replace placeholder with realistic test data"
                    ))
        
        check_placeholders(test.input_data, "input_data")
        check_placeholders(test.expected_output, "expected_output")
        
        return issues

    def _calculate_quality_score(self, test: TestCase, issues: List[ValidationIssue]) -> float:
        """Calculate overall quality score for the test."""
        base_score = 1.0
        
        # Deduct points for issues
        for issue in issues:
            if issue.severity == ValidationSeverity.ERROR:
                base_score -= 0.3
            elif issue.severity == ValidationSeverity.WARNING:
                base_score -= 0.1
            else:  # INFO
                base_score -= 0.05
        
        # Quality factors
        description_quality = min(1.0, len(test.description) / 50.0) if test.description else 0.0
        
        input_completeness = 0.5
        if test.input_data:
            input_completeness = min(1.0, len(test.input_data) / 3.0)
        
        output_specificity = 0.5
        if test.expected_output:
            output_specificity = min(1.0, len(test.expected_output) / 2.0)
        
        # Test type alignment (basic check)
        type_alignment = 0.8  # Default, would be enhanced based on deeper analysis
        
        executability = 1.0 if test.endpoint and test.method else 0.0
        
        # Weighted score
        quality_score = (
            description_quality * self.quality_weights["description_quality"] +
            input_completeness * self.quality_weights["input_completeness"] +
            output_specificity * self.quality_weights["output_specificity"] +
            type_alignment * self.quality_weights["test_type_alignment"] +
            executability * self.quality_weights["executability"]
        )
        
        return max(0.0, min(1.0, base_score * quality_score))

    def _enhance_test(self, test: TestCase, issues: List[ValidationIssue]) -> TestCase:
        """Enhance test based on validation issues and best practices."""
        enhanced = TestCase(
            test_id=test.test_id,
            type=test.type,
            description=test.description,
            input_data=test.input_data.copy() if test.input_data else {},
            expected_output=test.expected_output.copy() if test.expected_output else {},
            endpoint=test.endpoint,
            method=test.method,
            tags=test.tags.copy() if test.tags else []
        )
        
        # Add missing status code if not present
        if "status_code" not in enhanced.expected_output:
            default_status = 200
            if enhanced.type == TestType.security:
                default_status = 401
            elif enhanced.type == TestType.edge:
                default_status = 400
            enhanced.expected_output["status_code"] = default_status
        
        # Add type-specific tags
        if enhanced.type.value not in enhanced.tags:
            enhanced.tags.append(enhanced.type.value)
        
        if enhanced.method and enhanced.method.lower() not in enhanced.tags:
            enhanced.tags.append(enhanced.method.lower())
        
        # Add execution metadata
        enhanced.tags.append("validated")
        
        return enhanced

    def _analyze_coverage(self, tests: List[TestCase]) -> Dict[str, Any]:
        """Analyze test coverage across different dimensions."""
        if not tests:
            return {"error": "No valid tests to analyze"}
        
        # Type coverage
        type_counts = {}
        for test_type in TestType:
            type_counts[test_type.value] = sum(1 for test in tests if test.type == test_type)
        
        # Method coverage
        method_counts = {}
        for test in tests:
            if test.method:
                method = test.method.upper()
                method_counts[method] = method_counts.get(method, 0) + 1
        
        # Endpoint coverage
        endpoint_counts = {}
        for test in tests:
            if test.endpoint:
                endpoint_counts[test.endpoint] = endpoint_counts.get(test.endpoint, 0) + 1
        
        return {
            "type_coverage": type_counts,
            "method_coverage": method_counts,
            "endpoint_coverage": endpoint_counts,
            "total_tests": len(tests)
        }

    def _analyze_quality(self, results: List[ValidationResult]) -> Dict[str, Any]:
        """Analyze quality metrics across all validation results."""
        if not results:
            return {"error": "No results to analyze"}
        
        quality_scores = [r.quality_score for r in results]
        
        return {
            "average_quality": sum(quality_scores) / len(quality_scores),
            "min_quality": min(quality_scores),
            "max_quality": max(quality_scores),
            "quality_distribution": {
                "excellent": sum(1 for score in quality_scores if score >= 0.9),
                "good": sum(1 for score in quality_scores if 0.7 <= score < 0.9),
                "fair": sum(1 for score in quality_scores if 0.5 <= score < 0.7),
                "poor": sum(1 for score in quality_scores if score < 0.5)
            }
        }

    def _analyze_diversity(self, tests: List[TestCase]) -> Dict[str, Any]:
        """Analyze diversity of test cases."""
        if not tests:
            return {"error": "No tests to analyze"}
        
        # Description uniqueness
        descriptions = [test.description for test in tests if test.description]
        unique_descriptions = len(set(descriptions))
        
        # Input data diversity
        input_patterns = set()
        for test in tests:
            if test.input_data:
                # Create a pattern from input keys
                pattern = tuple(sorted(test.input_data.keys()))
                input_patterns.add(pattern)
        
        return {
            "description_uniqueness": unique_descriptions / len(descriptions) if descriptions else 0.0,
            "unique_input_patterns": len(input_patterns),
            "diversity_score": (unique_descriptions / len(tests) + len(input_patterns) / len(tests)) / 2
        }

    def _generate_recommendations(
        self, 
        results: List[ValidationResult], 
        coverage_analysis: Dict[str, Any]
    ) -> List[str]:
        """Generate recommendations based on validation results."""
        recommendations = []
        
        # Quality-based recommendations
        avg_quality = sum(r.quality_score for r in results) / len(results) if results else 0
        if avg_quality < 0.7:
            recommendations.append("Consider improving test quality by adding more detailed descriptions and expected outputs")
        
        # Coverage-based recommendations
        type_coverage = coverage_analysis.get("type_coverage", {})
        
        if type_coverage.get("security", 0) == 0:
            recommendations.append("Add security tests to improve coverage")
        
        if type_coverage.get("performance", 0) == 0:
            recommendations.append("Add performance tests to improve coverage")
        
        if type_coverage.get("edge", 0) == 0:
            recommendations.append("Add edge case tests to improve robustness")
        
        # Issue-based recommendations
        common_issues = {}
        for result in results:
            for issue in result.issues:
                common_issues[issue.message] = common_issues.get(issue.message, 0) + 1
        
        for issue, count in common_issues.items():
            if count > len(results) * 0.5:  # If more than 50% of tests have this issue
                recommendations.append(f"Common issue affecting {count} tests: {issue}")
        
        return recommendations