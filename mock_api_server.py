#!/usr/bin/env python3
"""
Simple mock API server to test frontend routes
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime

app = FastAPI(title="Mock API Test Server")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/dashboard/coverage")
async def get_coverage():
    return {
        "endpoint_coverage": {
            "/api/users": 0.85,
            "/api/orders": 0.92,
            "/api/products": 0.78,
            "/api/auth": 0.95
        },
        "parameter_coverage": {
            "/api/users": 0.80,
            "/api/orders": 0.88,
            "/api/products": 0.75,
            "/api/auth": 0.90
        },
        "coverage_trends": {
            "endpoint_coverage": [0.70, 0.75, 0.80, 0.85, 0.88, 0.90, 0.92]
        },
        "coverage_gaps": {
            "/api/users": ["Missing pagination tests", "No error handling tests"],
            "/api/orders": ["Missing edge case tests"],
            "/api/products": ["No performance tests", "Missing validation tests"]
        }
    }

@app.get("/api/dashboard/failures")
async def get_failures():
    return {
        "failure_patterns": [
            {
                "pattern_id": "timeout_001",
                "error_type": "TimeoutError",
                "frequency": 15,
                "affected_endpoints": ["/api/users", "/api/orders"],
                "affected_methods": ["GET", "POST"],
                "probable_cause": "Database connection timeout",
                "error_messages": ["Connection timeout after 30s"]
            },
            {
                "pattern_id": "validation_002",
                "error_type": "ValidationError",
                "frequency": 8,
                "affected_endpoints": ["/api/products"],
                "affected_methods": ["POST", "PUT"],
                "probable_cause": "Invalid input parameters",
                "error_messages": ["Required field missing"]
            }
        ],
        "failure_trends": {
            "2024-01-01": 5,
            "2024-01-02": 8,
            "2024-01-03": 12,
            "2024-01-04": 6,
            "2024-01-05": 3
        },
        "failure_types": {
            "TimeoutError": 15,
            "ValidationError": 8,
            "AuthenticationError": 3,
            "ServerError": 2
        },
        "retry_success_rate": 0.75
    }

@app.get("/api/dashboard/analytics")
async def get_analytics():
    return {
        "execution_trends": {
            "total_executions": [100, 120, 150, 180, 200, 220, 250],
            "success_rate": [0.85, 0.88, 0.90, 0.92, 0.89, 0.91, 0.93],
            "avg_duration": [1.2, 1.1, 1.0, 0.9, 1.1, 1.0, 0.8],
            "dates": ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-05", "2024-01-06", "2024-01-07"]
        },
        "optimization_metrics": {
            "coverage_improvement": 15.5,
            "execution_time_saved": 24.3,
            "resource_efficiency": 1.8,
            "policy_updates": 12
        },
        "performance_metrics": {
            "avg_response_time": 245,
            "p95_response_time": 890,
            "execution_success_rate": 0.92
        },
        "resource_utilization": {
            "cpu_usage": [45, 52, 48, 55, 60, 58, 50],
            "memory_usage": [65, 70, 68, 72, 75, 73, 69],
            "timestamps": ["10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30"]
        }
    }

@app.get("/api/dashboard/risk")
async def get_risk():
    return {
        "recommendations": [
            {
                "endpoint": "/api/users",
                "type": "performance",
                "severity": "high",
                "description": "High response time detected",
                "action": "Optimize database queries and add caching",
                "risk_score": 0.85,
                "confidence": 0.92
            },
            {
                "endpoint": "/api/orders",
                "type": "reliability",
                "severity": "medium",
                "description": "Intermittent timeout issues",
                "action": "Increase connection pool size",
                "risk_score": 0.65,
                "confidence": 0.78
            },
            {
                "endpoint": "/api/products",
                "type": "security",
                "severity": "low",
                "description": "Missing input validation",
                "action": "Add comprehensive input validation",
                "risk_score": 0.35,
                "confidence": 0.88
            }
        ],
        "risk_trends": [
            {"date": "2024-01-01", "high_risk": 2, "medium_risk": 5, "low_risk": 8},
            {"date": "2024-01-02", "high_risk": 3, "medium_risk": 4, "low_risk": 7},
            {"date": "2024-01-03", "high_risk": 1, "medium_risk": 6, "low_risk": 9},
            {"date": "2024-01-04", "high_risk": 2, "medium_risk": 3, "low_risk": 10},
            {"date": "2024-01-05", "high_risk": 1, "medium_risk": 4, "low_risk": 8}
        ],
        "high_risk_endpoints": [
            {"endpoint": "/api/users", "risk_score": 0.85},
            {"endpoint": "/api/orders", "risk_score": 0.65},
            {"endpoint": "/api/auth", "risk_score": 0.45}
        ]
    }

@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)