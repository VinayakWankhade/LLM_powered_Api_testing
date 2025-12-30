from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.websocket.manager import manager
from app.security.jwt import decode_access_token
from app.db.session import async_session_maker
from app.services.project_service import ProjectService
from app.utils.logger import log

router = APIRouter(prefix="/ws", tags=["WebSocket"])

async def get_user_from_token(token: str):
    """Utility to verify JWT for WebSockets."""
    payload = decode_access_token(token)
    if not payload:
        return None
    return payload.get("sub") # Returns user_id string

@router.websocket("/projects/{project_id}")
async def project_websocket(
    websocket: WebSocket,
    project_id: UUID,
    token: str = Query(...)
):
    """
    WebSocket endpoint for real-time project updates.
    
    Flow:
    1. Authenticate JWT.
    2. Check if user owns the project.
    3. Accept connection and wait for events.
    """
    user_id_str = await get_user_from_token(token)
    if not user_id_str:
        log.warning("Unauthenticated WS connection attempted.")
        await websocket.close(code=1008) # Policy Violation
        return

    # Check ownership (we need a manual session here as we are in long-lived WS)
    p_id_str = str(project_id)
    u_id = UUID(user_id_str)
    
    async with async_session_maker() as db:
        try:
            await ProjectService.get_project(db, project_id, u_id)
        except Exception:
            log.warning(f"Unauthorized WS access to project {p_id_str}")
            await websocket.close(code=1008)
            return

    # Add to manager
    await manager.connect(websocket, p_id_str)
    
    try:
        while True:
            # Keep connection alive, though we mostly just PUSH from server
            data = await websocket.receive_text()
            # We can handle client messages here (e.g. "ping") if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket, p_id_str)
    except Exception as e:
        log.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, p_id_str)
