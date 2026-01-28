"""
Prometheus metrics utilities
"""
from prometheus_client import Counter, Histogram, Gauge
from functools import wraps
import time


# Import metrics from main
from app.main import (
    http_requests_total,
    http_request_duration_seconds,
    systems_total,
    metrics_collected_total,
    ansible_playbook_duration_seconds,
    ansible_playbook_status
)


def track_ansible_execution(playbook_name: str):
    """Decorator to track Ansible playbook execution"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                ansible_playbook_status.labels(playbook=playbook_name, status='success').inc()
                return result
            except Exception as e:
                ansible_playbook_status.labels(playbook=playbook_name, status='failed').inc()
                raise e
            finally:
                duration = time.time() - start_time
                ansible_playbook_duration_seconds.labels(playbook=playbook_name).observe(duration)
        return wrapper
    return decorator


async def update_systems_gauge(db):
    """Update systems gauge metrics"""
    from sqlalchemy import select, func
    from app.models.models import System
    
    # Count by status
    result = await db.execute(
        select(System.status, func.count(System.id).label('count'))
        .group_by(System.status)
    )
    
    # Reset and update gauges
    for row in result:
        systems_total.labels(status=row.status).set(row.count)


def track_metric_collection(system_type: str):
    """Track metric collection by system type"""
    metrics_collected_total.labels(system_type=system_type).inc()
