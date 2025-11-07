from __future__ import annotations

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
import joblib
import torch
import torch.nn as nn
import logging

logger = logging.getLogger(__name__)


@dataclass
class RiskMetrics:
    failure_probability: float
    expected_failures: float
    severity_score: float
    confidence: float
    last_updated: datetime


@dataclass
class Recommendation:
    endpoint: str
    type: str  # 'priority', 'coverage', 'retry', 'security', 'performance'
    severity: str  # 'high', 'medium', 'low'
    description: str
    action: str
    risk_score: float
    confidence: float
    created_at: datetime = datetime.now()


class DeepRiskPredictor(nn.Module):
    def __init__(
        self,
        input_dim: int,
        hidden_dims: List[int] = [64, 32],
        output_dim: int = 3
    ):
        super().__init__()
        layers = []
        
        # Input layer
        layers.append(nn.Linear(input_dim, hidden_dims[0]))
        layers.append(nn.ReLU())
        layers.append(nn.Dropout(0.2))
        
        # Hidden layers
        for i in range(len(hidden_dims) - 1):
            layers.append(nn.Linear(hidden_dims[i], hidden_dims[i + 1]))
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(0.2))
        
        # Output layer
        layers.append(nn.Linear(hidden_dims[-1], output_dim))
        layers.append(nn.Sigmoid())
        
        self.network = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x)


class RiskForecaster:
    def __init__(
        self,
        model_path: Optional[str] = "models/risk_forecaster",
        use_deep_learning: bool = False
    ):
        self.model_path = model_path
        self.use_deep_learning = use_deep_learning
        self.scaler = StandardScaler()
        
        # Classical ML models
        self.failure_classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.severity_regressor = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=5,
            random_state=42
        )
        
        # Deep learning model
        self.deep_model: Optional[DeepRiskPredictor] = None
        self.input_dim: Optional[int] = None
        
        # Load models if they exist
        if model_path:
            self.load_models()

    def prepare_features(
        self,
        data: List[Dict[str, Any]]
    ) -> Tuple[np.ndarray, List[str]]:
        """Convert raw data to feature matrix."""
        df = pd.DataFrame(data)
        
        # Extract endpoint features
        df['path_length'] = df['endpoint'].str.count('/')
        df['has_params'] = df['parameters'].apply(lambda x: len(x) > 0)
        
        # Time-based features
        df['hour'] = pd.to_datetime(df['timestamp']).dt.hour
        df['day_of_week'] = pd.to_datetime(df['timestamp']).dt.dayofweek
        
        # Historical metrics
        df['recent_failures'] = df.groupby('endpoint')['failed'].transform(
            lambda x: x.rolling(window=10, min_periods=1).mean()
        )
        
        # Error type encoding
        error_types = pd.get_dummies(df['error_type'], prefix='error')
        df = pd.concat([df, error_types], axis=1)
        
        # Coverage features
        df['coverage_ratio'] = df['coverage'] / df['total_lines']
        
        # Select and order features
        feature_columns = [
            'path_length', 'has_params', 'hour', 'day_of_week',
            'recent_failures', 'coverage_ratio', 'response_time'
        ] + [col for col in df.columns if col.startswith('error_')]
        
        X = df[feature_columns].values
        return X, feature_columns

    def predict_risk(
        self,
        endpoint_data: Dict[str, Any]
    ) -> RiskMetrics:
        """Predict risk metrics for an endpoint."""
        # Convert single endpoint data to feature matrix
        X, _ = self.prepare_features([endpoint_data])
        X_scaled = self.scaler.transform(X)
        
        # Get predictions from classical models
        failure_prob = self.failure_classifier.predict_proba(X_scaled)[0, 1]
        severity = self.severity_regressor.predict(X_scaled)[0]
        
        # Get deep learning predictions if available
        if self.use_deep_learning and self.deep_model:
            dl_preds = self._get_deep_predictions(X_scaled)
            # Ensemble predictions
            failure_prob = (failure_prob + dl_preds[0]) / 2
            severity = (severity + dl_preds[1]) / 2
        
        # Calculate confidence
        confidence = self._calculate_confidence(X_scaled[0])
        
        return RiskMetrics(
            failure_probability=failure_prob,
            expected_failures=failure_prob * 100,  # per 100 executions
            severity_score=severity,
            confidence=confidence,
            last_updated=datetime.now()
        )

    def train(
        self,
        historical_data: List[Dict[str, Any]],
        validation_split: float = 0.2
    ) -> Dict[str, float]:
        """Train all models."""
        X, feature_columns = self.prepare_features(historical_data)
        self.input_dim = X.shape[1]
        
        # Prepare labels
        y_failure = np.array([d['failed'] for d in historical_data])
        y_severity = np.array([d.get('severity', 0) for d in historical_data])
        
        # Split data
        X_train, X_val, y_fail_train, y_fail_val = train_test_split(
            X, y_failure, test_size=validation_split
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_val_scaled = self.scaler.transform(X_val)
        
        # Train models
        self.failure_classifier.fit(X_train_scaled, y_fail_train)
        self.severity_regressor.fit(X_train_scaled, y_severity[:len(X_train)])
        
        if self.use_deep_learning:
            self._train_deep_model(
                X_train_scaled,
                y_fail_train,
                y_severity[:len(X_train)]
            )
        
        # Save models
        if self.model_path:
            self.save_models()
            
        return self._calculate_metrics(
            X_val_scaled,
            y_fail_val,
            y_severity[len(X_train):]
        )

    def _train_deep_model(self, X: np.ndarray, y1: np.ndarray, y2: np.ndarray) -> None:
        """Train deep learning model."""
        if not self.deep_model:
            return
            
        X_tensor = torch.FloatTensor(X)
        y_tensor = torch.FloatTensor(np.column_stack([y1, y2, y1 * y2]))
        
        criterion = nn.BCELoss()
        optimizer = torch.optim.Adam(self.deep_model.parameters())
        
        self.deep_model.train()
        for _ in range(100):
            optimizer.zero_grad()
            loss = criterion(self.deep_model(X_tensor), y_tensor)
            loss.backward()
            optimizer.step()

    def save_models(self) -> None:
        """Save models to disk."""
        if not self.model_path:
            return
            
        joblib.dump(self.failure_classifier,
                   f"{self.model_path}/failure_classifier.joblib")
        joblib.dump(self.severity_regressor,
                   f"{self.model_path}/severity_regressor.joblib")
        joblib.dump(self.scaler,
                   f"{self.model_path}/scaler.joblib")
        
        if self.deep_model:
            torch.save(self.deep_model.state_dict(),
                      f"{self.model_path}/deep_model.pt")

    def load_models(self) -> None:
        """Load models from disk."""
        try:
            self.failure_classifier = joblib.load(
                f"{self.model_path}/failure_classifier.joblib"
            )
            self.severity_regressor = joblib.load(
                f"{self.model_path}/severity_regressor.joblib"
            )
            self.scaler = joblib.load(
                f"{self.model_path}/scaler.joblib"
            )
            
            if self.use_deep_learning:
                state_dict = torch.load(f"{self.model_path}/deep_model.pt")
                self.deep_model = DeepRiskPredictor(self.input_dim or 10)
                self.deep_model.load_state_dict(state_dict)
        except FileNotFoundError:
            logger.warning("No existing models found. Will train new ones.")
            pass
    
    def _get_deep_predictions(self, X_scaled: np.ndarray) -> np.ndarray:
        """Get predictions from deep learning model."""
        if not self.deep_model:
            return np.zeros(3)
        
        self.deep_model.eval()
        with torch.no_grad():
            X_tensor = torch.FloatTensor(X_scaled)
            predictions = self.deep_model(X_tensor)
            return predictions.numpy()[0]
    
    def _calculate_confidence(self, features: np.ndarray) -> float:
        """Calculate prediction confidence based on feature similarity to training data."""
        # Simple confidence metric based on feature magnitudes
        # In production, this could use more sophisticated methods like
        # distance to training data centroids or prediction intervals
        feature_magnitude = np.linalg.norm(features)
        # Normalize to 0-1 range with reasonable bounds
        confidence = min(1.0, max(0.3, 1.0 - (feature_magnitude / 10.0)))
        return confidence
    
    def _calculate_metrics(
        self, 
        X_val: np.ndarray, 
        y_fail_val: np.ndarray, 
        y_severity_val: np.ndarray
    ) -> Dict[str, float]:
        """Calculate validation metrics for the trained models."""
        # Get predictions
        fail_pred = self.failure_classifier.predict_proba(X_val)[:, 1]
        severity_pred = self.severity_regressor.predict(X_val)
        
        # Calculate metrics
        from sklearn.metrics import accuracy_score, precision_score, recall_score, mean_squared_error, r2_score
        
        # Binary classification metrics for failure prediction
        fail_binary_pred = (fail_pred > 0.5).astype(int)
        accuracy = accuracy_score(y_fail_val, fail_binary_pred)
        precision = precision_score(y_fail_val, fail_binary_pred, zero_division=0)
        recall = recall_score(y_fail_val, fail_binary_pred, zero_division=0)
        
        # Regression metrics for severity prediction
        mse = mean_squared_error(y_severity_val, severity_pred)
        r2 = r2_score(y_severity_val, severity_pred)
        
        return {
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "severity_mse": mse,
            "severity_r2": r2,
            "validation_samples": len(X_val)
        }


class RecommendationEngine:
    def __init__(
        self,
        risk_forecaster: RiskForecaster,
        risk_threshold: float = 0.7,
        coverage_threshold: float = 0.8,
        performance_threshold: float = 1000,  # ms
        max_recommendations: int = 10
    ):
        self.risk_forecaster = risk_forecaster
        self.risk_threshold = risk_threshold
        self.coverage_threshold = coverage_threshold
        self.performance_threshold = performance_threshold
        self.max_recommendations = max_recommendations
        
        # Cache for recommendations
        self._cache: Dict[str, List[Recommendation]] = {}
        self._cache_timeout = timedelta(minutes=30)
        self._last_update = datetime.now()

    def get_recommendations(
        self,
        historical_data: List[Dict[str, Any]],
        current_coverage: Dict[str, float],
        force_refresh: bool = False
    ) -> List[Recommendation]:
        """Generate prioritized recommendations."""
        if not force_refresh and self._is_cache_valid():
            return self._get_cached_recommendations()
            
        recommendations: List[Recommendation] = []
        
        # Group data by endpoint
        endpoints = {}
        for entry in historical_data:
            endpoint = entry['endpoint']
            if endpoint not in endpoints:
                endpoints[endpoint] = []
            endpoints[endpoint].append(entry)
        
        # Analyze each endpoint
        for endpoint, data in endpoints.items():
            # Get risk metrics
            latest_data = data[-1]
            risk_metrics = self.risk_forecaster.predict_risk(latest_data)
            
            # Generate recommendations based on different factors
            self._add_risk_based_recommendations(
                recommendations, endpoint, risk_metrics, data
            )
            self._add_coverage_based_recommendations(
                recommendations, endpoint, current_coverage.get(endpoint, 0)
            )
            self._add_performance_recommendations(
                recommendations, endpoint, data
            )
            
        # Sort and limit recommendations
        recommendations.sort(key=lambda x: x.risk_score, reverse=True)
        recommendations = recommendations[:self.max_recommendations]
        
        # Update cache
        self._cache[datetime.now().isoformat()] = recommendations
        self._last_update = datetime.now()
        
        return recommendations

    def _add_risk_based_recommendations(
        self,
        recommendations: List[Recommendation],
        endpoint: str,
        risk_metrics: RiskMetrics,
        historical_data: List[Dict[str, Any]]
    ) -> None:
        """Add recommendations based on risk analysis."""
        if risk_metrics.failure_probability > self.risk_threshold:
            # Analyze failure patterns
            failure_patterns = self._analyze_failure_patterns(historical_data)
            
            recommendations.append(Recommendation(
                endpoint=endpoint,
                type='priority',
                severity='high' if risk_metrics.failure_probability > 0.8 else 'medium',
                description=f"High risk endpoint detected (failure probability: {risk_metrics.failure_probability:.2f})",
                action=f"Prioritize testing and review common failure patterns: {', '.join(failure_patterns)}",
                risk_score=risk_metrics.failure_probability,
                confidence=risk_metrics.confidence
            ))
            
            # Add retry strategy recommendation if needed
            if self._needs_retry_strategy(historical_data):
                recommendations.append(Recommendation(
                    endpoint=endpoint,
                    type='retry',
                    severity='medium',
                    description="Inconsistent failures detected",
                    action="Implement retry strategy with exponential backoff",
                    risk_score=risk_metrics.failure_probability * 0.8,
                    confidence=risk_metrics.confidence * 0.9
                ))

    def _add_coverage_based_recommendations(
        self,
        recommendations: List[Recommendation],
        endpoint: str,
        coverage: float
    ) -> None:
        """Add recommendations based on coverage analysis."""
        if coverage < self.coverage_threshold:
            recommendations.append(Recommendation(
                endpoint=endpoint,
                type='coverage',
                severity='medium',
                description=f"Low test coverage detected ({coverage:.1%})",
                action="Add tests for uncovered paths and edge cases",
                risk_score=1 - coverage,
                confidence=0.9
            ))

    def _add_performance_recommendations(
        self,
        recommendations: List[Recommendation],
        endpoint: str,
        historical_data: List[Dict[str, Any]]
    ) -> None:
        """Add recommendations based on performance analysis."""
        response_times = [d.get('response_time', 0) for d in historical_data]
        avg_response_time = np.mean(response_times) if response_times else 0
        
        if avg_response_time > self.performance_threshold:
            recommendations.append(Recommendation(
                endpoint=endpoint,
                type='performance',
                severity='medium',
                description=f"High average response time ({avg_response_time:.0f}ms)",
                action="Review endpoint performance and optimize if possible",
                risk_score=min(1.0, avg_response_time / self.performance_threshold),
                confidence=0.85
            ))

    def _analyze_failure_patterns(
        self,
        historical_data: List[Dict[str, Any]]
    ) -> List[str]:
        """Analyze and return common failure patterns."""
        failure_counts: Dict[str, int] = {}
        
        for entry in historical_data:
            if entry.get('failed', False):
                error_type = entry.get('error_type', 'unknown')
                failure_counts[error_type] = failure_counts.get(error_type, 0) + 1
        
        # Return most common failure types
        return [k for k, v in sorted(
            failure_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )[:3]]

    def _needs_retry_strategy(
        self,
        historical_data: List[Dict[str, Any]]
    ) -> bool:
        """Determine if endpoint needs a retry strategy."""
        recent_data = historical_data[-10:]  # Look at last 10 executions
        failures = [d.get('failed', False) for d in recent_data]
        
        if not failures:
            return False
        
        # Check for alternating success/failure pattern
        failure_rate = sum(failures) / len(failures)
        return 0.2 < failure_rate < 0.8  # Inconsistent failures

    def _is_cache_valid(self) -> bool:
        """Check if cached recommendations are still valid."""
        return (
            len(self._cache) > 0 and
            datetime.now() - self._last_update < self._cache_timeout
        )

    def _get_cached_recommendations(self) -> List[Recommendation]:
        """Get recommendations from cache."""
        if not self._cache:
            return []
        
        # Get most recent recommendations
        latest_key = max(self._cache.keys())
        return self._cache[latest_key]
