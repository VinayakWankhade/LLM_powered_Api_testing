from __future__ import annotations

from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.core.analysis.result_collector import ResultCollector, FailurePattern
from app.core.analysis.failure_analyzer import FailureAnalyzer
from app.core.analysis.coverage_reporter import CoverageReporter
from app.core.recommendation import RecommendationEngine, RiskForecaster, Recommendation
from app.dependencies import (
    get_knowledge_base,
    get_embedding_model,
    get_result_collector,
    get_failure_analyzer,
    get_coverage_reporter,
    get_risk_forecaster,
    get_recommendation_engine
)


router = APIRouter()


@router.get("/failures")
async def get_failure_patterns(
    hours: int = Query(24, description="Look back period in hours"),
    collector: ResultCollector = Depends(get_result_collector),
    analyzer: FailureAnalyzer = Depends(get_failure_analyzer)
) -> List[FailurePattern]:
    """Get failure patterns from recent test executions."""
    failures_df = collector.get_recent_failures(hours=hours)
    return analyzer.analyze_failures(failures_df)


@router.get("/statistics/endpoints")
async def get_endpoint_statistics(
    collector: ResultCollector = Depends(get_result_collector)
) -> Dict[str, Dict[str, Any]]:
    """Get statistics per endpoint."""
    return collector.get_endpoint_statistics()


@router.get("/coverage/report")
async def get_coverage_report(
    format: str = Query("json", description="Report format: json, csv, or html"),
    reporter: CoverageReporter = Depends(get_coverage_reporter)
) -> Any:
    """Get coverage report in specified format."""
    report = reporter.generate_coverage_report(format=format)
    
    if format == "json":
        return JSONResponse(content=report)
    elif format == "html":
        return HTMLResponse(content=report)
    elif format == "csv":
        return FileResponse(
            report,
            media_type="text/csv",
            filename=f"coverage_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        )
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")


@router.get("/coverage/trends")
async def get_coverage_trends(
    days: int = Query(7, description="Number of days to analyze"),
    reporter: CoverageReporter = Depends(get_coverage_reporter)
) -> Dict[str, List[float]]:
    """Get coverage trends over time."""
    return reporter.get_coverage_trends(days=days)


@router.get("/coverage/gaps")
async def get_coverage_gaps(
    reporter: CoverageReporter = Depends(get_coverage_reporter)
) -> Dict[str, List[str]]:
    """Get current coverage gaps."""
    return reporter.identify_coverage_gaps()


@router.get("/results/export")
async def export_results(
    format: str = Query("json", description="Export format: json, csv, or excel"),
    collector: ResultCollector = Depends(get_result_collector)
) -> Any:
    """Export test results in specified format."""
    try:
        data = collector.export_results(format=format)
        
        if format == "json":
            return JSONResponse(content=data)
        else:
            filename = f"test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{format}"
            return FileResponse(
                data,
                media_type=f"application/{format}",
                filename=filename
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class RiskAnalysisRequest(BaseModel):
    endpoint: str
    lookback_hours: Optional[int] = 24
    include_history: Optional[bool] = False


class UpdateModelRequest(BaseModel):
    force_retrain: Optional[bool] = False
    validation_split: Optional[float] = 0.2


@router.post("/risk/analyze")
async def analyze_risk(
    request: RiskAnalysisRequest,
    collector: ResultCollector = Depends(get_result_collector),
    forecaster: RiskForecaster = Depends(get_risk_forecaster)
) -> Dict[str, Any]:
    """Analyze risk for a specific endpoint."""
    # Get historical data
    history = collector.get_endpoint_history(
        endpoint=request.endpoint,
        hours=request.lookback_hours
    )
    
    if not history:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for endpoint {request.endpoint}"
        )
    
    # Get risk metrics
    metrics = forecaster.predict_risk(history[-1])
    
    response = {
        "endpoint": request.endpoint,
        "risk_metrics": {
            "failure_probability": metrics.failure_probability,
            "expected_failures": metrics.expected_failures,
            "severity_score": metrics.severity_score,
            "confidence": metrics.confidence,
            "last_updated": metrics.last_updated.isoformat()
        }
    }
    
    if request.include_history:
        response["history"] = history
        
    return response


@router.get("/risk/recommendations")
async def get_recommendations(
    hours: int = Query(24, description="Look back period in hours"),
    force_refresh: bool = Query(False, description="Force refresh recommendations"),
    collector: ResultCollector = Depends(get_result_collector),
    engine: RecommendationEngine = Depends(get_recommendation_engine),
    coverage: CoverageReporter = Depends(get_coverage_reporter)
) -> List[Dict[str, Any]]:
    """Get test optimization recommendations."""
    # Get historical data
    historical_data = collector.get_recent_results(hours=hours)
    
    # Get current coverage
    coverage_data = coverage.get_current_coverage()
    
    # Generate recommendations
    recommendations = engine.get_recommendations(
        historical_data=historical_data,
        current_coverage=coverage_data,
        force_refresh=force_refresh
    )
    
    return [
        {
            "endpoint": r.endpoint,
            "type": r.type,
            "severity": r.severity,
            "description": r.description,
            "action": r.action,
            "risk_score": r.risk_score,
            "confidence": r.confidence,
            "created_at": r.created_at.isoformat()
        }
        for r in recommendations
    ]


@router.post("/risk/update-models")
async def update_risk_models(
    request: UpdateModelRequest,
    background_tasks: BackgroundTasks,
    collector: ResultCollector = Depends(get_result_collector),
    forecaster: RiskForecaster = Depends(get_risk_forecaster)
) -> Dict[str, Any]:
    """Update risk prediction models."""
    if not request.force_retrain:
        # Check if we have new data that warrants retraining
        historical_data = collector.get_recent_results(hours=24)
        if len(historical_data) < 100:  # Arbitrary threshold
            return {
                "message": "Not enough new data for retraining",
                "status": "skipped"
            }
    
    # Get training data
    training_data = collector.get_recent_results(hours=168)  # Last week
    
    # Schedule model update in background
    def update_models():
        metrics = forecaster.train(
            historical_data=training_data,
            validation_split=request.validation_split
        )
        return metrics
    
    background_tasks.add_task(update_models)
    
    return {
        "message": "Model update scheduled",
        "status": "scheduled",
        "data_points": len(training_data)
    }


@router.get("/search")
async def semantic_search(
    q: str,
    k: int = 5,
    source: Optional[str] = None,
    kb = Depends(get_knowledge_base),
    embed = Depends(get_embedding_model),
) -> Dict[str, Any]:
    """Semantic search in the knowledge base."""
    vectors = embed.embed([q])
    where = {"source": source} if source else None
    result = kb.query(query_embeddings=vectors, n_results=k, where=where)
    return result


