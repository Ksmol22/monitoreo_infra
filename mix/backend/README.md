# Backend Django - API REST + Ansible

Backend API-only con Django REST Framework y integración nativa con Ansible.

## 📁 Estructura

```
backend/
├── config/                 # Configuración Django
│   ├── settings.py        # Settings principales
│   ├── urls.py            # URLs principales
│   ├── celery.py          # Configuración Celery
│   └── wsgi.py/asgi.py    # Server config
│
├── apps/
│   ├── core/              # Modelos principales
│   │   ├── models.py      # System, Metric, Log
│   │   ├── admin.py       # Django Admin config
│   │   └── tasks.py       # Celery tasks (cleanup)
│   │
│   ├── api/               # REST API
│   │   ├── serializers.py # DRF Serializers
│   │   ├── views.py       # API ViewSets
│   │   └── urls.py        # API routes
│   │
│   └── ansible_integration/   # Integración Ansible
│       ├── tasks.py           # Celery tasks para Ansible
│       └── playbooks/         # Playbooks Ansible
│           ├── linux_metrics.yml
│           ├── windows_metrics.yml
│           └── database_metrics.yml
│
├── ansible/
│   ├── ansible.cfg        # Configuración Ansible
│   └── inventory/         # Inventory de servidores
│       └── hosts.yml
│
├── requirements.txt       # Python dependencies
├── manage.py             # Django management
├── Dockerfile            # Docker config
└── .env.example          # Environment variables template
```

## 🚀 Características

### Django REST Framework
- ✅ API REST completa
- ✅ Serializers automáticos
- ✅ ViewSets para CRUD
- ✅ Paginación
- ✅ Filtros y búsqueda
- ✅ Throttling (rate limiting)

### Ansible Integration
- ✅ ansible-runner (API Python nativa)
- ✅ Playbooks para Linux, Windows y Databases
- ✅ Ejecución vía Celery (async)
- ✅ Scheduling automático (cada 5 min)

### Celery Tasks
- ✅ collect_linux_metrics()
- ✅ collect_windows_metrics()
- ✅ collect_database_metrics()
- ✅ cleanup_old_metrics()
- ✅ update_system_statuses()

### Security
- ✅ CORS configurado para Vue
- ✅ Django security middleware
- ✅ JWT ready (opcional)
- ✅ Rate limiting

## 📡 API Endpoints

Ver documentación completa en [../QUICKSTART.md](../QUICKSTART.md#-api-endpoints)

**Base URL**: `http://localhost:8000/api/v1/`

- `/systems/` - CRUD de sistemas
- `/metrics/` - Métricas de rendimiento
- `/logs/` - Logs de eventos
- `/dashboard/` - Estadísticas completas

## 🔧 Configuración

### Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://postgres:postgres@db:5432/monitoreo_infra
REDIS_URL=redis://redis:6379/0
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Base de Datos

```bash
# Ejecutar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Cargar datos de ejemplo
python manage.py loaddata fixtures/initial_data.json  # (si existe)
```

## 🎮 Comandos Útiles

```bash
# Iniciar servidor de desarrollo
python manage.py runserver

# Celery worker
celery -A config worker -l info

# Celery beat (tareas programadas)
celery -A config beat -l info

# Django shell
python manage.py shell

# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Colectar archivos estáticos
python manage.py collectstatic
```

## 🔌 Uso con Frontend Vue

El backend expone una API REST que el frontend Vue consume:

```typescript
// Frontend (Vue)
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
})

// Get systems
const { data } = await api.get('/v1/systems/')

// Create metric
await api.post('/v1/metrics/', {
  system_id: 1,
  cpu_usage: 45.5,
  memory_usage: 67.8,
  disk_usage: 52.3,
  network_in: 1024,
  network_out: 2048
})
```

## 📊 Modelos de Datos

### System
```python
class System(models.Model):
    name = CharField          # Nombre del servidor
    type = CharField          # linux, windows, database
    ip_address = GenericIPAddressField
    status = CharField        # online, offline, warning
    version = CharField
    last_seen = DateTimeField
    ansible_user = CharField
    ansible_port = IntegerField
    ansible_connection = CharField  # ssh, winrm, psrp
```

### Metric
```python
class Metric(models.Model):
    system = ForeignKey(System)
    cpu_usage = DecimalField
    memory_usage = DecimalField
    disk_usage = DecimalField
    network_in = DecimalField
    network_out = DecimalField
    timestamp = DateTimeField
```

### Log
```python
class Log(models.Model):
    system = ForeignKey(System)
    level = CharField         # info, warning, error, critical
    message = TextField
    source = CharField
    timestamp = DateTimeField
```

## 🔐 Autenticación (Opcional)

Para agregar JWT authentication:

```bash
pip install djangorestframework-simplejwt
```

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

# urls.py
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view()),
]
```

## 📚 Recursos

- [Django REST Framework](https://www.django-rest-framework.org/)
- [Celery](https://docs.celeryq.dev/)
- [Ansible Runner](https://ansible-runner.readthedocs.io/)
