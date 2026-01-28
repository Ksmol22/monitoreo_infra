"""
Ansible Celery Tasks with Prometheus Metrics
"""
import ansible_runner
from celery import shared_task
from pathlib import Path
import time

from app.core.config import settings


PLAYBOOKS_PATH = Path(settings.ANSIBLE_PLAYBOOKS_PATH)
INVENTORY_PATH = settings.ANSIBLE_INVENTORY_PATH


def track_playbook_execution(playbook_name: str, func):
    """Track playbook execution with Prometheus"""
    from app.core.prometheus import ansible_playbook_duration_seconds, ansible_playbook_status
    
    start_time = time.time()
    try:
        result = func()
        ansible_playbook_status.labels(playbook=playbook_name, status='success').inc()
        return result
    except Exception as e:
        ansible_playbook_status.labels(playbook=playbook_name, status='failed').inc()
        raise e
    finally:
        duration = time.time() - start_time
        ansible_playbook_duration_seconds.labels(playbook=playbook_name).observe(duration)


@shared_task(name="app.tasks.ansible_tasks.collect_linux_metrics")
def collect_linux_metrics():
    """Collect metrics from Linux servers via Ansible"""
    playbook_path = PLAYBOOKS_PATH / "linux_metrics.yml"
    
    def run_playbook():
        from app.core.prometheus import track_metric_collection
        
        result = ansible_runner.run(
            private_data_dir="/tmp/ansible",
            playbook=str(playbook_path),
            inventory=INVENTORY_PATH,
            quiet=False,
            verbosity=1,
            extravars={
                "api_url": "http://backend:8000/api/v1"
            }
        )
        
        # Track successful metric collection
        if result.status == 'successful':
            track_metric_collection('linux')
        
        return {
            "status": result.status,
            "rc": result.rc,
            "stats": result.stats
        }
    
    return track_playbook_execution('linux_metrics', run_playbook)


@shared_task(name="app.tasks.ansible_tasks.collect_windows_metrics")
def collect_windows_metrics():
    """Collect metrics from Windows servers via Ansible"""
    playbook_path = PLAYBOOKS_PATH / "windows_metrics.yml"
    
    def run_playbook():
        from app.core.prometheus import track_metric_collection
        
        result = ansible_runner.run(
            private_data_dir="/tmp/ansible",
            playbook=str(playbook_path),
            inventory=INVENTORY_PATH,
            quiet=False,
            verbosity=1,
            extravars={
                "api_url": "http://backend:8000/api/v1"
            }
        )
        
        # Track successful metric collection
        if result.status == 'successful':
            track_metric_collection('windows')
        
        return {
            "status": result.status,
            "rc": result.rc,
            "stats": result.stats
        }
    
    return track_playbook_execution('windows_metrics', run_playbook)


@shared_task(name="app.tasks.ansible_tasks.collect_database_metrics")
def collect_database_metrics():
    """Collect metrics from Database servers via Ansible"""
    playbook_path = PLAYBOOKS_PATH / "database_metrics.yml"
    
    def run_playbook():
        from app.core.prometheus import track_metric_collection
        
        result = ansible_runner.run(
            private_data_dir="/tmp/ansible",
            playbook=str(playbook_path),
            inventory=INVENTORY_PATH,
            quiet=False,
            verbosity=1,
            extravars={
                "api_url": "http://backend:8000/api/v1"
            }
        )
        
        # Track successful metric collection
        if result.status == 'successful':
            track_metric_collection('database')
        
        return {
            "status": result.status,
            "rc": result.rc,
            "stats": result.stats
        }
    
    return track_playbook_execution('database_metrics', run_playbook)


@shared_task(name="app.tasks.ansible_tasks.run_ad_hoc_command")
def run_ad_hoc_command(host_pattern: str, module: str, module_args: str = ""):
    """Run ad-hoc Ansible command"""
    result = ansible_runner.run(
        private_data_dir="/tmp/ansible",
        host_pattern=host_pattern,
        module=module,
        module_args=module_args,
        inventory=INVENTORY_PATH,
        quiet=False
    )
    
    return {
        "status": result.status,
        "rc": result.rc,
        "events": [event for event in result.events if event.get("event") == "runner_on_ok"]
    }
