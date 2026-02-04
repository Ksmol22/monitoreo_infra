# 🚀 Guía Práctica: Conectar Ansible a Servidores Reales

## 📋 Requisitos Previos

### 1. Instalar Ansible en tu máquina
```bash
# Windows (usando WSL2 o Git Bash)
pip install ansible

# Verificar instalación
ansible --version
```

### 2. Instalar colecciones necesarias
```bash
# Para Windows servers
ansible-galaxy collection install ansible.windows
ansible-galaxy collection install community.windows

# Para bases de datos
ansible-galaxy collection install community.postgresql
ansible-galaxy collection install community.mysql
```

---

## 🖥️ PARTE 1: Conectar a Servidores LINUX (RHEL/CentOS)

### Paso 1: Preparar el servidor Linux
```bash
# En el servidor Linux (RHEL/CentOS), ejecuta:

# 1. Crear usuario para Ansible
sudo useradd -m -s /bin/bash ansible
sudo passwd ansible

# 2. Dar permisos sudo sin contraseña
echo "ansible ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/ansible

# 3. Configurar SSH (si usas clave pública)
sudo mkdir -p /home/ansible/.ssh
sudo chmod 700 /home/ansible/.ssh

# 4. Habilitar autenticación por contraseña temporalmente
sudo sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

### Paso 2: Generar y copiar clave SSH desde tu máquina
```bash
# En tu máquina Windows/WSL
ssh-keygen -t ed25519 -C "ansible-key"

# Copiar clave al servidor
ssh-copy-id ansible@192.168.1.100

# O manualmente:
cat ~/.ssh/id_ed25519.pub | ssh ansible@192.168.1.100 "cat >> ~/.ssh/authorized_keys"
```

### Paso 3: Configurar en el inventario
```yaml
# backend/ansible/inventory/hosts.yml
linux:
  hosts:
    rhel-server-1:
      ansible_host: 192.168.1.100      # ⬅️ IP real de tu servidor
      ansible_user: ansible
      ansible_port: 22
      ansible_connection: ssh
      ansible_python_interpreter: /usr/bin/python3
      ansible_ssh_private_key_file: ~/.ssh/id_ed25519
```

### Paso 4: Probar conexión
```bash
cd backend/ansible

# Test de ping
ansible linux -i inventory/hosts.yml -m ping

# Ver información del sistema
ansible linux -i inventory/hosts.yml -m setup | grep ansible_distribution
```

---

## 🪟 PARTE 2: Conectar a Servidores WINDOWS

### Paso 1: Preparar el servidor Windows
```powershell
# En el servidor Windows, ejecuta PowerShell como Administrador:

# 1. Habilitar WinRM (Windows Remote Management)
Enable-PSRemoting -Force

# 2. Configurar WinRM para HTTPS (recomendado para producción)
# Crear certificado autofirmado
$cert = New-SelfSignedCertificate -DnsName "windows-server" -CertStoreLocation Cert:\LocalMachine\My
$thumb = $cert.Thumbprint

# Crear listener HTTPS
New-Item -Path WSMan:\LocalHost\Listener -Transport HTTPS -Address * -CertificateThumbPrint $thumb -Force

# Abrir firewall
New-NetFirewallRule -DisplayName "WinRM HTTPS" -Direction Inbound -LocalPort 5986 -Protocol TCP -Action Allow

# 3. Configurar autenticación básica (para desarrollo)
Set-Item -Path WSMan:\localhost\Service\Auth\Basic -Value $true

# 4. Verificar configuración
winrm enumerate winrm/config/Listener
```

### Paso 2: Instalar pywinrm en tu máquina
```bash
pip install pywinrm[credssp]
```

### Paso 3: Configurar credenciales con Ansible Vault
```bash
cd backend/ansible

# Crear archivo vault para contraseñas
ansible-vault create group_vars/windows/vault.yml

# Dentro del archivo, agregar:
---
vault_windows_password: "TuContraseñaSegura123!"
```

### Paso 4: Configurar en el inventario
```yaml
# backend/ansible/inventory/hosts.yml
windows:
  hosts:
    windows-server-1:
      ansible_host: 192.168.1.200      # ⬅️ IP real de tu servidor Windows
      ansible_user: Administrator
      ansible_password: "{{ vault_windows_password }}"
      ansible_connection: winrm
      ansible_winrm_server_cert_validation: ignore  # ignore para desarrollo, validar en producción
      ansible_winrm_transport: ntlm     # o 'basic' o 'credssp'
      ansible_port: 5986                # 5986 para HTTPS, 5985 para HTTP
```

### Paso 5: Probar conexión
```bash
# Test de ping (requiere vault password)
ansible windows -i inventory/hosts.yml -m win_ping --ask-vault-pass

# Ver información del sistema
ansible windows -i inventory/hosts.yml -m setup --ask-vault-pass | grep ansible_os_family
```

---

## 🗄️ PARTE 3: Conectar a Bases de Datos

### Opción A: PostgreSQL

#### Paso 1: Preparar PostgreSQL
```bash
# En el servidor con PostgreSQL

# 1. Crear usuario para monitoreo
sudo -u postgres psql -c "CREATE USER ansible_monitor WITH PASSWORD 'password123';"
sudo -u postgres psql -c "GRANT pg_monitor TO ansible_monitor;"
sudo -u postgres psql -c "GRANT CONNECT ON DATABASE postgres TO ansible_monitor;"

# 2. Configurar pg_hba.conf para permitir conexión
sudo nano /var/lib/pgsql/data/pg_hba.conf
# Agregar línea:
# host    all    ansible_monitor    192.168.1.0/24    md5

# 3. Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

#### Paso 2: Configurar en el inventario
```yaml
databases:
  hosts:
    postgres-server-1:
      ansible_host: 192.168.1.300      # ⬅️ IP del servidor PostgreSQL
      ansible_user: ansible              # Usuario SSH del servidor
      ansible_port: 22
      ansible_connection: ssh
      db_type: postgresql
      db_port: 5432
      db_user: ansible_monitor
      db_password: "{{ vault_db_password }}"
      db_name: postgres
```

### Opción B: MySQL/MariaDB

#### Paso 1: Preparar MySQL
```bash
# En el servidor MySQL
mysql -u root -p

# Crear usuario para monitoreo
CREATE USER 'ansible_monitor'@'%' IDENTIFIED BY 'password123';
GRANT SELECT, PROCESS, REPLICATION CLIENT ON *.* TO 'ansible_monitor'@'%';
FLUSH PRIVILEGES;
```

#### Paso 2: Configurar en el inventario
```yaml
databases:
  hosts:
    mysql-server-1:
      ansible_host: 192.168.1.301
      ansible_user: ansible
      ansible_port: 22
      ansible_connection: ssh
      db_type: mysql
      db_port: 3306
      db_user: ansible_monitor
      db_password: "{{ vault_db_password }}"
```

### Opción C: SQL Server (Windows)

#### Paso 1: Preparar SQL Server
```sql
-- En SQL Server Management Studio
-- Crear login para monitoreo
CREATE LOGIN ansible_monitor WITH PASSWORD = 'Password123!';
GO

-- Dar permisos de vista
GRANT VIEW SERVER STATE TO ansible_monitor;
GRANT VIEW ANY DATABASE TO ansible_monitor;
GO
```

#### Paso 2: Configurar en el inventario
```yaml
databases:
  hosts:
    sqlserver-1:
      ansible_host: 192.168.1.302
      ansible_connection: winrm
      ansible_user: Administrator
      ansible_password: "{{ vault_windows_password }}"
      ansible_port: 5986
      db_type: mssql
      db_port: 1433
      db_user: ansible_monitor
      db_password: "{{ vault_db_password }}"
```

---

## 🔐 PARTE 4: Gestión Segura de Credenciales

### Crear archivo vault
```bash
cd backend/ansible

# Crear carpeta para variables de grupo
mkdir -p group_vars/all

# Crear archivo de vault
ansible-vault create group_vars/all/vault.yml
```

### Contenido del vault.yml
```yaml
---
# Contraseñas de Windows
vault_windows_password: "Admin123!"

# Contraseñas de bases de datos
vault_db_password: "DbPassword123!"

# Claves API
vault_api_token: "tu-token-seguro"
```

### Guardar contraseña del vault
```bash
# Crear archivo de contraseña (NO commitearlo a git!)
echo "mi-contraseña-vault" > .vault_pass

# Agregar a .gitignore
echo ".vault_pass" >> .gitignore

# Usar en comandos
ansible-playbook playbooks/linux_metrics.yml --vault-password-file .vault_pass
```

---

## 🎯 PARTE 5: Ejecutar Playbooks

### Método 1: Ejecutar manualmente
```bash
cd backend/ansible

# Linux
ansible-playbook -i inventory/hosts.yml playbooks/linux_metrics.yml --vault-password-file .vault_pass

# Windows
ansible-playbook -i inventory/hosts.yml playbooks/windows_metrics.yml --vault-password-file .vault_pass

# Databases
ansible-playbook -i inventory/hosts.yml playbooks/database_metrics.yml --vault-password-file .vault_pass

# Todos a la vez
ansible-playbook -i inventory/hosts.yml playbooks/*.yml --vault-password-file .vault_pass
```

### Método 2: Automatizar con cron/scheduler
```bash
# En Linux/WSL, editar crontab
crontab -e

# Ejecutar cada 5 minutos
*/5 * * * * cd /path/to/backend/ansible && ansible-playbook -i inventory/hosts.yml playbooks/*.yml --vault-password-file .vault_pass >> /var/log/ansible-metrics.log 2>&1
```

### Método 3: Integrar con el backend FastAPI

Crear endpoint en FastAPI:
```python
# backend/app/routers/ansible.py
from fastapi import APIRouter, BackgroundTasks
import subprocess
import os

router = APIRouter()

@router.post("/run-ansible/{playbook}")
async def run_ansible_playbook(playbook: str, background_tasks: BackgroundTasks):
    """
    Ejecutar playbook de Ansible
    playbook: 'linux', 'windows', 'database', 'all'
    """
    ansible_dir = os.path.join(os.path.dirname(__file__), '../../ansible')
    
    playbook_map = {
        'linux': 'linux_metrics.yml',
        'windows': 'windows_metrics.yml',
        'database': 'database_metrics.yml',
        'all': '*.yml'
    }
    
    playbook_file = playbook_map.get(playbook, 'linux_metrics.yml')
    
    def run_playbook():
        cmd = [
            'ansible-playbook',
            '-i', 'inventory/hosts.yml',
            f'playbooks/{playbook_file}',
            '--vault-password-file', '.vault_pass'
        ]
        
        subprocess.run(cmd, cwd=ansible_dir, capture_output=True)
    
    background_tasks.add_task(run_playbook)
    
    return {"status": "started", "playbook": playbook}
```

---

## 🧪 PARTE 6: Probar Todo el Flujo

### 1. Verificar conectividad
```bash
cd backend/ansible

# Probar todos los hosts
ansible all -i inventory/hosts.yml -m ping --vault-password-file .vault_pass
```

### 2. Ejecutar recolección de métricas
```bash
# Ejecutar todos los playbooks
ansible-playbook -i inventory/hosts.yml playbooks/linux_metrics.yml --vault-password-file .vault_pass
ansible-playbook -i inventory/hosts.yml playbooks/windows_metrics.yml --vault-password-file .vault_pass
ansible-playbook -i inventory/hosts.yml playbooks/database_metrics.yml --vault-password-file .vault_pass
```

### 3. Verificar en la API
```bash
# Ver sistemas registrados
curl http://localhost:8000/api/v1/systems/

# Ver métricas recientes
curl http://localhost:8000/api/v1/metrics/?limit=10

# Ver logs
curl http://localhost:8000/api/v1/logs/?limit=10
```

---

## ⚠️ Troubleshooting Común

### Linux: "Permission denied"
```bash
# Verificar clave SSH
ssh -i ~/.ssh/id_ed25519 ansible@192.168.1.100

# Ver logs detallados
ansible linux -i inventory/hosts.yml -m ping -vvv
```

### Windows: "Connection timeout"
```powershell
# En el servidor Windows, verificar listener
winrm enumerate winrm/config/Listener

# Verificar firewall
Test-NetConnection -ComputerName localhost -Port 5986

# Probar desde tu máquina
Test-NetConnection -ComputerName 192.168.1.200 -Port 5986
```

### Database: "Authentication failed"
```bash
# PostgreSQL - verificar conexión
psql -h 192.168.1.300 -U ansible_monitor -d postgres

# MySQL - verificar conexión
mysql -h 192.168.1.301 -u ansible_monitor -p
```

---

## 📊 PARTE 7: Ver Resultados en la Plataforma

Una vez ejecutados los playbooks:

1. **Inicia el backend**:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Inicia el frontend**:
   ```bash
   cd frontend
   npm start
   ```

3. **Accede a**: http://localhost:5173

4. Los sistemas aparecerán automáticamente en:
   - **Panel de Control**: Vista general
   - **Servidores Windows**: Lista de servers Windows
   - **Servidores Linux**: Lista de RHEL/CentOS
   - **Bases de Datos**: Lista de DBs

---

## 🔄 Automatización Completa

### Script para ejecutar todo automáticamente
```bash
# backend/ansible/run_all.sh
#!/bin/bash

cd "$(dirname "$0")"

echo "🚀 Iniciando recolección de métricas..."

# Ejecutar playbooks
for playbook in playbooks/*.yml; do
    echo "📊 Ejecutando $(basename $playbook)..."
    ansible-playbook -i inventory/hosts.yml "$playbook" --vault-password-file .vault_pass
    
    if [ $? -eq 0 ]; then
        echo "✅ $(basename $playbook) completado"
    else
        echo "❌ Error en $(basename $playbook)"
    fi
done

echo "✨ Recolección completada!"
```

### Hacer ejecutable
```bash
chmod +x backend/ansible/run_all.sh

# Ejecutar
./backend/ansible/run_all.sh
```

---

## 📝 Checklist Rápido

- [ ] Ansible instalado
- [ ] Colecciones Windows instaladas
- [ ] SSH configurado para Linux
- [ ] WinRM configurado para Windows
- [ ] Usuario de base de datos creado
- [ ] Inventario configurado con IPs reales
- [ ] Vault creado con contraseñas
- [ ] Test de ping exitoso
- [ ] Backend corriendo
- [ ] Playbooks ejecutados
- [ ] Datos visibles en la plataforma

---

## 🎓 Recursos Adicionales

- [Documentación Ansible](https://docs.ansible.com/)
- [Windows con Ansible](https://docs.ansible.com/ansible/latest/os_guide/windows_usage.html)
- [Ansible Vault](https://docs.ansible.com/ansible/latest/cli/ansible-vault.html)
- [PostgreSQL Monitoring](https://www.postgresql.org/docs/current/monitoring-stats.html)

---

¿Necesitas ayuda? Revisa los logs:
```bash
# Ver logs de Ansible
ansible-playbook playbooks/linux_metrics.yml -vvv

# Ver logs del backend
tail -f backend/app.log
```
