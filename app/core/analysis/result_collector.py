from __future__ import annotations

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass
from collections import defaultdict

from app.core.executor.result_types import TestResult, ExecutionMetrics
from app.schemas.tests import TestCase, TestType
from app.core.coverage_aggregator import CoverageMetrics


@dataclass
class FailurePattern:
    pattern_id: str
    error_type: str
    frequency: int
    affected_endpoints: List[str]
    affected_methods: List[str]
    common_parameters: Dict[str, Any]
    error_messages: List[str]
    first_seen: datetime
    last_seen: datetime
    probable_cause: str


class ResultCollector:
    def __init__(self):
        self.results_df: Optional[pd.DataFrame] = None
        self._initialize_dataframe()

    def _initialize_dataframe(self):
        """Initialize empty DataFrame with standardized schema."""
        self.results_df = pd.DataFrame(columns=[
            'test_id', 'execution_id', 'endpoint', 'method', 
            'test_type', 'parameters', 'status', 'response_code',
            'response_time', 'error_message', 'timestamp'
        ])

    def add_execution_result(self, execution_id: str, tests: List[TestCase], 
                           metrics: ExecutionMetrics, coverage: CoverageMetrics):
        """Add new execution results to the collection."""
        # Create result records
        records = []
        for test, result in zip(tests, metrics.results):
            record = {
                'test_id': test.test_id,
                'execution_id': execution_id,
                'endpoint': test.endpoint,
                'method': test.method,
                'test_type': test.type,
                'parameters': str(test.input_data),  # Convert dict to string for storage
                'status': 'pass' if result.success else 'fail',
                'response_code': result.status_code,
                'response_time': result.response_time,
                'error_message': result.error,
                'timestamp': result.start_time
            }
            records.append(record)

        # Add to DataFrame
        new_df = pd.DataFrame.from_records(records)
        self.results_df = pd.concat([self.results_df, new_df], ignore_index=True)

    def get_recent_failures(self, hours: int = 24) -> pd.DataFrame:
        """Get failures from the last N hours."""
        if self.results_df.empty:
            return pd.DataFrame()

        cutoff = datetime.now() - timedelta(hours=hours)
        mask = (self.results_df['status'] == 'fail') & (self.results_df['timestamp'] >= cutoff)
        return self.results_df[mask]

    def get_endpoint_statistics(self) -> Dict[str, Dict[str, Any]]:
        """Calculate statistics per endpoint."""
        if self.results_df.empty:
            return {}

        stats = {}
        grouped = self.results_df.groupby('endpoint')
        
        for endpoint, group in grouped:
            total_tests = len(group)
            failed_tests = len(group[group['status'] == 'fail'])
            avg_response_time = group['response_time'].mean()
            
            stats[endpoint] = {
                'total_tests': total_tests,
                'failed_tests': failed_tests,
                'success_rate': (total_tests - failed_tests) / total_tests * 100,
                'avg_response_time': avg_response_time,
                'last_failure': group[group['status'] == 'fail']['timestamp'].max()
            }
        
        return stats

    def export_results(self, format: str = 'json') -> str:
        """Export results in specified format."""
        if format == 'csv':
            return self.results_df.to_csv(index=False)
        elif format == 'json':
            return self.results_df.to_json(orient='records', date_format='iso')
        elif format == 'excel':
            # Return bytes for Excel file
            return self.results_df.to_excel(index=False)
        else:
            raise ValueError(f"Unsupported format: {format}")

    def get_total_tests(self) -> int:
        """Get total number of tests executed."""
        if self.results_df is None or self.results_df.empty:
            return 0
        return len(self.results_df)

    def get_total_endpoints(self) -> int:
        """Get total number of unique endpoints tested."""
        if self.results_df is None or self.results_df.empty:
            return 0
        return self.results_df['endpoint'].nunique()

    def get_endpoints(self) -> List[str]:
        """Get list of all unique endpoints."""
        if self.results_df is None or self.results_df.empty:
            return []
        return self.results_df['endpoint'].unique().tolist()

    def get_failures(self, query: Dict[str, Any]) -> pd.DataFrame:
        """Get failures based on query parameters."""
        if self.results_df is None or self.results_df.empty:
            return pd.DataFrame()
        
        df = self.results_df[self.results_df['status'] == 'fail'].copy()
        
        # Apply filters
        if 'endpoint' in query and query['endpoint']:
            df = df[df['endpoint'] == query['endpoint']]
        if 'test_type' in query and query['test_type']:
            df = df[df['test_type'] == query['test_type']]
        if 'start_date' in query and query['start_date']:
            df = df[df['timestamp'] >= query['start_date']]
        if 'end_date' in query and query['end_date']:
            df = df[df['timestamp'] <= query['end_date']]
            
        return df

    def get_execution_trends(self, days: int = 7) -> Dict[str, List[Any]]:
        """Get execution trends over time."""
        if self.results_df is None or self.results_df.empty:
            return {
                'total_executions': [],
                'success_rate': [],
                'avg_duration': [],
                'dates': []
            }
        
        # Group by date
        df = self.results_df.copy()
        df['date'] = pd.to_datetime(df['timestamp']).dt.date
        
        daily_stats = df.groupby('date').agg({
            'test_id': 'count',
            'status': lambda x: (x == 'pass').mean(),
            'response_time': 'mean'
        }).tail(days)
        
        return {
            'total_executions': daily_stats['test_id'].tolist(),
            'success_rate': daily_stats['status'].tolist(),
            'avg_duration': daily_stats['response_time'].tolist(),
            'dates': [str(d) for d in daily_stats.index.tolist()]
        }

    def get_avg_response_time(self) -> float:
        """Get average response time across all tests."""
        if self.results_df is None or self.results_df.empty:
            return 0.0
        return self.results_df['response_time'].mean()

    def get_percentile_response_time(self, percentile: int) -> float:
        """Get percentile response time."""
        if self.results_df is None or self.results_df.empty:
            return 0.0
        return self.results_df['response_time'].quantile(percentile / 100.0)

    def get_success_rate(self) -> float:
        """Get overall success rate."""
        if self.results_df is None or self.results_df.empty:
            return 0.0
        return (self.results_df['status'] == 'pass').mean()

    def get_recent_results(self, hours: int = 24) -> pd.DataFrame:
        """Get recent test results."""
        if self.results_df is None or self.results_df.empty:
            return pd.DataFrame()
        
        cutoff = datetime.now() - timedelta(hours=hours)
        return self.results_df[self.results_df['timestamp'] >= cutoff]

    def get_risk_trends(self, days: int = 7) -> List[Dict[str, Any]]:
        """Get risk trends over time."""
        if self.results_df is None or self.results_df.empty:
            return []
        
        # Group by date and calculate risk metrics
        df = self.results_df.copy()
        df['date'] = pd.to_datetime(df['timestamp']).dt.date
        
        daily_stats = df.groupby('date').agg({
            'status': lambda x: {
                'high_risk': sum(1 for s in x if s == 'fail') * 2,  # Weight failures higher
                'medium_risk': sum(1 for s in x if s == 'fail'),
                'low_risk': sum(1 for s in x if s == 'pass')
            }
        }).tail(days)
        
        trends = []
        for date, row in daily_stats.iterrows():
            risk_data = row['status']
            trends.append({
                'date': str(date),
                'high_risk': risk_data['high_risk'],
                'medium_risk': risk_data['medium_risk'],
                'low_risk': risk_data['low_risk']
            })
        
        return trends

    def get_endpoint_data(self, endpoint: str) -> Dict[str, Any]:
        """Get data for a specific endpoint."""
        if self.results_df is None or self.results_df.empty:
            return {}
        
        endpoint_data = self.results_df[self.results_df['endpoint'] == endpoint]
        if endpoint_data.empty:
            return {}
        
        return {
            'endpoint': endpoint,
            'total_tests': len(endpoint_data),
            'success_rate': (endpoint_data['status'] == 'pass').mean(),
            'avg_response_time': endpoint_data['response_time'].mean(),
            'recent_failures': len(endpoint_data[
                (endpoint_data['status'] == 'fail') &
                (endpoint_data['timestamp'] >= datetime.now() - timedelta(hours=24))
            ])
        }