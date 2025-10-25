# Obtener token de autenticacion

$body = @{
    email = "admin1@ticketvue.com"
    password = "admin123"
    user_type = "Administrador"
} | ConvertTo-Json

Write-Host "Obteniendo token..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/users/login" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Host ""
        Write-Host "LOGIN EXITOSO" -ForegroundColor Green
        Write-Host "Usuario: $($response.data.user.firstName) $($response.data.user.lastName)" -ForegroundColor White
        Write-Host ""
        Write-Host "TOKEN:" -ForegroundColor Yellow
        Write-Host $response.data.token
        Write-Host ""
        Write-Host "Copia este comando en la consola del navegador (F12):" -ForegroundColor Cyan
        Write-Host "localStorage.setItem('apiToken', '$($response.data.token)')" -ForegroundColor White
        
        $response.data.token | Out-File -FilePath "token.txt" -Encoding utf8
        Write-Host ""
        Write-Host "Token guardado en token.txt" -ForegroundColor Green
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
