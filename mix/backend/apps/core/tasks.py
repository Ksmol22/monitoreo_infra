"""
Core tasks (cleanup, etc).
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from apps.core.models import Metric, Log
import logging

logger = logging.getLogger(__name__)


@shared_task
def cleanup_old_metrics():
    """
    Delete metrics older than 30 days.
    Runs daily at 2 AM.
    """
    try:
        thirty_days_ago = timezone.now() - timedelta(days=30)
        deleted_count = Metric.objects.filter(timestamp__lt=thirty_days_ago).delete()[0]
        
        logger.info(f"Deleted {deleted_count} old metrics")
        
        Log.objects.create(
            system_id=1,
            level='info',
            message=f'Cleanup completed: {deleted_count} old metrics deleted',
            source='cleanup_task'
        )
        
        return {'status': 'success', 'deleted': deleted_count}
    
    except Exception as e:
        logger.exception("Error cleaning up old metrics")
        return {'status': 'error', 'message': str(e)}


@shared_task
def update_system_statuses():
    """
    Update system statuses based on last_seen timestamp.
    Runs every minute.
    """
    from apps.core.models import System
    
    try:
        systems = System.objects.all()
        updated = 0
        
        for system in systems:
            old_status = system.status
            system.update_status()
            if old_status != system.status:
                updated += 1
                
                Log.objects.create(
                    system=system,
                    level='warning' if system.status == 'offline' else 'info',
                    message=f'System status changed from {old_status} to {system.status}',
                    source='status_monitor'
                )
        
        logger.info(f"Updated {updated} system statuses")
        return {'status': 'success', 'updated': updated}
    
    except Exception as e:
        logger.exception("Error updating system statuses")
        return {'status': 'error', 'message': str(e)}
