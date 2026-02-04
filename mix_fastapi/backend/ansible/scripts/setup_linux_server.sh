#!/bin/bash

# Script de configuración rápida de servidor Linux para Ansible
# Ejecutar como root en el servidor Linux

set -e

echo "🔧 Configurando servidor Linux para Ansible..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Crear usuario ansible
echo -e "${YELLOW}[1/6]${NC} Creando usuario ansible..."
if id "ansible" &>/dev/null; then
    echo "Usuario ansible ya existe"
else
    useradd -m -s /bin/bash ansible
    echo "ansible:ansible123" | chpasswd
    echo -e "${GREEN}✓${NC} Usuario ansible creado (contraseña: ansible123)"
fi

# 2. Configurar sudo sin contraseña
echo -e "${YELLOW}[2/6]${NC} Configurando permisos sudo..."
echo "ansible ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/ansible
chmod 440 /etc/sudoers.d/ansible
echo -e "${GREEN}✓${NC} Permisos sudo configurados"

# 3. Configurar directorio SSH
echo -e "${YELLOW}[3/6]${NC} Configurando SSH..."
mkdir -p /home/ansible/.ssh
chmod 700 /home/ansible/.ssh
touch /home/ansible/.ssh/authorized_keys
chmod 600 /home/ansible/.ssh/authorized_keys
chown -R ansible:ansible /home/ansible/.ssh
echo -e "${GREEN}✓${NC} Directorio SSH configurado"

# 4. Habilitar autenticación por contraseña temporalmente
echo -e "${YELLOW}[4/6]${NC} Habilitando autenticación SSH..."
if grep -q "^PasswordAuthentication" /etc/ssh/sshd_config; then
    sed -i 's/^PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config
else
    echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config
fi
echo -e "${GREEN}✓${NC} Autenticación SSH habilitada"

# 5. Instalar Python3 si no está instalado
echo -e "${YELLOW}[5/6]${NC} Verificando Python3..."
if ! command -v python3 &> /dev/null; then
    yum install -y python3 || apt-get install -y python3
    echo -e "${GREEN}✓${NC} Python3 instalado"
else
    echo "Python3 ya está instalado: $(python3 --version)"
fi

# 6. Reiniciar SSH
echo -e "${YELLOW}[6/6]${NC} Reiniciando servicio SSH..."
systemctl restart sshd
echo -e "${GREEN}✓${NC} SSH reiniciado"

echo ""
echo "================================"
echo -e "${GREEN}✨ Configuración completada!${NC}"
echo "================================"
echo ""
echo "📝 Información importante:"
echo "   Usuario: ansible"
echo "   Contraseña: ansible123"
echo "   IP del servidor: $(hostname -I | awk '{print $1}')"
echo ""
echo "🔑 Siguiente paso desde tu máquina:"
echo "   ssh-copy-id ansible@$(hostname -I | awk '{print $1}')"
echo ""
echo "⚠️  IMPORTANTE: Cambia la contraseña después de copiar la clave SSH:"
echo "   passwd ansible"
echo ""
