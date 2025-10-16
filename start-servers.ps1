# Script para iniciar los servidores backend y frontend
# HU7: Sistema de control de roles (Administrador, Operador, Cliente)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Sistema de Boletería - Control de Roles HU7" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Detener procesos Node.js anteriores
Write-Host "🔄 Deteniendo procesos Node.js anteriores..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 2

# Iniciar Backend en una nueva ventana
Write-Host "🚀 Iniciando Backend (Puerto 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host '🔧 BACKEND - Puerto 3000' -ForegroundColor Green; node server.js"

# Esperar a que el backend inicie
Start-Sleep -Seconds 5

# Iniciar Frontend en una nueva ventana
Write-Host "🚀 Iniciando Frontend (Puerto 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host '🎨 FRONTEND - Puerto 5173' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "✅ Servidores iniciados:" -ForegroundColor Green
Write-Host "   📡 Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "   🌐 Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "👥 Usuarios de prueba (sin base de datos):" -ForegroundColor Yellow
Write-Host "   🔹 Administrador: admin@ticketvue.com / admin123" -ForegroundColor White
Write-Host "   🔹 Operador:      operador@ticketvue.com / operador123" -ForegroundColor White
Write-Host "   🔹 Cliente:       cliente@test.com / cliente123" -ForegroundColor White
Write-Host ""
Write-Host "📋 Criterios de aceptación HU7:" -ForegroundColor Magenta
Write-Host "   ✓ Operador solo accede a validación de tickets" -ForegroundColor White
Write-Host "   ✓ Operador no puede acceder al panel de reportes" -ForegroundColor White
Write-Host "   ✓ Cliente solo puede comprar tickets" -ForegroundColor White
Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar esta ventana..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
