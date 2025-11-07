"""
WebSocket manager for real-time updates
"""

from typing import Dict, Set, Any
from fastapi import WebSocket
import json
import asyncio
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {
            "test_updates": set(),
            "metrics": set(),
            "alerts": set()
        }
        
    async def connect(self, websocket: WebSocket, client_id: str, channel: str):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = set()
        self.active_connections[channel].add(websocket)
        logger.info(f"Client {client_id} connected to channel {channel}")
    
    def disconnect(self, websocket: WebSocket, channel: str):
        self.active_connections[channel].remove(websocket)
        logger.info(f"Client disconnected from channel {channel}")
    
    async def broadcast_to_channel(self, message: Dict[str, Any], channel: str):
        if channel in self.active_connections:
            dead_connections = set()
            for connection in self.active_connections[channel]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to client: {e}")
                    dead_connections.add(connection)
            
            # Clean up dead connections
            for dead in dead_connections:
                self.active_connections[channel].remove(dead)
    
    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            
    async def broadcast_metrics(self, metrics: Dict[str, Any]):
        await self.broadcast_to_channel(
            {"type": "metrics", "data": metrics},
            "metrics"
        )
    
    async def broadcast_test_update(self, update: Dict[str, Any]):
        await self.broadcast_to_channel(
            {"type": "test_update", "data": update},
            "test_updates"
        )
    
    async def broadcast_alert(self, alert: Dict[str, Any]):
        await self.broadcast_to_channel(
            {"type": "alert", "data": alert},
            "alerts"
        )