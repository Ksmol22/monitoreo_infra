# 🚀 Guía de Inicio Rápido - Django

## Instalación y Configuración

### 1. Clonar el repositorio y configurar

```bash
cd django
cp .env.example .env
```

Edita `.env` y configura tus variables de entorno.

### 2. Opción A: Docker (Recomendado)

```bash
# Construir e iniciar todos los servicios
docker-compose up --build -d

# Ver logs
docker-compose logs -f web

# Crear superusuario
docker-compose exec web python manage.py createsuperuser

# Acceder a:
# - Dashboard: http://localhost:8000
# - Admin: http://localhost:8000/admin
# - API: http://localhost:8000/api/v1/
```

### 2. Opción B: Desarrollo Local

```bash
# Crear entorno virtual
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Configurar base de datos (primero inicia PostgreSQL y Redis)
python manage.py migrate
python manage.py createsuperuser

# Cargar datos de ejemplo (opcional)
python manage.py shell
```

```python
from apps.core.models import System, Metric, Log

# Crear sistemas de ejemplo
System.objects.create(
    name="Web Server 01",
    type="linux",
    ip_address="192.168.1.10",
    status="online"
)
System.objects.create(
    name="Windows Server 01",
    type="windows",
    ip_address="192.168.1.20",
    status="online"
)
System.objects.create(
    name="PostgreSQL DB",
    type="database",
    ip_address="192.168.1.30",
    status="online"
)
```

```bash
# Iniciar Django
python manage.py runserver

# En otra terminal: Celery Worker
celery -A config worker -l info

# En otra terminal: Celery Beat
celery -A config beat -l info
```

## 3. Configurar Ansible

### Editar Inventory

Edita `ansible/inventory/hosts.yml`:

```yaml
all:
  vars:
    django_api_host: "localhost"  # O tu IP de Django
  
  children:
    linux_servers:
      hosts:
        server1:
          ansible_host: 192.168.1.10
          ansible_user: admin
          system_id: 1  # ID del sistema en Django
```

### Probar conexión Ansible

```bash
# Test ping Linux
ansible linux_servers -m ping -i ansible/inventory/hosts.yml

# Test ping Windows
ansible windows_servers -m win_ping -i ansible/inventory/hosts.yml

# Ejecutar playbook manualmente
ansible-playbook apps/ansible_integration/playbooks/linux_metrics.yml \
    -i ansible/inventory/hosts.yml
```

## 4. Primer Sistema Monitoreado

### Agregar desde Admin

1. Ve a http://localhost:8000/admin
2. Login con tu superuser
3. Core > Systems > Add System
4. Llena los datos:
   - Name: "Mi Servidor Linux"
   - Type: "Linux"
   - IP: "192.168.1.100"
   - Ansible User: "admin"
   - Ansible Port: 22
   - Ansible Connection: "ssh"
5. Guarda

### Agregar desde API

```bash
curl -X POST http://localhost:8000/api/v1/systems/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Servidor Linux",
    "type": "linux",
    "ip_address": "192.168.1.100",
    "ansible_user": "admin",
    "ansible_port": 22,
    "ansible_connection": "ssh"
  }'
```

### Enviar métricas manualmente (prueba)

```bash
curl -X POST http://localhost:8000/api/v1/metrics/ \
  -H "Content-Type: application/json" \
  -d '{
    "system_id": 1,
    "cpu_usage": 45.5,
    "memory_usage": 67.8,
    "disk_usage": 52.3,
    "network_in": 1024,
    "network_out": 2048
  }'
```

## 5. Ejecutar Tareas de Ansible Manualmente

```bash
# Desde Django shell
python manage.py shell
```

```python
from apps.ansible_integration.tasks import collect_linux_metrics
collect_linux_metrics.delay()
```

O directamente con Ansible:

```bash
ansible-playbook apps/ansible_integration/playbooks/linux_metrics.yml
```

## 6. Ver Resultados

- Dashboard: http://localhost:8000
- API Explorer: http://localhost:8000/api/v1/
- Admin Panel: http://localhost:8000/admin

## Comandos Útiles

```bash
# Ver logs de Django
docker-compose logs -f web

# Ver logs de Celery
docker-compose logs -f celery

# Reiniciar servicios
docker-compose restart web celery

# Ejecutar migraciones
docker-compose exec web python manage.py migrate

# Crear superusuario
docker-compose exec web python manage.py createsuperuser

# Shell de Django
docker-compose exec web python manage.py shell

# Limpiar métricas antiguas manualmente
docker-compose exec web python manage.py shell
>>> from apps.core.tasks import cleanup_old_metrics
>>> cleanup_old_metrics()
```

## Troubleshooting

### Error: "connection refused" al enviar métricas

- Verifica que Django esté corriendo en `0.0.0.0:8000`
- Verifica que el firewall permita conexiones al puerto 8000
- En el inventory, usa la IP correcta de Django en `django_api_host`

### Ansible no se conecta a Windows

```bash
# Verifica que WinRM esté habilitado en Windows
# En PowerShell como Admin:
Enable-PSRemoting -Force
Set-Item WSMan:\localhost\Client\TrustedHosts -Value "*" -Force

# Test manual
ansible windows_servers -m win_ping
```

### Celery no ejecuta tareas

```bash
# Verifica que Redis esté corriendo
docker-compose ps redis

# Verifica logs de Celery
docker-compose logs celery

# Reinicia Celery
docker-compose restart celery celery-beat
```

## Próximos Pasos

1. ✅ Configurar tus servidores reales en el inventory
2. ✅ Configurar SSH keys para Linux (sin contraseña)
3. ✅ Configurar WinRM para Windows
4. ✅ Ajustar la frecuencia de recolección en `config/celery.py`
5. ✅ Configurar Ansible Vault para credenciales
6. ✅ Agregar más playbooks personalizados
7. ✅ Configurar alertas (email, Slack, etc.)
