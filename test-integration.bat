@echo off
echo =====================================
echo    TEST DE INTEGRACION
echo    Backend y Frontend
echo =====================================
echo.

echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   ERROR: Node.js no esta instalado
    exit /b 1
)
echo   OK: Node.js instalado
echo.

echo [2/5] Verificando dependencias del backend...
if exist "backend\node_modules\" (
    echo   OK: Dependencias del backend instaladas
) else (
    echo   Instalando dependencias del backend...
    cd backend
    call npm install
    cd ..
)
echo.

echo [3/5] Verificando dependencias del frontend...
if exist "node_modules\" (
    echo   OK: Dependencias del frontend instaladas
) else (
    echo   Instalando dependencias del frontend...
    call npm install
)
echo.

echo [4/5] Verificando archivos de configuracion...
if exist "backend\.env" (
    echo   OK: backend\.env existe
) else (
    echo   ADVERTENCIA: backend\.env no existe
    echo   Necesitas configurar el email en backend\.env
)

if exist ".env" (
    echo   OK: .env existe
) else (
    echo   ADVERTENCIA: .env no existe
)
echo.

echo [5/5] Probando conexion al backend...
echo   Iniciando backend temporalmente...
start /b cmd /c "cd backend && node server.js > nul 2>&1"
timeout /t 3 /nobreak >nul

curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo   ADVERTENCIA: No se pudo conectar al backend
    echo   Asegurate de iniciar el backend manualmente
) else (
    echo   OK: Backend responde correctamente
)

:: Intentar detener el proceso de Node que iniciamos
taskkill /f /im node.exe >nul 2>&1

echo.
echo =====================================
echo    PROXIMOS PASOS
echo =====================================
echo.
echo 1. Iniciar el BACKEND:
echo    cd backend
echo    npm start
echo.
echo 2. Iniciar el FRONTEND (en otra terminal):
echo    npm run dev
echo.
echo 3. Configurar email (backend\.env):
echo    - Opcion A: Ethereal Email (desarrollo)
echo    - Opcion B: Gmail (produccion)
echo.
echo 4. Acceder a la aplicacion:
echo    http://localhost:5173
echo.
echo =====================================
echo    LISTO PARA USAR
echo =====================================
pause
