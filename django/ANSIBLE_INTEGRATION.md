# Integración con Ansible - Monitoreo de Infraestructura

## 📖 Descripción General

Este documento explica cómo Django se integra con Ansible para recolectar automáticamente métricas de servidores Linux, Windows y bases de datos.

## 🏗️ Arquitectura de Integración

```
┌─────────────────────────────────────────────────────────────┐
│                    DJANGO APPLICATION                        │
│                                                              │
│  ┌────────────────┐         ┌──────────────────┐          │
│  │  Web Interface │         │   REST API       │          │
│  │  (Dashboard)   │◄────────┤  /api/v1/        │          │
│  └────────────────┘         └──────────────────┘          │
│                                      ▲                       │
│                                      │                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           CELERY TASKS (Async Workers)                 │ │
│  │                                                        │ │
│  │  Every 5 minutes:                                     │ │
│  │  • collect_linux_metrics()                            │ │
│  │  • collect_windows_metrics()                          │ │
│  │  • collect_database_metrics()                         │ │
│  └───────────────────┬────────────────────────────────────┘ │
└────────────────────────┼──────────────────────────────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │   ANSIBLE RUNNER             │
          │   (Python API)               │
          └──────────────┬───────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌───────────────┐ ┌──────────────┐ ┌───────────────┐
│ LINUX SERVERS │ │ WIN SERVERS  │ │  DATABASES    │
│               │ │              │ │               │
│ • SSH         │ │ • WinRM      │ │ • pg_stat     │
│ • top/htop    │ │ • PowerShell │ │ • MySQL stats │
│ • df -h       │ │ • Get-VM     │ │ • Oracle      │
└───────────────┘ └──────────────┘ └───────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  PostgreSQL  │
                  │  (metrics,   │
                  │   logs)      │
                  └──────────────┘
```

## 🔧 Configuración Inicial

### 1. Configurar Ansible Inventory

Crea el archivo de inventario en `ansible/inventory/hosts.yml`:

```yaml
all:
  children:
    linux_servers:
      hosts:
        web-server-01:
          ansible_host: 192.168.1.10
          ansible_user: admin
          ansible_ssh_private_key_file: ~/.ssh/id_rsa
        
        app-server-01:
          ansible_host: 192.168.1.11
          ansible_user: deploy
          ansible_port: 2222
    
    windows_servers:
      hosts:
        win-server-01:
          ansible_host: 192.168.1.20
          ansible_user: Administrator
          ansible_password: "{{ vault_win_password }}"
          ansible_connection: winrm
          ansible_winrm_transport: ntlm
          ansible_port: 5985
        
        win-dc-01:
          ansible_host: 192.168.1.21
          ansible_user: domain\admin
          ansible_connection: psrp  # PowerShell Remoting over SSH
    
    databases:
      hosts:
        postgres-01:
          ansible_host: 192.168.1.30
          ansible_user: postgres
          db_type: postgresql
          db_port: 5432
        
        mysql-01:
          ansible_host: 192.168.1.31
          ansible_user: dba
          db_type: mysql
          db_port: 3306
        
        oracle-01:
          ansible_host: 192.168.1.32
          ansible_user: oracle
          db_type: oracle
          db_port: 1521
```

### 2. Encriptar Credenciales con Ansible Vault

```bash
# Crear archivo de contraseña del vault
echo "mi-password-super-seguro" > ansible/.vault_pass
chmod 600 ansible/.vault_pass

# Crear archivo de variables encriptadas
ansible-vault create ansible/inventory/group_vars/all/vault.yml \
    --vault-password-file=ansible/.vault_pass

# Contenido del vault.yml:
vault_win_password: "WindowsPassword123!"
vault_db_passwords:
  postgres: "PostgresPass456"
  mysql: "MySQLPass789"
  oracle: "OraclePass012"
```

### 3. Configurar Ansible

Crea `ansible/ansible.cfg`:

```ini
[defaults]
inventory = inventory/hosts.yml
host_key_checking = False
timeout = 30
gather_facts = True
retry_files_enabled = False
vault_password_file = .vault_pass

[privilege_escalation]
become = True
become_method = sudo
become_user = root
become_ask_pass = False
```

## 📝 Playbooks de Ansible

### Linux Metrics Playbook

`apps/ansible_integration/playbooks/linux_metrics.yml`:

```yaml
---
- name: Collect Linux System Metrics
  hosts: linux_servers
  gather_facts: yes
  
  tasks:
    - name: Get CPU usage
      shell: top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}'
      register: cpu_usage
      changed_when: false
    
    - name: Get memory usage
      shell: free | grep Mem | awk '{print ($3/$2) * 100.0}'
      register: memory_usage
      changed_when: false
    
    - name: Get disk usage
      shell: df -h / | tail -1 | awk '{print $5}' | sed 's/%//'
      register: disk_usage
      changed_when: false
    
    - name: Get network statistics
      shell: |
        cat /proc/net/dev | grep -v "lo:" | tail -1 | awk '{print $2,$10}'
      register: network_stats
      changed_when: false
    
    - name: Send metrics to Django API
      uri:
        url: "http://{{ django_api_host }}:8000/api/v1/metrics/"
        method: POST
        body_format: json
        headers:
          Content-Type: "application/json"
        body:
          system_id: "{{ hostvars[inventory_hostname].system_id }}"
          cpu_usage: "{{ cpu_usage.stdout | float }}"
          memory_usage: "{{ memory_usage.stdout | float }}"
          disk_usage: "{{ disk_usage.stdout | float }}"
          network_in: "{{ network_stats.stdout.split()[0] | int }}"
          network_out: "{{ network_stats.stdout.split()[1] | int }}"
        status_code: 201
      delegate_to: localhost
```

### Windows Metrics Playbook

`apps/ansible_integration/playbooks/windows_metrics.yml`:

```yaml
---
- name: Collect Windows System Metrics
  hosts: windows_servers
  gather_facts: yes
  
  tasks:
    - name: Get CPU usage
      win_shell: |
        (Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue
      register: cpu_usage
    
    - name: Get memory usage
      win_shell: |
        $mem = Get-CimInstance Win32_OperatingSystem
        [math]::Round((($mem.TotalVisibleMemorySize - $mem.FreePhysicalMemory) / $mem.TotalVisibleMemorySize) * 100, 2)
      register: memory_usage
    
    - name: Get disk usage
      win_shell: |
        $disk = Get-PSDrive C
        [math]::Round((($disk.Used / ($disk.Used + $disk.Free)) * 100), 2)
      register: disk_usage
    
    - name: Get network statistics
      win_shell: |
        $adapters = Get-NetAdapterStatistics | Where-Object {$_.Name -notlike "*Loopback*"}
        $totalIn = ($adapters | Measure-Object -Property ReceivedBytes -Sum).Sum
        $totalOut = ($adapters | Measure-Object -Property SentBytes -Sum).Sum
        "$totalIn $totalOut"
      register: network_stats
    
    - name: Send metrics to Django API
      uri:
        url: "http://{{ django_api_host }}:8000/api/v1/metrics/"
        method: POST
        body_format: json
        body:
          system_id: "{{ hostvars[inventory_hostname].system_id }}"
          cpu_usage: "{{ cpu_usage.stdout | float }}"
          memory_usage: "{{ memory_usage.stdout | float }}"
          disk_usage: "{{ disk_usage.stdout | float }}"
          network_in: "{{ network_stats.stdout.split()[0] | int }}"
          network_out: "{{ network_stats.stdout.split()[1] | int }}"
        status_code: 201
      delegate_to: localhost
```

### Database Metrics Playbook

`apps/ansible_integration/playbooks/database_metrics.yml`:

```yaml
---
- name: Collect Database Metrics
  hosts: databases
  gather_facts: yes
  
  tasks:
    # PostgreSQL
    - name: Get PostgreSQL metrics
      postgresql_query:
        login_host: "{{ ansible_host }}"
        login_user: "{{ ansible_user }}"
        login_password: "{{ vault_db_passwords.postgres }}"
        query: |
          SELECT
            (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
            (SELECT pg_database_size(current_database())) as db_size,
            (SELECT sum(blks_hit)*100/sum(blks_hit + blks_read) FROM pg_stat_database) as cache_hit_ratio
      register: pg_metrics
      when: db_type == "postgresql"
    
    # MySQL
    - name: Get MySQL metrics
      mysql_query:
        login_host: "{{ ansible_host }}"
        login_user: "{{ ansible_user }}"
        login_password: "{{ vault_db_passwords.mysql }}"
        query: |
          SELECT
            (SELECT VARIABLE_VALUE FROM information_schema.GLOBAL_STATUS WHERE VARIABLE_NAME='Threads_connected') as connections,
            (SELECT SUM(data_length + index_length) FROM information_schema.TABLES) as total_size
      register: mysql_metrics
      when: db_type == "mysql"
    
    - name: Send database metrics to Django API
      uri:
        url: "http://{{ django_api_host }}:8000/api/v1/metrics/"
        method: POST
        body_format: json
        body:
          system_id: "{{ hostvars[inventory_hostname].system_id }}"
          cpu_usage: 0  # Database CPU is measured from host
          memory_usage: 0  # Database memory is measured from host
          disk_usage: "{{ (pg_metrics.query_result[0].db_size | default(0)) | int }}"
          network_in: 0
          network_out: 0
        status_code: 201
      delegate_to: localhost
```

## 🐍 Celery Tasks (Django)

`apps/ansible_integration/tasks.py`:

```python
import ansible_runner
from celery import shared_task
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@shared_task
def collect_linux_metrics():
    """Execute Ansible playbook to collect Linux metrics."""
    try:
        runner = ansible_runner.run(
            playbook=str(settings.ANSIBLE_PLAYBOOKS_DIR / 'linux_metrics.yml'),
            inventory=str(settings.ANSIBLE_INVENTORY_DIR / 'hosts.yml'),
            quiet=False,
        )
        
        if runner.status == 'successful':
            logger.info(f"Linux metrics collected successfully. {runner.stats}")
            return {'status': 'success', 'stats': runner.stats}
        else:
            logger.error(f"Linux metrics collection failed: {runner.status}")
            return {'status': 'failed', 'error': runner.status}
    
    except Exception as e:
        logger.exception("Error collecting Linux metrics")
        return {'status': 'error', 'message': str(e)}

@shared_task
def collect_windows_metrics():
    """Execute Ansible playbook to collect Windows metrics."""
    # Similar implementation
    pass

@shared_task
def collect_database_metrics():
    """Execute Ansible playbook to collect database metrics."""
    # Similar implementation
    pass
```

## 🚀 Flujo de Trabajo

### 1. Recolección Automática (Cada 5 minutos)

```
1. Celery Beat trigger → collect_linux_metrics()
2. Task ejecuta: ansible-runner run linux_metrics.yml
3. Ansible conecta a servidores Linux via SSH
4. Playbook ejecuta comandos (top, free, df)
5. Playbook hace POST a /api/v1/metrics/
6. Django guarda métricas en PostgreSQL
7. Dashboard actualiza gráficos en tiempo real
```

### 2. Recolección Manual

Puedes ejecutar manualmente desde Django Admin o CLI:

```bash
# Desde Django shell
python manage.py shell
>>> from apps.ansible_integration.tasks import collect_linux_metrics
>>> collect_linux_metrics.delay()

# Desde CLI directamente
ansible-playbook apps/ansible_integration/playbooks/linux_metrics.yml
```

### 3. Callback Plugin (Avanzado)

Ansible puede notificar a Django automáticamente:

`ansible/plugins/callback/django_notifier.py`:

```python
from ansible.plugins.callback import CallbackBase
import requests

class CallbackModule(CallbackBase):
    def v2_runner_on_ok(self, result):
        # Send result to Django API
        requests.post(
            'http://localhost:8000/api/v1/metrics/',
            json=result._result
        )
```

## 📊 Ventajas de Django + Ansible

| Característica | Django + Ansible | Vue (Node.js) |
|----------------|------------------|---------------|
| **Integración Ansible** | ✅ Nativa (Python) | ❌ Requiere wrappers |
| **Ejecución Async** | ✅ Celery | Requiere Bull/Agenda |
| **Callback Plugins** | ✅ Ansible → Django directo | ❌ Complicado |
| **Ansible Runner API** | ✅ Python nativo | Requiere subprocess |
| **Vault Management** | ✅ ansible-vault directo | Requiere CLI |
| **Inventory Dinámico** | ✅ Scripts Python | Requiere adaptadores |

## 🔒 Seguridad

1. **Credentials**: Siempre usa Ansible Vault
2. **SSH Keys**: Usa llaves SSH en lugar de contraseñas
3. **API Authentication**: Implementa tokens JWT en Django
4. **Network**: Aísla red de monitoreo (VLAN separada)
5. **Firewall**: Solo permite conexiones desde Django server

## 📖 Referencias

- [Ansible Runner Docs](https://ansible-runner.readthedocs.io/)
- [Celery Beat Schedule](https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html)
- [Django REST Framework](https://www.django-rest-framework.org/)
