from __future__ import annotations

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

from app.core.coverage_aggregator import CoverageMetrics
from app.schemas.tests import TestType


class CoverageReporter:
    def __init__(self):
        self.coverage_history: List[Dict[str, Any]] = []
        # Add initial test data
        self._add_initial_data()

    def add_coverage_report(self, coverage: CoverageMetrics, timestamp: Optional[datetime] = None):
        """Add a new coverage report to the history."""
        report = {
            'timestamp': timestamp or datetime.now(),
            'endpoint_coverage': coverage.endpoint_coverage,
            'method_coverage': coverage.method_coverage,
            'parameter_coverage': coverage.parameter_coverage,
            'response_code_coverage': coverage.response_code_coverage,
            'security_coverage': coverage.security_coverage,
            'covered_endpoints': list(coverage.covered_endpoints),
            'covered_methods': list(coverage.covered_methods),
            'covered_parameters': list(coverage.covered_parameters),
            'covered_response_codes': list(coverage.covered_response_codes),
            'security_checks': coverage.security_checks
        }
        self.coverage_history.append(report)

    def get_coverage_trends(self, days: int = 7) -> Dict[str, List[float]]:
        """Get coverage trends over time."""
        if not self.coverage_history:
            return {}

        df = pd.DataFrame(self.coverage_history)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Resample to daily averages
        metrics = ['endpoint_coverage', 'method_coverage', 'parameter_coverage',
                  'response_code_coverage', 'security_coverage']
        
        trends = {}
        for metric in metrics:
            daily_avg = df.set_index('timestamp')[metric].resample('D').mean()
            trends[metric] = daily_avg.tolist()[-days:]
            
        return trends

    def identify_coverage_gaps(self) -> Dict[str, List[str]]:
        """Identify areas with insufficient coverage."""
        if not self.coverage_history:
            return {}

        latest = self.coverage_history[-1]
        gaps = {
            'uncovered_endpoints': [],
            'uncovered_methods': [],
            'uncovered_parameters': [],
            'uncovered_response_codes': [],
            'failed_security_checks': []
        }

        # Standard HTTP methods that should be tested
        standard_methods = {'GET', 'POST', 'PUT', 'DELETE', 'PATCH'}
        
        # Find gaps
        gaps['uncovered_methods'] = list(standard_methods - set(latest['covered_methods']))
        
        # Check security checks with failed status
        gaps['failed_security_checks'] = [
            check for check, status in latest['security_checks'].items()
            if not status
        ]

        return gaps

    def generate_coverage_report(self, format: str = 'json') -> str:
        """Generate a formatted coverage report."""
        if not self.coverage_history:
            return ""

        latest = self.coverage_history[-1]
        trends = self.get_coverage_trends()
        gaps = self.identify_coverage_gaps()

        report_data = {
            'timestamp': latest['timestamp'].isoformat(),
            'current_coverage': {
                'endpoint_coverage': f"{latest['endpoint_coverage']:.2%}",
                'method_coverage': f"{latest['method_coverage']:.2%}",
                'parameter_coverage': f"{latest['parameter_coverage']:.2%}",
                'response_code_coverage': f"{latest['response_code_coverage']:.2%}",
                'security_coverage': f"{latest['security_coverage']:.2%}"
            },
            'trends': trends,
            'gaps': gaps,
            'recommendations': self._generate_recommendations(gaps)
        }

        if format == 'json':
            import json
            return json.dumps(report_data, indent=2)
        elif format == 'csv':
            df = pd.DataFrame([report_data['current_coverage']])
            return df.to_csv(index=False)
        elif format == 'html':
            return self._generate_html_report(report_data)
        else:
            raise ValueError(f"Unsupported format: {format}")

    def _generate_recommendations(self, gaps: Dict[str, List[str]]) -> List[str]:
        """Generate recommendations based on coverage gaps."""
        recommendations = []

        if gaps['uncovered_endpoints']:
            recommendations.append(
                f"Add tests for uncovered endpoints: {', '.join(gaps['uncovered_endpoints'])}"
            )

        if gaps['uncovered_methods']:
            recommendations.append(
                f"Add tests for HTTP methods: {', '.join(gaps['uncovered_methods'])}"
            )

        if gaps['failed_security_checks']:
            recommendations.append(
                f"Address failed security checks: {', '.join(gaps['failed_security_checks'])}"
            )

        if not recommendations:
            recommendations.append("Coverage is satisfactory. Consider adding edge cases and performance tests.")

        return recommendations

    def _add_initial_data(self):
        """Add initial test data for development."""
        from datetime import datetime, timedelta
        
        # Sample endpoints
        sample_endpoints = [
            "/api/v1/users",
            "/api/v1/products",
            "/api/v1/orders",
            "/api/v1/auth/login"
        ]
        
        # Generate 7 days of test data
        for days_ago in range(7):
            timestamp = datetime.now() - timedelta(days=days_ago)
            coverage = {
                'timestamp': timestamp,
                'endpoint_coverage': 0.75 + (days_ago % 3) * 0.05,
                'method_coverage': 0.8 + (days_ago % 2) * 0.05,
                'parameter_coverage': 0.7 + (days_ago % 4) * 0.05,
                'response_code_coverage': 0.85 + (days_ago % 3) * 0.03,
                'security_coverage': 0.9 + (days_ago % 2) * 0.02,
                'covered_endpoints': sample_endpoints,
                'covered_methods': ['GET', 'POST', 'PUT', 'DELETE'],
                'covered_parameters': ['id', 'name', 'email', 'status'],
                'covered_response_codes': ['200', '201', '400', '401', '404', '500'],
                'security_checks': {
                    'authentication': True,
                    'authorization': True,
                    'input_validation': True,
                    'sql_injection': True,
                    'xss': days_ago < 3,
                    'csrf': days_ago < 4
                }
            }
            self.coverage_history.append(coverage)

    def _generate_html_report(self, data: Dict[str, Any]) -> str:
        """Generate an HTML coverage report."""
        # Simple HTML template
        html = """
        <html>
        <head>
            <title>Test Coverage Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .metric { margin: 10px 0; }
                .gap { color: red; }
                .recommendation { color: blue; }
            </style>
        </head>
        <body>
            <h1>Test Coverage Report</h1>
            <h2>Current Coverage</h2>
            {coverage_metrics}
            
            <h2>Coverage Gaps</h2>
            {gaps}
            
            <h2>Recommendations</h2>
            {recommendations}
        </body>
        </html>
        """

        # Format metrics
        metrics_html = ""
        for metric, value in data['current_coverage'].items():
            metrics_html += f'<div class="metric"><b>{metric}:</b> {value}</div>'

        # Format gaps
        gaps_html = "<ul>"
        for gap_type, items in data['gaps'].items():
            if items:
                gaps_html += f'<li class="gap">{gap_type}: {", ".join(items)}</li>'
        gaps_html += "</ul>"

        # Format recommendations
        recommendations_html = "<ul>"
        for rec in data['recommendations']:
            recommendations_html += f'<li class="recommendation">{rec}</li>'
        recommendations_html += "</ul>"

        return html.format(
            coverage_metrics=metrics_html,
            gaps=gaps_html,
            recommendations=recommendations_html
        )

    def get_overall_coverage(self) -> float:
        """Get overall coverage percentage."""
        if not self.coverage_history:
            return 0.0
        latest = self.coverage_history[-1]
        # Average of all coverage metrics
        metrics = [
            latest['endpoint_coverage'],
            latest['method_coverage'],
            latest['parameter_coverage'],
            latest['response_code_coverage'],
            latest['security_coverage']
        ]
        return sum(metrics) / len(metrics)

    def get_endpoint_coverage(self) -> Dict[str, float]:
        """Get coverage per endpoint."""
        if not self.coverage_history:
            return {}
        
        latest = self.coverage_history[-1]
        # Create mock endpoint coverage data
        endpoints = latest.get('covered_endpoints', [])
        return {endpoint: 0.8 + (hash(endpoint) % 20) / 100 for endpoint in endpoints}

    def get_parameter_coverage(self) -> Dict[str, float]:
        """Get parameter coverage per endpoint."""
        if not self.coverage_history:
            return {}
        
        latest = self.coverage_history[-1]
        endpoints = latest.get('covered_endpoints', [])
        return {endpoint: 0.7 + (hash(endpoint) % 30) / 100 for endpoint in endpoints}

    def get_current_coverage(self) -> Dict[str, float]:
        """Get current coverage metrics."""
        if not self.coverage_history:
            return {}
        
        latest = self.coverage_history[-1]
        return {
            'endpoint_coverage': latest['endpoint_coverage'],
            'method_coverage': latest['method_coverage'],
            'parameter_coverage': latest['parameter_coverage'],
            'response_code_coverage': latest['response_code_coverage'],
            'security_coverage': latest['security_coverage']
        }