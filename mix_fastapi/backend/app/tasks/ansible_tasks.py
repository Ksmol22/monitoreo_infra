"""
Ansible Celery Tasks
"""
import ansible_runner
from celery import shared_task
from pathlib import Path

from app.core.config import settings


PLAYBOOKS_PATH = Path(settings.ANSIBLE_PLAYBOOKS_PATH)
INVENTORY_PATH = settings.ANSIBLE_INVENTORY_PATH


@shared_task(name="app.tasks.ansible_tasks.collect_linux_metrics")
def collect_linux_metrics():
    """Collect metrics from Linux servers via Ansible"""
    playbook_path = PLAYBOOKS_PATH / "linux_metrics.yml"
    
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
    
    return {
        "status": result.status,
        "rc": result.rc,
        "stats": result.stats
    }


@shared_task(name="app.tasks.ansible_tasks.collect_windows_metrics")
def collect_windows_metrics():
    """Collect metrics from Windows servers via Ansible"""
    playbook_path = PLAYBOOKS_PATH / "windows_metrics.yml"
    
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
    
    return {
        "status": result.status,
        "rc": result.rc,
        "stats": result.stats
    }


@shared_task(name="app.tasks.ansible_tasks.collect_database_metrics")
def collect_database_metrics():
    """Collect metrics from Database servers via Ansible"""
    playbook_path = PLAYBOOKS_PATH / "database_metrics.yml"
    
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
    
    return {
        "status": result.status,
        "rc": result.rc,
        "stats": result.stats
    }


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
