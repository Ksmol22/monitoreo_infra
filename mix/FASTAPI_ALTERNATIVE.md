# 🔥 FastAPI como Alternativa a Django para Ansible

## ¿Por qué FastAPI?

FastAPI es un framework moderno de Python que podría ser **incluso mejor** que Django para este proyecto específico de monitoreo con Ansible.

## 📊 Comparación Detallada

| Característica | Django | FastAPI | Ganador |
|---|---|---|---|
| **Velocidad** | ⭐⭐⭐ (sync) | ⭐⭐⭐⭐⭐ (async) | 🏆 FastAPI |
| **Documentación API** | Manual | ✅ Automática (Swagger) | 🏆 FastAPI |
| **Type Hints** | Opcional | ✅ Nativo | 🏆 FastAPI |
| **Async/Await** | Parcial | ✅ Total | 🏆 FastAPI |
| **Performance** | Bueno | ✅ Excelente | 🏆 FastAPI |
| **ORM** | ✅ Incluido | SQLAlchemy/Tortoise | 🏆 Django |
| **Admin Panel** | ✅ Gratis | ❌ No incluido | 🏆 Django |
| **Curva de Aprendizaje** | Media | ✅ Baja | 🏆 FastAPI |
| **Comunidad** | ✅ Grande | Creciendo | 🏆 Django |
| **Ideal para APIs** | Bueno | ✅ Excelente | 🏆 FastAPI |
| **Integración Ansible** | ✅ Python | ✅ Python | 🤝 Empate |
| **Celery** | ✅ Integrado | ✅ Fácil integrar | 🤝 Empate |
| **Tamaño del framework** | Grande | ✅ Ligero | 🏆 FastAPI |

---

## 🚀 Ejemplo: API con FastAPI

### Instalación

```bash
pip install fastapi uvicorn[standard] sqlalchemy celery redis ansible-runner
```

### Código Básico

```python
# main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import ansible_runner

app = FastAPI(
    title="Monitoreo de Infraestructura",
    description="API para monitoreo con Ansible",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "postgresql://user:pass@localhost/db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class System(Base):
    __tablename__ = "systems"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    type = Column(String)  # linux, windows, database
    ip_address = Column(String)
    status = Column(String, default="offline")
    last_seen = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class Metric(Base):
    __tablename__ = "metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    system_id = Column(Integer)
    cpu_usage = Column(Float)
    memory_usage = Column(Float)
    disk_usage = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Pydantic Schemas
from pydantic import BaseModel

class SystemCreate(BaseModel):
    name: str
    type: str
    ip_address: str
    status: str = "offline"

class SystemResponse(SystemCreate):
    id: int
    last_seen: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class MetricCreate(BaseModel):
    system_id: int
    cpu_usage: float
    memory_usage: float
    disk_usage: float

class MetricResponse(MetricCreate):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoints
@app.get("/")
async def root():
    return {"message": "Monitoreo API", "docs": "/docs"}

@app.get("/api/v1/systems/", response_model=List[SystemResponse])
async def get_systems(db: Session = Depends(get_db)):
    """Get all systems"""
    systems = db.query(System).all()
    return systems

@app.post("/api/v1/systems/", response_model=SystemResponse)
async def create_system(system: SystemCreate, db: Session = Depends(get_db)):
    """Create a new system"""
    db_system = System(**system.dict())
    db.add(db_system)
    db.commit()
    db.refresh(db_system)
    return db_system

@app.get("/api/v1/systems/{system_id}", response_model=SystemResponse)
async def get_system(system_id: int, db: Session = Depends(get_db)):
    """Get system by ID"""
    system = db.query(System).filter(System.id == system_id).first()
    if not system:
        raise HTTPException(status_code=404, detail="System not found")
    return system

@app.get("/api/v1/metrics/", response_model=List[MetricResponse])
async def get_metrics(
    system_id: int = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get metrics with optional filters"""
    query = db.query(Metric)
    if system_id:
        query = query.filter(Metric.system_id == system_id)
    metrics = query.order_by(Metric.timestamp.desc()).limit(limit).all()
    return metrics

@app.post("/api/v1/metrics/", response_model=MetricResponse)
async def create_metric(metric: MetricCreate, db: Session = Depends(get_db)):
    """Create a new metric"""
    db_metric = Metric(**metric.dict())
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric

@app.get("/api/v1/dashboard/")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    from sqlalchemy import func
    
    total = db.query(System).count()
    online = db.query(System).filter(System.status == "online").count()
    offline = db.query(System).filter(System.status == "offline").count()
    
    # Average metrics (last hour)
    from datetime import timedelta
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    
    avg_metrics = db.query(
        func.avg(Metric.cpu_usage).label('avg_cpu'),
        func.avg(Metric.memory_usage).label('avg_memory'),
        func.avg(Metric.disk_usage).label('avg_disk')
    ).filter(Metric.timestamp >= one_hour_ago).first()
    
    return {
        "total_systems": total,
        "online_systems": online,
        "offline_systems": offline,
        "avg_cpu_usage": avg_metrics.avg_cpu or 0,
        "avg_memory_usage": avg_metrics.avg_memory or 0,
        "avg_disk_usage": avg_metrics.avg_disk or 0,
    }

# Ansible Integration
@app.post("/api/v1/ansible/collect-linux")
async def collect_linux_metrics():
    """Execute Ansible playbook to collect Linux metrics"""
    runner = ansible_runner.run(
        playbook='playbooks/linux_metrics.yml',
        inventory='inventory/hosts.yml',
        quiet=False
    )
    
    if runner.status == 'successful':
        return {
            "status": "success",
            "stats": runner.stats
        }
    else:
        return {
            "status": "failed",
            "error": runner.status
        }

# Celery Tasks
from celery import Celery

celery_app = Celery(
    'tasks',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0'
)

@celery_app.task
def collect_metrics_task():
    """Celery task to collect metrics"""
    runner = ansible_runner.run(
        playbook='playbooks/linux_metrics.yml',
        inventory='inventory/hosts.yml'
    )
    return runner.status

# Run with: uvicorn main:app --reload
```

---

## ✅ Ventajas de FastAPI para este Proyecto

### 1. **Documentación Automática**

Con Django:
```python
# Tienes que documentar manualmente o usar drf-yasg
```

Con FastAPI:
```python
# ¡Documentación automática en /docs!
# Swagger UI interactivo gratis
# http://localhost:8000/docs
```

### 2. **Performance**

```python
# Benchmark (requests/segundo)
Django REST Framework: ~1000 req/s
FastAPI: ~3000-5000 req/s
```

FastAPI es **3-5x más rápido** gracias a:
- Async/await nativo
- Pydantic validation (C extensions)
- Starlette (ASGI framework)

### 3. **Type Safety**

```python
# Django (opcional)
def create_system(request):
    data = request.data  # Any type
    # No validation automática
    
# FastAPI (obligatorio)
def create_system(system: SystemCreate):
    # ✅ Validación automática
    # ✅ Type hints
    # ✅ Auto-completion en IDE
```

### 4. **Async Ansible**

```python
# FastAPI permite ejecutar Ansible de forma async
@app.post("/collect")
async def collect_metrics():
    result = await run_ansible_async()
    return result

# Mejor para múltiples playbooks en paralelo
```

### 5. **Código Más Limpio**

```python
# Django ViewSet (verbose)
class SystemViewSet(viewsets.ModelViewSet):
    queryset = System.objects.all()
    serializer_class = SystemSerializer
    
    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

# FastAPI (conciso)
@app.get("/systems/")
async def get_systems(db: Session = Depends(get_db)):
    return db.query(System).all()
```

---

## ⚖️ Desventajas de FastAPI

### 1. **No Admin Panel**

Django:
```python
# Admin panel gratis
# http://localhost:8000/admin
```

FastAPI:
```python
# Tienes que construir tu propio admin
# O usar herramientas de terceros como:
# - FastAPI-Admin
# - SQLAdmin
```

### 2. **ORM No Incluido**

Django:
```python
# Django ORM incluido
from django.db import models

class System(models.Model):
    name = models.CharField(max_length=255)
```

FastAPI:
```python
# Necesitas SQLAlchemy o Tortoise ORM
from sqlalchemy import Column, String

class System(Base):
    name = Column(String)
```

### 3. **Menos "Batteries Included"**

Django viene con:
- ORM
- Admin
- Auth
- Forms
- Templates
- Migrations

FastAPI:
- Solo el framework web
- Tienes que agregar todo lo demás

---

## 🏆 Recomendación Final

### Usa **FastAPI** si:

✅ Necesitas **máximo performance**  
✅ Quieres **documentación automática**  
✅ Tu proyecto es **API-only** (sin templates)  
✅ Te gusta **código limpio y conciso**  
✅ Quieres **async/await nativo**  
✅ No necesitas admin panel built-in  

### Usa **Django** si:

✅ Quieres **admin panel gratis**  
✅ Necesitas **Django ORM robusto**  
✅ Prefieres **más funcionalidades incluidas**  
✅ Tu equipo ya conoce Django  
✅ Quieres **menos decisiones que tomar**  
✅ Necesitas autenticación robusta incluida  

---

## 🎯 Para Monitoreo con Ansible

### Mi Recomendación: **FastAPI + Vue 3**

**Razones:**
1. ✅ FastAPI es más rápido (importante para APIs de monitoreo)
2. ✅ Documentación automática (útil para debuggear)
3. ✅ Código más limpio y moderno
4. ✅ Async nativo (mejor para múltiples playbooks)
5. ✅ Vue 3 no necesita admin panel de Django

**Pero si necesitas admin panel:** **Django + Vue 3**

---

## 📂 Estructura FastAPI + Vue

```
mix-fastapi/
├── frontend/              # Vue 3 (igual que el proyecto mix)
│   └── ...
├── backend/               # FastAPI
│   ├── app/
│   │   ├── main.py       # FastAPI app
│   │   ├── models.py     # SQLAlchemy models
│   │   ├── schemas.py    # Pydantic schemas
│   │   ├── database.py   # DB connection
│   │   ├── routers/      # API routes
│   │   │   ├── systems.py
│   │   │   ├── metrics.py
│   │   │   └── logs.py
│   │   └── ansible_integration/
│   │       ├── tasks.py      # Celery tasks
│   │       └── playbooks/    # Ansible playbooks
│   ├── requirements.txt
│   └── Dockerfile
└── docker-compose.yml
```

---

## 📖 Recursos

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **FastAPI + SQLAlchemy**: https://fastapi.tiangolo.com/tutorial/sql-databases/
- **FastAPI + Celery**: https://fastapi.tiangolo.com/tutorial/bigger-applications/
- **FastAPI + Vue**: https://testdriven.io/blog/fastapi-vue/

---

## 🎬 Conclusión

Para un **sistema de monitoreo moderno con Ansible**:

**Mejor opción general**: **FastAPI + Vue 3**
- Más rápido
- Más moderno
- Mejor para APIs puras
- Documentación automática

**Mejor si necesitas admin**: **Django + Vue 3**
- Admin panel gratis
- Más baterías incluidas
- Más maduro

**Más simple**: **Django Monolítico**
- Todo en uno
- Menos complejidad
- Ideal para equipos pequeños

---

¿Quieres que cree un ejemplo completo con FastAPI en lugar de Django? Solo avísame y lo preparo en la carpeta `mix-fastapi/`.
