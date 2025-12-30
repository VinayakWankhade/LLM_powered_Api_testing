from asyncio import create_task, CancelledError
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.utils.logger import log
from app.api.routes import health, auth, projects, scanning, tests, websocket, analytics, api_keys
from app.websocket.dispatcher import EventDispatcher

@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info(f"Starting {settings.APP_NAME} in {settings.ENV} mode...")
    dispatcher_task = create_task(EventDispatcher.listen())
    yield
    log.info(f"Shutting down {settings.APP_NAME}...")
    dispatcher_task.cancel()
    try:
        await dispatcher_task
    except CancelledError:
        log.info("WebSocket Dispatcher task cancelled successfully.")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Enterprise-grade AI-powered API Test Generation Platform",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route Mounting
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(scanning.router, prefix=settings.API_V1_STR)
app.include_router(tests.router, prefix=settings.API_V1_STR)
app.include_router(websocket.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(api_keys.router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "docs": "/docs"
    }
