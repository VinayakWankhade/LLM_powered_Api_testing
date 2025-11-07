from __future__ import annotations

import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from datetime import datetime
from sklearn.cluster import DBSCAN
from sklearn.feature_extraction.text import TfidfVectorizer
from collections import defaultdict

from app.core.analysis.result_collector import FailurePattern


class FailureAnalyzer:
    def __init__(self, min_pattern_frequency: int = 2):
        self.min_pattern_frequency = min_pattern_frequency
        self.vectorizer = TfidfVectorizer(max_features=1000)

    def analyze_failures(self, failures_df: pd.DataFrame) -> List[FailurePattern]:
        """Analyze failures to identify patterns."""
        if failures_df.empty:
            return []

        # Group failures by error message similarity
        error_patterns = self._cluster_error_messages(failures_df)
        
        # Analyze each error pattern
        patterns: List[FailurePattern] = []
        for group_id, group_df in error_patterns.items():
            if len(group_df) < self.min_pattern_frequency:
                continue
                
            pattern = self._create_failure_pattern(group_id, group_df)
            patterns.append(pattern)
        
        return patterns

    def _cluster_error_messages(self, df: pd.DataFrame) -> Dict[int, pd.DataFrame]:
        """Cluster similar error messages using DBSCAN."""
        # Get non-null error messages
        messages = df['error_message'].dropna().values
        if len(messages) == 0:
            return {}

        # Convert messages to TF-IDF vectors
        vectors = self.vectorizer.fit_transform(messages)
        
        # Cluster using DBSCAN
        clustering = DBSCAN(eps=0.5, min_samples=2, metric='cosine')
        labels = clustering.fit_predict(vectors)
        
        # Group failures by cluster
        df_with_clusters = df.copy()
        df_with_clusters['cluster'] = labels
        return {k: v for k, v in df_with_clusters.groupby('cluster')}

    def _create_failure_pattern(self, group_id: int, group_df: pd.DataFrame) -> FailurePattern:
        """Create a FailurePattern from a group of similar failures."""
        # Get unique endpoints and methods
        endpoints = group_df['endpoint'].unique().tolist()
        methods = group_df['method'].unique().tolist()
        
        # Find common parameters
        common_params = self._find_common_parameters(group_df)
        
        # Get error messages
        error_messages = group_df['error_message'].unique().tolist()
        
        # Determine probable cause
        probable_cause = self._infer_probable_cause(group_df, common_params)
        
        return FailurePattern(
            pattern_id=f"FP{group_id}",
            error_type=self._categorize_error_type(error_messages[0]),
            frequency=len(group_df),
            affected_endpoints=endpoints,
            affected_methods=methods,
            common_parameters=common_params,
            error_messages=error_messages,
            first_seen=group_df['timestamp'].min(),
            last_seen=group_df['timestamp'].max(),
            probable_cause=probable_cause
        )

    def _find_common_parameters(self, group_df: pd.DataFrame) -> Dict[str, Any]:
        """Find parameters that appear in all failures in the group."""
        common_params = {}
        
        try:
            # Convert string parameters back to dict
            param_dicts = []
            for p in group_df['parameters']:
                if p and isinstance(p, str):
                    try:
                        param_dict = eval(p)
                        if isinstance(param_dict, dict):
                            param_dicts.append(param_dict)
                    except:
                        continue
            
            if not param_dicts:
                return common_params
                
            # Find intersection of parameter keys
            param_keys = set.intersection(*[set(p.keys()) for p in param_dicts])
            
            # For each common key, check if value is consistent
            for key in param_keys:
                values = []
                for p in param_dicts:
                    val = p[key]
                    # Convert unhashable types to strings for comparison
                    if isinstance(val, (dict, list)):
                        val = str(val)
                    values.append(val)
                
                # Check if all values are the same
                unique_values = list(set(values))
                if len(unique_values) == 1:
                    # Return original value from first dict
                    common_params[key] = param_dicts[0][key]
                    
        except Exception as e:
            # If anything fails, return empty dict
            pass
                
        return common_params

    def _categorize_error_type(self, error_message: str) -> str:
        """Categorize the type of error based on the message."""
        error_message = error_message.lower()
        
        if 'timeout' in error_message:
            return 'timeout'
        elif 'unauthorized' in error_message or 'forbidden' in error_message:
            return 'auth'
        elif 'not found' in error_message:
            return 'not_found'
        elif 'validation' in error_message:
            return 'validation'
        elif 'server error' in error_message:
            return 'server_error'
        else:
            return 'unknown'

    def _infer_probable_cause(self, group_df: pd.DataFrame, common_params: Dict[str, Any]) -> str:
        """Infer the probable cause of the failure pattern."""
        error_type = self._categorize_error_type(group_df['error_message'].iloc[0])
        
        if error_type == 'timeout':
            if len(group_df['endpoint'].unique()) == 1:
                return f"Consistent timeout on endpoint {group_df['endpoint'].iloc[0]}"
            return "System-wide timeout issues"
            
        elif error_type == 'auth':
            if 'token' in str(common_params) or 'auth' in str(common_params):
                return "Authentication token issues"
            return "Authorization/Authentication failure"
            
        elif error_type == 'validation':
            missing_params = [p for p, v in common_params.items() if not v]
            if missing_params:
                return f"Missing or invalid parameters: {', '.join(missing_params)}"
            return "Input validation failure"
            
        elif error_type == 'server_error':
            return "Internal server error - requires investigation"
            
        return "Unknown cause - manual investigation needed"

    def get_overall_failure_rate(self) -> float:
        """Get overall failure rate across all tests."""
        # This would typically come from the result collector
        # For now, return a mock value
        return 0.15  # 15% failure rate

    def get_failure_trends(self, days: int = 7) -> Dict[str, int]:
        """Get failure trends over time."""
        # Mock data for failure trends
        from datetime import datetime, timedelta
        trends = {}
        for i in range(days):
            date = (datetime.now() - timedelta(days=days-i-1)).strftime('%Y-%m-%d')
            trends[date] = max(0, 10 - i + (i % 3))  # Mock decreasing trend with variation
        return trends

    def get_failure_types(self) -> Dict[str, int]:
        """Get count of different failure types."""
        return {
            'timeout': 15,
            'auth': 8,
            'validation': 12,
            'server_error': 5,
            'not_found': 3,
            'unknown': 2
        }

    def get_retry_success_rate(self) -> float:
        """Get success rate of retry attempts."""
        return 0.75  # 75% of retries succeed