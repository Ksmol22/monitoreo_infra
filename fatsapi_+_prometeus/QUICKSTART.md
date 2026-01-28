# 🚀 QUICKSTART - FastAPI + Vue 3 + Prometheus + Grafana

Guía rápida para poner en marcha el sistema completo de monitoreo con visualización profesional.

## 📋 Prerequisitos

- Docker Desktop
- Git
- Navegador web

## ⚡ Inicio Rápido (5 minutos)

### 1. Navegar al Proyecto

```powershell
cd c:\Users\yulir\OneDrive\Documents\monitoreo_infra\fatsapi_+_prometeus
```

### 2. Copiar Configuración

```powershell
# Backend
Copy-Item "backend\.env.example" "backend\.env"

# Frontend (opcional)
Copy-Item "frontend\.env" "frontend\.env.local"
```

### 3. Iniciar Todo

```powershell
# Levantar todos los servicios
docker-compose up --build -d

# Ver logs
docker-compose logs -f
```

### 4. Esperar que Inicien (2-3 minutos)

```powershell
# Ver estado
docker-compose ps

# Todos deben estar "Up"
```

## 🌐 Acceso a las Aplicaciones

### URLs Principales

| Aplicación | URL | Credenciales |
|------------|-----|--------------|
| **Vue Dashboard** | http://localhost:3000 | - |
| **Grafana** | http://localhost:3001 | admin / admin |
| **Prometheus** | http://localhost:9090 | - |
| **FastAPI Docs** | http://localhost:8000/api/docs | - |
| **Nginx (All-in-one)** | http://localhost | - |

## 📊 Grafana - Primera Vez

### 1. Login

1. Ir a http://localhost:3001
2. Usuario: `admin`
3. Password: `admin`
4. (Te pedirá cambiar password - puedes saltarlo)

### 2. Ver Dashboard Predefinido

1. Menú lateral → Dashboards
2. Seleccionar **"Infrastructure Monitoring Overview"**
3. ¡Listo! Ya tienes métricas visualizadas

### 3. Explorar Métricas

Dashboard incluye:
- ✅ Total sistemas por estado
- ✅ HTTP request rate
- ✅ API response time (p95)
- ✅ Ansible playbook duration
- ✅ Ansible success rate
- ✅ Métricas recolectadas

## 📈 Prometheus - Explorador

### 1. Abrir Prometheus

http://localhost:9090

### 2. Queries de Ejemplo

Prueba estas queries en el explorador:

```promql
# Ver todos los sistemas por estado
sum(systems_total) by (status)

# HTTP requests por segundo
rate(http_requests_total[5m])

# Latencia API (percentil 95)
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Duración de playbooks Ansible
ansible_playbook_duration_seconds

# Tasa de éxito Ansible
rate(ansible_playbook_status{status="success"}[5m])
```

### 3. Ver Targets

1. Menu superior → Status → Targets
2. Verificar que `fastapi` esté **UP**
3. Si está DOWN, revisar logs: `docker-compose logs backend`

## 🎨 Vue Dashboard

### Acceder

http://localhost:3000

### Funcionalidades

- ✅ Dashboard con stats cards
- ✅ Lista de sistemas
- ✅ Logs en tiempo real
- ✅ Auto-refresh cada 30 segundos

### Nota

Para análisis profundo de métricas, usa **Grafana** (mejor visualización)

## 🔧 Configurar Servidores Reales

### 1. Editar Inventory

```powershell
notepad backend\ansible\inventory\hosts.yml
```

### 2. Agregar tus Servidores

```yaml
all:
  children:
    linux:
      hosts:
        mi-servidor-linux:
          ansible_host: 192.168.1.100
          ansible_user: ansible
          ansible_port: 22
    
    windows:
      hosts:
        mi-servidor-windows:
          ansible_host: 192.168.1.200
          ansible_user: Administrator
          ansible_connection: winrm
          ansible_port: 5986
    
    databases:
      hosts:
        mi-db:
          ansible_host: 192.168.1.300
          db_type: postgresql
```

### 3. Probar Conectividad

```bash
# Entrar al contenedor
docker exec -it monitoreo_backend_prometheus bash

# Ping a todos
ansible all -m ping -i ansible/inventory/hosts.yml

# Si falla, revisar:
# - IPs correctas
# - SSH keys configuradas
# - Firewall abierto
```

### 4. Ejecutar Playbook Manual

```bash
# Dentro del contenedor
ansible-playbook ansible/playbooks/linux_metrics.yml -i ansible/inventory/hosts.yml

# Ver output detallado
ansible-playbook ansible/playbooks/linux_metrics.yml -i ansible/inventory/hosts.yml -vvv
```

## 📊 Crear Dashboard Personalizado en Grafana

### Paso 1: Nuevo Dashboard

1. Grafana → Menú → Dashboards → New Dashboard
2. Click "Add new panel"

### Paso 2: Query

En el campo Query, escribe:

```promql
# Ejemplo: CPU promedio
avg(cpu_usage)

# Ejemplo: Memoria por sistema
memory_usage{system_name=~".*"}

# Ejemplo: Disk usage crítico
disk_usage > 80
```

### Paso 3: Visualización

- **Stat**: Para números únicos (total sistemas)
- **Graph**: Para tendencias en el tiempo
- **Gauge**: Para porcentajes (CPU, memoria)
- **Table**: Para listar valores

### Paso 4: Guardar

Click "Save" → Dar nombre → Save

## 🔍 Ver Métricas Raw

### Endpoint Prometheus

```powershell
# Ver todas las métricas
curl http://localhost:8000/metrics

# O abrir en navegador
start http://localhost:8000/metrics
```

### Métricas Disponibles

```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",endpoint="/api/v1/systems/",status="200"} 42

# HELP systems_total Total number of systems
# TYPE systems_total gauge
systems_total{status="online"} 5
systems_total{status="offline"} 2

# HELP ansible_playbook_duration_seconds Ansible playbook execution time
# TYPE ansible_playbook_duration_seconds histogram
ansible_playbook_duration_seconds_bucket{playbook="linux_metrics",le="10"} 15
```

## 🧪 Pruebas

### 1. Verificar FastAPI

```powershell
# Health check
curl http://localhost:8000/health
# → {"status":"healthy"}

# Listar sistemas
curl http://localhost:8000/api/v1/systems/

# Dashboard stats
curl http://localhost:8000/api/v1/dashboard/stats
```

### 2. Verificar Prometheus

1. Ir a http://localhost:9090
2. Status → Targets
3. `fastapi` debe estar **UP**

### 3. Verificar Grafana

1. http://localhost:3001
2. Login: admin / admin
3. Dashboards → Infrastructure Monitoring Overview
4. Debe mostrar gráficos (pueden estar vacíos si no hay datos)

### 4. Generar Tráfico

```powershell
# Generar requests para ver métricas
for ($i=1; $i -le 100; $i++) {
    curl http://localhost:8000/api/v1/systems/ | Out-Null
}
```

Luego ir a Grafana y ver el "HTTP Request Rate" aumentar

## 🚨 Troubleshooting

### Problema: Grafana no muestra datos

**Causa**: Dashboard vacío porque no hay datos todavía

**Solución**:
1. Crear sistemas vía API o frontend
2. Esperar que Celery ejecute playbooks (cada 5 min)
3. Generar tráfico: `curl http://localhost:8000/api/v1/systems/`

### Problema: Prometheus Target DOWN

**Causa**: Backend no responde en /metrics

**Solución**:
```powershell
# Ver logs backend
docker-compose logs backend

# Verificar que inició correctamente
curl http://localhost:8000/health

# Reiniciar backend
docker-compose restart backend
```

### Problema: Grafana "Error reading Prometheus"

**Causa**: Prometheus no está levantado

**Solución**:
```powershell
# Ver estado
docker-compose ps prometheus

# Ver logs
docker-compose logs prometheus

# Reiniciar
docker-compose restart prometheus
```

### Problema: Frontend no carga

**Causa**: Puerto 3000 ocupado

**Solución**:
```powershell
# Ver qué usa puerto 3000
netstat -ano | findstr :3000

# Matar proceso
taskkill /PID <PID> /F

# O cambiar puerto en docker-compose.yml
```

### Problema: No hay métricas de Ansible

**Causa**: Playbooks no se han ejecutado

**Solución**:
```bash
# Ejecutar manualmente
docker exec -it monitoreo_backend_prometheus bash
ansible-playbook ansible/playbooks/linux_metrics.yml -i ansible/inventory/hosts.yml

# O esperar 5 minutos (Celery Beat programado)
docker-compose logs celery_beat
```

## 📊 Dashboards Recomendados

### 1. Sistema Overview
```promql
# Panel 1: Total Sistemas
sum(systems_total)

# Panel 2: Sistemas por Estado (Pie Chart)
sum(systems_total) by (status)

# Panel 3: CPU Promedio
avg(cpu_usage)

# Panel 4: Memoria Promedio
avg(memory_usage)
```

### 2. Performance API
```promql
# Request Rate
rate(http_requests_total[5m])

# Latency p95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Errores 5xx
sum(rate(http_requests_total{status=~"5.."}[5m]))
```

### 3. Ansible Monitoring
```promql
# Duración de Playbooks
ansible_playbook_duration_seconds

# Success Rate
rate(ansible_playbook_status{status="success"}[5m]) / rate(ansible_playbook_status[5m])

# Total Métricas Colectadas
sum(metrics_collected_total) by (system_type)
```

## 🎓 Queries PromQL Avanzadas

```promql
# Top 5 endpoints más usados
topk(5, sum(rate(http_requests_total[5m])) by (endpoint))

# Sistemas con alta CPU (>80%)
cpu_usage > 80

# Promedio de latencia por endpoint
avg(http_request_duration_seconds) by (endpoint)

# Crecimiento de sistemas en última hora
increase(systems_total[1h])

# Playbooks con más fallos
topk(3, sum(ansible_playbook_status{status="failed"}) by (playbook))
```

## 📱 Configurar Alertas (Avanzado)

### 1. Editar prometheus.yml

```yaml
# Agregar reglas de alertas
rule_files:
  - "alerts.yml"
```

### 2. Crear alerts.yml

```yaml
groups:
  - name: infrastructure_alerts
    interval: 30s
    rules:
      - alert: HighCPU
        expr: cpu_usage > 90
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CPU alta en {{ $labels.system_name }}"
      
      - alert: SystemDown
        expr: systems_total{status="offline"} > 0
        for: 2m
        labels:
          severity: critical
```

### 3. Configurar en Grafana

1. Alerting → Alert rules → New alert rule
2. Query: `cpu_usage > 90`
3. Condition: `Last for 5m`
4. Contact points: Email, Slack, etc.

## 🔄 Comandos Útiles

```powershell
# Ver todos los logs
docker-compose logs -f

# Logs de un servicio
docker-compose logs -f grafana
docker-compose logs -f prometheus
docker-compose logs -f backend

# Reiniciar servicio
docker-compose restart grafana

# Detener todo
docker-compose down

# Eliminar volúmenes (resetear BD)
docker-compose down -v

# Reconstruir desde cero
docker-compose up --build -d

# Ver métricas en tiempo real
watch -n 1 curl -s http://localhost:8000/metrics
```

## 📚 Próximos Pasos

1. ✅ Crear dashboards personalizados en Grafana
2. ✅ Configurar alertas para CPU/memoria alta
3. ✅ Agregar más sistemas al inventory
4. ✅ Explorar queries PromQL avanzadas
5. ✅ Exportar dashboards (JSON) para compartir

## 🎉 ¡Listo!

Tienes un sistema completo de monitoreo con:
- ✅ Dashboard Vue para usuarios
- ✅ Grafana para análisis técnico
- ✅ Prometheus para métricas time-series
- ✅ Ansible para automatización

**URLs de acceso rápido**:
- Vue: http://localhost:3000
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090
- Todo en uno: http://localhost

---

💡 **Tip**: Bookmark http://localhost:3001 para acceso rápido a Grafana
