# 🚀 Infrastructure Monitoring - FastAPI + Vue 3 + Prometheus + Grafana

Sistema completo de monitoreo de infraestructura con **FastAPI** (backend), **Vue 3** (frontend), **Prometheus** (métricas) y **Grafana** (visualización), integrado con **Ansible**.

## 🎯 Stack Tecnológico

### Backend
- ⚡ **FastAPI** - API async de alto rendimiento
- 📊 **prometheus_client** - Exportación de métricas
- 🤖 **Ansible** - Automatización de infraestructura
- 🔄 **Celery** - Tareas asíncronas

### Frontend
- 🎨 **Vue 3** - Framework reactivo moderno
- 📘 **TypeScript** - Type safety
- ⚡ **TanStack Query** - Data fetching
- 💅 **Tailwind CSS** - Estilos

### Monitoring
- 📈 **Prometheus** - Time-series database
- 📊 **Grafana** - Dashboards profesionales
- 🔔 **Alertmanager** - Alertas (opcional)

## 🏗️ Arquitectura

```
┌────────────────────────────────────────────────────────────┐
│                    Nginx (Port 80)                          │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐      │
│  │  Vue 3       │  │  FastAPI    │  │  Grafana     │      │
│  │  (3000)      │  │  (8000)     │  │  (3001)      │      │
│  └──────────────┘  └──────┬──────┘  └──────▲───────┘      │
└──────────────────────────┼────────────────┼────────────────┘
                           │                │
                    ┌──────▼──────┐  ┌──────┴──────┐
                    │ PostgreSQL  │  │ Prometheus  │
                    │   (Data)    │  │  (Metrics)  │
                    └─────────────┘  └──────▲──────┘
                                            │
                    ┌───────────────────────┴────────┐
                    │        FastAPI /metrics         │
                    │  • HTTP requests                │
                    │  • Ansible execution            │
                    │  • System statuses              │
                    │  • API latency                  │
                    └────────────────────────────────┘
```

## 📦 Servicios Docker

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **frontend** | 3000 | Vue 3 SPA |
| **backend** | 8000 | FastAPI + Prometheus exporter |
| **grafana** | 3001 | Dashboards y visualización |
| **prometheus** | 9090 | Time-series database |
| **nginx** | 80 | Reverse proxy |
| **db** | 5432 | PostgreSQL |
| **redis** | 6379 | Celery broker |
| **celery_worker** | - | Ejecución de tareas Ansible |
| **celery_beat** | - | Scheduler de tareas |

## 🚀 Quick Start

### 1. Navegar al Proyecto

```powershell
cd c:\Users\yulir\OneDrive\Documents\monitoreo_infra\fatsapi_+_prometeus
```

### 2. Copiar Variables de Entorno

```powershell
Copy-Item "backend\.env.example" "backend\.env"
```

### 3. Iniciar Todo

```powershell
docker-compose up --build -d
```

### 4. Verificar Servicios

```powershell
docker-compose ps
```

## 🌐 Acceso a las Aplicaciones

### Aplicaciones Principales

- **Frontend Vue**: http://localhost:3000
  - Dashboard con gráficos
  - Lista de sistemas
  - Logs en tiempo real

- **Grafana**: http://localhost:3001
  - Usuario: `admin`
  - Password: `admin`
  - Dashboards predefinidos incluidos

- **FastAPI Swagger**: http://localhost:8000/api/docs
  - Documentación interactiva
  - Pruebas de API

- **Prometheus**: http://localhost:9090
  - Explorador de métricas
  - Consultas PromQL

- **Nginx (todo en uno)**: http://localhost
  - `/` → Frontend Vue
  - `/api` → Backend FastAPI
  - `/grafana` → Grafana
  - `/metrics` → Métricas Prometheus

## 📊 Métricas Disponibles

### HTTP Metrics
```promql
# Total de requests HTTP
http_requests_total{method="GET", endpoint="/api/v1/systems/", status="200"}

# Latencia de requests (percentil 95)
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Rate de requests por segundo
rate(http_requests_total[5m])
```

### Ansible Metrics
```promql
# Duración de playbooks
ansible_playbook_duration_seconds{playbook="linux_metrics"}

# Tasa de éxito de playbooks
rate(ansible_playbook_status{status="success"}[5m])

# Total de métricas recolectadas
sum(metrics_collected_total) by (system_type)
```

### System Metrics
```promql
# Sistemas por estado
sum(systems_total) by (status)

# Sistemas online
systems_total{status="online"}

# Sistemas offline
systems_total{status="offline"}
```

## 📈 Grafana Dashboards

### Dashboard Predefinido: Infrastructure Overview

Incluye:
- ✅ Total de sistemas por estado
- ✅ HTTP request rate
- ✅ API response time (p95)
- ✅ Ansible playbook execution duration
- ✅ Ansible success rate
- ✅ Métricas recolectadas por tipo

### Crear Dashboard Personalizado

1. Ir a http://localhost:3001
2. Login: `admin` / `admin`
3. Menú → Dashboards → New Dashboard
4. Add Panel → Seleccionar Prometheus datasource
5. Query: `sum(systems_total) by (status)`
6. Visualización: Stat / Graph / Gauge

### Queries PromQL Útiles

```promql
# CPU promedio de todos los sistemas
avg(cpu_usage)

# Memoria usage por sistema
memory_usage{system_name=~".*"}

# Disk usage crítico (>90%)
disk_usage > 90

# Requests por endpoint (top 5)
topk(5, sum(rate(http_requests_total[5m])) by (endpoint))

# Tasa de error (status 5xx)
sum(rate(http_requests_total{status=~"5.."}[5m]))
```

## 🔧 Configuración Ansible

### Editar Inventory

```yaml
# backend/ansible/inventory/hosts.yml
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
```

### Probar Playbook

```bash
docker exec -it monitoreo_backend_prometheus bash
ansible-playbook ansible/playbooks/linux_metrics.yml -i ansible/inventory/hosts.yml
```

## 🎨 Frontend Vue

El frontend incluye:
- ✅ Dashboard con estadísticas
- ✅ Lista de sistemas con estados
- ✅ Logs en tiempo real
- ✅ Auto-refresh cada 30 segundos
- ✅ Gráficos con Chart.js

Para métricas avanzadas, usa **Grafana** en http://localhost:3001

## 🔍 Debugging

### Ver Métricas Raw

```bash
# Métricas en formato Prometheus
curl http://localhost:8000/metrics

# Queries a Prometheus
curl 'http://localhost:9090/api/v1/query?query=up'
```

### Logs de Servicios

```powershell
# Todos los logs
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo Prometheus
docker-compose logs -f prometheus

# Solo Grafana
docker-compose logs -f grafana
```

### Prometheus Targets

1. Ir a http://localhost:9090/targets
2. Verificar que `fastapi` esté UP
3. Ver errores de scraping

## 🚨 Alertas (Configuración Avanzada)

### Crear Reglas de Alertas

```yaml
# prometheus-alerts.yml
groups:
  - name: infrastructure
    interval: 30s
    rules:
      - alert: HighCPUUsage
        expr: cpu_usage > 90
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU on {{ $labels.system_name }}"
      
      - alert: SystemOffline
        expr: systems_total{status="offline"} > 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "System is offline"
```

## 📚 Estructura del Proyecto

```
fatsapi_+_prometeus/
├── backend/                    # FastAPI con Prometheus
│   ├── app/
│   │   ├── core/
│   │   │   └── prometheus.py   # Métricas helper
│   │   ├── main.py             # /metrics endpoint
│   │   └── tasks/
│   │       └── ansible_tasks.py # Tracking métricas
│   └── ansible/
│
├── frontend/                   # Vue 3 (igual que mix_fastapi)
│
├── grafana/
│   ├── datasources/
│   │   └── datasource.yml      # Prometheus datasource
│   └── dashboards/
│       ├── dashboard.yml       # Provisioning config
│       └── infrastructure-overview.json  # Dashboard
│
├── prometheus.yml              # Config Prometheus
├── docker-compose.yml          # 9 servicios
├── nginx.conf                  # Reverse proxy
├── README.md
└── QUICKSTART.md
```

## 🎯 Ventajas de este Stack

| Feature | Beneficio |
|---------|-----------|
| **Prometheus** | Time-series DB profesional |
| **Grafana** | Visualización de nivel enterprise |
| **FastAPI** | Performance + métricas automáticas |
| **Vue 3** | Dashboard user-friendly |
| **Ansible** | Automatización nativa |

## 📖 Recursos

- **Prometheus Docs**: https://prometheus.io/docs/
- **Grafana Docs**: https://grafana.com/docs/
- **PromQL Cheatsheet**: https://promlabs.com/promql-cheat-sheet/
- **FastAPI Prometheus**: https://github.com/trallnag/prometheus-fastapi-instrumentator

## 🎓 Siguiente Nivel

1. ✅ **Alertmanager** para notificaciones (Slack, Email)
2. ✅ **Node Exporter** para métricas de host
3. ✅ **PostgreSQL Exporter** para métricas de BD
4. ✅ **Redis Exporter** para métricas de Redis
5. ✅ **Thanos** para long-term storage

---

🎉 **Sistema completo de monitoreo con visualización profesional**
