# Script para probar endpoints de operadores

$token = Get-Content -Path "token.txt" -Raw -Encoding UTF8
Write-Host "Token length: $($token.Length)" -ForegroundColor Cyan
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "=== PRUEBA DE ENDPOINTS DE OPERADORES ===" -ForegroundColor Cyan
Write-Host ""

# 1. Obtener lista de operadores
Write-Host "1. Obteniendo lista de operadores..." -ForegroundColor Yellow
try {
    $operators = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/operators" -Method GET -Headers $headers
    Write-Host "   ✅ Success: $($operators.success)" -ForegroundColor Green
    Write-Host "   📊 Total operadores: $($operators.data.Count)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error al obtener operadores" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 2. Crear un nuevo operador
Write-Host "2. Creando nuevo operador..." -ForegroundColor Yellow
$newOperator = @{
    email = "operador.nuevo$(Get-Random -Maximum 1000)@ticketvue.com"
    password = "Test123!"
    firstName = "Nuevo"
    lastName = "Operador"
    phone = "+56912345678"
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/operators" -Method POST -Headers $headers -Body $newOperator
    Write-Host "   ✅ Success: $($createResponse.success)" -ForegroundColor Green
    Write-Host "   📝 Mensaje: $($createResponse.message)" -ForegroundColor Green
    Write-Host "   👤 Email: $($createResponse.data.email)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error al crear operador" -ForegroundColor Red
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "   $($errorDetails.message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== FIN DE PRUEBAS ===" -ForegroundColor Cyan
