# ⚡ Guía Rápida - Conectar Ansible en 10 Minutos

## 🎯 Objetivo
Conectar Ansible a tus servidores Windows, Linux y Bases de Datos para empezar a recolectar métricas.

---

## 📋 Pre-requisitos (5 minutos)

```bash
# 1. Instalar Ansible
pip install ansible pywinrm

# 2. Instalar colecciones
ansible-galaxy collection install ansible.windows community.windows

# 3. Navegar al directorio
cd backend/ansible
```

---

## 🐧 LINUX - Configuración Rápida

### En el servidor Linux (como root):
```bash
# Descargar y ejecutar script
curl -o setup_linux.sh https://raw.githubusercontent.com/.../setup_linux_server.sh
chmod +x setup_linux.sh
./setup_linux.sh
```

O manualmente:
```bash
# Crear usuario
useradd -m ansible
echo "ansible:ansible123" | chpasswd
echo "ansible ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/ansible

# Instalar Python3
yum install -y python3  # RHEL/CentOS
```

### En tu máquina:
```bash
# Copiar clave SSH
ssh-keygen -t ed25519
ssh-copy-id ansible@<IP_DEL_SERVIDOR>

# Probar
ssh ansible@<IP_DEL_SERVIDOR> "uname -a"
```

---

## 🪟 WINDOWS - Configuración Rápida

### En el servidor Windows (PowerShell como Admin):
```powershell
# Ejecutar script de configuración
Enable-PSRemoting -Force

# Crear certificado y habilitar HTTPS
$cert = New-SelfSignedCertificate -DnsName $env:COMPUTERNAME -CertStoreLocation Cert:\LocalMachine\My
New-Item -Path WSMan:\LocalHost\Listener -Transport HTTPS -Address * -CertificateThumbPrint $cert.Thumbprint -Force

# Configurar firewall
New-NetFirewallRule -DisplayName "WinRM HTTPS" -Direction Inbound -LocalPort 5986 -Protocol TCP -Action Allow

# Habilitar autenticación básica
Set-Item -Path WSMan:\localhost\Service\Auth\Basic -Value $true
```

### En tu máquina:
```bash
# Instalar pywinrm
pip install pywinrm[credssp]

# Probar (desde PowerShell)
Test-WSMan -ComputerName <IP_DEL_SERVIDOR> -UseSSL
```

---

## 🗄️ BASE DE DATOS - Configuración Rápida

### PostgreSQL:
```sql
-- En el servidor PostgreSQL
CREATE USER ansible_monitor WITH PASSWORD 'password123';
GRANT pg_monitor TO ansible_monitor;
```

### MySQL:
```sql
-- En el servidor MySQL
CREATE USER 'ansible_monitor'@'%' IDENTIFIED BY 'password123';
GRANT SELECT, PROCESS ON *.* TO 'ansible_monitor'@'%';
FLUSH PRIVILEGES;
```

---

## ⚙️ Configurar Inventario (2 minutos)

```bash
cd backend/ansible

# 1. Copiar ejemplo
cp inventory/hosts.example.yml inventory/hosts.yml

# 2. Editar con tus IPs
nano inventory/hosts.yml
```

Configuración mínima:
```yaml
all:
  children:
    linux:
      hosts:
        mi-server-linux:
          ansible_host: 192.168.1.100  # ⬅️ TU IP
          ansible_user: ansible
          ansible_port: 22
    
    windows:
      hosts:
        mi-server-windows:
          ansible_host: 192.168.1.200  # ⬅️ TU IP
          ansible_user: Administrator
          ansible_password: "{{ vault_win_pass }}"
          ansible_connection: winrm
          ansible_port: 5986
    
    databases:
      hosts:
        mi-postgres:
          ansible_host: 192.168.1.300  # ⬅️ TU IP
          ansible_user: ansible
          db_type: postgresql
  
  vars:
    api_url: http://localhost:8000/api/v1
```

---

## 🔐 Configurar Credenciales (1 minuto)

```bash
# Crear vault
ansible-vault create group_vars/all/vault.yml
# Contraseña del vault: (elige una y recuérdala)

# Dentro del archivo, agregar:
---
vault_win_pass: "TuPasswordWindows123"
vault_db_pass: "TuPasswordDB123"

# Guardar contraseña del vault (NO subir a git!)
echo "tu-password-vault" > .vault_pass
chmod 600 .vault_pass
echo ".vault_pass" >> .gitignore
```

---

## 🧪 Probar Conectividad (1 minuto)

```bash
# Probar Linux
ansible linux -i inventory/hosts.yml -m ping

# Probar Windows
ansible windows -i inventory/hosts.yml -m win_ping --vault-password-file .vault_pass

# Probar todos
./scripts/test_connectivity.sh
```

---

## 🚀 Ejecutar Recolección (1 minuto)

```bash
# Método 1: Script automático
./scripts/run_all_playbooks.sh

# Método 2: Manual por tipo
ansible-playbook -i inventory/hosts.yml playbooks/linux_metrics.yml --vault-password-file .vault_pass
ansible-playbook -i inventory/hosts.yml playbooks/windows_metrics.yml --vault-password-file .vault_pass
ansible-playbook -i inventory/hosts.yml playbooks/database_metrics.yml --vault-password-file .vault_pass
```

---

## 🎨 Ver Resultados

```bash
# 1. Iniciar backend (otra terminal)
cd backend
uvicorn app.main:app --reload

# 2. Iniciar frontend (otra terminal)
cd frontend
npm start

# 3. Abrir navegador
http://localhost:5173
```

---

## 🔄 Automatizar (Opcional)

### Linux/WSL (cron):
```bash
crontab -e

# Ejecutar cada 5 minutos
*/5 * * * * cd /ruta/backend/ansible && ./scripts/run_all_playbooks.sh >> /var/log/ansible.log 2>&1
```

### Windows (Task Scheduler):
```powershell
$action = New-ScheduledTaskAction -Execute "wsl" -Argument "-e bash -c 'cd /ruta/backend/ansible && ./scripts/run_all_playbooks.sh'"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5)
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "AnsibleMetrics" -Description "Recolectar métricas con Ansible"
```

---

## 🐛 Solución de Problemas

### Linux: "Permission denied"
```bash
# Verificar clave SSH
ssh-copy-id ansible@<IP>
chmod 600 ~/.ssh/id_ed25519
```

### Windows: "Connection timeout"
```powershell
# En el servidor, verificar WinRM
winrm enumerate winrm/config/Listener
Test-NetConnection -ComputerName localhost -Port 5986
```

### Database: "Connection refused"
```bash
# Verificar que el puerto esté abierto
telnet <IP> 5432  # PostgreSQL
telnet <IP> 3306  # MySQL
```

### Verbose mode para depurar:
```bash
ansible-playbook playbooks/linux_metrics.yml -vvv
```

---

## 📊 Comandos Útiles

```bash
# Ver todos los hosts
ansible all -i inventory/hosts.yml --list-hosts

# Ver variables de un host
ansible mi-server-linux -i inventory/hosts.yml -m debug -a "var=hostvars"

# Ejecutar comando en todos los Linux
ansible linux -i inventory/hosts.yml -m shell -a "uptime"

# Ver información del sistema
ansible all -i inventory/hosts.yml -m setup | grep ansible_distribution

# Editar vault
ansible-vault edit group_vars/all/vault.yml
```

---

## ✅ Checklist

- [ ] Ansible instalado
- [ ] Servidor Linux configurado
- [ ] Servidor Windows con WinRM habilitado
- [ ] Base de datos con usuario de monitoreo
- [ ] Inventario configurado (hosts.yml)
- [ ] Vault creado con contraseñas
- [ ] Test de ping exitoso en todos
- [ ] Playbooks ejecutados sin errores
- [ ] Backend corriendo (puerto 8000)
- [ ] Frontend corriendo (puerto 5173)
- [ ] Datos visibles en el dashboard

---

## 🎯 Próximos Pasos

1. **Añadir más servidores**: Edita `inventory/hosts.yml`
2. **Personalizar métricas**: Modifica `playbooks/*.yml`
3. **Automatizar**: Configura cron/Task Scheduler
4. **Alertas**: Configura umbrales en el backend
5. **Dashboards**: Personaliza visualizaciones en el frontend

---

## 📚 Documentación Completa

Para configuración avanzada, ver:
- `GUIA_ANSIBLE_PRACTICA.md` - Guía detallada completa
- `inventory/hosts.example.yml` - Ejemplos de configuración
- `playbooks/*.yml` - Playbooks explicados

---

## 💡 Tips

- **Usa claves SSH** en lugar de contraseñas para Linux
- **WinRM HTTPS** es más seguro que HTTP
- **Ansible Vault** para todas las contraseñas
- **Prueba con un servidor** antes de añadir más
- **Logs detallados** con `-vvv` cuando algo falla

---

¡Listo! En menos de 10 minutos deberías tener métricas fluyendo hacia tu dashboard. 🎉
