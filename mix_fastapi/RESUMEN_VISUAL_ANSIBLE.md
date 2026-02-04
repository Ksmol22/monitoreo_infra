# 🎯 Resumen Visual - Conectar Ansible a Servidores

## 📊 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                    TU MÁQUINA (Windows)                     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │             Ansible + WSL/PowerShell               │    │
│  │                                                      │    │
│  │  • Inventario: hosts.yml                           │    │
│  │  • Credenciales: vault.yml (encriptado)           │    │
│  │  • Playbooks: linux/windows/database_metrics.yml  │    │
│  └───────────────┬─────────────────────────┬─────────┘    │
│                  │                         │                │
└──────────────────┼─────────────────────────┼────────────────┘
                   │                         │
                   │                         │
    ┌──────────────┼─────────────────────────┼──────────────┐
    │              │                         │              │
    │              │                         │              │
    ▼              ▼                         ▼              ▼
┌────────┐    ┌────────┐              ┌─────────┐    ┌──────────┐
│ Linux  │    │ Linux  │              │ Windows │    │ Windows  │
│ Server │    │   DB   │              │ Server  │    │    DB    │
│        │    │        │              │         │    │          │
│ RHEL   │    │ Postgre│              │ Server  │    │   SQL    │
│ CentOS │    │  SQL   │              │  2022   │    │  Server  │
└────────┘    └────────┘              └─────────┘    └──────────┘
    │              │                        │              │
    │              │                        │              │
    └──────────────┴────────────────────────┴──────────────┘
                   │
                   │ Envía métricas
                   ▼
           ┌───────────────┐
           │   Backend     │
           │   FastAPI     │
           │   :8000       │
           └───────┬───────┘
                   │
                   │ Almacena en
                   ▼
           ┌───────────────┐
           │   Database    │
           │   PostgreSQL  │
           └───────┬───────┘
                   │
                   │ Lee desde
                   ▼
           ┌───────────────┐
           │   Frontend    │
           │   Angular     │
           │   :5173       │
           └───────────────┘
```

## 🔄 Flujo de Trabajo

### 1️⃣ Configuración Inicial (Una sola vez)

```
┌─────────────────┐
│ 1. Preparar     │
│    Servidores   │◄─── Scripts: setup_linux_server.sh
└────────┬────────┘              setup_windows_server.ps1
         │
         ▼
┌─────────────────┐
│ 2. Configurar   │
│    Inventario   │◄─── Archivo: inventory/hosts.yml
└────────┬────────┘     (IPs, usuarios, puertos)
         │
         ▼
┌─────────────────┐
│ 3. Guardar      │
│    Credenciales │◄─── Vault: group_vars/all/vault.yml
└────────┬────────┘     (contraseñas encriptadas)
         │
         ▼
┌─────────────────┐
│ 4. Probar       │
│    Conexión     │◄─── Script: test_connectivity.sh/bat
└────────┬────────┘
         │
         ▼
    ✅ Listo!
```

### 2️⃣ Recolección de Métricas (Automática/Manual)

```
┌──────────────────────┐
│ Ejecutar Playbooks   │◄─── Manual: run_all_playbooks.sh/bat
└──────────┬───────────┘     Automático: Cron/Task Scheduler
           │
           ├──► 🐧 Linux Playbook
           │    • Conecta por SSH
           │    • Ejecuta comandos (top, free, df)
           │    • Obtiene CPU, RAM, Disco
           │    • Envía a API
           │
           ├──► 🪟 Windows Playbook
           │    • Conecta por WinRM
           │    • Ejecuta PowerShell
           │    • Obtiene métricas (Get-Counter)
           │    • Envía a API
           │
           └──► 🗄️ Database Playbook
                • Conecta por SSH
                • Consulta base de datos
                • Obtiene métricas específicas
                • Envía a API
```

## 📝 Checklist de Configuración

### Para Servidor Linux (RHEL/CentOS)

```
Servidor Linux:
  ✓ Usuario 'ansible' creado
  ✓ Permisos sudo sin contraseña
  ✓ Python3 instalado
  ✓ Puerto SSH 22 abierto
  ✓ Clave SSH copiada desde tu máquina

Tu Máquina:
  ✓ Clave SSH generada (ssh-keygen)
  ✓ Clave copiada al servidor (ssh-copy-id)
  ✓ Conexión SSH probada (ssh ansible@<IP>)

Inventario:
  ✓ IP configurada en hosts.yml
  ✓ Usuario: ansible
  ✓ Puerto: 22
  ✓ Python: /usr/bin/python3
```

### Para Servidor Windows

```
Servidor Windows:
  ✓ WinRM habilitado (Enable-PSRemoting)
  ✓ Certificado SSL creado
  ✓ Listener HTTPS configurado (puerto 5986)
  ✓ Firewall abierto para puerto 5986
  ✓ Autenticación básica habilitada

Tu Máquina:
  ✓ pywinrm instalado (pip install pywinrm)
  ✓ Contraseña guardada en vault
  ✓ Conexión WinRM probada (Test-WSMan)

Inventario:
  ✓ IP configurada en hosts.yml
  ✓ Usuario: Administrator (o tu usuario)
  ✓ Puerto: 5986 (HTTPS) o 5985 (HTTP)
  ✓ Conexión: winrm
  ✓ Contraseña en vault
```

### Para Base de Datos

```
Servidor de BD:
  ✓ Usuario de monitoreo creado
  ✓ Permisos de lectura otorgados
  ✓ Puerto de BD abierto (5432/3306/1433)
  ✓ Servidor accesible por SSH

PostgreSQL:
  ✓ Usuario: ansible_monitor
  ✓ Role: pg_monitor
  ✓ Puerto: 5432

MySQL:
  ✓ Usuario: ansible_monitor
  ✓ Permisos: SELECT, PROCESS
  ✓ Puerto: 3306

Tu Máquina:
  ✓ Credenciales en vault
  ✓ SSH configurado al servidor

Inventario:
  ✓ IP configurada
  ✓ db_type: postgresql/mysql/mssql
  ✓ Credenciales de BD en vault
```

## 🎬 Scripts Disponibles

```
scripts/
├── 🔧 setup_linux_server.sh       ─── Prepara servidor Linux
│                                       Ejecutar en: Servidor Linux
│                                       Usuario: root
│
├── 🔧 setup_windows_server.ps1    ─── Prepara servidor Windows
│                                       Ejecutar en: Servidor Windows
│                                       Usuario: Administrator
│
├── 🧪 test_connectivity.sh/.bat   ─── Prueba conexión a todos
│                                       Ejecutar en: Tu máquina
│                                       Resultado: ✅ o ❌ por servidor
│
└── 🚀 run_all_playbooks.sh/.bat   ─── Recolecta todas las métricas
                                        Ejecutar en: Tu máquina
                                        Frecuencia: Manual o automático
```

## 📊 Ejemplo de Salida

### Test de Conectividad
```
╔════════════════════════════════════════╗
║   🔍 Test de Conectividad Ansible    ║
╚════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐧 Probando servidores Linux...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
prod-rhel-web-01 | SUCCESS
✅ Servidores Linux: CONECTADOS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🪟 Probando servidores Windows...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
prod-win-sql-01 | SUCCESS
✅ Servidores Windows: CONECTADOS

✨ Test completado!
```

### Recolección de Métricas
```
╔════════════════════════════════════════════════════╗
║     🚀 Recolección de Métricas con Ansible        ║
╚════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐧 Ejecutando: Servidores Linux
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Servidores Linux completado en 8s

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🪟 Ejecutando: Servidores Windows
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Servidores Windows completado en 12s

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗄️  Ejecutando: Bases de Datos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Bases de Datos completado en 6s

📊 Resumen de Ejecución
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐧 Linux:     ✓ Exitoso
🪟 Windows:   ✓ Exitoso
🗄️  Databases: ✓ Exitoso

⏱️  Tiempo total: 26s
✨ ¡Todas las métricas recolectadas exitosamente!
```

## 🔑 Comandos Más Usados

### Probar Conexión
```bash
# Linux
ansible linux -i inventory/hosts.yml -m ping

# Windows (con vault)
ansible windows -i inventory/hosts.yml -m win_ping --vault-password-file .vault_pass

# Todos
ansible all -i inventory/hosts.yml -m ping --vault-password-file .vault_pass
```

### Ejecutar Comando
```bash
# Ver uptime en Linux
ansible linux -i inventory/hosts.yml -m shell -a "uptime"

# Ver servicios en Windows
ansible windows -i inventory/hosts.yml -m win_shell -a "Get-Service" --vault-password-file .vault_pass
```

### Recolectar Métricas
```bash
# Solo Linux
ansible-playbook -i inventory/hosts.yml playbooks/linux_metrics.yml

# Solo Windows
ansible-playbook -i inventory/hosts.yml playbooks/windows_metrics.yml --vault-password-file .vault_pass

# Todos
./scripts/run_all_playbooks.sh
```

### Vault
```bash
# Crear
ansible-vault create group_vars/all/vault.yml

# Editar
ansible-vault edit group_vars/all/vault.yml

# Ver
ansible-vault view group_vars/all/vault.yml
```

## 🎓 Recursos de Aprendizaje

1. **QUICKSTART_ANSIBLE.md** - Inicio rápido en 10 minutos
2. **GUIA_ANSIBLE_PRACTICA.md** - Guía completa paso a paso
3. **backend/ansible/README.md** - Documentación del directorio
4. **inventory/hosts.example.yml** - Ejemplos de configuración

## 💡 Tips Finales

✅ **DO's:**
- Usa claves SSH para Linux (más seguro)
- Guarda contraseñas en Ansible Vault
- Prueba con un servidor antes de agregar más
- Revisa logs cuando algo falle
- Automatiza después de que funcione manualmente

❌ **DON'Ts:**
- No subas contraseñas a git
- No uses autenticación básica en producción (Windows)
- No ignores los errores de conexión
- No corras playbooks sin probar la conexión primero
- No uses contraseñas débiles

---

**¿Listo para empezar?**

1. Lee `QUICKSTART_ANSIBLE.md`
2. Prepara tus servidores
3. Configura el inventario
4. ¡Ejecuta y disfruta! 🚀
