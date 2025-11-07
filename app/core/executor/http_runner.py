from __future__ import annotations

from datetime import datetime
import httpx
from typing import Any, Dict, Optional

from app.schemas.tests import TestCase
from app.core.executor.result_types import TestResult

class HTTPXRunner:
    def __init__(self, timeout: float = 30.0):
        self.timeout = timeout
        
    async def execute_test(self, test: TestCase) -> TestResult:
        """Execute a single test case using HTTPX async client."""
        start_time = datetime.now()
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                # Prepare request
                url = self._build_url(test.endpoint)
                method = test.method or "GET"
                headers = self._prepare_headers(test.input_data)
                
                # Execute request
                response = await client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    json=test.input_data.get("body"),
                    params=test.input_data.get("query"),
                )
                
                end_time = datetime.now()
                
                # Validate response
                success = self._validate_response(response, test.expected_output)
                
                return TestResult(
                    test_id=test.test_id,
                    success=success,
                    status_code=response.status_code,
                    response_time=(end_time - start_time).total_seconds(),
                    response_body=response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text,
                    headers=dict(response.headers),
                    start_time=start_time,
                    end_time=end_time
                )
                
            except Exception as e:
                end_time = datetime.now()
                return TestResult(
                    test_id=test.test_id,
                    success=False,
                    error=str(e),
                    start_time=start_time,
                    end_time=end_time
                )
    
    def _build_url(self, endpoint: Optional[str]) -> str:
        """Build full URL from endpoint."""
        # TODO: Get base URL from config
        base_url = "http://localhost:8000"  # Default for local testing
        if not endpoint:
            raise ValueError("Endpoint is required")
        return f"{base_url.rstrip('/')}/{endpoint.lstrip('/')}"
    
    def _prepare_headers(self, input_data: Dict[str, Any]) -> Dict[str, str]:
        """Prepare request headers from test input."""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        # Add any custom headers from test input
        if "headers" in input_data:
            headers.update(input_data["headers"])
        return headers
    
    def _validate_response(self, response: httpx.Response, expected: Dict[str, Any]) -> bool:
        """Validate response against expected output."""
        # Check status code
        expected_status = expected.get("status_code", 200)
        if response.status_code != expected_status:
            return False
            
        # If specific response validation is needed
        if "body" in expected:
            try:
                actual_body = response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text
                return self._compare_response(actual_body, expected["body"])
            except Exception:
                return False
                
        return True
    
    def _compare_response(self, actual: Any, expected: Any) -> bool:
        """Deep compare response body with expected output."""
        if isinstance(expected, dict):
            if not isinstance(actual, dict):
                return False
            return all(
                k in actual and self._compare_response(actual[k], v)
                for k, v in expected.items()
            )
        elif isinstance(expected, list):
            if not isinstance(actual, list) or len(actual) != len(expected):
                return False
            return all(
                self._compare_response(a, e)
                for a, e in zip(actual, expected)
            )
        return actual == expected


# Alias for backward compatibility
HTTPRunner = HTTPXRunner
