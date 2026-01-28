"""
Maintenance Celery Tasks
"""
from celery import shared_task
from datetime import datetime, timedelta
from sqlalchemy import select, delete
from sqlalchemy.orm import Session

from app.core.database import engine
from app.models.models import Metric, Log, System


@shared_task(name="app.tasks.maintenance_tasks.cleanup_old_metrics")
def cleanup_old_metrics(days: int = 30):
    """Delete metrics older than specified days"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    with Session(engine.sync_engine) as session:
        result = session.execute(
            delete(Metric).where(Metric.timestamp < cutoff_date)
        )
        session.commit()
        deleted_count = result.rowcount
    
    return {
        "deleted_metrics": deleted_count,
        "cutoff_date": cutoff_date.isoformat()
    }


@shared_task(name="app.tasks.maintenance_tasks.cleanup_old_logs")
def cleanup_old_logs(days: int = 90):
    """Delete logs older than specified days"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    with Session(engine.sync_engine) as session:
        result = session.execute(
            delete(Log).where(Log.timestamp < cutoff_date)
        )
        session.commit()
        deleted_count = result.rowcount
    
    return {
        "deleted_logs": deleted_count,
        "cutoff_date": cutoff_date.isoformat()
    }


@shared_task(name="app.tasks.maintenance_tasks.update_system_statuses")
def update_system_statuses():
    """Update system statuses based on last_seen timestamp"""
    threshold = datetime.utcnow() - timedelta(minutes=10)
    
    with Session(engine.sync_engine) as session:
        # Get all systems
        result = session.execute(select(System))
        systems = result.scalars().all()
        
        updated_count = 0
        for system in systems:
            if system.last_seen < threshold and system.status != "offline":
                system.status = "offline"
                updated_count += 1
        
        session.commit()
    
    return {
        "updated_systems": updated_count,
        "threshold": threshold.isoformat()
    }
