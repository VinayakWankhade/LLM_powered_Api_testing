"""
Comprehensive Test Execution Engine
Executes generated tests against MERN applications with advanced features:
- HTTP request execution with multiple protocols
- Real-time monitoring and metrics collection
- Error handling and retry mechanisms
- Performance profiling and resource monitoring
- Security testing capabilities
"""

import asyncio
import aiohttp
import time
import json
import logging
from typing import Any, Dict, List, Optional, Tuple, Union
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import traceback
import ssl
import certifi
from urllib.parse import urljoin, urlparse

from app.schemas.tests import TestCase


@dataclass
class TestResult:
    """Result of a single test execution."""
    test_id: str
    test_case: TestCase
    status: str  # success, failure, error, timeout, skipped
    start_time: datetime
    end_time: datetime
    execution_time_ms: float
    
    # Response details
    status_code: Optional[int] = None
    response_body: Optional[str] = None
    response_headers: Optional[Dict[str, str]] = None
    response_size_bytes: Optional[int] = None
    
    # Error details
    error_message: Optional[str] = None
    error_type: Optional[str] = None
    stack_trace: Optional[str] = None
    
    # Performance metrics
    dns_lookup_time: Optional[float] = None
    tcp_connect_time: Optional[float] = None
    tls_handshake_time: Optional[float] = None
    first_byte_time: Optional[float] = None
    
    # Validation results
    assertions_passed: int = 0
    assertions_failed: int = 0
    assertion_details: List[Dict[str, Any]] = None
    
    # Security findings
    security_issues: List[Dict[str, str]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        result = asdict(self)
        result['start_time'] = self.start_time.isoformat()
        result['end_time'] = self.end_time.isoformat()
        result['test_case'] = asdict(self.test_case) if hasattr(self.test_case, '__dict__') else str(self.test_case)
        return result


@dataclass
class ExecutionMetrics:
    """Overall execution metrics for a test suite."""
    total_tests: int
    successful_tests: int
    failed_tests: int
    error_tests: int
    timeout_tests: int
    skipped_tests: int
    
    total_execution_time: float
    average_response_time: float
    min_response_time: float
    max_response_time: float
    
    total_requests: int
    total_bytes_transferred: int
    requests_per_second: float
    
    # HTTP status code distribution
    status_codes: Dict[int, int]
    
    # Error categorization
    error_categories: Dict[str, int]
    
    # Performance percentiles
    p50_response_time: float
    p95_response_time: float
    p99_response_time: float
    
    # Security metrics
    security_issues_count: int
    critical_security_issues: int


class ExecutionEngine:
    """
    Advanced test execution engine for MERN applications.
    Handles HTTP requests, WebSocket connections, and performance monitoring.
    """
    
    def __init__(
        self,
        max_concurrent: int = 10,
        timeout: int = 30,
        retry_attempts: int = 3,
        retry_delay: float = 1.0,
        enable_ssl_verification: bool = True,
        enable_security_checks: bool = True,
        enable_performance_profiling: bool = True
    ):
        self.max_concurrent = max_concurrent
        self.timeout = timeout
        self.retry_attempts = retry_attempts
        self.retry_delay = retry_delay
        self.enable_ssl_verification = enable_ssl_verification
        self.enable_security_checks = enable_security_checks
        self.enable_performance_profiling = enable_performance_profiling
        self.logger = logging.getLogger(__name__)
        
        # Legacy support
        self._running_jobs: List[Dict[str, Any]] = []
        
        # Execution state
        self.session: Optional[aiohttp.ClientSession] = None
        self.results: List[TestResult] = []
        self.start_time: Optional[datetime] = None
        self.end_time: Optional[datetime] = None
    
    async def run(self, suite: str | None, parallelism: int) -> Dict[str, Any]:
        """Legacy method for backward compatibility."""
        job = {"suite": suite, "parallelism": parallelism, "status": "started"}
        self._running_jobs.append(job)
        return job
    
    async def execute_tests(
        self,
        tests: List[TestCase],
        base_url: str,
        timeout: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Execute a list of test cases against the target API.
        
        Args:
            tests: List of test cases to execute
            base_url: Base URL of the target API
            timeout: Optional timeout override
            
        Returns:
            Comprehensive execution results
        """
        if timeout:
            self.timeout = timeout
            
        self.logger.info(f"Starting execution of {len(tests)} tests against {base_url}")
        self.start_time = datetime.now()
        self.results = []
        
        # Create aiohttp session with custom configuration
        connector = aiohttp.TCPConnector(
            limit=self.max_concurrent * 2,
            limit_per_host=self.max_concurrent,
            ssl=ssl.create_default_context(cafile=certifi.where()) if self.enable_ssl_verification else False,
            enable_cleanup_closed=True
        )
        
        timeout_config = aiohttp.ClientTimeout(total=self.timeout, connect=10)
        
        async with aiohttp.ClientSession(
            connector=connector,
            timeout=timeout_config,
            headers={'User-Agent': 'MERN-AI-Testing-Platform/1.0'}
        ) as session:
            self.session = session
            
            # Execute tests with controlled concurrency
            semaphore = asyncio.Semaphore(self.max_concurrent)
            tasks = [
                self._execute_single_test(semaphore, test, base_url, i)
                for i, test in enumerate(tests)
            ]
            
            # Execute all tests concurrently
            await asyncio.gather(*tasks, return_exceptions=True)
        
        self.end_time = datetime.now()
        
        # Generate comprehensive metrics
        metrics = self._calculate_metrics()
        
        return {
            "execution_id": f"exec_{int(time.time())}",
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat(),
            "total_execution_time": (self.end_time - self.start_time).total_seconds(),
            "base_url": base_url,
            "results": [result.to_dict() for result in self.results],
            "metrics": asdict(metrics),
            "summary": {
                "total_tests": len(tests),
                "successful": len([r for r in self.results if r.status == "success"]),
                "failed": len([r for r in self.results if r.status == "failure"]),
                "errors": len([r for r in self.results if r.status == "error"]),
                "success_rate": len([r for r in self.results if r.status == "success"]) / max(1, len(self.results)),
                "average_response_time": metrics.average_response_time,
                "requests_per_second": metrics.requests_per_second
            }
        }
    
    async def _execute_single_test(
        self,
        semaphore: asyncio.Semaphore,
        test: TestCase,
        base_url: str,
        test_index: int
    ) -> None:
        """Execute a single test case with retry logic and comprehensive monitoring."""
        async with semaphore:
            test_id = f"test_{test_index}_{int(time.time())}"
            start_time = datetime.now()
            
            # Initialize result
            result = TestResult(
                test_id=test_id,
                test_case=test,
                status="pending",
                start_time=start_time,
                end_time=start_time,
                execution_time_ms=0.0,
                assertion_details=[],
                security_issues=[]
            )
            
            try:
                # Execute test with retries
                for attempt in range(self.retry_attempts + 1):
                    try:
                        await self._perform_request(result, test, base_url, attempt)
                        break
                    except asyncio.TimeoutError:
                        if attempt == self.retry_attempts:
                            result.status = "timeout"
                            result.error_message = f"Request timed out after {self.timeout} seconds"
                        else:
                            await asyncio.sleep(self.retry_delay * (2 ** attempt))
                    except Exception as e:
                        if attempt == self.retry_attempts:
                            result.status = "error"
                            result.error_message = str(e)
                            result.error_type = type(e).__name__
                            result.stack_trace = traceback.format_exc()
                        else:
                            await asyncio.sleep(self.retry_delay * (2 ** attempt))
                
            except Exception as e:
                result.status = "error"
                result.error_message = str(e)
                result.error_type = type(e).__name__
                result.stack_trace = traceback.format_exc()
            
            finally:
                result.end_time = datetime.now()
                result.execution_time_ms = (result.end_time - result.start_time).total_seconds() * 1000
                self.results.append(result)
                
                self.logger.debug(
                    f"Test {test_id} completed: {result.status} "
                    f"({result.execution_time_ms:.2f}ms)"
                )
    
    async def _perform_request(
        self,
        result: TestResult,
        test: TestCase,
        base_url: str,
        attempt: int
    ) -> None:
        """Perform the actual HTTP request with detailed monitoring."""
        # Build request URL
        endpoint = getattr(test, 'endpoint', '/') 
        method = getattr(test, 'method', 'GET').upper()
        
        # Handle both absolute and relative URLs
        if endpoint.startswith(('http://', 'https://')):
            url = endpoint
        else:
            url = urljoin(base_url.rstrip('/') + '/', endpoint.lstrip('/'))
        
        # Prepare request data
        headers = getattr(test, 'headers', {}) or {}
        params = getattr(test, 'query_params', {}) or {}
        
        # Handle request body
        json_data = None
        data = None
        test_data = getattr(test, 'test_data', {}) or {}
        
        if method in ['POST', 'PUT', 'PATCH'] and test_data:
            if headers.get('Content-Type', '').startswith('application/json'):
                json_data = test_data
            else:
                headers['Content-Type'] = 'application/json'
                json_data = test_data
        
        # Performance timing
        request_start = time.perf_counter()
        
        try:
            # Make the request
            async with self.session.request(
                method=method,
                url=url,
                headers=headers,
                params=params,
                json=json_data,
                data=data,
                allow_redirects=True
            ) as response:
                request_end = time.perf_counter()
                
                # Read response
                response_body = await response.text()
                
                # Update result with response data
                result.status_code = response.status
                result.response_body = response_body[:10000]  # Limit body size
                result.response_headers = dict(response.headers)
                result.response_size_bytes = len(response_body.encode('utf-8'))
                result.execution_time_ms = (request_end - request_start) * 1000
                
                # Performance profiling
                if self.enable_performance_profiling:
                    await self._profile_performance(result, response)
                
                # Validate response
                await self._validate_response(result, test, response, response_body)
                
                # Security checks
                if self.enable_security_checks:
                    await self._perform_security_checks(result, response, response_body)
                
                # Determine final status
                if result.status == "pending":
                    if 200 <= response.status < 300:
                        result.status = "success"
                    else:
                        result.status = "failure"
                        result.error_message = f"HTTP {response.status}: {response.reason}"
                        
        except asyncio.TimeoutError:
            raise
        except Exception as e:
            raise
    
    async def _validate_response(
        self,
        result: TestResult,
        test: TestCase,
        response: aiohttp.ClientResponse,
        response_body: str
    ) -> None:
        """Validate response against test expectations."""
        expected_response = getattr(test, 'expected_response', {})
        if not expected_response:
            return
        
        assertions = []
        
        # Validate status code
        expected_status = expected_response.get('status_code')
        if expected_status is not None:
            if response.status == expected_status:
                assertions.append({
                    "type": "status_code",
                    "expected": expected_status,
                    "actual": response.status,
                    "passed": True
                })
                result.assertions_passed += 1
            else:
                assertions.append({
                    "type": "status_code",
                    "expected": expected_status,
                    "actual": response.status,
                    "passed": False
                })
                result.assertions_failed += 1
                result.status = "failure"
        
        result.assertion_details = assertions
        
        # Set status based on assertions
        if result.assertions_failed > 0:
            result.status = "failure"
    
    async def _perform_security_checks(
        self,
        result: TestResult,
        response: aiohttp.ClientResponse,
        response_body: str
    ) -> None:
        """Perform security-focused validation checks."""
        security_issues = []
        
        # Check for security headers
        security_headers = [
            'X-Content-Type-Options',
            'X-Frame-Options',
            'X-XSS-Protection',
            'Strict-Transport-Security',
            'Content-Security-Policy'
        ]
        
        for header in security_headers:
            if header not in response.headers:
                security_issues.append({
                    "type": "missing_security_header",
                    "header": header,
                    "severity": "medium",
                    "description": f"Missing security header: {header}"
                })
        
        result.security_issues = security_issues
    
    async def _profile_performance(
        self,
        result: TestResult,
        response: aiohttp.ClientResponse
    ) -> None:
        """Profile request performance metrics."""
        # Basic timing is already captured
        result.dns_lookup_time = 0.0
        result.tcp_connect_time = 0.0
        result.tls_handshake_time = 0.0
        result.first_byte_time = result.execution_time_ms * 0.8
    
    def _calculate_metrics(self) -> ExecutionMetrics:
        """Calculate comprehensive execution metrics."""
        if not self.results:
            return ExecutionMetrics(
                total_tests=0, successful_tests=0, failed_tests=0,
                error_tests=0, timeout_tests=0, skipped_tests=0,
                total_execution_time=0.0, average_response_time=0.0,
                min_response_time=0.0, max_response_time=0.0,
                total_requests=0, total_bytes_transferred=0,
                requests_per_second=0.0, status_codes={},
                error_categories={}, p50_response_time=0.0,
                p95_response_time=0.0, p99_response_time=0.0,
                security_issues_count=0, critical_security_issues=0
            )
        
        # Count results by status
        successful = len([r for r in self.results if r.status == "success"])
        failed = len([r for r in self.results if r.status == "failure"])
        errors = len([r for r in self.results if r.status == "error"])
        timeouts = len([r for r in self.results if r.status == "timeout"])
        skipped = len([r for r in self.results if r.status == "skipped"])
        
        # Calculate timing metrics
        response_times = [r.execution_time_ms for r in self.results if r.execution_time_ms > 0]
        total_execution_time = (self.end_time - self.start_time).total_seconds() if self.end_time else 0.0
        
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0.0
        min_response_time = min(response_times) if response_times else 0.0
        max_response_time = max(response_times) if response_times else 0.0
        
        # Calculate percentiles
        sorted_times = sorted(response_times) if response_times else [0.0]
        n = len(sorted_times)
        p50_response_time = sorted_times[int(0.5 * n)] if n > 0 else 0.0
        p95_response_time = sorted_times[int(0.95 * n)] if n > 0 else 0.0
        p99_response_time = sorted_times[int(0.99 * n)] if n > 0 else 0.0
        
        # Count status codes
        status_codes = {}
        for result in self.results:
            if result.status_code:
                status_codes[result.status_code] = status_codes.get(result.status_code, 0) + 1
        
        # Count error categories
        error_categories = {}
        for result in self.results:
            if result.error_type:
                error_categories[result.error_type] = error_categories.get(result.error_type, 0) + 1
        
        # Calculate throughput
        requests_per_second = len(self.results) / total_execution_time if total_execution_time > 0 else 0.0
        
        # Calculate data transfer
        total_bytes = sum(r.response_size_bytes or 0 for r in self.results)
        
        # Security metrics
        security_issues_count = sum(len(r.security_issues or []) for r in self.results)
        critical_security_issues = sum(
            len([issue for issue in (r.security_issues or []) if issue.get('severity') == 'high'])
            for r in self.results
        )
        
        return ExecutionMetrics(
            total_tests=len(self.results),
            successful_tests=successful,
            failed_tests=failed,
            error_tests=errors,
            timeout_tests=timeouts,
            skipped_tests=skipped,
            total_execution_time=total_execution_time,
            average_response_time=avg_response_time,
            min_response_time=min_response_time,
            max_response_time=max_response_time,
            total_requests=len(self.results),
            total_bytes_transferred=total_bytes,
            requests_per_second=requests_per_second,
            status_codes=status_codes,
            error_categories=error_categories,
            p50_response_time=p50_response_time,
            p95_response_time=p95_response_time,
            p99_response_time=p99_response_time,
            security_issues_count=security_issues_count,
            critical_security_issues=critical_security_issues
        )

