# Monitoreo de Infraestructura - Arquitectura de Microservicios

Sistema de monitoreo de infraestructura construido con **arquitectura de microservicios**, **Vue.js 3** y **Node.js/Express**.

## 🏗️ Arquitectura

```
monitoreo-infra/
├── frontend/                    # Aplicación Vue.js 3
│   ├── src/
│   │   ├── components/         # Componentes Vue
│   │   ├── composables/        # Composables
│   │   ├── pages/              # Vistas
│   │   └── router.ts           # Vue Router
│   ├── Dockerfile
│   └── package.json
│
├── backend/
│   ├── api-gateway/            # 🌐 Gateway (Puerto 4000)
│   │   ├── src/
│   │   │   └── index.ts       # Proxy a microservicios
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── services/
│   │   ├── systems/           # 🖥️ Microservicio de Sistemas (Puerto 4001)
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   └── routes.ts
│   │   │   ├── Dockerfile
│   │   │   └── package.json
│   │   │
│   │   ├── metrics/           # 📊 Microservicio de Métricas (Puerto 4002)
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   └── routes.ts
│   │   │   ├── Dockerfile
│   │   │   └── package.json
│   │   │
│   │   └── logs/              # 📝 Microservicio de Logs (Puerto 4003)
│   │       ├── src/
│   │       │   ├── index.ts
│   │       │   └── routes.ts
│   │       ├── Dockerfile
│   │       └── package.json
│   │
│   └── shared/                # 📦 Código compartido
│       ├── db.ts              # Conexión DB
│       ├── schema.ts          # Esquemas Drizzle
│       └── package.json
│
└── docker-compose.yml         # Orquestación de servicios
```

## 🚀 Stack Tecnológico

### Frontend
- **Vue 3** + TypeScript
- **Vue Router** - Enrutamiento
- **Pinia** - State management
- **TanStack Query** - Data fetching
- **PrimeVue** - Componentes UI
- **Tailwind CSS** - Estilos
- **Vite** - Build tool

### Backend (Microservicios)
- **Node.js** + **Express** + TypeScript
- **Drizzle ORM** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos compartida
- **Zod** - Validación de datos
- **Helmet** - Seguridad HTTP
- **CORS** - Control de acceso
- **Rate Limiting** - Protección contra abuso

### Infraestructura
- **Docker** + **Docker Compose**
- **Nginx** - Servidor web para frontend
- **PostgreSQL 15** - Base de datos

## 📦 Instalación y Configuración

### Opción 1: Docker (Recomendado)

```bash
# Clonar el repositorio
git clone <repo-url>
cd monitoreo-infra

# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

**URLs de Acceso:**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000
- Systems Service: http://localhost:4001
- Metrics Service: http://localhost:4002
- Logs Service: http://localhost:4003

### Opción 2: Desarrollo Local

#### 1. Instalar PostgreSQL
```bash
# Asegúrate de tener PostgreSQL corriendo en localhost:5432
# O usa Docker:
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=monitoreo_infra \
  -p 5432:5432 \
  postgres:15-alpine
```

#### 2. Instalar dependencias

```bash
# Frontend
cd frontend
npm install

# API Gateway
cd ../backend/api-gateway
npm install

# Shared
cd ../shared
npm install

# Systems Service
cd ../services/systems
npm install

# Metrics Service
cd ../metrics
npm install

# Logs Service
cd ../logs
npm install
```

#### 3. Configurar variables de entorno

Crea archivos `.env` en cada servicio:

**backend/api-gateway/.env:**
```env
PORT=4000
SYSTEMS_SERVICE_URL=http://localhost:4001
METRICS_SERVICE_URL=http://localhost:4002
LOGS_SERVICE_URL=http://localhost:4003
ALLOWED_ORIGINS=http://localhost:3000
```

**backend/services/systems/.env:**
```env
PORT=4001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/monitoreo_infra
ALLOWED_ORIGINS=http://localhost:3000
```

**backend/services/metrics/.env:**
```env
PORT=4002
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/monitoreo_infra
ALLOWED_ORIGINS=http://localhost:3000
```

**backend/services/logs/.env:**
```env
PORT=4003
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/monitoreo_infra
ALLOWED_ORIGINS=http://localhost:3000
```

#### 4. Ejecutar servicios

Abre 5 terminales:

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 2 - API Gateway:**
```bash
cd backend/api-gateway
npm run dev
```

**Terminal 3 - Systems Service:**
```bash
cd backend/services/systems
npm run dev
```

**Terminal 4 - Metrics Service:**
```bash
cd backend/services/metrics
npm run dev
```

**Terminal 5 - Logs Service:**
```bash
cd backend/services/logs
npm run dev
```

## 🔌 API Endpoints

### API Gateway (Puerto 4000)

Todos los endpoints se acceden a través del gateway:

#### Sistemas
- `GET /api/systems` - Listar sistemas
- `GET /api/systems/:id` - Obtener sistema
- `POST /api/systems` - Crear sistema
- `PATCH /api/systems/:id` - Actualizar sistema
- `DELETE /api/systems/:id` - Eliminar sistema

#### Métricas
- `GET /api/metrics?systemId=1&limit=100` - Listar métricas
- `GET /api/metrics/:id` - Obtener métrica
- `POST /api/metrics` - Crear métrica
- `POST /api/metrics/bulk` - Crear múltiples métricas

#### Logs
- `GET /api/logs?systemId=1&level=error` - Listar logs
- `GET /api/logs/:id` - Obtener log
- `POST /api/logs` - Crear log
- `POST /api/logs/bulk` - Crear múltiples logs

### Health Checks
- `GET /health` - Gateway health
- `GET http://localhost:4001/health` - Systems service
- `GET http://localhost:4002/health` - Metrics service
- `GET http://localhost:4003/health` - Logs service

## 🔒 Seguridad

Cada microservicio incluye:

- ✅ **Helmet** - Headers de seguridad HTTP
- ✅ **CORS** - Control de acceso por origen
- ✅ **Rate Limiting** - Protección contra abuso
- ✅ **Validación** con Zod
- ✅ **Sanitización** de inputs

## 📊 Monitoreo y Logs

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f api-gateway
docker-compose logs -f systems-service
docker-compose logs -f metrics-service
docker-compose logs -f logs-service

# Ver logs del frontend
docker-compose logs -f frontend
```

## 🧪 Testing

```bash
# Frontend
cd frontend
npm run test

# Backend (cada microservicio)
cd backend/services/systems
npm run test
```

## 🚢 Despliegue

### Docker Compose (Producción)

```bash
# Build y levantar
docker-compose up -d --build

# Escalar servicios
docker-compose up -d --scale systems-service=3 --scale metrics-service=3
```

### Variables de Entorno de Producción

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
ALLOWED_ORIGINS=https://tudominio.com
```

## 🔧 Mantenimiento

### Actualizar dependencias

```bash
# Frontend
cd frontend && npm update

# Cada microservicio
cd backend/services/systems && npm update
cd backend/services/metrics && npm update
cd backend/services/logs && npm update
cd backend/api-gateway && npm update
```

### Migración de base de datos

```bash
cd backend/shared
npm run db:generate
npm run db:push
```

## 📈 Escalabilidad

La arquitectura de microservicios permite:

- ✅ Escalar servicios independientemente
- ✅ Desplegar actualizaciones sin downtime
- ✅ Agregar nuevos microservicios fácilmente
- ✅ Balanceo de carga por servicio

## 🆘 Troubleshooting

### Puerto ya en uso
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

### Problemas de conexión a DB
```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep postgres

# Ver logs de PostgreSQL
docker-compose logs postgres
```

### Frontend no conecta con backend
- Verifica que el API Gateway esté corriendo en puerto 4000
- Revisa configuración de proxy en `vite.config.ts`
- Verifica CORS en el API Gateway

## 📄 Licencia

MIT

## 👥 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
