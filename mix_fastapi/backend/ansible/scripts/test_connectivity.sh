#!/bin/bash

# Script para probar conectividad con todos los servidores
# Ejecutar desde: backend/ansible/

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🔍 Test de Conectividad Ansible    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "ansible.cfg" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde backend/ansible/${NC}"
    exit 1
fi

# Verificar vault password
if [ ! -f ".vault_pass" ]; then
    echo -e "${YELLOW}⚠️  Archivo .vault_pass no encontrado${NC}"
    echo -n "Ingresa la contraseña del vault: "
    read -s VAULT_PASS
    echo ""
    echo "$VAULT_PASS" > .vault_pass
    chmod 600 .vault_pass
fi

VAULT_PASS_FILE=".vault_pass"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 Verificando inventario...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Listar hosts
ansible-inventory -i inventory/hosts.yml --list --yaml | grep -E "ansible_host:|ansible_user:" | head -20

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🐧 Probando servidores Linux...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if ansible linux -i inventory/hosts.yml -m ping --vault-password-file "$VAULT_PASS_FILE" 2>/dev/null; then
    echo -e "${GREEN}✅ Servidores Linux: CONECTADOS${NC}"
    
    # Obtener información básica
    echo ""
    echo "Información del sistema:"
    ansible linux -i inventory/hosts.yml -m shell -a "uname -a && cat /etc/os-release | grep PRETTY_NAME" --vault-password-file "$VAULT_PASS_FILE" 2>/dev/null | grep -v ">>>"
else
    echo -e "${RED}❌ Servidores Linux: ERROR DE CONEXIÓN${NC}"
    echo ""
    echo "💡 Soluciones posibles:"
    echo "   1. Verifica que el servidor esté encendido"
    echo "   2. Verifica la IP en inventory/hosts.yml"
    echo "   3. Prueba manualmente: ssh ansible@<IP>"
    echo "   4. Verifica la clave SSH: ssh-copy-id ansible@<IP>"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🪟 Probando servidores Windows...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if ansible windows -i inventory/hosts.yml -m win_ping --vault-password-file "$VAULT_PASS_FILE" 2>/dev/null; then
    echo -e "${GREEN}✅ Servidores Windows: CONECTADOS${NC}"
    
    # Obtener información básica
    echo ""
    echo "Información del sistema:"
    ansible windows -i inventory/hosts.yml -m win_shell -a "systeminfo | findstr /B /C:\"OS Name\" /C:\"OS Version\"" --vault-password-file "$VAULT_PASS_FILE" 2>/dev/null | grep -v ">>>"
else
    echo -e "${RED}❌ Servidores Windows: ERROR DE CONEXIÓN${NC}"
    echo ""
    echo "💡 Soluciones posibles:"
    echo "   1. Verifica que WinRM esté habilitado"
    echo "   2. Verifica la IP en inventory/hosts.yml"
    echo "   3. Prueba manualmente: Test-WSMan -ComputerName <IP>"
    echo "   4. Ejecuta setup_windows_server.ps1 en el servidor"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🗄️  Probando servidores de bases de datos...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if ansible databases -i inventory/hosts.yml -m ping --vault-password-file "$VAULT_PASS_FILE" 2>/dev/null; then
    echo -e "${GREEN}✅ Servidores de BD: CONECTADOS${NC}"
    
    # Verificar tipo de base de datos
    echo ""
    echo "Verificando bases de datos instaladas:"
    ansible databases -i inventory/hosts.yml -m shell -a "command -v psql || command -v mysql || echo 'No DB client found'" --vault-password-file "$VAULT_PASS_FILE" 2>/dev/null | grep -v ">>>"
else
    echo -e "${RED}❌ Servidores de BD: ERROR DE CONEXIÓN${NC}"
    echo ""
    echo "💡 Soluciones posibles:"
    echo "   1. Verifica que el servidor esté accesible por SSH"
    echo "   2. Verifica la IP en inventory/hosts.yml"
    echo "   3. Prueba manualmente: ssh <usuario>@<IP>"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Resumen de conectividad${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Contar hosts por grupo
LINUX_COUNT=$(ansible linux -i inventory/hosts.yml --list-hosts 2>/dev/null | grep -c "hosts" || echo "0")
WINDOWS_COUNT=$(ansible windows -i inventory/hosts.yml --list-hosts 2>/dev/null | grep -c "hosts" || echo "0")
DB_COUNT=$(ansible databases -i inventory/hosts.yml --list-hosts 2>/dev/null | grep -c "hosts" || echo "0")

echo "📈 Estadísticas:"
echo "   Servidores Linux: $LINUX_COUNT configurados"
echo "   Servidores Windows: $WINDOWS_COUNT configurados"
echo "   Servidores BD: $DB_COUNT configurados"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Test completado!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "🎯 Próximos pasos:"
echo "   1. Si todos los tests pasaron: ./scripts/run_all_playbooks.sh"
echo "   2. Si hay errores: revisa la guía en GUIA_ANSIBLE_PRACTICA.md"
echo "   3. Para ver logs detallados: agrega -vvv al final de los comandos"
echo ""
