from __future__ import annotations

from collections import defaultdict
from typing import Any, Dict, List, Set
from pydantic import BaseModel

from app.core.executor.result_types import TestResult
from app.schemas.tests import TestCase, TestType


class CoverageMetrics(BaseModel):
    endpoint_coverage: float
    method_coverage: float
    parameter_coverage: float
    response_code_coverage: float
    security_coverage: float
    performance_metrics: Dict[str, float]
    covered_endpoints: Set[str]
    covered_methods: Set[str]
    covered_parameters: Set[str]
    covered_response_codes: Set[str]
    security_checks: Dict[str, bool]


class CoverageAggregator:
    def __init__(self):
        self.known_endpoints: Set[str] = set()
        self.known_methods: Set[str] = {"GET", "POST", "PUT", "DELETE", "PATCH"}
        self.known_parameters: Set[str] = set()
        self.known_response_codes: Set[str] = {"200", "201", "204", "400", "401", "403", "404", "500"}
        self.known_security_checks: Set[str] = {
            "authentication", "authorization", "input_validation",
            "sql_injection", "xss", "csrf"
        }

    def analyze_coverage(self, tests: List[TestCase], results: List[TestResult]) -> CoverageMetrics:
        """Analyze test execution results and compute coverage metrics."""
        
        # Initialize coverage tracking
        covered_endpoints: Set[str] = set()
        covered_methods: Set[str] = set()
        covered_parameters: Set[str] = set()
        covered_response_codes: Set[str] = set()
        security_checks: Dict[str, bool] = {check: False for check in self.known_security_checks}
        
        # Performance metrics
        response_times: List[float] = []
        
        # Map results by test_id for easy lookup
        results_map = {r.test_id: r for r in results}
        
        for test in tests:
            if test.endpoint:
                self.known_endpoints.add(test.endpoint)
                if test.test_id in results_map and results_map[test.test_id].success:
                    covered_endpoints.add(test.endpoint)
            
            if test.method:
                if test.test_id in results_map and results_map[test.test_id].success:
                    covered_methods.add(test.method.upper())
            
            # Track parameters
            if test.input_data:
                for param in test.input_data.keys():
                    self.known_parameters.add(param)
                    if test.test_id in results_map and results_map[test.test_id].success:
                        covered_parameters.add(param)
            
            # Track response codes
            result = results_map.get(test.test_id)
            if result and result.status_code:
                covered_response_codes.add(str(result.status_code))
            
            # Track security checks
            if test.type == TestType.security:
                desc = test.description.lower()
                for check in self.known_security_checks:
                    if check in desc and test.test_id in results_map:
                        security_checks[check] = security_checks[check] or results_map[test.test_id].success
            
            # Collect performance metrics
            if result and result.response_time is not None:
                response_times.append(result.response_time)
        
        # Calculate coverage percentages
        endpoint_coverage = len(covered_endpoints) / len(self.known_endpoints) if self.known_endpoints else 0
        method_coverage = len(covered_methods) / len(self.known_methods)
        parameter_coverage = len(covered_parameters) / len(self.known_parameters) if self.known_parameters else 0
        response_code_coverage = len(covered_response_codes) / len(self.known_response_codes)
        security_coverage = sum(1 for v in security_checks.values() if v) / len(security_checks)
        
        # Calculate performance metrics
        performance_metrics = self._calculate_performance_metrics(response_times)
        
        return CoverageMetrics(
            endpoint_coverage=endpoint_coverage,
            method_coverage=method_coverage,
            parameter_coverage=parameter_coverage,
            response_code_coverage=response_code_coverage,
            security_coverage=security_coverage,
            performance_metrics=performance_metrics,
            covered_endpoints=covered_endpoints,
            covered_methods=covered_methods,
            covered_parameters=covered_parameters,
            covered_response_codes=covered_response_codes,
            security_checks=security_checks
        )
    
    def _calculate_performance_metrics(self, response_times: List[float]) -> Dict[str, float]:
        """Calculate performance metrics from response times."""
        if not response_times:
            return {
                "min_response_time": 0,
                "max_response_time": 0,
                "avg_response_time": 0,
                "p95_response_time": 0,
                "p99_response_time": 0
            }
        
        response_times.sort()
        n = len(response_times)
        
        return {
            "min_response_time": response_times[0],
            "max_response_time": response_times[-1],
            "avg_response_time": sum(response_times) / n,
            "p95_response_time": response_times[int(n * 0.95)],
            "p99_response_time": response_times[int(n * 0.99)]
        }