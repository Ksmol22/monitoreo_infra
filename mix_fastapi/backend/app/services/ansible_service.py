"""
Ansible Service - Gestión de configuración y conexiones con Ansible
"""
import os
import yaml
import asyncio
from pathlib import Path
from typing import Dict, Any, Optional
from jinja2 import Template


class AnsibleService:
    """Servicio para gestionar Ansible"""
    
    def __init__(self):
        self.ansible_dir = Path(__file__).parent.parent.parent / "ansible"
        self.inventory_dir = self.ansible_dir / "inventory"
        self.playbooks_dir = self.ansible_dir / "playbooks"
        self.inventory_file = self.inventory_dir / "hosts.yml"
        
        # Crear directorios si no existen
        self.inventory_dir.mkdir(parents=True, exist_ok=True)
        self.playbooks_dir.mkdir(parents=True, exist_ok=True)
    
    async def add_system_to_inventory(
        self,
        name: str,
        ip_address: str,
        system_type: str,
        ansible_user: str,
        ansible_password: str,
        ansible_port: int = 22,
        ansible_become: Optional[str] = None
    ) -> bool:
        """
        Agrega un sistema al inventario de Ansible
        
        Args:
            name: Nombre del sistema
            ip_address: Dirección IP
            system_type: Tipo de sistema (linux, windows, database)
            ansible_user: Usuario para conexión
            ansible_password: Contraseña
            ansible_port: Puerto de conexión
            ansible_become: Método de elevación (sudo, su)
        
        Returns:
            bool: True si se agregó correctamente
        """
        try:
            # Leer inventario existente o crear uno nuevo
            inventory = self._load_inventory()
            
            # Determinar el grupo según el tipo
            if system_type == "windows":
                group = "windows_servers"
                connection_type = "winrm"
                extra_vars = {
                    "ansible_connection": connection_type,
                    "ansible_winrm_server_cert_validation": "ignore",
                    "ansible_winrm_transport": "ntlm"
                }
            else:  # linux o database
                group = f"{system_type}_servers"
                connection_type = "ssh"
                extra_vars = {
                    "ansible_connection": connection_type,
                }
                if ansible_become:
                    extra_vars["ansible_become"] = "yes"
                    extra_vars["ansible_become_method"] = ansible_become
                    extra_vars["ansible_become_user"] = "root"
            
            # Agregar el host al grupo correspondiente
            if group not in inventory:
                inventory[group] = {"hosts": {}}
            
            # Configuración del host
            host_vars = {
                "ansible_host": ip_address,
                "ansible_user": ansible_user,
                "ansible_password": ansible_password,
                "ansible_port": ansible_port,
                **extra_vars
            }
            
            inventory[group]["hosts"][name] = host_vars
            
            # Guardar inventario
            self._save_inventory(inventory)
            
            # Crear playbook de monitoreo para el sistema
            await self._create_monitoring_playbook(name, system_type)
            
            return True
        
        except Exception as e:
            print(f"Error al agregar sistema al inventario: {e}")
            return False
    
    def _load_inventory(self) -> Dict[str, Any]:
        """Carga el inventario de Ansible"""
        if self.inventory_file.exists():
            with open(self.inventory_file, 'r') as f:
                return yaml.safe_load(f) or {}
        return {}
    
    def _save_inventory(self, inventory: Dict[str, Any]) -> None:
        """Guarda el inventario de Ansible"""
        with open(self.inventory_file, 'w') as f:
            yaml.dump(inventory, f, default_flow_style=False, sort_keys=False)
    
    async def _create_monitoring_playbook(self, name: str, system_type: str) -> None:
        """Crea un playbook de monitoreo para el sistema"""
        
        if system_type == "windows":
            playbook_content = f"""---
- name: Monitorear {name} (Windows)
  hosts: {name}
  gather_facts: yes
  
  tasks:
    - name: Obtener información del sistema
      win_shell: |
        $info = @{{}}
        $info.hostname = $env:COMPUTERNAME
        $info.os = (Get-WmiObject Win32_OperatingSystem).Caption
        $info.cpu = (Get-WmiObject Win32_Processor).LoadPercentage
        $info.memory = (Get-WmiObject Win32_OperatingSystem).FreePhysicalMemory
        $info | ConvertTo-Json
      register: system_info
    
    - name: Obtener servicios
      win_service_info:
      register: services_info
    
    - name: Mostrar información
      debug:
        msg: "{{{{ system_info.stdout }}}}"
"""
        else:  # linux o database
            playbook_content = f"""---
- name: Monitorear {name} (Linux)
  hosts: {name}
  gather_facts: yes
  
  tasks:
    - name: Obtener uso de CPU
      shell: top -bn1 | grep "Cpu(s)" | awk '{{print $2}}' | cut -d'%' -f1
      register: cpu_usage
    
    - name: Obtener uso de memoria
      shell: free | grep Mem | awk '{{print ($3/$2) * 100.0}}'
      register: memory_usage
    
    - name: Obtener uso de disco
      shell: df -h / | tail -n 1 | awk '{{print $5}}' | cut -d'%' -f1
      register: disk_usage
    
    - name: Mostrar métricas
      debug:
        msg:
          - "CPU: {{{{ cpu_usage.stdout }}}}%"
          - "Memoria: {{{{ memory_usage.stdout }}}}%"
          - "Disco: {{{{ disk_usage.stdout }}}}%"
"""
        
        playbook_file = self.playbooks_dir / f"monitor_{name}.yml"
        with open(playbook_file, 'w') as f:
            f.write(playbook_content)
    
    async def test_connection(self, name: str) -> Dict[str, Any]:
        """
        Prueba la conexión con un sistema usando Ansible ping
        
        Args:
            name: Nombre del sistema
        
        Returns:
            Dict con el resultado de la prueba
        """
        try:
            cmd = [
                "ansible",
                name,
                "-i", str(self.inventory_file),
                "-m", "ping",
                "-o"
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                return {
                    "success": True,
                    "message": "Conexión exitosa",
                    "output": stdout.decode()
                }
            else:
                return {
                    "success": False,
                    "message": "Error al conectar",
                    "error": stderr.decode()
                }
        
        except Exception as e:
            return {
                "success": False,
                "message": f"Error al ejecutar Ansible: {str(e)}"
            }
    
    async def run_monitoring_playbook(self, name: str) -> Dict[str, Any]:
        """
        Ejecuta el playbook de monitoreo para un sistema
        
        Args:
            name: Nombre del sistema
        
        Returns:
            Dict con el resultado de la ejecución
        """
        try:
            playbook_file = self.playbooks_dir / f"monitor_{name}.yml"
            
            if not playbook_file.exists():
                return {
                    "success": False,
                    "message": "Playbook no encontrado"
                }
            
            cmd = [
                "ansible-playbook",
                str(playbook_file),
                "-i", str(self.inventory_file)
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                return {
                    "success": True,
                    "message": "Playbook ejecutado correctamente",
                    "output": stdout.decode()
                }
            else:
                return {
                    "success": False,
                    "message": "Error al ejecutar playbook",
                    "error": stderr.decode()
                }
        
        except Exception as e:
            return {
                "success": False,
                "message": f"Error: {str(e)}"
            }
    
    async def remove_system_from_inventory(self, name: str, system_type: str) -> bool:
        """
        Elimina un sistema del inventario de Ansible
        
        Args:
            name: Nombre del sistema
            system_type: Tipo de sistema
        
        Returns:
            bool: True si se eliminó correctamente
        """
        try:
            inventory = self._load_inventory()
            group = f"{system_type}_servers"
            
            if group in inventory and "hosts" in inventory[group]:
                if name in inventory[group]["hosts"]:
                    del inventory[group]["hosts"][name]
                    
                    # Si el grupo queda vacío, eliminarlo
                    if not inventory[group]["hosts"]:
                        del inventory[group]
                    
                    self._save_inventory(inventory)
            
            # Eliminar playbook
            playbook_file = self.playbooks_dir / f"monitor_{name}.yml"
            if playbook_file.exists():
                playbook_file.unlink()
            
            return True
        
        except Exception as e:
            print(f"Error al eliminar sistema del inventario: {e}")
            return False


# Instancia única del servicio
ansible_service = AnsibleService()
