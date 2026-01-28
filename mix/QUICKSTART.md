# 🚀 Guía de Inicio Rápido - Proyecto Híbrido

## Stack: Vue 3 + Django + Ansible

Este proyecto combina lo mejor de ambos mundos:
- **Frontend moderno**: Vue 3 SPA con TypeScript
- **Backend robusto**: Django REST API con integración nativa de Ansible

---

## 📦 Instalación Completa con Docker

### 1. Prerequisitos
```bash
# Asegúrate de tener instalado:
- Docker Desktop
- Docker Compose
- Git
```

### 2. Clonar y Configurar
```bash
cd c:\Users\yulir\OneDrive\Documents\monitoreo_infra\mix

# Copiar variables de entorno del backend
cd backend
cp .env.example .env
# Edita .env con tus credenciales

cd ..
```

### 3. Iniciar Todo con Docker
```bash
# Construir e iniciar todos los servicios
docker-compose up --build -d

# Ver logs en tiempo real
docker-compose logs -f

# Servicios disponibles:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000/api/
# - Admin Panel: http://localhost:8000/admin/
# - Nginx: http://localhost:80
```

### 4. Configurar Base de Datos
```bash
# Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# Crear superusuario
docker-compose exec backend python manage.py createsuperuser

# Cargar datos de ejemplo (opcional)
docker-compose exec backend python manage.py shell
```

```python
from apps.core.models import System

System.objects.create(
    name="Web Server 01",
    type="linux",
    ip_address="192.168.1.10",
    status="online",
    ansible_user="admin"
)
```

### 5. Acceder a la Aplicación

Abre tu navegador:
- **Frontend Vue**: http://localhost:3000
- **Backend API Docs**: http://localhost:8000/api/v1/
- **Django Admin**: http://localhost:8000/admin

---

## 💻 Desarrollo Local (Sin Docker)

### Backend (Django)

```bash
cd backend

# Crear entorno virtual
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Configurar base de datos (PostgreSQL debe estar corriendo)
python manage.py migrate
python manage.py createsuperuser

# Iniciar servidor Django
python manage.py runserver
# → http://localhost:8000

# En otra terminal: Celery Worker
celery -A config worker -l info

# En otra terminal: Celery Beat
celery -A config beat -l info
```

### Frontend (Vue)

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar dev server
npm run dev
# → http://localhost:3000

# Build para producción
npm run build
```

---

## 🔧 Configurar Ansible

### 1. Editar Inventory

Edita `backend/ansible/inventory/hosts.yml`:

```yaml
all:
  vars:
    django_api_host: "backend"  # En Docker
    # django_api_host: "localhost"  # En local
  
  children:
    linux_servers:
      hosts:
        web-server-01:
          ansible_host: 192.168.1.10
          ansible_user: admin
          ansible_ssh_private_key_file: ~/.ssh/id_rsa
          system_id: 1  # ID del sistema en Django
        
    windows_servers:
      hosts:
        win-server-01:
          ansible_host: 192.168.1.20
          ansible_user: Administrator
          ansible_connection: winrm
          system_id: 2
    
    databases:
      hosts:
        postgres-01:
          ansible_host: 192.168.1.30
          ansible_user: postgres
          db_type: postgresql
          system_id: 3
```

### 2. Probar Conexión Ansible

```bash
# Entrar al contenedor backend
docker-compose exec backend bash

# Probar ping a servidores Linux
ansible linux_servers -m ping -i ansible/inventory/hosts.yml

# Probar ping a Windows
ansible windows_servers -m win_ping -i ansible/inventory/hosts.yml
```

### 3. Ejecutar Playbooks Manualmente

```bash
# Recolectar métricas de Linux
docker-compose exec backend ansible-playbook \
    apps/ansible_integration/playbooks/linux_metrics.yml

# Recolectar de Windows
docker-compose exec backend ansible-playbook \
    apps/ansible_integration/playbooks/windows_metrics.yml

# Recolectar de Databases
docker-compose exec backend ansible-playbook \
    apps/ansible_integration/playbooks/database_metrics.yml
```

---

## 🔄 Flujo de Trabajo Completo

### Automático (Cada 5 minutos)

1. **Celery Beat** ejecuta tareas programadas
2. **Ansible Runner** ejecuta playbooks
3. **Playbooks** recolectan métricas de servidores
4. **Ansible** envía datos POST a Django API
5. **Django** guarda en PostgreSQL
6. **Frontend Vue** actualiza automáticamente (polling cada 30s)

### Manual

```bash
# Desde Django shell
docker-compose exec backend python manage.py shell

>>> from apps.ansible_integration.tasks import collect_linux_metrics
>>> collect_linux_metrics.delay()
```

---

## 📡 API Endpoints

### Sistemas
```bash
GET    /api/v1/systems/          # Listar todos
POST   /api/v1/systems/          # Crear nuevo
GET    /api/v1/systems/{id}/     # Detalle
PATCH  /api/v1/systems/{id}/     # Actualizar
DELETE /api/v1/systems/{id}/     # Eliminar
GET    /api/v1/systems/stats/    # Estadísticas
```

### Métricas
```bash
GET    /api/v1/metrics/          # Listar (query: ?system_id=1&limit=50)
POST   /api/v1/metrics/          # Crear métrica
POST   /api/v1/metrics/bulk/     # Crear múltiples
GET    /api/v1/metrics/latest/   # Últimas por sistema
```

### Logs
```bash
GET    /api/v1/logs/             # Listar (query: ?level=error&system_id=1)
POST   /api/v1/logs/             # Crear log
GET    /api/v1/logs/recent/      # Recientes (última hora)
```

### Dashboard
```bash
GET    /api/v1/dashboard/        # Estadísticas completas
```

---

## 🧪 Probar la API

### Con curl

```bash
# Get all systems
curl http://localhost:8000/api/v1/systems/

# Create system
curl -X POST http://localhost:8000/api/v1/systems/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Server",
    "type": "linux",
    "ip_address": "192.168.1.100",
    "status": "online"
  }'

# Get dashboard stats
curl http://localhost:8000/api/v1/dashboard/
```

### Desde el Frontend Vue

El frontend ya está configurado para consumir la API:

```typescript
// src/services/api.ts ya tiene todos los endpoints

import { dashboardApi, systemsApi } from '@/services/api'

// Obtener estadísticas
const stats = await dashboardApi.getStats()

// Obtener sistemas
const systems = await systemsApi.getAll()
```

---

## 🎨 Desarrollo del Frontend

### Estructura de Archivos

```
frontend/src/
├── components/     # Componentes reutilizables (futuro)
├── views/          # Páginas principales
│   ├── Dashboard.vue
│   ├── Systems.vue
│   └── Logs.vue
├── services/       # API calls
│   └── api.ts
├── types/          # TypeScript types
│   └── index.ts
├── router.ts       # Vue Router
├── App.vue         # Componente principal
└── main.ts         # Entry point
```

### Agregar Nuevos Componentes

```vue
<!-- src/components/MetricCard.vue -->
<template>
  <div class="bg-white rounded-lg shadow p-4">
    <h3 class="text-lg font-semibold">{{ title }}</h3>
    <p class="text-3xl font-bold mt-2">{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
}>()
</script>
```

---

## 🐛 Troubleshooting

### Frontend no se conecta al backend

```bash
# Verifica que el backend esté corriendo
curl http://localhost:8000/api/v1/systems/

# Verifica CORS en backend/config/settings.py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:80',
]

# Verifica la variable de entorno en frontend
# frontend/.env
VITE_API_URL=http://localhost:8000/api
```

### Celery no ejecuta tareas

```bash
# Ver logs de Celery
docker-compose logs -f celery

# Verificar que Redis esté corriendo
docker-compose ps redis

# Reiniciar Celery
docker-compose restart celery celery-beat
```

### Ansible no se conecta

```bash
# Test manual
docker-compose exec backend bash
ansible all -m ping -i ansible/inventory/hosts.yml

# Verificar SSH keys
# Linux: Copia tu clave pública al servidor
ssh-copy-id user@192.168.1.10

# Windows: Verifica WinRM
# En el servidor Windows (PowerShell Admin):
Enable-PSRemoting -Force
```

---

## 📚 Comandos Útiles

```bash
# Ver todos los contenedores
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs -f frontend
docker-compose logs -f backend

# Reiniciar un servicio
docker-compose restart backend

# Detener todo
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reconstruir solo un servicio
docker-compose up --build frontend

# Ejecutar comando en contenedor
docker-compose exec backend python manage.py shell
docker-compose exec frontend npm run build

# Ver uso de recursos
docker stats
```

---

## 🚀 Deploy a Producción

### 1. Configurar variables de entorno

```env
# backend/.env
DEBUG=False
SECRET_KEY=<genera-una-clave-segura>
ALLOWED_HOSTS=tudominio.com
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### 2. Build de producción

```bash
# Frontend
cd frontend
npm run build
# Los archivos estarán en dist/

# Backend
cd backend
python manage.py collectstatic --noinput
```

### 3. Usar docker-compose para producción

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - VITE_API_URL=https://api.tudominio.com
  
  backend:
    environment:
      - DEBUG=False
      - ALLOWED_HOSTS=tudominio.com
```

---

## 📖 Próximos Pasos

1. ✅ Configurar sistemas reales en Django Admin
2. ✅ Configurar Ansible inventory con tus servidores
3. ✅ Probar playbooks manualmente
4. ✅ Verificar que Celery ejecute tareas automáticamente
5. ✅ Personalizar el diseño del frontend Vue
6. ✅ Agregar autenticación JWT
7. ✅ Configurar alertas (email, Slack)
8. ✅ Agregar más visualizaciones (gráficos con Chart.js)

---

## 🆘 Ayuda

- **Documentación Django**: https://docs.djangoproject.com/
- **Documentación Vue**: https://vuejs.org/
- **Ansible Runner**: https://ansible-runner.readthedocs.io/
- **Docker Compose**: https://docs.docker.com/compose/
