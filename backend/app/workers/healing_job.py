import asyncio
from uuid import UUID
from app.workers.celery_app import celery_app
from app.services.self_healing_service import SelfHealingService
from app.db.session import async_session_maker
from app.utils.logger import log
from app.websocket.dispatcher import emit_event

@celery_app.task(bind=True, name="app.workers.healing_job.run_self_healing")
def run_self_healing(self, project_id: str, test_case_id: str):
    log.info(f"Self-healing worker triggered for test: {test_case_id}")
    
    # Emit Start Event
    emit_event(project_id, {"event": "HEALING_STATUS", "test_id": test_case_id, "status": "STARTED", "message": "Analyzing failure..."})
    
    async def execute():
        async with async_session_maker() as db:
            result = await SelfHealingService.heal_test_case(db, UUID(test_case_id))
            return result

    try:
        loop = asyncio.get_event_loop()
        result = loop.run_until_complete(execute())
        
        # Emit Success Event
        emit_event(project_id, {
            "event": "HEALING_STATUS", 
            "test_id": test_case_id, 
            "status": "HEALED", 
            "message": f"Test healed! {result.get('reason', '')}"
        })
        
        return result
    except Exception as e:
        log.error(f"Self-healing job failed: {e}")
        emit_event(project_id, {"event": "HEALING_STATUS", "test_id": test_case_id, "status": "FAILED", "message": f"Healing failed: {str(e)}"})
        return {"status": "FAILED", "error": str(e)}
