import logging
from fastapi import FastAPI, Request, WebSocket, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import APIKeyHeader
from fastapi.websockets import WebSocketDisconnect, WebSocketState

from app.core.config import settings
from app.routers import ingest, execution, analytics, generation, healing, dashboard, real_time_testing, feedback, workflow, reports

# Configure logging
logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)

# API Key security scheme
api_key_header = APIKeyHeader(name=settings.API_KEY_HEADER)

# Initialize WebSocket manager
from app.core.websocket_manager import ConnectionManager
manager = ConnectionManager()

def create_app() -> FastAPI:
    app = FastAPI(
        title="Hybrid Agentic RL API Testing Framework",
        description="Advanced API testing framework with RL-based optimization",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Error handling middleware
    @app.middleware("http")
    async def error_handling_middleware(request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            logger.error(f"Request error: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal server error"}
            )

    # Register routers
    app.include_router(ingest.router, prefix="/ingest", tags=["ingest"])
    app.include_router(execution.router, prefix="/execute", tags=["execution"])
    app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
    app.include_router(generation.router, prefix="/generate", tags=["generation"])
    # healing router already declares its own prefix; avoid double-prefixing
    app.include_router(healing.router, tags=["healing"])
    app.include_router(dashboard.router, tags=["dashboard"])
    app.include_router(real_time_testing.router, tags=["real-time-testing"])
    app.include_router(feedback.router, prefix="/api/feedback", tags=["feedback"])
    app.include_router(workflow.router, prefix="/api/workflow", tags=["workflow"])
    app.include_router(reports.router, tags=["reports"])  # /api/reports

    @app.get("/health")
    async def health() -> dict:
        """Health check endpoint"""
        return {
            "status": "ok",
            "version": "1.0.0",
            "environment": "development" if settings.LOG_LEVEL == "DEBUG" else "production"
        }

    @app.on_event("startup")
    async def startup_event():
        """Initialize services on startup"""
        logger.info("Starting API server...")
        # Initialize services here if needed

    @app.on_event("shutdown")
    async def shutdown_event():
        """Cleanup on shutdown"""
        logger.info("Shutting down API server...")
        # Cleanup resources here if needed

    @app.websocket("/ws/{channel}")
    async def websocket_endpoint(websocket: WebSocket, channel: str, client_id: str = Query(None)):
        try:
            await manager.connect(websocket, client_id, channel)
            while True:
                try:
                    data = await websocket.receive_text()
                    await manager.send_personal_message(
                        {"type": "echo", "data": data},
                        websocket
                    )
                except WebSocketDisconnect:
                    manager.disconnect(websocket, channel)
                    break
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
            if websocket.client_state != WebSocketState.DISCONNECTED:
                await websocket.close()

    return app

app = create_app()


