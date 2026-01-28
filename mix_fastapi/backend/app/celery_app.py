"""
Celery Application
"""
from celery import Celery
from celery.schedules import crontab

from app.core.config import settings


# Create Celery app
celery_app = Celery(
    "monitoreo_infra",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.ansible_tasks", "app.tasks.maintenance_tasks"]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
)

# Celery Beat schedule
celery_app.conf.beat_schedule = {
    "collect-linux-metrics": {
        "task": "app.tasks.ansible_tasks.collect_linux_metrics",
        "schedule": 300.0,  # Every 5 minutes
    },
    "collect-windows-metrics": {
        "task": "app.tasks.ansible_tasks.collect_windows_metrics",
        "schedule": 300.0,  # Every 5 minutes
    },
    "collect-database-metrics": {
        "task": "app.tasks.ansible_tasks.collect_database_metrics",
        "schedule": 300.0,  # Every 5 minutes
    },
    "cleanup-old-metrics": {
        "task": "app.tasks.maintenance_tasks.cleanup_old_metrics",
        "schedule": crontab(hour=2, minute=0),  # Daily at 2 AM
    },
    "update-system-statuses": {
        "task": "app.tasks.maintenance_tasks.update_system_statuses",
        "schedule": 60.0,  # Every minute
    },
}
