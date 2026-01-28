"""
Celery configuration.
"""
import os
from celery import Celery
from celery.schedules import crontab

# Set default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('monitoreo_infra')

# Load config from Django settings
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps
app.autodiscover_tasks()

# Celery Beat Schedule
app.conf.beat_schedule = {
    'collect-linux-metrics': {
        'task': 'apps.ansible_integration.tasks.collect_linux_metrics',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
    'collect-windows-metrics': {
        'task': 'apps.ansible_integration.tasks.collect_windows_metrics',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
    'collect-database-metrics': {
        'task': 'apps.ansible_integration.tasks.collect_database_metrics',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
    'cleanup-old-metrics': {
        'task': 'apps.core.tasks.cleanup_old_metrics',
        'schedule': crontab(hour='2', minute='0'),  # Daily at 2 AM
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
