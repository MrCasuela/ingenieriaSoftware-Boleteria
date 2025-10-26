# Script para obtener el token de autenticación
# Ejecutar: .\get-token.ps1

Write-Host "🔑 Obteniendo Token de Autenticación..." -ForegroundColor Cyan
Write-Host ""

# Datos de login
$loginData = @{
    email = "admin1@ticketvue.com"
    password = "admin123"
    user_type = "Administrador"
} | ConvertTo-Json

Write-Host "📤 Enviando solicitud de login..." -ForegroundColor Yellow
Write-Host "Email: admin1@ticketvue.com" -ForegroundColor Gray
Write-Host "URL: http://localhost:3000/api/users/login" -ForegroundColor Gray
Write-Host ""

try {
    # Hacer la petición de login
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/users/login" `
        -Method POST `
        -Body $loginData `
        -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ LOGIN EXITOSO!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 INFORMACIÓN DEL USUARIO:" -ForegroundColor Cyan
        Write-Host "  Nombre: $($response.data.user.firstName) $($response.data.user.lastName)" -ForegroundColor White
        Write-Host "  Email: $($response.data.user.email)" -ForegroundColor White
        Write-Host "  Tipo: $($response.data.user.userType)" -ForegroundColor White
        Write-Host ""
        Write-Host "🔐 TOKEN DE AUTENTICACIÓN:" -ForegroundColor Green
        Write-Host $response.data.token -ForegroundColor Yellow
        Write-Host ""
        Write-Host "💾 Para usarlo en el navegador, abre la consola (F12) y ejecuta:" -ForegroundColor Cyan
        Write-Host "localStorage.setItem('apiToken', '$($response.data.token)')" -ForegroundColor White
        Write-Host ""
        
        # Guardar el token en un archivo
        $response.data.token | Out-File -FilePath "token.txt" -Encoding utf8
        Write-Host "Token guardado en: token.txt" -ForegroundColor Green
    } else {
        Write-Host "Error: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR AL CONECTAR:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifica que:" -ForegroundColor Yellow
    Write-Host "  1. Docker este corriendo" -ForegroundColor Gray
    Write-Host "  2. El backend este en puerto 3000" -ForegroundColor Gray
}
