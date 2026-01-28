"""
Celery tasks for Ansible integration.
"""
import ansible_runner
from celery import shared_task
from django.conf import settings
from apps.core.models import System, Metric, Log
import logging
import json

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def collect_linux_metrics(self):
    """
    Execute Ansible playbook to collect Linux server metrics.
    Runs every 5 minutes via Celery Beat.
    """
    try:
        playbook_path = settings.ANSIBLE_PLAYBOOKS_DIR / 'linux_metrics.yml'
        inventory_path = settings.ANSIBLE_INVENTORY_DIR / 'hosts.yml'
        
        logger.info(f"Starting Linux metrics collection via Ansible")
        
        runner = ansible_runner.run(
            playbook=str(playbook_path),
            inventory=str(inventory_path),
            quiet=False,
            verbosity=1,
        )
        
        if runner.status == 'successful':
            logger.info(f"Linux metrics collected successfully. Stats: {runner.stats}")
            
            # Create log entry
            Log.objects.create(
                system_id=1,  # System admin logs
                level='info',
                message=f'Linux metrics collection completed. Hosts: {len(runner.stats["ok"])}',
                source='ansible_integration'
            )
            
            return {
                'status': 'success',
                'stats': runner.stats,
                'hosts_ok': len(runner.stats.get('ok', {}))
            }
        else:
            logger.error(f"Linux metrics collection failed: {runner.status}")
            return {'status': 'failed', 'error': runner.status}
    
    except FileNotFoundError:
        logger.error(f"Playbook not found: {playbook_path}")
        return {'status': 'error', 'message': 'Playbook not found'}
    
    except Exception as e:
        logger.exception("Error collecting Linux metrics")
        # Retry task
        raise self.retry(exc=e, countdown=60)


@shared_task(bind=True, max_retries=3)
def collect_windows_metrics(self):
    """
    Execute Ansible playbook to collect Windows server metrics.
    Runs every 5 minutes via Celery Beat.
    """
    try:
        playbook_path = settings.ANSIBLE_PLAYBOOKS_DIR / 'windows_metrics.yml'
        inventory_path = settings.ANSIBLE_INVENTORY_DIR / 'hosts.yml'
        
        logger.info(f"Starting Windows metrics collection via Ansible")
        
        runner = ansible_runner.run(
            playbook=str(playbook_path),
            inventory=str(inventory_path),
            quiet=False,
            verbosity=1,
        )
        
        if runner.status == 'successful':
            logger.info(f"Windows metrics collected successfully. Stats: {runner.stats}")
            
            Log.objects.create(
                system_id=1,
                level='info',
                message=f'Windows metrics collection completed. Hosts: {len(runner.stats["ok"])}',
                source='ansible_integration'
            )
            
            return {
                'status': 'success',
                'stats': runner.stats,
                'hosts_ok': len(runner.stats.get('ok', {}))
            }
        else:
            logger.error(f"Windows metrics collection failed: {runner.status}")
            return {'status': 'failed', 'error': runner.status}
    
    except Exception as e:
        logger.exception("Error collecting Windows metrics")
        raise self.retry(exc=e, countdown=60)


@shared_task(bind=True, max_retries=3)
def collect_database_metrics(self):
    """
    Execute Ansible playbook to collect database metrics.
    Runs every 5 minutes via Celery Beat.
    """
    try:
        playbook_path = settings.ANSIBLE_PLAYBOOKS_DIR / 'database_metrics.yml'
        inventory_path = settings.ANSIBLE_INVENTORY_DIR / 'hosts.yml'
        
        logger.info(f"Starting database metrics collection via Ansible")
        
        runner = ansible_runner.run(
            playbook=str(playbook_path),
            inventory=str(inventory_path),
            quiet=False,
            verbosity=1,
        )
        
        if runner.status == 'successful':
            logger.info(f"Database metrics collected successfully. Stats: {runner.stats}")
            
            Log.objects.create(
                system_id=1,
                level='info',
                message=f'Database metrics collection completed. Hosts: {len(runner.stats["ok"])}',
                source='ansible_integration'
            )
            
            return {
                'status': 'success',
                'stats': runner.stats,
                'hosts_ok': len(runner.stats.get('ok', {}))
            }
        else:
            logger.error(f"Database metrics collection failed: {runner.status}")
            return {'status': 'failed', 'error': runner.status}
    
    except Exception as e:
        logger.exception("Error collecting database metrics")
        raise self.retry(exc=e, countdown=60)


@shared_task
def execute_ansible_playbook(playbook_name, extra_vars=None):
    """
    Generic task to execute any Ansible playbook.
    
    Args:
        playbook_name: Name of the playbook file
        extra_vars: Dictionary of extra variables to pass to Ansible
    """
    try:
        playbook_path = settings.ANSIBLE_PLAYBOOKS_DIR / playbook_name
        inventory_path = settings.ANSIBLE_INVENTORY_DIR / 'hosts.yml'
        
        logger.info(f"Executing Ansible playbook: {playbook_name}")
        
        runner = ansible_runner.run(
            playbook=str(playbook_path),
            inventory=str(inventory_path),
            extravars=extra_vars or {},
            quiet=False,
        )
        
        return {
            'status': runner.status,
            'stats': runner.stats,
            'rc': runner.rc
        }
    
    except Exception as e:
        logger.exception(f"Error executing playbook {playbook_name}")
        return {'status': 'error', 'message': str(e)}
