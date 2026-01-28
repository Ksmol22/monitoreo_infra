# Arquitectura de Microservicios - Monitoreo de Infraestructura

## 📐 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Vue.js 3)                      │
│                      http://localhost:3000                       │
│                         (Nginx en Docker)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Express)                       │
│                      http://localhost:4000                       │
│                   (Proxy + Rate Limiting + CORS)                 │
└───────┬──────────────────┬─────────────────┬────────────────────┘
        │                  │                 │
        │                  │                 │
        ▼                  ▼                 ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   SYSTEMS     │  │   METRICS     │  │     LOGS      │
│   SERVICE     │  │   SERVICE     │  │   SERVICE     │
│   :4001       │  │   :4002       │  │   :4003       │
│               │  │               │  │               │
│ - CRUD        │  │ - CRUD        │  │ - CRUD        │
│ - Validation  │  │ - Aggregation │  │ - Filtering   │
│ - Security    │  │ - Security    │  │ - Security    │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                  │                   │
        └──────────────────┴───────────────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │    PostgreSQL 15    │
                │      :5432          │
                │                     │
                │  - systems table    │
                │  - metrics table    │
                │  - logs table       │
                └─────────────────────┘
```

## 🎯 Principios de Diseño

### 1. Separation of Concerns (SoC)
Cada microservicio tiene una **responsabilidad única**:
- **Systems Service**: Gestión de sistemas monitoreados
- **Metrics Service**: Recopilación y consulta de métricas
- **Logs Service**: Almacenamiento y búsqueda de logs

### 2. Single Source of Truth
- Base de datos **compartida** entre servicios (patrón Database-per-Service simplificado)
- Cada servicio accede solo a sus tablas correspondientes
- Posibilidad futura de separar DB por servicio

### 3. API Gateway Pattern
- **Punto de entrada único** para el frontend
- Enrutamiento inteligente a microservicios
- Seguridad centralizada (CORS, Rate Limiting)
- Simplifica el código del frontend

### 4. Independencia y Escalabilidad
- Cada microservicio puede escalarse independientemente
- Despliegues independientes sin downtime
- Fallo de un servicio no afecta a los demás

## 🔐 Seguridad

### Capas de Seguridad

#### 1. API Gateway
```typescript
- Helmet: Headers de seguridad HTTP
- CORS: Control de orígenes permitidos
- Rate Limiting: 1000 req/15min por IP
- Session Management (preparado para JWT)
```

#### 2. Microservicios
```typescript
- Helmet: Headers de seguridad HTTP
- CORS: Validación de origen
- Rate Limiting específico por servicio
- Validación con Zod en cada endpoint
```

#### 3. Base de Datos
```typescript
- Drizzle ORM: Protección contra SQL Injection
- Prepared Statements
- Validación de tipos con TypeScript
```

## 📊 Comunicación entre Servicios

### Patrón Actual: Sincrónico (HTTP/REST)

```
Frontend → API Gateway → Microservicio → PostgreSQL
                ↓
            Response
```

**Ventajas:**
- Simple de implementar
- Fácil de debuggear
- Request/Response directo

**Desventajas:**
- Acoplamiento temporal
- Si un servicio falla, falla la request

### Patrón Futuro Recomendado: Asincrónico (Message Queue)

```
Frontend → API Gateway → Queue (RabbitMQ/Kafka) → Microservicio
                ↓                    ↓
            ACK                  Process
```

## 🗄️ Gestión de Datos

### Modelo Actual: Shared Database

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Systems    │     │  Metrics    │     │   Logs      │
│  Service    │     │  Service    │     │  Service    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                    │
       └───────────────────┴────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL │
                    │             │
                    │  - systems  │
                    │  - metrics  │
                    │  - logs     │
                    └─────────────┘
```

**Ventajas:**
- Transacciones ACID
- Joins entre tablas
- Consistencia fuerte

**Desventajas:**
- Acoplamiento de datos
- Punto único de fallo

### Modelo Futuro: Database per Service

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Systems    │     │  Metrics    │     │   Logs      │
│  Service    │     │  Service    │     │  Service    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                    │
┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
│ PostgreSQL  │     │ TimescaleDB │     │ ElasticSearch│
│  systems    │     │  metrics    │     │    logs     │
└─────────────┘     └─────────────┘     └─────────────┘
```

## 🚀 Flujo de Datos

### 1. Consulta de Sistemas

```
1. Usuario accede a Dashboard
2. Frontend hace GET /api/systems
3. API Gateway redirige a Systems Service
4. Systems Service consulta PostgreSQL
5. Retorna JSON al Frontend
6. Vue.js renderiza componentes
```

### 2. Creación de Métrica

```
1. Agente de monitoreo POST /api/metrics
2. API Gateway valida rate limit
3. Redirige a Metrics Service
4. Metrics Service valida con Zod
5. Inserta en PostgreSQL
6. Retorna confirmación
```

### 3. Búsqueda de Logs

```
1. Usuario filtra logs por nivel
2. Frontend GET /api/logs?level=error
3. API Gateway redirige
4. Logs Service aplica filtros
5. Query optimizado con índices
6. Retorna resultados paginados
```

## 🔄 Escalabilidad

### Estrategias de Escalamiento

#### Horizontal Scaling
```bash
# Escalar servicio de métricas a 3 instancias
docker-compose up -d --scale metrics-service=3

# Load Balancer distribuye carga
```

#### Vertical Scaling
```yaml
# docker-compose.yml
metrics-service:
  deploy:
    resources:
      limits:
        cpus: '2.0'
        memory: 2G
```

#### Caching (Futuro)
```
Redis Cache → Reducir carga en PostgreSQL
- Cache de sistemas frecuentes
- Cache de métricas agregadas
- Cache de logs recientes
```

## 📈 Monitoreo de Microservicios

### Health Checks

```
GET /health en cada servicio:

{
  "status": "ok",
  "service": "systems",
  "uptime": 123456,
  "memory": {...},
  "database": "connected"
}
```

### Logging Centralizado

```
Todos los servicios loggean en formato JSON:
{
  "timestamp": "2026-01-27T...",
  "service": "metrics-service",
  "level": "info",
  "message": "..."
}

Futuro: Agregación con ELK Stack
```

## 🛠️ Decisiones Técnicas

| Decisión | Razón |
|----------|-------|
| **Express** | Ligero, flexible, gran ecosistema |
| **TypeScript** | Type safety, mejor DX |
| **Drizzle ORM** | Moderno, type-safe, excelente DX |
| **PostgreSQL** | ACID, confiable, buen rendimiento |
| **Vue 3** | Reactivo, composable, fácil de aprender |
| **Docker** | Portabilidad, fácil deploy |
| **Pnpm** (futuro) | Más rápido que npm, ahorra espacio |

## 🔮 Roadmap de Arquitectura

### Fase 1: ✅ Actual
- Microservicios básicos
- API Gateway
- Shared Database
- Docker Compose

### Fase 2: 🚧 Corto Plazo
- [ ] Autenticación JWT en Gateway
- [ ] Redis para caching
- [ ] Logging centralizado
- [ ] Métricas de performance

### Fase 3: 📋 Mediano Plazo
- [ ] Message Queue (RabbitMQ)
- [ ] Database per Service
- [ ] Service Discovery (Consul)
- [ ] Load Balancer (Nginx)

### Fase 4: 🌟 Largo Plazo
- [ ] Kubernetes deployment
- [ ] Service Mesh (Istio)
- [ ] GraphQL Federation
- [ ] Event Sourcing

## 📚 Referencias

- [Microservices Patterns](https://microservices.io/patterns/)
- [12 Factor App](https://12factor.net/)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)
