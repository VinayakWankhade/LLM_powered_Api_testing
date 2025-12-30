import asyncio
from app.workers.celery_app import celery_app
from app.services.scanner_service import ScannerService
from app.db.session import async_session_maker
from app.utils.logger import log
from app.websocket.dispatcher import emit_event
from uuid import UUID

@celery_app.task(bind=True, name="app.workers.scan_job.run_scan")
def run_scan(self, project_id: str, git_url: str):
    log.info(f"Starting background scan job for project: {project_id}")
    p_id = UUID(project_id)
    
    # Emit Start Event
    emit_event(project_id, {"event": "SCAN_PROGRESS", "percentage": 10, "message": "Cloning repository..."})
    
    async def execute():
        async with async_session_maker() as db:
            # We add a progress callback if the service supports it (future proofing)
            # For now, we'll just emit events here at key milestones
            result = await ScannerService.scan_project_codebase(db, p_id, git_url)
            return result

    try:
        emit_event(project_id, {"event": "SCAN_PROGRESS", "percentage": 30, "message": "Analyzing codebase..."})
        
        loop = asyncio.get_event_loop()
        count = loop.run_until_complete(execute())
        
        emit_event(project_id, {"event": "SCAN_PROGRESS", "percentage": 100, "message": "Scan complete!"})
        emit_event(project_id, {"event": "JOB_COMPLETED", "job_type": "scan", "count": count})
        
        log.info(f"Background job finished! Found {count} endpoints.")
        return {"status": "SUCCESS", "endpoints_found": count}
        
    except Exception as e:
        emit_event(project_id, {"event": "SCAN_PROGRESS", "percentage": 0, "message": f"Scan failed: {str(e)}"})
        log.error(f"Background job failed: {e}")
        raise self.retry(exc=e, countdown=10)
