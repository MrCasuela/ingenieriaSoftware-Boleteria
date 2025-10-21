# Script para iniciar TicketVue
# Sistema de Boleteria con Docker

Write-Host ""
Write-Host "Iniciando TicketVue..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si existe .env.docker
if (-not (Test-Path ".env.docker")) {
    Write-Host "Archivo .env.docker no encontrado" -ForegroundColor Yellow
    Write-Host "Copiando desde .env.docker.example..." -ForegroundColor Yellow
    Copy-Item ".env.docker.example" ".env.docker"
    Write-Host "Archivo .env.docker creado" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANTE: Por favor, configura las variables en .env.docker antes de continuar" -ForegroundColor Yellow
    Write-Host "Especialmente: DB_PASSWORD, JWT_SECRET, EMAIL_USER, EMAIL_PASSWORD" -ForegroundColor Yellow
    Write-Host ""
    
    $respuesta = Read-Host "Deseas continuar con los valores por defecto? (s/n)"
    if ($respuesta -ne "s" -and $respuesta -ne "S") {
        Write-Host ""
        Write-Host "Inicio cancelado. Configura .env.docker y vuelve a ejecutar este script." -ForegroundColor Red
        exit 1
    }
}

# Detener contenedores existentes
Write-Host "Deteniendo contenedores existentes..." -ForegroundColor Yellow
docker-compose down 2>$null

# Construir y levantar
Write-Host ""
Write-Host "Construyendo e iniciando contenedores..." -ForegroundColor Cyan
Write-Host "Esto puede tomar unos minutos la primera vez..." -ForegroundColor Gray
Write-Host ""

docker-compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Error al iniciar los contenedores" -ForegroundColor Red
    exit 1
}

# Esperar a que los servicios esten listos
Write-Host ""
Write-Host "Esperando a que los servicios esten listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Mostrar estado
Write-Host ""
Write-Host "Estado de los contenedores:" -ForegroundColor Cyan
docker ps --filter "name=ticketvue"

Write-Host ""
Write-Host "TicketVue iniciado correctamente" -ForegroundColor Green
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Frontend:    http://localhost" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:3000" -ForegroundColor Cyan
Write-Host "MySQL:       localhost:3307" -ForegroundColor Cyan
Write-Host ""
Write-Host "Comandos utiles:" -ForegroundColor Yellow
Write-Host "  - Ver logs backend:   docker logs ticketvue-backend -f" -ForegroundColor Gray
Write-Host "  - Ver logs frontend:  docker logs ticketvue-frontend -f" -ForegroundColor Gray
Write-Host "  - Detener:            .\stop.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
