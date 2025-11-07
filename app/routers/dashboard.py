from __future__ import annotations

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime, timedelta

from app.dependencies import (
    get_coverage_reporter,
    get_failure_analyzer,
    get_result_collector,
    get_recommendation_engine,
    get_risk_forecaster,
    get_execution_scheduler,
    get_real_time_data_service
)


router = APIRouter(prefix="/api/dashboard")


class DashboardFilters(BaseModel):
    endpoint: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    test_type: Optional[str] = None
    severity: Optional[str] = None


@router.get("/overview")
async def get_dashboard_overview(
    real_time_service = Depends(get_real_time_data_service)
) -> Dict[str, Any]:
    """Get high-level dashboard metrics from real-time calculations."""
    return await real_time_service.get_live_dashboard_metrics()


@router.get("/coverage")
async def get_coverage_metrics(
    filters: DashboardFilters = Depends(),
    real_time_service = Depends(get_real_time_data_service)
) -> Dict[str, Any]:
    """Get detailed coverage metrics from real-time calculations."""
    metrics = await real_time_service.get_live_coverage_metrics()
    
    # Apply filters if specified
    if filters.endpoint:
        if "endpoint_coverage" in metrics:
            metrics["endpoint_coverage"] = {
                k: v for k, v in metrics["endpoint_coverage"].items()
                if k == filters.endpoint
            }
        if "parameter_coverage" in metrics:
            metrics["parameter_coverage"] = {
                k: v for k, v in metrics["parameter_coverage"].items()
                if k == filters.endpoint
            }
    
    return metrics


@router.get("/failures")
async def get_failure_metrics(
    filters: DashboardFilters = Depends(),
    real_time_service = Depends(get_real_time_data_service)
) -> Dict[str, Any]:
    """Get failure analysis metrics from real-time calculations."""
    # Convert filters to dict format
    filter_dict = {}
    if filters.endpoint:
        filter_dict["endpoint"] = filters.endpoint
    if filters.test_type:
        filter_dict["test_type"] = filters.test_type
    if filters.severity:
        filter_dict["severity"] = filters.severity
    if filters.start_date:
        filter_dict["start_date"] = filters.start_date
    if filters.end_date:
        filter_dict["end_date"] = filters.end_date
    
    return await real_time_service.get_live_failure_metrics(filter_dict)


@router.get("/analytics")
async def get_analytics_metrics(
    filters: DashboardFilters = Depends(),
    real_time_service = Depends(get_real_time_data_service)
) -> Dict[str, Any]:
    """Get analytics and optimization metrics from real-time calculations."""
    return await real_time_service.get_live_analytics_metrics()


@router.get("/realtime-metrics")
async def get_realtime_metrics(
    time_range: str = Query(default="1h", description="Time range for metrics (1h, 6h, 24h, 7d)"),
    real_time_service = Depends(get_real_time_data_service)
) -> Dict[str, Any]:
    """Get real-time dashboard metrics for the specified time range."""
    try:
        # Parse time range
        hours_map = {"1h": 1, "6h": 6, "24h": 24, "7d": 168}
        hours = hours_map.get(time_range, 1)
        
        # Get real-time metrics
        metrics = await real_time_service.get_live_dashboard_metrics()
        
        # Add time-specific data
        metrics.update({
            "time_range": time_range,
            "timestamp": datetime.utcnow().isoformat(),
            "total_tests_executed": metrics.get("total_tests", 0),
            "success_rate": metrics.get("success_rate", 0.0),
            "average_response_time": metrics.get("avg_response_time", 0.0),
            "active_endpoints": len(metrics.get("endpoint_coverage", {})),
            "failure_rate": 1.0 - metrics.get("success_rate", 0.0)
        })
        
        return metrics
    except Exception as e:
        return {
            "error": str(e),
            "time_range": time_range,
            "timestamp": datetime.utcnow().isoformat(),
            "total_tests_executed": 0,
            "success_rate": 0.0,
            "average_response_time": 0.0,
            "active_endpoints": 0,
            "failure_rate": 0.0
        }


@router.get("/risk")
async def get_risk_metrics(
    filters: DashboardFilters = Depends(),
    engine = Depends(get_recommendation_engine),
    collector = Depends(get_result_collector),
    coverage_reporter = Depends(get_coverage_reporter)
) -> Dict[str, Any]:
    """Get risk predictions and recommendations."""
    historical_data = collector.get_recent_results(hours=24)
    coverage = coverage_reporter.get_current_coverage()
    
    recommendations = engine.get_recommendations(
        historical_data=historical_data,
        current_coverage=coverage
    )
    
    return {
        "recommendations": [
            {
                "endpoint": r.endpoint,
                "type": r.type,
                "severity": r.severity,
                "description": r.description,
                "action": r.action,
                "risk_score": r.risk_score,
                "confidence": r.confidence
            }
            for r in recommendations
        ],
        "risk_trends": collector.get_risk_trends(days=7),
        "high_risk_endpoints": [
            {
                "endpoint": e,
                "risk_score": engine.risk_forecaster.predict_risk(
                    collector.get_endpoint_data(e)
                ).failure_probability
            }
            for e in collector.get_endpoints()
        ]
    }