#!/bin/bash

# Script para ejecutar todos los playbooks de recolección de métricas
# Ejecutar desde: backend/ansible/

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════╗
║                                                    ║
║     🚀 Recolección de Métricas con Ansible        ║
║                                                    ║
╚════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificar directorio
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
LOG_DIR="logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/ansible_run_$TIMESTAMP.log"

# Crear directorio de logs
mkdir -p "$LOG_DIR"

echo -e "${BLUE}📝 Logs guardados en: $LOG_FILE${NC}"
echo ""

# Función para ejecutar playbook
run_playbook() {
    local playbook=$1
    local name=$2
    local icon=$3
    
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${icon} ${BLUE}Ejecutando: $name${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    START_TIME=$(date +%s)
    
    if ansible-playbook -i inventory/hosts.yml "$playbook" --vault-password-file "$VAULT_PASS_FILE" >> "$LOG_FILE" 2>&1; then
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        echo -e "${GREEN}✅ $name completado en ${DURATION}s${NC}"
        return 0
    else
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        echo -e "${RED}❌ Error en $name (${DURATION}s)${NC}"
        echo -e "${YELLOW}💡 Ver detalles en: $LOG_FILE${NC}"
        return 1
    fi
    echo ""
}

# Iniciar recolección
START_TOTAL=$(date +%s)

LINUX_SUCCESS=0
WINDOWS_SUCCESS=0
DB_SUCCESS=0

# Ejecutar playbooks
echo -e "${BLUE}📊 Iniciando recolección de métricas...${NC}"
echo ""

# Linux
if [ -f "playbooks/linux_metrics.yml" ]; then
    run_playbook "playbooks/linux_metrics.yml" "Servidores Linux" "🐧"
    LINUX_SUCCESS=$?
fi

# Windows
if [ -f "playbooks/windows_metrics.yml" ]; then
    run_playbook "playbooks/windows_metrics.yml" "Servidores Windows" "🪟"
    WINDOWS_SUCCESS=$?
fi

# Databases
if [ -f "playbooks/database_metrics.yml" ]; then
    run_playbook "playbooks/database_metrics.yml" "Bases de Datos" "🗄️ "
    DB_SUCCESS=$?
fi

# Resumen final
END_TOTAL=$(date +%s)
TOTAL_DURATION=$((END_TOTAL - START_TOTAL))

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📊 Resumen de Ejecución${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Mostrar resultados
[ $LINUX_SUCCESS -eq 0 ] && echo -e "🐧 Linux:     ${GREEN}✓ Exitoso${NC}" || echo -e "🐧 Linux:     ${RED}✗ Error${NC}"
[ $WINDOWS_SUCCESS -eq 0 ] && echo -e "🪟 Windows:   ${GREEN}✓ Exitoso${NC}" || echo -e "🪟 Windows:   ${RED}✗ Error${NC}"
[ $DB_SUCCESS -eq 0 ] && echo -e "🗄️  Databases: ${GREEN}✓ Exitoso${NC}" || echo -e "🗄️  Databases: ${RED}✗ Error${NC}"

echo ""
echo -e "${BLUE}⏱️  Tiempo total: ${TOTAL_DURATION}s${NC}"
echo -e "${BLUE}📁 Logs: $LOG_FILE${NC}"
echo ""

# Verificar errores
TOTAL_ERRORS=$((LINUX_SUCCESS + WINDOWS_SUCCESS + DB_SUCCESS))

if [ $TOTAL_ERRORS -eq 0 ]; then
    echo -e "${GREEN}✨ ¡Todas las métricas recolectadas exitosamente!${NC}"
    echo ""
    echo -e "${BLUE}🎯 Próximos pasos:${NC}"
    echo "   1. Ver datos en la API: curl http://localhost:8000/api/v1/metrics/"
    echo "   2. Ver en el dashboard: http://localhost:5173"
    echo "   3. Programar ejecución periódica con cron"
    EXIT_CODE=0
else
    echo -e "${RED}⚠️  Se encontraron $TOTAL_ERRORS errores${NC}"
    echo ""
    echo -e "${YELLOW}💡 Para depurar:${NC}"
    echo "   1. Ver logs: cat $LOG_FILE"
    echo "   2. Ejecutar con verbose: ansible-playbook ... -vvv"
    echo "   3. Probar conectividad: ./scripts/test_connectivity.sh"
    EXIT_CODE=1
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

exit $EXIT_CODE
