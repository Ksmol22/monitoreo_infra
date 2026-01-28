# 🚀 Infrastructure Monitoring - FastAPI + Vue 3

Sistema de monitoreo de infraestructura con **FastAPI** (backend) y **Vue 3** (frontend), integrado con **Ansible** para automatización.

## 📋 Características

### ⚡ FastAPI Backend
- **Alta Performance**: 3-5x más rápido que Django
- **Async Nativo**: Soporte completo para async/await
- **Documentación Automática**: Swagger UI y ReDoc
- **Type Safety**: Pydantic para validación de datos
- **SQLAlchemy 2.0**: ORM async con PostgreSQL

### 🎨 Vue 3 Frontend
- **Composition API**: Código modular y reutilizable
- **TypeScript**: Type safety en frontend
- **TanStack Query**: Data fetching y caching inteligente
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Build tool ultra rápido

### 🤖 Ansible Integration
- **ansible-runner**: API Python nativa
- **Playbooks**: Linux, Windows, y Database monitoring
- **Celery**: Ejecución asíncrona de playbooks
- **Scheduling**: Colección automática cada 5 minutos

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    Nginx (Port 80)                       │
│  ┌──────────────────┐          ┌──────────────────┐     │
│  │  Frontend (3000) │          │  Backend (8000)  │     │
│  │   Vue 3 + Vite   │◄────────►│    FastAPI       │     │
│  └──────────────────┘          └────────┬─────────┘     │
└────────────────────────────────────────┼────────────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
         ┌────▼────┐              ┌──────▼──────┐          ┌───────▼──────┐
         │  Redis  │              │ PostgreSQL  │          │    Celery    │
         │ (Cache) │              │   (Data)    │          │  Worker+Beat │
         └─────────┘              └─────────────┘          └──────────────┘
                                                                   │
                                                          ┌────────▼────────┐
                                                          │    Ansible      │
                                                          │   Playbooks     │
                                                          └─────────────────┘
```

### 6 Contenedores Docker

1. **db**: PostgreSQL 15 (base de datos)
2. **redis**: Redis 7 (broker y cache)
3. **backend**: FastAPI + Uvicorn
4. **celery_worker**: Ejecuta tareas Ansible
5. **celery_beat**: Scheduler de tareas
6. **frontend**: Vue 3 + Vite
7. **nginx**: Reverse proxy

## 📦 Estructura del Proyecto

```
mix_fastapi/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/endpoints/  # API endpoints
│   │   │   ├── systems.py     # CRUD sistemas
│   │   │   ├── metrics.py     # Métricas
│   │   │   ├── logs.py        # Logs
│   │   │   └── dashboard.py   # Dashboard stats
│   │   ├── core/              # Core modules
│   │   │   ├── config.py      # Settings
│   │   │   └── database.py    # SQLAlchemy async
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── tasks/             # Celery tasks
│   │   │   ├── ansible_tasks.py
│   │   │   └── maintenance_tasks.py
│   │   ├── celery_app.py      # Celery config
│   │   └── main.py            # FastAPI app
│   ├── ansible/
│   │   ├── inventory/hosts.yml
│   │   └── playbooks/
│   │       ├── linux_metrics.yml
│   │       ├── windows_metrics.yml
│   │       └── database_metrics.yml
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                   # Vue 3 Frontend
│   ├── src/
│   │   ├── views/             # Páginas
│   │   │   ├── Dashboard.vue
│   │   │   ├── Systems.vue
│   │   │   └── Logs.vue
│   │   ├── services/api.ts    # API client
│   │   ├── types/index.ts     # TypeScript types
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── router.ts
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── docker-compose.yml          # Orquestación
├── nginx.conf                  # Reverse proxy
├── README.md
└── QUICKSTART.md
```

## 🚀 Quick Start

### Prerequisitos

- Docker & Docker Compose
- Git

### 1. Clonar e Iniciar

```bash
# Navegar al proyecto
cd c:\Users\yulir\OneDrive\Documents\monitoreo_infra\mix_fastapi

# Copiar variables de entorno
cp backend/.env.example backend/.env

# Levantar todos los servicios
docker-compose up --build -d
```

### 2. Verificar Servicios

```bash
# Ver logs
docker-compose logs -f

# Ver estado
docker-compose ps
```

### 3. Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **Nginx**: http://localhost

## 📡 API Endpoints

Base URL: `http://localhost:8000/api/v1/`

### Systems
```
GET    /systems/          # Listar sistemas
GET    /systems/{id}      # Obtener sistema
POST   /systems/          # Crear sistema
PUT    /systems/{id}      # Actualizar sistema
DELETE /systems/{id}      # Eliminar sistema
GET    /systems/stats/count  # Contadores
```

### Metrics
```
GET    /metrics/          # Listar métricas
GET    /metrics/latest    # Última métrica por sistema
GET    /metrics/{id}      # Obtener métrica
POST   /metrics/          # Crear métrica
POST   /metrics/bulk      # Crear múltiples
```

### Logs
```
GET    /logs/             # Listar logs
GET    /logs/recent       # Logs recientes
GET    /logs/{id}         # Obtener log
POST   /logs/             # Crear log
```

### Dashboard
```
GET    /dashboard/stats   # Estadísticas completas
```

## 🎯 Ventajas de FastAPI

### Performance
- **3-5x más rápido** que Django
- Async/await nativo
- Uvicorn (ASGI server)

### Developer Experience
- **Docs automáticas**: Swagger + ReDoc
- **Type hints**: Python 3.11+
- **Pydantic validation**: Automática
- **Less boilerplate**: Más conciso

### Example Comparison

**Django REST Framework**:
```python
# serializers.py
class SystemSerializer(serializers.ModelSerializer):
    class Meta:
        model = System
        fields = '__all__'

# views.py
class SystemViewSet(viewsets.ModelViewSet):
    queryset = System.objects.all()
    serializer_class = SystemSerializer
```

**FastAPI**:
```python
# Schemas + Endpoint en uno
class SystemCreate(BaseModel):
    name: str
    type: str
    ip_address: str

@app.post("/systems/", response_model=System)
async def create_system(system: SystemCreate, db: AsyncSession = Depends(get_db)):
    db_system = System(**system.dict())
    db.add(db_system)
    await db.commit()
    return db_system
```

## 🔧 Configuración Ansible

### 1. Editar Inventory

Edita [backend/ansible/inventory/hosts.yml](backend/ansible/inventory/hosts.yml):

```yaml
all:
  children:
    linux:
      hosts:
        server1:
          ansible_host: 192.168.1.100
          ansible_user: ansible
    
    windows:
      hosts:
        winserver1:
          ansible_host: 192.168.1.200
          ansible_connection: winrm
    
    databases:
      hosts:
        db1:
          ansible_host: 192.168.1.300
```

### 2. Probar Conectividad

```bash
# Entrar al contenedor backend
docker exec -it monitoreo_backend_fastapi bash

# Ping a todos los hosts
ansible all -m ping -i ansible/inventory/hosts.yml
```

### 3. Ejecutar Playbook Manualmente

```bash
ansible-playbook ansible/playbooks/linux_metrics.yml -i ansible/inventory/hosts.yml
```

## 🔄 Celery Tasks

### Tareas Programadas

```python
# Cada 5 minutos
- collect_linux_metrics
- collect_windows_metrics
- collect_database_metrics

# Cada 1 minuto
- update_system_statuses

# Diario a las 2 AM
- cleanup_old_metrics
```

### Ver Tareas en Ejecución

```bash
# Logs de Celery Worker
docker-compose logs -f celery_worker

# Logs de Celery Beat
docker-compose logs -f celery_beat
```

## 🛠️ Desarrollo

### Backend

```bash
# Instalar dependencias localmente
cd backend
pip install -r requirements.txt

# Ejecutar FastAPI (con hot reload)
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
# Instalar dependencias
cd frontend
npm install

# Dev server (con HMR)
npm run dev
# → http://localhost:3000
```

### Crear Migración (Alembic)

```bash
# Dentro del contenedor backend
docker exec -it monitoreo_backend_fastapi bash

# Crear migración
alembic revision --autogenerate -m "Add new field"

# Aplicar migración
alembic upgrade head
```

## 📊 Modelos de Datos

### System
```python
id: int
name: str (unique)
type: Enum[linux, windows, database]
ip_address: str
status: Enum[online, offline, warning]
version: str
last_seen: datetime
ansible_user: str
ansible_port: int
ansible_connection: str
created_at: datetime
updated_at: datetime
```

### Metric
```python
id: int
system_id: int (FK)
cpu_usage: Decimal(5,2)
memory_usage: Decimal(5,2)
disk_usage: Decimal(5,2)
network_in: Decimal(15,2)
network_out: Decimal(15,2)
timestamp: datetime
```

### Log
```python
id: int
system_id: int (FK)
level: Enum[info, warning, error, critical]
message: str
source: str
timestamp: datetime
```

## 🐛 Troubleshooting

### Backend no inicia

```bash
# Ver logs
docker-compose logs backend

# Verificar BD
docker-compose logs db

# Recrear contenedor
docker-compose up --build backend
```

### Celery no ejecuta tareas

```bash
# Ver logs de worker
docker-compose logs celery_worker

# Ver logs de beat
docker-compose logs celery_beat

# Verificar Redis
docker exec -it monitoreo_redis_fastapi redis-cli ping
```

### Frontend no conecta con backend

1. Verificar CORS en `backend/app/core/config.py`
2. Verificar `VITE_API_URL` en frontend
3. Ver logs: `docker-compose logs nginx`

## 📚 Documentación Adicional

- Ver [QUICKSTART.md](QUICKSTART.md) para guía paso a paso
- Ver [backend/README.md](backend/README.md) para detalles del backend
- Ver [frontend/README.md](frontend/README.md) para detalles del frontend

## 🤝 Comparación con Django

| Feature | FastAPI | Django |
|---------|---------|--------|
| **Performance** | ⚡ 3-5x más rápido | ⚠️ Más lento |
| **Async Support** | ✅ Nativo | ⚠️ Limitado |
| **Auto Docs** | ✅ Swagger + ReDoc | ❌ No |
| **Admin Panel** | ❌ No incluido | ✅ Django Admin |
| **ORM** | SQLAlchemy (separado) | ✅ Django ORM |
| **Learning Curve** | 🟢 Fácil | 🟡 Media |
| **Ecosystem** | 🟡 En crecimiento | ✅ Muy maduro |

## 📄 Licencia

MIT

## 👤 Autor

Yuli R.
