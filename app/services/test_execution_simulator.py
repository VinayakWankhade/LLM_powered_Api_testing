"""
Test execution simulator that runs actual tests against APIs and collects real execution data.
This generates real-time metrics instead of mock data.
"""

import asyncio
import aiohttp
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import json

from app.schemas.tests import TestCase, TestType
from app.services.knowledge_base import KnowledgeBase

logger = logging.getLogger(__name__)


class TestExecutionSimulator:
    """Simulates real test execution to generate actual metrics and data"""
    
    def __init__(self, knowledge_base: KnowledgeBase, base_url: str = "http://localhost:8000"):
        self.kb = knowledge_base
        self.base_url = base_url
        self.execution_history = []
        self.results_db = []  # In-memory storage for test results
        
    async def run_continuous_testing(self, interval_seconds: int = 60):
        """Run continuous testing to generate real-time data"""
        logger.info("Starting continuous testing simulator...")
        
        while True:
            try:
                await self._execute_test_cycle()
                await asyncio.sleep(interval_seconds)
            except Exception as e:
                logger.error(f"Error in continuous testing: {e}")
                await asyncio.sleep(interval_seconds)
    
    async def _execute_test_cycle(self):
        """Execute one cycle of tests against available endpoints"""
        # Get endpoints from knowledge base
        endpoints = await self._get_available_endpoints()
        
        if not endpoints:
            logger.info("No endpoints available for testing")
            return
        
        logger.info(f"Running test cycle for {len(endpoints)} endpoints...")
        
        # Execute tests for each endpoint
        for endpoint_info in endpoints:
            try:
                await self._test_endpoint(endpoint_info)
            except Exception as e:
                logger.error(f"Error testing endpoint {endpoint_info.get('endpoint')}: {e}")
    
    async def _get_available_endpoints(self) -> List[Dict[str, Any]]:
        """Get available endpoints from knowledge base"""
        try:
            result = self.kb.collection.peek(limit=100)
            endpoints = []
            
            if result and result.get("metadatas"):
                for i, metadata in enumerate(result["metadatas"]):
                    if metadata and "endpoint" in metadata:
                        endpoint_info = {
                            "endpoint": metadata["endpoint"],
                            "method": metadata.get("method", "GET"),
                            "operation_id": metadata.get("operation_id"),
                            "description": metadata.get("description", ""),
                            "parameter_count": metadata.get("parameter_count", 0)
                        }
                        endpoints.append(endpoint_info)
            
            return endpoints
        except Exception as e:
            logger.error(f"Error getting endpoints: {e}")
            return []
    
    async def _test_endpoint(self, endpoint_info: Dict[str, Any]):
        """Test a specific endpoint and record results"""
        endpoint = endpoint_info["endpoint"]
        method = endpoint_info["method"]
        
        test_case = TestCase(
            test_id=f"auto_{endpoint.replace('/', '_')}_{method}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            type=TestType.functional,
            description=f"Automated test for {method} {endpoint}",
            endpoint=endpoint,
            method=method,
            input_data=self._generate_test_data(endpoint_info),
            expected_output={"status_code": 200}
        )
        
        # Execute the test
        result = await self._execute_test_case(test_case)
        
        # Store result for analytics
        self.results_db.append(result)
        self.execution_history.append({
            "timestamp": datetime.now(),
            "endpoint": endpoint,
            "method": method,
            "success": result["success"],
            "response_time": result.get("response_time", 0),
            "status_code": result.get("status_code")
        })
        
        # Keep only recent results (last 1000)
        if len(self.results_db) > 1000:
            self.results_db = self.results_db[-1000:]
        if len(self.execution_history) > 1000:
            self.execution_history = self.execution_history[-1000:]
    
    def _generate_test_data(self, endpoint_info: Dict[str, Any]) -> Dict[str, Any]:
        """Generate test data for an endpoint"""
        endpoint = endpoint_info["endpoint"]
        method = endpoint_info["method"]
        
        test_data = {}
        
        # Add path parameters if endpoint has them
        if "{" in endpoint:
            # Simple path parameter generation
            if "userId" in endpoint:
                test_data["path_params"] = {"userId": "123"}
            elif "id" in endpoint:
                test_data["path_params"] = {"id": "1"}
        
        # Add query parameters for GET requests
        if method == "GET":
            if "users" in endpoint.lower():
                test_data["query"] = {"limit": "10", "offset": "0"}
        
        # Add body for POST/PUT requests
        if method in ["POST", "PUT"]:
            if "users" in endpoint.lower():
                test_data["body"] = {
                    "name": "Test User",
                    "email": "test@example.com"
                }
        
        return test_data
    
    async def _execute_test_case(self, test_case: TestCase) -> Dict[str, Any]:
        """Execute a single test case against the API"""
        start_time = datetime.now()
        
        try:
            # Build URL
            url = self._build_test_url(test_case)
            
            # Prepare request data
            headers = {"Content-Type": "application/json"}
            json_data = test_case.input_data.get("body")
            params = test_case.input_data.get("query")
            
            async with aiohttp.ClientSession() as session:
                async with session.request(
                    method=test_case.method or "GET",
                    url=url,
                    json=json_data,
                    params=params,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    end_time = datetime.now()
                    response_time = (end_time - start_time).total_seconds()
                    
                    try:
                        response_body = await response.json()
                    except:
                        response_body = await response.text()
                    
                    success = self._validate_response(response, test_case.expected_output)
                    
                    return {
                        "test_id": test_case.test_id,
                        "endpoint": test_case.endpoint,
                        "method": test_case.method,
                        "success": success,
                        "status_code": response.status,
                        "response_time": response_time,
                        "response_body": response_body,
                        "timestamp": end_time,
                        "error": None
                    }
        
        except Exception as e:
            end_time = datetime.now()
            response_time = (end_time - start_time).total_seconds()
            
            return {
                "test_id": test_case.test_id,
                "endpoint": test_case.endpoint,
                "method": test_case.method,
                "success": False,
                "status_code": None,
                "response_time": response_time,
                "response_body": None,
                "timestamp": end_time,
                "error": str(e)
            }
    
    def _build_test_url(self, test_case: TestCase) -> str:
        """Build the full URL for testing"""
        endpoint = test_case.endpoint or ""
        
        # Replace path parameters
        if test_case.input_data.get("path_params"):
            for param, value in test_case.input_data["path_params"].items():
                endpoint = endpoint.replace(f"{{{param}}}", str(value))
        
        # Handle special cases - if testing our own API
        if endpoint.startswith("/api/"):
            url = f"{self.base_url}{endpoint}"
        elif endpoint.startswith("/"):
            url = f"{self.base_url}{endpoint}"
        else:
            url = f"{self.base_url}/{endpoint}"
        
        return url
    
    def _validate_response(self, response, expected_output: Dict[str, Any]) -> bool:
        """Validate response against expected output"""
        expected_status = expected_output.get("status_code", 200)
        
        # For now, consider any response code in 200-299 range as success
        if 200 <= response.status <= 299:
            return True
        
        # Or if it matches the expected status code
        return response.status == expected_status
    
    def get_execution_stats(self) -> Dict[str, Any]:
        """Get real execution statistics"""
        if not self.execution_history:
            return {
                "total_executions": 0,
                "successful_executions": 0,
                "failed_executions": 0,
                "success_rate": 0.0,
                "avg_response_time": 0.0,
                "endpoints_tested": 0
            }
        
        total = len(self.execution_history)
        successful = sum(1 for r in self.execution_history if r["success"])
        failed = total - successful
        
        avg_response_time = sum(r["response_time"] for r in self.execution_history) / total
        endpoints_tested = len(set(r["endpoint"] for r in self.execution_history))
        
        return {
            "total_executions": total,
            "successful_executions": successful,
            "failed_executions": failed,
            "success_rate": round(successful / total, 3),
            "avg_response_time": round(avg_response_time, 3),
            "endpoints_tested": endpoints_tested
        }
    
    def get_coverage_stats(self) -> Dict[str, Any]:
        """Calculate real coverage statistics"""
        if not self.execution_history:
            return {"endpoint_coverage": {}, "method_coverage": {}}
        
        endpoint_counts = {}
        method_counts = {}
        
        for result in self.execution_history:
            endpoint = result["endpoint"]
            method = result["method"]
            
            endpoint_counts[endpoint] = endpoint_counts.get(endpoint, 0) + 1
            method_counts[method] = method_counts.get(method, 0) + 1
        
        # Calculate coverage scores (simple implementation)
        endpoint_coverage = {}
        for endpoint, count in endpoint_counts.items():
            # Coverage based on how many times tested
            coverage_score = min(count / 5.0, 1.0)  # 5 tests = 100% coverage
            endpoint_coverage[endpoint] = round(coverage_score, 3)
        
        return {
            "endpoint_coverage": endpoint_coverage,
            "method_coverage": method_counts
        }
    
    def get_failure_patterns(self) -> List[Dict[str, Any]]:
        """Analyze real failure patterns"""
        if not self.results_db:
            return []
        
        failures = [r for r in self.results_db if not r["success"]]
        if not failures:
            return []
        
        # Group failures by endpoint and error type
        patterns = {}
        for failure in failures:
            endpoint = failure["endpoint"]
            error_type = self._categorize_error(failure.get("error", ""), failure.get("status_code"))
            
            key = f"{endpoint}_{error_type}"
            if key not in patterns:
                patterns[key] = {
                    "endpoint": endpoint,
                    "error_type": error_type,
                    "count": 0,
                    "first_seen": failure["timestamp"],
                    "last_seen": failure["timestamp"]
                }
            
            patterns[key]["count"] += 1
            patterns[key]["last_seen"] = failure["timestamp"]
        
        return list(patterns.values())
    
    def _categorize_error(self, error_msg: str, status_code: Optional[int]) -> str:
        """Categorize error type"""
        if status_code:
            if status_code == 404:
                return "not_found"
            elif status_code == 500:
                return "server_error"
            elif status_code == 401:
                return "authentication"
            elif status_code == 403:
                return "authorization"
            elif status_code >= 400:
                return "client_error"
        
        if error_msg:
            error_lower = error_msg.lower()
            if "timeout" in error_lower:
                return "timeout"
            elif "connection" in error_lower:
                return "connection"
            elif "network" in error_lower:
                return "network"
        
        return "unknown"