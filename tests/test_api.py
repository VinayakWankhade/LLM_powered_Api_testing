import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_coverage_endpoint():
    async with AsyncClient(app=app, base_url="http://localhost:8000") as client:
        response = await client.get("/api/dashboard/coverage")
        assert response.status_code == 200
        data = response.json()
        assert "endpoint_coverage" in data
        assert "parameter_coverage" in data
        assert "coverage_trends" in data
        assert "coverage_gaps" in data

@pytest.mark.asyncio
async def test_failures_endpoint():
    async with AsyncClient(app=app, base_url="http://localhost:8000") as client:
        response = await client.get("/api/dashboard/failures")
        assert response.status_code == 200
        data = response.json()
        assert "failure_patterns" in data
        assert "failure_trends" in data
        assert "failure_types" in data

@pytest.mark.asyncio
async def test_risk_endpoint():
    async with AsyncClient(app=app, base_url="http://localhost:8000") as client:
        response = await client.get("/api/dashboard/risk")
        assert response.status_code == 200
        data = response.json()
        assert "recommendations" in data
        assert "risk_trends" in data
        assert "high_risk_endpoints" in data

@pytest.mark.asyncio
async def test_overview_endpoint():
    async with AsyncClient(app=app, base_url="http://localhost:8000") as client:
        response = await client.get("/api/dashboard/overview")
        assert response.status_code == 200
        data = response.json()
        assert "total_tests" in data
        assert "total_endpoints" in data
        assert "overall_coverage" in data
        assert "failure_rate" in data