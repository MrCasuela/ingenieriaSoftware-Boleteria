# Script de Prueba de Integración Backend-Frontend

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   TEST DE INTEGRACION" -ForegroundColor Cyan
Write-Host "   Backend y Frontend" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Node.js está instalado
Write-Host "[1/6] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  OK Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR Node.js no esta instalado" -ForegroundColor Red
    exit 1
}

# Verificar dependencias del backend
Write-Host ""
Write-Host "[2/6] Verificando dependencias del backend..." -ForegroundColor Yellow
if (Test-Path "backend\node_modules") {
    Write-Host "  ✓ Dependencias del backend instaladas" -ForegroundColor Green
} else {
    Write-Host "  ! Instalando dependencias del backend..." -ForegroundColor Yellow
    Push-Location backend
    npm install
    Pop-Location
    Write-Host "  ✓ Dependencias instaladas" -ForegroundColor Green
}

# Verificar dependencias del frontend
Write-Host ""
Write-Host "[3/6] Verificando dependencias del frontend..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  ✓ Dependencias del frontend instaladas" -ForegroundColor Green
} else {
    Write-Host "  ! Instalando dependencias del frontend..." -ForegroundColor Yellow
    npm install
    Write-Host "  ✓ Dependencias instaladas" -ForegroundColor Green
}

# Verificar archivo .env del backend
Write-Host ""
Write-Host "[4/6] Verificando configuración del backend..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "  ✓ Archivo backend\.env existe" -ForegroundColor Green
    
    # Leer y verificar variables clave
    $envContent = Get-Content "backend\.env" -Raw
    
    if ($envContent -match "PORT=(\d+)") {
        $port = $matches[1]
        Write-Host "  ✓ Puerto configurado: $port" -ForegroundColor Green
    } else {
        Write-Host "  ! Puerto no configurado (usando 3000 por defecto)" -ForegroundColor Yellow
        $port = 3000
    }
    
    if ($envContent -match "SMTP_USER=" -or $envContent -match "EMAIL_USER=") {
        Write-Host "  ⚠ Configuración de email detectada (verificar credenciales)" -ForegroundColor Yellow
    } else {
        Write-Host "  ! Email no configurado - necesitarás configurarlo para enviar emails" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ Archivo backend\.env no existe" -ForegroundColor Red
    Write-Host "  Copiando desde backend\.env.example..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "  ⚠ Archivo creado - necesitas configurar las credenciales de email" -ForegroundColor Yellow
}

# Verificar archivo .env del frontend
Write-Host ""
Write-Host "[5/6] Verificando configuración del frontend..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "  ✓ Archivo .env existe" -ForegroundColor Green
    
    $frontendEnv = Get-Content ".env" -Raw
    if ($frontendEnv -match "VITE_API_URL=(.+)") {
        $apiUrl = $matches[1].Trim()
        Write-Host "  ✓ API URL configurada: $apiUrl" -ForegroundColor Green
    } else {
        Write-Host "  ! VITE_API_URL no configurada" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ! Archivo .env no existe, usando valores por defecto" -ForegroundColor Yellow
}

# Test de conexión al backend
Write-Host ""
Write-Host "[6/6] Probando conexión al backend..." -ForegroundColor Yellow
Write-Host "  Intentando iniciar el backend en puerto $port..." -ForegroundColor Cyan

# Iniciar el backend en background
$backendJob = Start-Job -ScriptBlock {
    param($workDir)
    Set-Location $workDir
    Set-Location backend
    node server.js
} -ArgumentList $PWD

# Esperar a que el backend esté listo
Write-Host "  Esperando a que el backend inicie..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

# Probar endpoint de health
try {
    $response = Invoke-RestMethod -Uri "http://localhost:$port/api/health" -Method Get -TimeoutSec 5
    Write-Host ""
    Write-Host "  ✓ Backend respondiendo correctamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Detalles del servidor:" -ForegroundColor Cyan
    Write-Host "  - Estado: $($response.status)" -ForegroundColor White
    Write-Host "  - API: $($response.services.api)" -ForegroundColor White
    Write-Host "  - Email: $($response.services.email)" -ForegroundColor White
    Write-Host "  - Base de datos: $($response.services.database)" -ForegroundColor White
    Write-Host ""
    Write-Host "  Endpoints disponibles:" -ForegroundColor Cyan
    Write-Host "  - Health Check: http://localhost:$port$($response.endpoints.health)" -ForegroundColor White
    Write-Host "  - Enviar Email: http://localhost:$port$($response.endpoints.sendEmail)" -ForegroundColor White
    
    $backendOk = $true
} catch {
    Write-Host "  ✗ Backend no responde" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    $backendOk = $false
}

# Detener el backend de prueba
Stop-Job -Job $backendJob
Remove-Job -Job $backendJob

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

if ($backendOk) {
    Write-Host "✓ BACKEND: Funcionando correctamente" -ForegroundColor Green
} else {
    Write-Host "✗ BACKEND: Hay problemas" -ForegroundColor Red
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   PRÓXIMOS PASOS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Para iniciar el BACKEND:" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "2. Para iniciar el FRONTEND (en otra terminal):" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Para configurar el email:" -ForegroundColor Yellow
Write-Host "   - Edita backend\.env" -ForegroundColor White
Write-Host "   - Opción A (desarrollo): Usa Ethereal Email (https://ethereal.email/)" -ForegroundColor White
Write-Host "   - Opción B (producción): Configura Gmail con contraseña de aplicación" -ForegroundColor White
Write-Host ""
Write-Host "4. Acceder a la aplicación:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173 (o el puerto que Vite asigne)" -ForegroundColor White
Write-Host ""

if ($backendOk) {
    Write-Host "✅ Todo listo para empezar!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Revisa los errores antes de continuar" -ForegroundColor Yellow
}

Write-Host ""
