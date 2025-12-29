from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, projects, endpoints, tests, analytics

app = FastAPI(title="AI TestGen API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(endpoints.router, prefix="/api/projects/{project_id}/endpoints", tags=["Endpoints"])
app.include_router(tests.router, prefix="/api/projects/{project_id}/tests", tags=["Tests"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
async def root():
    return {"message": "Welcome to AI TestGen API", "status": "Online"}
