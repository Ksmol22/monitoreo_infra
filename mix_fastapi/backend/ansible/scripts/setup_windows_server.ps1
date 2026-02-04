# Script de configuración de WinRM para Windows Server
# Ejecutar en PowerShell como Administrador

Write-Host "🔧 Configurando Windows Server para Ansible..." -ForegroundColor Cyan

# Función para mostrar progreso
function Show-Step {
    param($step, $total, $message)
    Write-Host "[$step/$total]" -ForegroundColor Yellow -NoNewline
    Write-Host " $message"
}

try {
    # 1. Habilitar WinRM
    Show-Step 1 7 "Habilitando WinRM..."
    Enable-PSRemoting -Force -SkipNetworkProfileCheck
    Write-Host "✓ WinRM habilitado" -ForegroundColor Green

    # 2. Configurar servicio WinRM
    Show-Step 2 7 "Configurando servicio WinRM..."
    Set-Service -Name WinRM -StartupType Automatic
    Start-Service -Name WinRM
    Write-Host "✓ Servicio WinRM configurado" -ForegroundColor Green

    # 3. Crear certificado autofirmado
    Show-Step 3 7 "Creando certificado SSL..."
    $hostname = $env:COMPUTERNAME
    $cert = New-SelfSignedCertificate -DnsName $hostname -CertStoreLocation Cert:\LocalMachine\My -KeyUsage DigitalSignature,KeyEncipherment -KeyAlgorithm RSA -KeyLength 2048
    $thumbprint = $cert.Thumbprint
    Write-Host "✓ Certificado creado: $thumbprint" -ForegroundColor Green

    # 4. Configurar listener HTTPS
    Show-Step 4 7 "Configurando listener HTTPS..."
    
    # Eliminar listener existente si existe
    Get-ChildItem WSMan:\localhost\Listener | Where-Object {$_.Keys -contains "Transport=HTTPS"} | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    
    # Crear nuevo listener
    New-Item -Path WSMan:\LocalHost\Listener -Transport HTTPS -Address * -CertificateThumbPrint $thumbprint -Force | Out-Null
    Write-Host "✓ Listener HTTPS configurado en puerto 5986" -ForegroundColor Green

    # 5. Configurar autenticación
    Show-Step 5 7 "Configurando métodos de autenticación..."
    Set-Item -Path WSMan:\localhost\Service\Auth\Basic -Value $true
    Set-Item -Path WSMan:\localhost\Service\Auth\CredSSP -Value $true
    Set-Item -Path WSMan:\localhost\Service\AllowUnencrypted -Value $false
    Write-Host "✓ Autenticación configurada (Basic, CredSSP)" -ForegroundColor Green

    # 6. Configurar firewall
    Show-Step 6 7 "Configurando reglas de firewall..."
    
    # Eliminar reglas existentes
    Remove-NetFirewallRule -DisplayName "WinRM HTTPS" -ErrorAction SilentlyContinue
    Remove-NetFirewallRule -DisplayName "WinRM HTTP" -ErrorAction SilentlyContinue
    
    # Crear nuevas reglas
    New-NetFirewallRule -DisplayName "WinRM HTTPS" -Direction Inbound -LocalPort 5986 -Protocol TCP -Action Allow | Out-Null
    New-NetFirewallRule -DisplayName "WinRM HTTP" -Direction Inbound -LocalPort 5985 -Protocol TCP -Action Allow | Out-Null
    Write-Host "✓ Firewall configurado (puertos 5985, 5986)" -ForegroundColor Green

    # 7. Aumentar límites de memoria
    Show-Step 7 7 "Optimizando configuración WinRM..."
    Set-Item -Path WSMan:\localhost\Shell\MaxMemoryPerShellMB -Value 1024
    Set-Item -Path WSMan:\localhost\Plugin\Microsoft.PowerShell\Quotas\MaxMemoryPerShellMB -Value 1024
    Write-Host "✓ Límites de memoria optimizados" -ForegroundColor Green

    # Mostrar configuración
    Write-Host "`n================================" -ForegroundColor Cyan
    Write-Host "✨ Configuración completada!" -ForegroundColor Green
    Write-Host "================================`n" -ForegroundColor Cyan

    Write-Host "📝 Información de configuración:" -ForegroundColor White
    Write-Host "   Hostname: $hostname"
    Write-Host "   IP Address: $((Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -ne '127.0.0.1'} | Select-Object -First 1).IPAddress)"
    Write-Host "   Puerto HTTP: 5985"
    Write-Host "   Puerto HTTPS: 5986"
    Write-Host "   Certificado: $thumbprint"
    Write-Host ""

    # Verificar listeners
    Write-Host "🔍 Listeners activos:" -ForegroundColor White
    winrm enumerate winrm/config/Listener

    Write-Host "`n📋 Próximos pasos:" -ForegroundColor Yellow
    Write-Host "   1. Anota la IP del servidor: $((Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -ne '127.0.0.1'} | Select-Object -First 1).IPAddress)"
    Write-Host "   2. Configura el inventario de Ansible con esta IP"
    Write-Host "   3. Usa el usuario: Administrator"
    Write-Host "   4. Guarda la contraseña en Ansible Vault"
    Write-Host ""

    # Test de conexión local
    Write-Host "🧪 Probando conexión local..." -ForegroundColor White
    try {
        $testResult = Test-WSMan -ComputerName localhost -UseSSL -ErrorAction Stop
        Write-Host "✓ Conexión local exitosa!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Advertencia: No se pudo probar la conexión local" -ForegroundColor Yellow
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }

} catch {
    Write-Host "❌ Error durante la configuración:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Script completado. Presiona Enter para salir..." -ForegroundColor Green
Read-Host
