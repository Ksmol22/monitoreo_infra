# 🔧 Ansible - Recolección Automática de Métricas

Este directorio contiene toda la configuración de Ansible para conectarse automáticamente a tus servidores Windows, Linux (RHEL) y Bases de Datos, recolectar métricas y enviarlas al backend.

## 📂 Estructura

```
ansible/
├── ansible.cfg              # Configuración principal de Ansible
├── .vault_pass              # Contraseña del vault (NO subir a git)
├── .env.example             # Ejemplo de variables de entorno
│
├── inventory/               # Inventario de servidores
│   ├── hosts.yml           # Tu inventario (configurar IPs reales)
│   └── hosts.example.yml   # Ejemplo completo con documentación
│
├── playbooks/              # Playbooks de recolección
│   ├── linux_metrics.yml   # Métricas de servidores Linux
│   ├── windows_metrics.yml # Métricas de servidores Windows
│   └── database_metrics.yml# Métricas de bases de datos
│
├── scripts/                # Scripts de utilidad
│   ├── setup_linux_server.sh       # Configurar servidor Linux
│   ├── setup_windows_server.ps1    # Configurar servidor Windows
│   ├── test_connectivity.sh        # Probar conexión (Linux/Mac)
│   ├── test_connectivity.bat       # Probar conexión (Windows)
│   ├── run_all_playbooks.sh        # Ejecutar todo (Linux/Mac)
│   └── run_all_playbooks.bat       # Ejecutar todo (Windows)
│
├── group_vars/             # Variables por grupos (se crea después)
│   └── all/
│       └── vault.yml       # Credenciales encriptadas
│
└── logs/                   # Logs de ejecución (se crea automáticamente)
```

## 🚀 Inicio Rápido

### 1. Preparar Servidores

**Linux:**
```bash
# En el servidor Linux (como root)
curl -o setup_linux.sh https://tu-repo/setup_linux_server.sh
chmod +x setup_linux.sh
./setup_linux.sh
```

**Windows:**
```powershell
# En el servidor Windows (PowerShell como Admin)
.\scripts\setup_windows_server.ps1
```

### 2. Configurar Inventario

```bash
# Copiar ejemplo
cp inventory/hosts.example.yml inventory/hosts.yml

# Editar con tus IPs y credenciales
nano inventory/hosts.yml
```

### 3. Configurar Credenciales

```bash
# Crear vault
mkdir -p group_vars/all
ansible-vault create group_vars/all/vault.yml

# Agregar contraseñas:
---
vault_windows_admin_password: "TuPasswordWindows"
vault_postgres_monitor_password: "TuPasswordPostgres"
vault_mysql_monitor_password: "TuPasswordMySQL"

# Guardar contraseña del vault
echo "tu-password-vault" > .vault_pass
chmod 600 .vault_pass
```

### 4. Probar Conectividad

**Linux/Mac:**
```bash
./scripts/test_connectivity.sh
```

**Windows:**
```batch
scripts\test_connectivity.bat
```

### 5. Recolectar Métricas

**Linux/Mac:**
```bash
./scripts/run_all_playbooks.sh
```

**Windows:**
```batch
scripts\run_all_playbooks.bat
```

## 📋 Comandos Útiles

### Gestión de Inventario

```bash
# Ver todos los hosts
ansible all -i inventory/hosts.yml --list-hosts

# Ver hosts por grupo
ansible linux -i inventory/hosts.yml --list-hosts
ansible windows -i inventory/hosts.yml --list-hosts
ansible databases -i inventory/hosts.yml --list-hosts

# Ver variables de un host
ansible mi-servidor -i inventory/hosts.yml -m debug -a "var=hostvars"
```

### Pruebas de Conectividad

```bash
# Ping a todos los Linux
ansible linux -i inventory/hosts.yml -m ping

# Ping a todos los Windows
ansible windows -i inventory/hosts.yml -m win_ping --vault-password-file .vault_pass

# Verificar Python en Linux
ansible linux -i inventory/hosts.yml -m shell -a "python3 --version"

# Ver información del sistema
ansible all -i inventory/hosts.yml -m setup --vault-password-file .vault_pass
```

### Ejecutar Comandos Ad-hoc

```bash
# Linux: Ver uptime
ansible linux -i inventory/hosts.yml -m shell -a "uptime"

# Linux: Ver uso de disco
ansible linux -i inventory/hosts.yml -m shell -a "df -h"

# Windows: Ver servicios
ansible windows -i inventory/hosts.yml -m win_shell -a "Get-Service" --vault-password-file .vault_pass

# Windows: Ver procesos
ansible windows -i inventory/hosts.yml -m win_shell -a "Get-Process | Select-Object -First 5" --vault-password-file .vault_pass
```

### Ejecutar Playbooks

```bash
# Todos los playbooks
ansible-playbook -i inventory/hosts.yml playbooks/*.yml --vault-password-file .vault_pass

# Solo Linux
ansible-playbook -i inventory/hosts.yml playbooks/linux_metrics.yml --vault-password-file .vault_pass

# Solo Windows
ansible-playbook -i inventory/hosts.yml playbooks/windows_metrics.yml --vault-password-file .vault_pass

# Solo Bases de Datos
ansible-playbook -i inventory/hosts.yml playbooks/database_metrics.yml --vault-password-file .vault_pass

# Modo verbose (para depuración)
ansible-playbook -i inventory/hosts.yml playbooks/linux_metrics.yml -vvv
```

### Gestión de Vault

```bash
# Crear vault
ansible-vault create group_vars/all/vault.yml

# Editar vault
ansible-vault edit group_vars/all/vault.yml

# Ver contenido del vault
ansible-vault view group_vars/all/vault.yml

# Cambiar contraseña del vault
ansible-vault rekey group_vars/all/vault.yml

# Encriptar archivo existente
ansible-vault encrypt group_vars/all/secrets.yml
```

## 🔐 Seguridad

### Credenciales

- **NUNCA** subas contraseñas en texto plano
- Usa Ansible Vault para todas las credenciales
- Agrega `.vault_pass` a `.gitignore`
- Usa claves SSH en lugar de contraseñas cuando sea posible

### Permisos

```bash
# Archivo de contraseña del vault
chmod 600 .vault_pass

# Claves SSH privadas
chmod 600 ~/.ssh/id_ed25519

# Archivos de vault
chmod 640 group_vars/all/vault.yml
```

### Variables de Vault Necesarias

```yaml
---
# Windows
vault_windows_admin_password: "password"
vault_windows_service_password: "password"
vault_domain_admin_password: "password"

# Bases de datos
vault_postgres_monitor_password: "password"
vault_mysql_monitor_password: "password"
vault_mssql_sa_password: "password"
vault_db_password: "password"

# Otros
vault_api_token: "token"
```

## 🐛 Troubleshooting

### Linux: "Permission denied (publickey)"

```bash
# Verificar clave SSH
ssh-copy-id ansible@<IP>

# Verificar permisos
chmod 600 ~/.ssh/id_ed25519
chmod 700 ~/.ssh

# Probar manualmente
ssh -v ansible@<IP>
```

### Windows: "Connection timeout"

```powershell
# En el servidor Windows, verificar WinRM
winrm enumerate winrm/config/Listener

# Verificar puerto
Test-NetConnection -ComputerName localhost -Port 5986

# Verificar firewall
Get-NetFirewallRule -DisplayName "WinRM*"
```

### Database: "Authentication failed"

```bash
# PostgreSQL
psql -h <IP> -U ansible_monitor -d postgres

# MySQL
mysql -h <IP> -u ansible_monitor -p

# Verificar permisos en PostgreSQL
SELECT * FROM pg_roles WHERE rolname = 'ansible_monitor';
```

### Verbose Mode

Para ver información detallada de errores:

```bash
# Nivel 1 (información básica)
ansible-playbook playbooks/linux_metrics.yml -v

# Nivel 2 (más detalles)
ansible-playbook playbooks/linux_metrics.yml -vv

# Nivel 3 (debug completo)
ansible-playbook playbooks/linux_metrics.yml -vvv
```

### Ver Logs

```bash
# Ver último log
ls -lt logs/ | head -2

# Ver contenido del último log
tail -f logs/ansible_run_*.log

# Buscar errores
grep -i error logs/ansible_run_*.log
```

## 🔄 Automatización

### Cron (Linux/Mac)

```bash
# Editar crontab
crontab -e

# Ejecutar cada 5 minutos
*/5 * * * * cd /ruta/backend/ansible && ./scripts/run_all_playbooks.sh >> /var/log/ansible-metrics.log 2>&1

# Ejecutar cada hora
0 * * * * cd /ruta/backend/ansible && ./scripts/run_all_playbooks.sh

# Ejecutar cada día a las 2 AM
0 2 * * * cd /ruta/backend/ansible && ./scripts/run_all_playbooks.sh
```

### Task Scheduler (Windows)

```powershell
# Crear tarea programada
$action = New-ScheduledTaskAction -Execute "wsl" -Argument "-e bash -c 'cd /ruta/backend/ansible && ./scripts/run_all_playbooks.sh'"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -Action $action -Trigger $trigger -Settings $settings -TaskName "AnsibleMetrics" -Description "Recolectar métricas con Ansible cada 5 minutos"

# Ver tareas
Get-ScheduledTask -TaskName "AnsibleMetrics"

# Eliminar tarea
Unregister-ScheduledTask -TaskName "AnsibleMetrics" -Confirm:$false
```

## 📊 Métricas Recolectadas

### Linux
- CPU usage (%)
- Memory usage (%)
- Disk usage (%)
- Network I/O (KB)
- Sistema operativo y versión
- Uptime

### Windows
- CPU usage (%)
- Memory usage (%)
- Disk usage (C:) (%)
- Network statistics
- Sistema operativo y versión
- Servicios

### Bases de Datos
- PostgreSQL:
  - Cache hit ratio
  - Database size
  - Connections
- MySQL:
  - Queries per second
  - Connection count
  - Database size
- SQL Server:
  - Buffer cache hit ratio
  - Page life expectancy

## 🎯 Próximos Pasos

1. **Añadir más servidores**: Edita `inventory/hosts.yml`
2. **Personalizar métricas**: Modifica playbooks en `playbooks/`
3. **Crear alertas**: Configura umbrales en el backend
4. **Automatizar**: Configura cron o Task Scheduler
5. **Monitorear logs**: Revisa `logs/` periódicamente

## 📚 Documentación

- **Guía Completa**: `../GUIA_ANSIBLE_PRACTICA.md`
- **Guía Rápida**: `../QUICKSTART_ANSIBLE.md`
- **Ansible Docs**: https://docs.ansible.com/
- **Windows + Ansible**: https://docs.ansible.com/ansible/latest/os_guide/windows_usage.html

## 💡 Tips

1. Empieza con un solo servidor de cada tipo
2. Usa `-vvv` cuando algo no funcione
3. Revisa los logs en `logs/`
4. Mantén las contraseñas en vault
5. Documenta cambios en el inventario
6. Prueba los playbooks antes de automatizar
7. Usa grupos en el inventario para organizarte mejor

## 🆘 Ayuda

Si tienes problemas:

1. Revisa `GUIA_ANSIBLE_PRACTICA.md`
2. Ejecuta con `-vvv` para ver detalles
3. Verifica logs en `logs/`
4. Prueba conectividad manual (SSH/WinRM)
5. Revisa la configuración del servidor

---

**Autor**: Sistema de Monitoreo de Infraestructura  
**Versión**: 1.0  
**Última actualización**: 2026
