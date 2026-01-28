# 🚀 QUICKSTART - FastAPI + Vue 3

Guía completa paso a paso para poner en marcha el sistema de monitoreo.

## 📋 Tabla de Contenidos

1. [Prerequisitos](#prerequisitos)
2. [Instalación](#instalación)
3. [Configuración](#configuración)
4. [Ejecución](#ejecución)
5. [Pruebas](#pruebas)
6. [Configuración Ansible](#configuración-ansible)
7. [Uso de la API](#uso-de-la-api)
8. [Troubleshooting](#troubleshooting)

## Prerequisitos

### Software Requerido

- **Docker Desktop**: [Descargar](https://www.docker.com/products/docker-desktop/)
- **Git**: [Descargar](https://git-scm.com/downloads)
- **VS Code** (opcional): [Descargar](https://code.visualstudio.com/)

### Verificar Instalación

```powershell
# Verificar Docker
docker --version
docker-compose --version

# Verificar Git
git --version
```

## Instalación

### Paso 1: Navegar al Proyecto

```powershell
cd c:\Users\yulir\OneDrive\Documents\monitoreo_infra\mix_fastapi
```

### Paso 2: Copiar Variables de Entorno

```powershell
# Copiar .env.example a .env
Copy-Item "backend\.env.example" "backend\.env"

# Copiar .env del frontend
Copy-Item "frontend\.env" "frontend\.env.local"
```

### Paso 3: Editar Variables (Opcional)

Edita `backend/.env` si necesitas cambiar configuraciones:

```env
SECRET_KEY=your-super-secret-key-change-in-production
DEBUG=True
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/monitoreo_infra
REDIS_URL=redis://redis:6379/0
```

## Configuración

### Configurar Servidores en Ansible

Edita `backend/ansible/inventory/hosts.yml`:

```yaml
all:
  children:
    # Servidores Linux
    linux:
      hosts:
        mi-servidor-linux:
          ansible_host: 192.168.1.100
          ansible_user: ansible
          ansible_port: 22
          ansible_connection: ssh
    
    # Servidores Windows
    windows:
      hosts:
        mi-servidor-windows:
          ansible_host: 192.168.1.200
          ansible_user: Administrator
          ansible_connection: winrm
          ansible_port: 5986
    
    # Servidores de Base de Datos
    databases:
      hosts:
        mi-db-server:
          ansible_host: 192.168.1.300
          ansible_user: postgres
          ansible_port: 22
          db_type: postgresql
          db_port: 5432
```

**⚠️ IMPORTANTE**: Reemplaza las IPs con tus servidores reales.

## Ejecución

### Opción 1: Levantar Todo (Recomendado)

```powershell
# Construir y levantar todos los servicios
docker-compose up --build -d
```

### Opción 2: Levantar por Partes

```powershell
# Solo base de datos y redis
docker-compose up -d db redis

# Backend
docker-compose up -d backend

# Celery
docker-compose up -d celery_worker celery_beat

# Frontend
docker-compose up -d frontend nginx
```

### Verificar Estado

```powershell
# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f celery_worker
```

## Pruebas

### 1. Verificar Backend (FastAPI)

Abre en tu navegador:

- **API Root**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### 2. Verificar Frontend (Vue)

Abre en tu navegador:

- **Frontend**: http://localhost:3000

### 3. Verificar Nginx

Abre en tu navegador:

- **Nginx (proxy completo)**: http://localhost

### 4. Verificar Base de Datos

```powershell
# Conectar a PostgreSQL
docker exec -it monitoreo_db_fastapi psql -U postgres -d monitoreo_infra

# Ver tablas
\dt

# Ver sistemas
SELECT * FROM systems;

# Salir
\q
```

### 5. Verificar Redis

```powershell
# Conectar a Redis
docker exec -it monitoreo_redis_fastapi redis-cli

# Ping
ping
# → PONG

# Ver keys
keys *

# Salir
exit
```

### 6. Verificar Celery

```powershell
# Ver logs de worker
docker-compose logs celery_worker

# Ver logs de beat (scheduler)
docker-compose logs celery_beat
```

## Configuración Ansible

### 1. Preparar Servidores Linux

En cada servidor Linux, crea el usuario ansible:

```bash
# En el servidor Linux
sudo useradd -m -s /bin/bash ansible
sudo usermod -aG sudo ansible
echo "ansible ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/ansible

# Copiar SSH key
ssh-copy-id ansible@192.168.1.100
```

### 2. Preparar Servidores Windows

Ejecuta en PowerShell (como Administrador):

```powershell
# Habilitar WinRM
Enable-PSRemoting -Force

# Configurar WinRM para HTTPS
$cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "Cert:\LocalMachine\My"
winrm create winrm/config/Listener?Address=*+Transport=HTTPS "@{Hostname=`"localhost`";CertificateThumbprint=`"$($cert.Thumbprint)`"}"

# Abrir firewall
New-NetFirewallRule -DisplayName "WinRM HTTPS" -Direction Inbound -Protocol TCP -LocalPort 5986 -Action Allow
```

### 3. Probar Conectividad

```powershell
# Entrar al contenedor backend
docker exec -it monitoreo_backend_fastapi bash

# Ping a todos los servidores
ansible all -m ping -i ansible/inventory/hosts.yml

# Ping solo a Linux
ansible linux -m ping -i ansible/inventory/hosts.yml

# Ping solo a Windows
ansible windows -m ping -i ansible/inventory/hosts.yml
```

### 4. Ejecutar Playbook Manualmente

```bash
# Dentro del contenedor backend
ansible-playbook ansible/playbooks/linux_metrics.yml -i ansible/inventory/hosts.yml

# Con más verbosidad
ansible-playbook ansible/playbooks/linux_metrics.yml -i ansible/inventory/hosts.yml -vvv
```

## Uso de la API

### Con cURL

```bash
# Listar sistemas
curl http://localhost:8000/api/v1/systems/

# Crear sistema
curl -X POST http://localhost:8000/api/v1/systems/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-server",
    "type": "linux",
    "ip_address": "192.168.1.100",
    "ansible_user": "ansible"
  }'

# Obtener dashboard stats
curl http://localhost:8000/api/v1/dashboard/stats
```

### Con PowerShell

```powershell
# Listar sistemas
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/systems/" -Method Get

# Crear sistema
$body = @{
    name = "test-server"
    type = "linux"
    ip_address = "192.168.1.100"
    ansible_user = "ansible"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/systems/" `
  -Method Post `
  -Body $body `
  -ContentType "application/json"
```

### Con Python

```python
import requests

# Base URL
API_URL = "http://localhost:8000/api/v1"

# Listar sistemas
response = requests.get(f"{API_URL}/systems/")
systems = response.json()
print(systems)

# Crear sistema
new_system = {
    "name": "test-server",
    "type": "linux",
    "ip_address": "192.168.1.100",
    "ansible_user": "ansible"
}
response = requests.post(f"{API_URL}/systems/", json=new_system)
print(response.json())

# Dashboard
response = requests.get(f"{API_URL}/dashboard/stats")
stats = response.json()
print(f"Total systems: {stats['total_systems']}")
print(f"Online: {stats['online_systems']}")
```

## Troubleshooting

### Problema: Backend no inicia

```powershell
# Ver logs
docker-compose logs backend

# Posibles causas:
# 1. Puerto 8000 ocupado
netstat -ano | findstr :8000

# 2. Error de BD - verificar
docker-compose logs db

# 3. Recrear contenedor
docker-compose down
docker-compose up --build backend
```

### Problema: Frontend no carga

```powershell
# Ver logs
docker-compose logs frontend

# Verificar puerto 3000
netstat -ano | findstr :3000

# Reinstalar node_modules
docker-compose exec frontend npm install

# Recrear
docker-compose up --build frontend
```

### Problema: Celery no ejecuta tareas

```powershell
# Ver logs
docker-compose logs celery_worker
docker-compose logs celery_beat

# Verificar Redis
docker exec -it monitoreo_redis_fastapi redis-cli ping

# Revisar tareas programadas (dentro del contenedor)
docker exec -it monitoreo_celery_beat_fastapi celery -A app.celery_app inspect scheduled
```

### Problema: Ansible no conecta

```bash
# Dentro del contenedor backend
docker exec -it monitoreo_backend_fastapi bash

# Verificar inventory
cat ansible/inventory/hosts.yml

# Test ping
ansible all -m ping -i ansible/inventory/hosts.yml -vvv

# Test comando ad-hoc
ansible linux -m shell -a "uptime" -i ansible/inventory/hosts.yml
```

### Problema: Puerto en uso

```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Matar proceso (reemplaza PID)
taskkill /PID 12345 /F

# O cambiar puerto en docker-compose.yml
```

### Resetear Todo

```powershell
# Detener y eliminar contenedores
docker-compose down

# Eliminar volúmenes (⚠️ BORRA LA BD)
docker-compose down -v

# Limpiar todo Docker
docker system prune -a --volumes

# Reconstruir desde cero
docker-compose up --build -d
```

## Comandos Útiles

### Docker

```powershell
# Ver logs en tiempo real
docker-compose logs -f

# Logs de un servicio
docker-compose logs -f backend

# Entrar a un contenedor
docker exec -it monitoreo_backend_fastapi bash
docker exec -it monitoreo_frontend_fastapi sh

# Reiniciar un servicio
docker-compose restart backend

# Detener todo
docker-compose stop

# Detener y eliminar
docker-compose down
```

### FastAPI (Backend)

```bash
# Dentro del contenedor backend
# Ejecutar shell interactivo
python
>>> from app.models.models import System
>>> from app.core.database import engine
>>> # ... queries

# Ejecutar script Python
python -c "from app.core.config import settings; print(settings.DATABASE_URL)"
```

### Vue (Frontend)

```bash
# Dentro del contenedor frontend
# Reinstalar dependencias
npm install

# Build para producción
npm run build

# Lint
npm run lint
```

## Siguientes Pasos

1. ✅ Configurar tus servidores en `ansible/inventory/hosts.yml`
2. ✅ Probar conectividad con `ansible all -m ping`
3. ✅ Ejecutar playbooks manualmente para verificar
4. ✅ Observar las tareas de Celery recolectando métricas
5. ✅ Explorar la API en http://localhost:8000/api/docs
6. ✅ Usar el frontend en http://localhost:3000

## 📚 Recursos

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Vue 3 Docs**: https://vuejs.org/
- **Ansible Docs**: https://docs.ansible.com/
- **Docker Docs**: https://docs.docker.com/

---

🎉 ¡Listo! Tu sistema de monitoreo está en funcionamiento.
