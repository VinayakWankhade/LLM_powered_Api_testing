"""
Real-time testing controller that starts continuous testing and provides live metrics.
"""

import asyncio
import logging
from typing import Dict, Any
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from app.dependencies import get_knowledge_base, get_real_time_data_service
from app.services.test_execution_simulator import TestExecutionSimulator
from app.services.real_time_data import RealTimeDataService
from app.core.websocket_manager import ConnectionManager

# Initialize WebSocket manager
websocket_manager = ConnectionManager()

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/testing", tags=["real-time-testing"])

# Global simulator instance
_simulator: TestExecutionSimulator = None
_testing_task = None


def get_simulator():
    global _simulator
    if _simulator is None:
        from app.dependencies import get_knowledge_base
        kb = get_knowledge_base()
        _simulator = TestExecutionSimulator(kb)
    return _simulator


@router.post("/start")
async def start_real_time_testing(
    background_tasks: BackgroundTasks,
    interval_seconds: int = 30
) -> Dict[str, Any]:
    """Start continuous real-time testing to generate live data"""
    global _testing_task
    
    if _testing_task and not _testing_task.done():
        return {
            "status": "already_running",
            "message": "Real-time testing is already running"
        }
    
    try:
        simulator = get_simulator()
        
        # Start continuous testing in background
        async def run_testing():
            while True:
                # Run test cycle
                results = await simulator._execute_test_cycle()
                
                # Broadcast results to all connected clients
                await websocket_manager.broadcast(
                    {
                        "type": "test_results",
                        "data": {
                            "execution_stats": simulator.get_execution_stats(),
                            "coverage_stats": simulator.get_coverage_stats(),
                            "failure_patterns": simulator.get_failure_patterns(),
                            "latest_results": results
                        }
                    },
                    channel="testing"
                )
                
                await asyncio.sleep(interval_seconds)
        
        _testing_task = asyncio.create_task(run_testing())
        
        logger.info(f"Started real-time testing with {interval_seconds}s interval")
        
        return {
            "status": "started",
            "message": f"Real-time testing started with {interval_seconds} second intervals",
            "interval_seconds": interval_seconds
        }
        
    except Exception as e:
        logger.error(f"Failed to start real-time testing: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start testing: {str(e)}")


@router.post("/stop")
async def stop_real_time_testing() -> Dict[str, Any]:
    """Stop continuous real-time testing"""
    global _testing_task
    
    if not _testing_task or _testing_task.done():
        return {
            "status": "not_running",
            "message": "Real-time testing is not currently running"
        }
    
    try:
        _testing_task.cancel()
        try:
            await _testing_task
        except asyncio.CancelledError:
            pass
        
        logger.info("Stopped real-time testing")
        
        return {
            "status": "stopped",
            "message": "Real-time testing has been stopped"
        }
        
    except Exception as e:
        logger.error(f"Failed to stop real-time testing: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to stop testing: {str(e)}")


@router.get("/status")
async def get_testing_status() -> Dict[str, Any]:
    """Get current status of real-time testing"""
    global _testing_task
    
    is_running = _testing_task and not _testing_task.done()
    
    status_info = {
        "is_running": is_running,
        "task_status": None,
        "execution_stats": {},
        "coverage_stats": {},
        "failure_patterns": []
    }
    
    if _testing_task:
        if _testing_task.done():
            try:
                _testing_task.result()
                status_info["task_status"] = "completed"
            except asyncio.CancelledError:
                status_info["task_status"] = "cancelled"
            except Exception as e:
                status_info["task_status"] = f"failed: {str(e)}"
        else:
            status_info["task_status"] = "running"
    
    # Get statistics from simulator if available
    if _simulator:
        status_info["execution_stats"] = _simulator.get_execution_stats()
        status_info["coverage_stats"] = _simulator.get_coverage_stats()
        status_info["failure_patterns"] = _simulator.get_failure_patterns()
    
    return status_info


@router.get("/live-metrics")
async def get_live_metrics(
    real_time_service: RealTimeDataService = Depends(get_real_time_data_service)
) -> Dict[str, Any]:
    """Get comprehensive live metrics from real-time data service"""
    try:
        # Get all live metrics
        dashboard_metrics = await real_time_service.get_live_dashboard_metrics()
        coverage_metrics = await real_time_service.get_live_coverage_metrics()
        failure_metrics = await real_time_service.get_live_failure_metrics()
        analytics_metrics = await real_time_service.get_live_analytics_metrics()
        
        # Add simulator-specific stats if available
        simulator_stats = {}
        if _simulator:
            simulator_stats = {
                "execution_stats": _simulator.get_execution_stats(),
                "coverage_stats": _simulator.get_coverage_stats(),
                "failure_patterns": _simulator.get_failure_patterns()
            }
        
        return {
            "dashboard": dashboard_metrics,
            "coverage": coverage_metrics,
            "failures": failure_metrics,
            "analytics": analytics_metrics,
            "simulator": simulator_stats,
            "testing_active": _testing_task and not _testing_task.done() if _testing_task else False
        }
        
    except Exception as e:
        logger.error(f"Failed to get live metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")


@router.post("/run-single-cycle")
async def run_single_test_cycle() -> Dict[str, Any]:
    """Run a single test cycle to generate immediate data"""
    try:
        simulator = get_simulator()
        
        # Run one test cycle
        results = await simulator._execute_test_cycle()
        
        # Get updated stats
        execution_stats = simulator.get_execution_stats()
        coverage_stats = simulator.get_coverage_stats()
        failure_patterns = simulator.get_failure_patterns()
        
        # Broadcast results to WebSocket clients
        await websocket_manager.broadcast(
            {
                "type": "test_results",
                "data": {
                    "execution_stats": execution_stats,
                    "coverage_stats": coverage_stats,
                    "failure_patterns": failure_patterns,
                    "latest_results": results
                }
            },
            channel="testing"
        )
        
        return {
            "status": "completed",
            "message": "Single test cycle completed",
            "execution_stats": execution_stats,
            "coverage_stats": coverage_stats
        }
        
    except Exception as e:
        logger.error(f"Failed to run test cycle: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to run test cycle: {str(e)}")


@router.get("/simulator-stats")
async def get_simulator_stats() -> Dict[str, Any]:
    """Get detailed statistics from the test execution simulator"""
    if not _simulator:
        return {
            "status": "not_initialized",
            "message": "Test simulator is not initialized"
        }
    
    try:
        return {
            "execution_stats": _simulator.get_execution_stats(),
            "coverage_stats": _simulator.get_coverage_stats(),
            "failure_patterns": _simulator.get_failure_patterns(),
            "recent_results_count": len(_simulator.results_db),
            "execution_history_count": len(_simulator.execution_history)
        }
        
    except Exception as e:
        logger.error(f"Failed to get simulator stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")


@router.delete("/clear-data")
async def clear_testing_data() -> Dict[str, Any]:
    """Clear all collected testing data and reset simulator"""
    global _simulator
    
    try:
        if _simulator:
            _simulator.execution_history.clear()
            _simulator.results_db.clear()
        
        return {
            "status": "cleared",
            "message": "All testing data has been cleared"
        }
        
    except Exception as e:
        logger.error(f"Failed to clear data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to clear data: {str(e)}")