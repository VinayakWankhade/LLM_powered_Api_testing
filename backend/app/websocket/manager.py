from fastapi import WebSocket
from typing import Dict, List
import json
from app.utils.logger import log

class ConnectionManager:
    """
    Manages WebSocket connections per project.
    
    Why this?
    We don't want to broadcast a scan status of Project A to 
    everyone. This manager groups connections by Project ID.
    """
    def __init__(self):
        # dictionary of {project_id: [list of WebSocket connections]}
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, project_id: str):
        """Accepts a connection and adds it to the project group."""
        await websocket.accept()
        if project_id not in self.active_connections:
            self.active_connections[project_id] = []
        self.active_connections[project_id].append(websocket)
        log.info(f"Client connected to project {project_id}. Total: {len(self.active_connections[project_id])}")

    def disconnect(self, websocket: WebSocket, project_id: str):
        """Removes a connection from the project group."""
        if project_id in self.active_connections:
            self.active_connections[project_id].remove(websocket)
            if not self.active_connections[project_id]:
                del self.active_connections[project_id]
        log.info(f"Client disconnected from project {project_id}")

    async def broadcast_to_project(self, project_id: str, message: dict):
        """Sends a message to everyone watching this specific project."""
        if project_id in self.active_connections:
            # We iterate over a copy to avoid 'size changed during iteration' errors
            for connection in self.active_connections[project_id][:]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    # If a connection is dead, remove it
                    log.error(f"Failed to send to socket: {e}")
                    self.active_connections[project_id].remove(connection)

# Global Manager Instance
manager = ConnectionManager()
