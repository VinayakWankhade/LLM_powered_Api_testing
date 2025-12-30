import json
import asyncio
import redis.asyncio as redis
from app.config import settings
from app.websocket.manager import manager
from app.utils.logger import log

class EventDispatcher:
    """
    The Bridge between Celery and WebSockets.
    
    Why?
    Celery workers run in different processes. They can't 'talk' to 
    the WebSocket connections in memory. This dispatcher uses Redis 
    Pub/Sub to bridge that gap.
    """
    CHANNEL = "ai_testgen_events"

    @staticmethod
    async def publish(project_id: str, event_data: dict):
        """Called by Workers to shout an update."""
        r = await redis.from_url(settings.REDIS_URL)
        message = {
            "project_id": project_id,
            "data": event_data
        }
        await r.publish(EventDispatcher.CHANNEL, json.dumps(message))
        await r.close()

    @staticmethod
    async def listen():
        """Called by FastAPI at startup to catch and whisper updates."""
        r = await redis.from_url(settings.REDIS_URL)
        pubsub = r.pubsub()
        await pubsub.subscribe(EventDispatcher.CHANNEL)
        
        log.info("WebSocket Dispatcher listening for background events...")
        
        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    payload = json.loads(message["data"])
                    project_id = payload["project_id"]
                    event_data = payload["data"]
                    
                    # Whisper to the connected users
                    await manager.broadcast_to_project(project_id, event_data)
        except Exception as e:
            log.error(f"Event Dispatcher error: {e}")
        finally:
            await pubsub.unsubscribe(EventDispatcher.CHANNEL)
            await r.close()

# Global sync-compatible publisher for Celery
def emit_event(project_id: str, event_data: dict):
    """
    Helper for Celery jobs (which are sync-wrapped) to send events.
    """
    # Use a separate sync redis client for the worker
    import redis as sync_redis
    r = sync_redis.from_url(settings.REDIS_URL)
    message = {
        "project_id": project_id,
        "data": event_data
    }
    r.publish("ai_testgen_events", json.dumps(message))
    r.close()
