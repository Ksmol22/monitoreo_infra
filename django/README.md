# Monitoreo de Infraestructura - Django + Ansible

Sistema de monitoreo de infraestructura construido con **Django**, **Django REST Framework** y **Ansible** para recolección automática de datos.

## 🏗️ Arquitectura

```
django/
├── manage.py
├── requirements.txt
├── docker-compose.yml
├── Dockerfile
├── .env.example
│
├── config/                      # Configuración del proyecto
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
│
├── apps/
│   ├── core/                   # App principal
│   │   ├── models.py          # Modelos (Systems, Metrics, Logs)
│   │   ├── views.py           # Vistas del dashboard
│   │   ├── urls.py
│   │   └── templates/         # Templates HTML
│   │
│   ├── api/                    # REST API
│   │   ├── serializers.py
│   │   ├── views.py           # ViewSets
│   │   ├── urls.py
│   │   └── permissions.py
│   │
│   └── ansible_integration/    # Integración con Ansible
│       ├── tasks.py           # Celery tasks
│       ├── playbooks/         # Ansible playbooks
│       │   ├── linux_metrics.yml
│       │   ├── windows_metrics.yml
│       │   └── database_metrics.yml
│       ├── inventory/         # Ansible inventory
│       └── collectors.py      # Collectors para parsear datos
│
├── static/                     # Assets estáticos (CSS, JS)
│   ├── css/
│   ├── js/
│   └── img/
│
├── templates/                  # Templates base
│   └── base.html
│
└── ansible/                    # Configuración Ansible
    ├── ansible.cfg
    ├── inventory/
    │   ├── hosts.yml
    │   └── group_vars/
    └── playbooks/
```

## 🚀 Stack Tecnológico

### Backend
- **Django 5.0** - Framework web
- **Django REST Framework** - API REST
- **PostgreSQL** - Base de datos
- **Celery** - Tareas asíncronas
- **Redis** - Message broker para Celery
- **Ansible** - Automatización y recolección de datos

### Frontend
- **Django Templates** + **HTMX** - Interactividad sin JavaScript pesado
- **Tailwind CSS** - Estilos
- **Alpine.js** - JavaScript reactivo ligero
- **Chart.js** - Gráficos

### Infraestructura
- **Docker** + **Docker Compose**
- **Gunicorn** - WSGI server
- **Nginx** - Proxy inverso

## 🎯 Ventajas sobre Vue para Ansible

### ✅ Integración Nativa con Ansible
1. **Python everywhere**: Django + Ansible = mismo lenguaje
2. **Celery**: Ejecuta playbooks de Ansible de forma asíncrona
3. **API directa**: Los playbooks pueden hacer POST directo a Django
4. **Callback plugins**: Ansible puede notificar a Django automáticamente

### ✅ Menor Complejidad
1. **Un solo proyecto**: No necesitas API Gateway + Microservicios
2. **Menos contenedores**: Django monolítico vs 5 contenedores Node
3. **Deployment más simple**: Un solo código base

### ✅ Mejor para Equipos de Infraestructura
1. **Python familiar**: SysAdmins ya conocen Python/Ansible
2. **Scripts reutilizables**: Mismos scripts Ansible para monitoreo y deploy
3. **Menos overhead**: No necesitas Node.js ni TypeScript

## 📦 Instalación

### Opción 1: Docker (Recomendado)

```bash
cd django
cp .env.example .env
docker-compose up -d
```

**URLs de Acceso:**
- Frontend: http://localhost:8000
- Admin: http://localhost:8000/admin
- API: http://localhost:8000/api/v1/

### Opción 2: Local Development

```bash
# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar base de datos
python manage.py migrate
python manage.py createsuperuser

# Cargar datos de ejemplo
python manage.py loaddata fixtures/initial_data.json

# Iniciar servidor
python manage.py runserver

# En otra terminal: Iniciar Celery
celery -A config worker -l info

# En otra terminal: Celery Beat (tareas programadas)
celery -A config beat -l info
```

## 🔧 Configuración de Ansible

### 1. Configurar Inventory

Edita `ansible/inventory/hosts.yml`:

```yaml
all:
  children:
    linux_servers:
      hosts:
        server1:
          ansible_host: 192.168.1.10
          ansible_user: admin
    windows_servers:
      hosts:
        server2:
          ansible_host: 192.168.1.20
          ansible_user: administrator
          ansible_connection: winrm
    databases:
      hosts:
        db1:
          ansible_host: 192.168.1.30
          db_type: postgresql
```

### 2. Ejecutar Recolección Manual

```bash
# Linux
ansible-playbook ansible/playbooks/linux_metrics.yml

# Windows
ansible-playbook ansible/playbooks/windows_metrics.yml

# Databases
ansible-playbook ansible/playbooks/database_metrics.yml
```

### 3. Recolección Automática

Django ejecuta automáticamente los playbooks cada 5 minutos usando Celery Beat.

## 🔐 Seguridad

- **Django Admin**: Panel de administración seguro
- **CSRF Protection**: Protección CSRF nativa de Django
- **Session Management**: Gestión de sesiones robusta
- **Ansible Vault**: Credenciales encriptadas
- **Rate Limiting**: django-ratelimit en API
- **CORS**: django-cors-headers configurado

## 📊 Comparación: Django vs Vue

| Aspecto | Vue (Node.js) | Django + Ansible |
|---------|---------------|------------------|
| **Lenguaje Backend** | TypeScript/JavaScript | Python |
| **Integración Ansible** | ❌ Requiere wrapper | ✅ Nativa |
| **Arquitectura** | Microservicios (5 contenedores) | Monolítico (3 contenedores) |
| **Complejidad** | Alta | Media |
| **Ideal para** | Frontend moderno, SPAs | Infraestructura, DevOps |
| **Curva de aprendizaje** | Alta (TypeScript + Node) | Media (Python) |
| **Tareas asíncronas** | Requiere Bull/Agenda | ✅ Celery nativo |
| **Admin Panel** | Hay que construirlo | ✅ Django Admin gratis |
| **ORM** | Drizzle | ✅ Django ORM (más maduro) |

## 🎯 Recomendación

**Usa Django si:**
- ✅ Tu equipo conoce Python
- ✅ Quieres integración directa con Ansible
- ✅ Prefieres simplicidad sobre microservicios
- ✅ Necesitas un admin panel rápido
- ✅ Vas a ejecutar tareas programadas (Celery)

**Usa Vue si:**
- ✅ Tu equipo conoce JavaScript/TypeScript
- ✅ Quieres una SPA moderna y reactiva
- ✅ Necesitas escalabilidad extrema
- ✅ Prefieres arquitectura de microservicios
- ✅ El frontend es tu prioridad

## 📖 Documentación Completa

Ver [ANSIBLE_INTEGRATION.md](./ANSIBLE_INTEGRATION.md) para detalles sobre la integración con Ansible.
