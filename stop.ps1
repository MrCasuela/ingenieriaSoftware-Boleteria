# ===================================
# Script para detener TicketVue
# Sistema de Boletería con Docker
# ===================================

Write-Host "`n🛑 Deteniendo TicketVue..." -ForegroundColor Yellow
Write-Host "=====================================`n" -ForegroundColor Yellow

# Verificar si existe .env.docker
if (-not (Test-Path ".env.docker")) {
    Write-Host "⚠️  Archivo .env.docker no encontrado" -ForegroundColor Yellow
    Write-Host "    Usando docker-compose sin archivo de entorno...`n" -ForegroundColor Gray
    docker-compose down
} else {
    docker-compose --env-file .env.docker down
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ TicketVue detenido correctamente`n" -ForegroundColor Green
    Write-Host "=====================================`n" -ForegroundColor Green
    Write-Host "💡 Para volver a iniciar, ejecuta: .\start.ps1`n" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Error al detener los contenedores`n" -ForegroundColor Red
    exit 1
}
