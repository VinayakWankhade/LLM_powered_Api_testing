# LLM-Based API Testing Framework — In-Depth Overview

This repository implements an intelligent, hybrid API testing framework that combines knowledge extraction (from OpenAPI/specs, documentation, and logs), LLM-assisted test generation (RAG + LLMs), reinforcement-learning based test prioritization/optimization, and an execution engine that aggregates coverage and failure analysis. The stack is primarily FastAPI (backend) and a Vite + React frontend.

This document gives a developer-oriented, in-depth walkthrough: architecture, components, setup, API reference, WebSocket realtime flows, testing, troubleshooting, and contribution guidelines.

---

## Table of Contents
- Project overview
- Architecture and components
- Running the project (backend & frontend)
- Environment variables and configuration
- API endpoints summary
- WebSocket realtime behaviour
- Scripts and utilities
- Testing & QA
- Troubleshooting / common issues
- Development notes & best practices
- Directory layout (detailed)
- Contribution

---

## Project overview

Goals:
- Automatically discover and ingest API specs, docs, and logs.
- Generate high-quality test cases using retrieval-augmented generation (RAG) + LLMs.
- Execute tests with a hybrid engine (parallel/sequential where applicable).
- Continuously collect coverage/failures and feed insights back for optimization and healing.
- Provide a web UI for orchestration and live monitoring (via WebSockets).

Key behaviours:
- Ingestion pipeline (parsing, chunking, embedding, vector store)
- Test generation service (RAG + LLM prompts)
- Test execution & coverage aggregation
- RL optimizer to prioritize test cases over time
- Auto-healing to adapt brittle tests

## Architecture and components

High-level components:

- Backend (FastAPI)
  - `app/core/` — core services and business logic (analysis, execution, RL, healing)
  - `app/routers/` — HTTP endpoints for ingestion, generation, execution, analytics, workflow, feedback, real-time testing, etc.
  - `app/services/` — service-layer implementations (ingestion, embeddings, execution simulation)
  - `app/core/websocket_manager.py` — connection manager that handles channel-based WebSocket broadcasting

- Frontend (Vite + React)
  - `frontend/src/` — React components, hooks, and services
  - `frontend/src/services/websocket.ts` — client-side WebSocket helper (reconnect, subscribe/unsubscribe)
  - `frontend/src/hooks/useWebSocket.ts` — React hook to consume WebSocket messages in components
  - `frontend/src/components/` — UI (dashboard, workflow views, real-time testing)

- Scripts & tooling
  - `scripts/check_routes.py` — route consistency checker between frontend usage and backend routers
  - `mock_api_server.py` — local mock server for target API testing
  - `tests/` — automated test suites (pytest)

- Data & configuration
  - `api/specs/` — sample OpenAPI spec files
  - `config/`, `data/policy.json` — runtime configuration

## Quickstart — setup & run (Windows / PowerShell)

1) Create a Python virtual environment and install backend deps

```powershell
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
```

2) Start the backend (development)

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3) Frontend (from repository root)

```powershell
cd frontend
npm install
npm run dev
# or: yarn && yarn dev
```

Notes:
- The FastAPI server exposes Swagger UI at `/docs` by default.
- The frontend is configured by `frontend/.env` and expects a `VITE_API_BASE_URL` value; without it it will default to the current host.

## Environment & configuration

Backend config is read via `app/core/config.py` (settings object). Important values you may need to set in your environment or a local `.env` file:

- API_KEY_HEADER — name of API key header if API key auth is used
- LOG_LEVEL — DEBUG/INFO
- CORS_ORIGINS — allowed frontend origins (list)

Frontend env (create `frontend/.env`):

```text
VITE_API_BASE_URL=localhost:8000
# If your frontend runs on a different port: VITE_API_BASE_URL=localhost:8000
```

## API endpoints — summary

The backend mounts routers under prefixes in `app/main.py`. Primary routes include:

- `GET /health` — health check
- `POST /ingest/*` — ingestion endpoints for specs/docs/logs
- `POST /generate/*` — test generation endpoints (RAG + LLM)
- `POST /execute/*` — start execution, run test cycles
- `GET /analytics/*` — metrics, coverage, failure patterns
- `POST /api/testing/*` — real-time testing control (start/stop/status)
- `POST /api/feedback/*` — feedback endpoints
- `POST /api/workflow/*` — workflow orchestration (start/scan/execute)

Refer to the running server's Swagger UI (`/docs`) for a complete, interactive reference. Example usage:

Curl examples (select):

```powershell
# Health
curl http://localhost:8000/health

# Start a real-time testing job
curl -X POST http://localhost:8000/api/testing/start -H "Content-Type: application/json" -d '{"interval_seconds":30}'

# Run a workflow (multipart form)
curl -X POST http://localhost:8000/api/workflow/execute-complete -F "mern_app_path=./sample_mern_project" -F "target_api_running=true"
```

## WebSocket realtime behavior

Realtime channels are provided via a WebSocket endpoint added to `app/main.py`:

- `ws://<host>/ws/{channel}?client_id=<id>`

Server responsibilities:
- Accept connections and manage them via `app.core.websocket_manager.ConnectionManager`.
- Broadcast messages to a named channel (for instance, `testing`) when realtime events occur (test cycle results, coverage updates, analytics)

Client responsibilities:
- Connect to the desired channel and pass a `client_id` query parameter (the frontend helper generates one automatically).
- Subscribe to message types (payloads include `type` and `data` fields). Example message shape:

```json
{
  "type": "test_results",
  "data": {
     "execution_stats": {...},
     "coverage_stats": {...},
     "latest_results": [...]
  }
}
```

Frontend helpers:
- `frontend/src/services/websocket.ts` — handles connection, auto-reconnect, subscribe/unsubscribe
- `frontend/src/hooks/useWebSocket.ts` — React hook wrapper for convenience

Troubleshooting tips:
- If connections fail in development, ensure CORS and proxies are configured and that you use `ws://` for HTTP and `wss://` for HTTPS. The frontend helper computes `ws(s)` automatically from the current location.

## Scripts and utilities

- `scripts/check_routes.py` — checks consistency between frontend-expected API routes and backend router registration. Run:

```powershell
python scripts/check_routes.py
```

- `mock_api_server.py` — small mock target API server useful for running tests against predictable responses.

## Testing & QA

Project tests are under `tests/` and are run with `pytest`.

```powershell
pip install -r requirements.txt  # ensure test deps installed
pytest -q
```

Add fast tests for components you change and prefer small, deterministic unit tests for the `app/core` logic. For WebSocket behaviour, use `websockets` or `starlette.testclient.WebSocketTestSession` in tests.

## Troubleshooting — common issues

- Received NaN for the `value` attribute (React input)
  - Symptom: frontend console shows "Received NaN for the `value` attribute" and points to `WorkflowView`.
  - Cause: some workflow items may not include `progress` (undefined/null). The UI attempted to compute `(workflow.progress * 100).toFixed(0)` which yields `NaN`.
  - Fix: ensure the UI checks for a numeric value before formatting. See `frontend/src/components/views/WorkflowView.tsx` — the code has been updated to display a default of `0%` when `progress` is not a number.

- WebSocket connection refused or immediately closed
  - Ensure the backend is running and the WebSocket endpoint is registered in `app/main.py` at `/ws/{channel}`.
  - For secure contexts, use `wss://` (HTTPS) and update `VITE_API_BASE_URL` accordingly.

- CORS errors from the frontend
  - Ensure `app/main.py`'s `CORS_ORIGINS` include the frontend origin (for dev: `http://localhost:3000` or the actual Vite port). Restart backend after changing settings.

## Development notes & best practices

- Keep the LLM prompt templates minimal and data-backed — store common prompts in `app/core` or a templates folder for shared maintenance.
- Isolate heavy ML/embedding jobs into background workers/processes for production-ready deployments (e.g., Celery, RQ).
- Use the route-checker script (`scripts/check_routes.py`) when you add frontend routes or rename backend routers.

## Directory layout (detailed)

Top-level (important files and folders):

- `app/` — Backend source
  - `app/main.py` — FastAPI app factory, middleware, websocket endpoint registration
  - `app/core/` — core modules: `analysis.py`, `execution_engine.py`, `websocket_manager.py`, `rl_optimizer.py`, `policy_manager.py`
  - `app/routers/` — individual router modules (`ingest.py`, `execution.py`, `analytics.py`, `generation.py`, `real_time_testing.py`, `workflow.py`, etc.)
- `frontend/` — Vite + React app
  - `src/services/websocket.ts` — client singleton
  - `src/hooks/useWebSocket.ts` — hook wrapper
  - `src/components/` — Dashboard and view components
- `scripts/` — helpful automation, route checker
- `tests/` — pytest suites
- `api/specs/` — sample API specs for ingestion & demo

## How to verify the integration quickly

1. Start the backend and frontend per Quickstart above.
2. Open backend Swagger UI at `http://localhost:8000/docs` to confirm endpoints.
3. Open the frontend (Vite dev URL) and navigate to the dashboard / real-time testing pages.
4. Start a real-time test job via the frontend UI or via curl:

```powershell
curl -X POST http://localhost:8000/api/testing/start -H "Content-Type: application/json" -d '{"interval_seconds":5}'
```

5. Watch the dashboard update via WebSocket messages.
6. Use `python scripts/check_routes.py` to detect route mismatches.

## Contribution

1. Fork the repository and create a feature branch.
2. Add tests for new behaviour and run `pytest`.
3. Follow existing code style and use small, focused PRs.

## Where to go next / Suggested improvements

- Add a Docker Compose file to orchestrate backend, frontend, and any vector DB (Chroma/Redis) for easy local dev.
- Add an integration test that starts uvicorn and the frontend in CI and validates a WebSocket-driven workflow.
- Extract heavy LLM/embedding workloads into an async worker; add metrics for RL optimizer performance.

---

If you'd like, I can also:

- generate a `docker-compose.yml` that brings up the backend, frontend, and a local vector DB for easy testing;
- add an 'examples' section that walks through a full end-to-end run with a sample MERN app in `sample_mern_project`;
- produce a lightweight architecture diagram (Mermaid or SVG) showing data flow.

Tell me which of those you'd like next and I will add them to the repo.
