from celery import Celery
from app.config import settings

"""
Celery Configuration
--------------------
This is how we tell Celery where to find Redis and what tasks it 
should be looking for.
"""

celery_app = Celery(
    "ai_testgen_workers",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.workers.scan_job", "app.workers.generation_job", "app.workers.healing_job"] # List of files where tasks live
)

# Optional configuration: how long to keep results, etc.
celery_app.conf.update(
    result_expires=3600,
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
