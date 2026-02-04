@echo off
REM Script para ejecutar todos los playbooks desde Windows
REM Ejecutar desde: backend\ansible\

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║                                                    ║
echo ║     🚀 Recolección de Métricas con Ansible        ║
echo ║                                                    ║
echo ╚════════════════════════════════════════════════════╝
echo.

REM Verificar directorio
if not exist "ansible.cfg" (
    echo ❌ Error: Ejecuta este script desde backend\ansible\
    pause
    exit /b 1
)

REM Verificar vault password
if not exist ".vault_pass" (
    echo ⚠️  Archivo .vault_pass no encontrado
    set /p VAULT_PASS="Ingresa la contraseña del vault: "
    echo !VAULT_PASS! > .vault_pass
)

set VAULT_PASS_FILE=.vault_pass
set LOG_DIR=logs
set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set LOG_FILE=%LOG_DIR%\ansible_run_%TIMESTAMP%.log

REM Crear directorio de logs
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo 📝 Logs guardados en: %LOG_FILE%
echo.
echo 📊 Iniciando recolección de métricas...
echo.

REM Ejecutar playbooks usando WSL
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🐧 Ejecutando: Servidores Linux
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

wsl ansible-playbook -i inventory/hosts.yml playbooks/linux_metrics.yml --vault-password-file "%VAULT_PASS_FILE%" >> "%LOG_FILE%" 2>&1
if %errorlevel% equ 0 (
    echo ✅ Servidores Linux completado
) else (
    echo ❌ Error en Servidores Linux
    echo 💡 Ver detalles en: %LOG_FILE%
)
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🪟 Ejecutando: Servidores Windows
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

wsl ansible-playbook -i inventory/hosts.yml playbooks/windows_metrics.yml --vault-password-file "%VAULT_PASS_FILE%" >> "%LOG_FILE%" 2>&1
if %errorlevel% equ 0 (
    echo ✅ Servidores Windows completado
) else (
    echo ❌ Error en Servidores Windows
    echo 💡 Ver detalles en: %LOG_FILE%
)
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🗄️  Ejecutando: Bases de Datos
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

wsl ansible-playbook -i inventory/hosts.yml playbooks/database_metrics.yml --vault-password-file "%VAULT_PASS_FILE%" >> "%LOG_FILE%" 2>&1
if %errorlevel% equ 0 (
    echo ✅ Bases de Datos completado
) else (
    echo ❌ Error en Bases de Datos
    echo 💡 Ver detalles en: %LOG_FILE%
)
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📊 Resumen de Ejecución
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📁 Logs completos: %LOG_FILE%
echo.
echo ✨ ¡Recolección completada!
echo.
echo 🎯 Próximos pasos:
echo    1. Ver datos en la API: http://localhost:8000/api/v1/metrics/
echo    2. Ver en el dashboard: http://localhost:5173
echo    3. Revisar logs si hubo errores
echo.

pause
