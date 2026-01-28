# 🚀 Monitoreo de Infraestructura - Stack Híbrido

## Lo Mejor de Ambos Mundos

Este proyecto combina:
- **Frontend**: Vue 3 + TypeScript (UI moderna y reactiva)
- **Backend**: Django/FastAPI + Ansible (integración nativa)

```
┌─────────────────────────────────────────────────────────┐
│           FRONTEND (Vue 3 SPA)                          │
│     http://localhost:3000                               │
│                                                         │
│  • Vue 3 + TypeScript                                   │
│  • Vue Router                                           │
│  • TanStack Query (React Query for Vue)                │
│  • Tailwind CSS                                         │
│  • Vite (dev server súper rápido)                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ REST API (fetch/axios)
                     ▼
┌─────────────────────────────────────────────────────────┐
│         BACKEND (Django REST API)                       │
│         http://localhost:8000/api/                      │
│                                                         │
│  • Django REST Framework                                │
│  • CORS habilitado                                      │
│  • JWT Authentication                                   │
│  • Celery + Ansible Runner                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │   Ansible Runner     │
          │   Python Native      │
          └──────────┬───────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    [Linux]     [Windows]      [DBs]
```

## 📦 Estructura del Proyecto

```
mix/
├── frontend/                   # Vue 3 SPA
│   ├── src/
│   │   ├── components/        # Componentes Vue reutilizables
│   │   ├── views/             # Páginas/vistas
│   │   ├── composables/       # Lógica reutilizable
│   │   ├── services/          # API calls a Django
│   │   └── router/            # Vue Router
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── backend/                    # Django API
│   ├── config/                # Settings Django
│   ├── apps/
│   │   ├── api/               # REST API endpoints
│   │   ├── core/              # Modelos
│   │   └── ansible_integration/  # Ansible tasks
│   ├── requirements.txt
│   ├── manage.py
│   └── Dockerfile
│
├── docker-compose.yml          # Orquestación completa
├── nginx.conf                  # Reverse proxy
└── README.md
```

## 🎯 Ventajas de Este Stack

### Frontend (Vue 3)
✅ **UI Moderna**: SPA reactiva y rápida  
✅ **TypeScript**: Type safety  
✅ **Hot Reload**: Desarrollo rápido con Vite  
✅ **Componentes Reutilizables**: Ecosistema Vue  
✅ **Performance**: Virtual DOM optimizado  

### Backend (Django)
✅ **Integración Ansible**: Nativa en Python  
✅ **ORM Robusto**: Django ORM maduro  
✅ **Admin Panel**: Django Admin gratis  
✅ **Celery**: Tareas asíncronas  
✅ **Seguridad**: CSRF, XSS, SQL Injection protections  

### Comunicación
✅ **REST API**: Estándar de la industria  
✅ **CORS**: Configurado correctamente  
✅ **JWT**: Autenticación moderna  
✅ **WebSockets** (opcional): Para updates en tiempo real  

## 🚀 Instalación Rápida

### Docker (Recomendado)

```bash
cd mix

# Iniciar todo
docker-compose up --build -d

# Ver logs
docker-compose logs -f

# Acceder a:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000/api/
# - Admin: http://localhost:8000/admin/
```

### Desarrollo Local

#### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

#### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
# → http://localhost:8000
```

## 🔧 Configuración

### 1. Variables de Entorno

**Backend** (`.env`):
```env
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://user:pass@db:5432/monitoreo
REDIS_URL=redis://redis:6379/0
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:8000/api
```

### 2. Configurar Ansible Inventory

```yaml
# backend/ansible/inventory/hosts.yml
all:
  vars:
    django_api_host: backend
  children:
    linux_servers:
      hosts:
        server1:
          ansible_host: 192.168.1.10
          system_id: 1
```

## 📡 API Endpoints

### Systems
```bash
GET    /api/v1/systems/          # Listar sistemas
POST   /api/v1/systems/          # Crear sistema
GET    /api/v1/systems/{id}/     # Detalle sistema
PATCH  /api/v1/systems/{id}/     # Actualizar
DELETE /api/v1/systems/{id}/     # Eliminar
```

### Metrics
```bash
GET    /api/v1/metrics/          # Listar métricas
POST   /api/v1/metrics/          # Crear métrica
POST   /api/v1/metrics/bulk/     # Crear múltiples
GET    /api/v1/metrics/latest/   # Últimas métricas
```

### Logs
```bash
GET    /api/v1/logs/             # Listar logs
POST   /api/v1/logs/             # Crear log
GET    /api/v1/logs/recent/      # Logs recientes
```

### Dashboard
```bash
GET    /api/v1/dashboard/        # Estadísticas completas
```

## 🔄 Flujo de Datos

```
1. Usuario abre Dashboard (Vue) → http://localhost:3000
2. Vue hace fetch a → http://localhost:8000/api/v1/dashboard/
3. Django responde con JSON
4. Vue renderiza datos en componentes
5. Celery ejecuta playbooks cada 5 min
6. Ansible envía datos a Django API
7. Vue se actualiza automáticamente (polling o WebSockets)
```

## 📊 Ejemplo de API Call desde Vue

```typescript
// frontend/src/services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Get all systems
export const getSystems = () => api.get('/v1/systems/')

// Get dashboard stats
export const getDashboard = () => api.get('/v1/dashboard/')

// Create metric
export const createMetric = (data: MetricData) => 
  api.post('/v1/metrics/', data)
```

## 🎨 Componentes Vue con API

```vue
<!-- frontend/src/views/Dashboard.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getDashboard } from '@/services/api'

const stats = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await getDashboard()
    stats.value = data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else>
    <h1>Total Systems: {{ stats.total_systems }}</h1>
    <p>Online: {{ stats.online_systems }}</p>
  </div>
</template>
```

## 🔐 Autenticación JWT

### Backend (Django)
```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}
```

### Frontend (Vue)
```typescript
// Interceptor para agregar token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

## 🆚 Alternativas de Backend

### Opción 1: Django REST Framework (Recomendado)
✅ **Maduro y estable**  
✅ **Admin panel incluido**  
✅ **ORM robusto**  
✅ **Gran comunidad**  
⚠️ **Más pesado que FastAPI**  

### Opción 2: FastAPI (Alternativa Moderna)
✅ **Súper rápido** (async/await)  
✅ **Documentación automática** (Swagger)  
✅ **Type hints nativos**  
✅ **Más ligero**  
⚠️ **Sin admin panel**  
⚠️ **Comunidad más pequeña**  

### Opción 3: Flask (Minimalista)
✅ **Muy ligero**  
✅ **Flexible**  
⚠️ **Requiere más configuración manual**  
⚠️ **Sin ORM incluido**  

## 📖 Comparación de Backends para Ansible

| Característica | Django | FastAPI | Flask |
|----------------|--------|---------|-------|
| **Velocidad** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Integración Ansible** | ✅ Nativa | ✅ Nativa | ✅ Nativa |
| **ORM** | ✅ Incluido | ❌ Separado | ❌ Separado |
| **Admin Panel** | ✅ Gratis | ❌ No | ❌ No |
| **Async** | ⚠️ Parcial | ✅ Total | ⚠️ Parcial |
| **Curva Aprendizaje** | Media | Baja | Baja |
| **Documentación API** | Manual | ✅ Auto (Swagger) | Manual |
| **Ideal para** | Apps completas | APIs puras | Microservicios |

## 🏆 Recomendación Final

### Para Monitoreo con Ansible:

**1. Django + Vue 3** (Este proyecto)
- ✅ Mejor para aplicaciones completas
- ✅ Admin panel incluido
- ✅ Comunidad grande
- ✅ ORM robusto

**2. FastAPI + Vue 3** (Ver carpeta `mix-fastapi/`)
- ✅ Mejor para APIs puras
- ✅ Más rápido (async)
- ✅ Documentación automática
- ✅ Código más limpio

**3. Django Monolítico** (Proyecto `django/`)
- ✅ Más simple
- ✅ Un solo código base
- ⚠️ Frontend menos moderno

## 🔗 Recursos

- [Django REST Framework](https://www.django-rest-framework.org/)
- [Vue 3 Docs](https://vuejs.org/)
- [Ansible Runner](https://ansible-runner.readthedocs.io/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Celery](https://docs.celeryq.dev/)

## 📝 Siguiente Paso

Revisa:
1. **`QUICKSTART.md`** - Guía de inicio rápido
2. **`COMPARISON.md`** - Django vs FastAPI vs Flask
3. **`frontend/README.md`** - Detalles del frontend Vue
4. **`backend/README.md`** - Detalles del backend
