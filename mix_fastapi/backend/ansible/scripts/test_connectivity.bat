@echo off
REM Script para probar conectividad con servidores desde Windows
REM Ejecutar desde: backend\ansible\

setlocal enabledelayedexpansion

echo ╔════════════════════════════════════════╗
echo ║   🔍 Test de Conectividad Ansible    ║
echo ╚════════════════════════════════════════╝
echo.

REM Verificar que estamos en el directorio correcto
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

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🐧 Probando servidores Linux...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

wsl ansible linux -i inventory/hosts.yml -m ping --vault-password-file "%VAULT_PASS_FILE%" 2>nul
if %errorlevel% equ 0 (
    echo ✅ Servidores Linux: CONECTADOS
) else (
    echo ❌ Servidores Linux: ERROR DE CONEXIÓN
    echo.
    echo 💡 Soluciones posibles:
    echo    1. Verifica que el servidor esté encendido
    echo    2. Verifica la IP en inventory/hosts.yml
    echo    3. Prueba manualmente: wsl ssh ansible@^<IP^>
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🪟 Probando servidores Windows...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

wsl ansible windows -i inventory/hosts.yml -m win_ping --vault-password-file "%VAULT_PASS_FILE%" 2>nul
if %errorlevel% equ 0 (
    echo ✅ Servidores Windows: CONECTADOS
) else (
    echo ❌ Servidores Windows: ERROR DE CONEXIÓN
    echo.
    echo 💡 Soluciones posibles:
    echo    1. Verifica que WinRM esté habilitado
    echo    2. Verifica la IP en inventory/hosts.yml
    echo    3. Ejecuta setup_windows_server.ps1 en el servidor
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🗄️  Probando servidores de bases de datos...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

wsl ansible databases -i inventory/hosts.yml -m ping --vault-password-file "%VAULT_PASS_FILE%" 2>nul
if %errorlevel% equ 0 (
    echo ✅ Servidores de BD: CONECTADOS
) else (
    echo ❌ Servidores de BD: ERROR DE CONEXIÓN
    echo.
    echo 💡 Soluciones posibles:
    echo    1. Verifica que el servidor esté accesible por SSH
    echo    2. Verifica la IP en inventory/hosts.yml
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✨ Test completado!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🎯 Próximos pasos:
echo    1. Si todos los tests pasaron: run_all_playbooks.bat
echo    2. Si hay errores: revisa GUIA_ANSIBLE_PRACTICA.md
echo.

pause
