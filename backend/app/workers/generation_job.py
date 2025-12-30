import asyncio
from typing import List
from uuid import UUID

from app.workers.celery_app import celery_app
from app.services.test_generator_service import TestGeneratorService
from app.db.session import async_session_maker
from app.domain.models.test_case import TestCase
from app.utils.logger import log
from app.websocket.dispatcher import emit_event

@celery_app.task(bind=True, name="app.workers.generation_job.batch_generate_tests")
def batch_generate_tests(self, project_id: str, endpoint_ids: List[str]):
    log.info(f"Starting background generation for {len(endpoint_ids)} endpoints.")
    
    # Emit Start Event
    emit_event(project_id, {"event": "GENERATION_PROGRESS", "percentage": 0, "message": "Initializing AI brain..."})
    
    async def execute():
        success_count = 0
        total = len(endpoint_ids)
        
        async with async_session_maker() as db:
            for index, ep_id_str in enumerate(endpoint_ids):
                try:
                    ep_id = UUID(ep_id_str)
                    
                    # Update Progress
                    percent = int(((index) / total) * 100)
                    emit_event(project_id, {
                        "event": "GENERATION_PROGRESS", 
                        "percentage": percent, 
                        "message": f"Generating test {index + 1}/{total}..."
                    })
                    
                    # 1. Generate text via AI
                    ai_data = await TestGeneratorService.generate_single_test(db, ep_id)
                    
                    # 2. Save to database
                    test_case = TestCase(
                        endpoint_id=ep_id,
                        description=ai_data["description"],
                        priority=ai_data["priority"],
                        test_code=ai_data["test_code"],
                        status="DRAFT"
                    )
                    db.add(test_case)
                    await db.commit()
                    success_count += 1
                    
                except Exception as e:
                    log.error(f"Failed to generate test for {ep_id_str}: {e}")
                    continue
                    
        return success_count

    try:
        loop = asyncio.get_event_loop()
        count = loop.run_until_complete(execute())
        
        emit_event(project_id, {"event": "GENERATION_PROGRESS", "percentage": 100, "message": "Generation complete!"})
        emit_event(project_id, {"event": "JOB_COMPLETED", "job_type": "generation", "count": count})
        
        log.info(f"Batch generation finished! Created {count} tests.")
        return {"status": "SUCCESS", "tests_generated": count}
    except Exception as e:
        emit_event(project_id, {"event": "GENERATION_PROGRESS", "percentage": 0, "message": f"Generation failed: {str(e)}"})
        log.error(f"Batch generation failed: {e}")
        raise self.retry(exc=e, countdown=30)
