# Guía Rápida: Levantar Proyecto y Verificar HU7

## Estado Actual
✅ **HU7 IMPLEMENTADA** - Sistema de roles (Operador/Administrador/Cliente) con control de acceso en backend y frontend.

## Archivos modificados para HU7:
- `backend/src/middleware/roleMiddleware.js` (NUEVO - middleware de autenticación/autorización)
- `backend/src/routes/ticketRoutes.js` (protegido con roles)
- `backend/src/routes/eventRoutes.js` (protegido con roles)
- `backend/src/routes/userRoutes.js` (protegido con roles)
- `backend/src/controllers/userController.js` (ahora devuelve JWT token)
- `src/stores/authStore.js` (guarda token y mapea roles correctamente)
- `src/services/eventApiService.js` (envía Authorization header)
- `src/stores/ticketStore.js` (envía Authorization header)

## OPCIÓN 1: Levantar con Docker (Recomendado - Producción-like)

### Paso 1: Detener y limpiar todo (empezar desde cero)
```powershell
cd C:\Users\fesal\ingenieriaSoftware-Boleteria-main\ingenieriaSoftware-Boleteria-main

# Detener contenedores y eliminar volúmenes (BORRA DATOS - empieza limpio)
docker-compose down -v

# Opcional: limpiar imágenes antiguas
docker system prune -f
```

### Paso 2: Levantar servicios (build + detach)
```powershell
docker-compose up -d --build
```
**Espera 1-2 minutos** para que MySQL inicialice y el backend conecte.

### Paso 3: Verificar estado
```powershell
# Ver contenedores (deben estar "Up")
docker ps

# Ver health de MySQL (espera a que diga "healthy")
docker inspect ticketvue-mysql --format='{{.State.Health.Status}}'

# Ver logs del backend (últimas 50 líneas)
docker logs ticketvue-backend --tail 50

# Probar health endpoint
Invoke-RestMethod http://localhost:3000/health
```

### Paso 4: Probar HU7 con Docker
```powershell
# Login como Operador
$op = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/users/login `
  -Body (@{email='operador1@ticketvue.com'; password='oper123'; user_type='Operador'} | ConvertTo-Json) `
  -ContentType 'application/json'
$op.token  # Debe mostrar un JWT token

# Intentar acceder a ruta de admin (DEBE FALLAR con 403)
Invoke-RestMethod -Method Get -Uri http://localhost:3000/api/users `
  -Headers @{Authorization="Bearer $($op.token)"}
# Resultado esperado: error 403 "Acceso denegado"

# Login como Admin
$adm = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/users/login `
  -Body (@{email='admin1@ticketvue.com'; password='admin123'; user_type='Administrador'} | ConvertTo-Json) `
  -ContentType 'application/json'

# Acceder a ruta de admin (DEBE FUNCIONAR)
Invoke-RestMethod -Method Get -Uri http://localhost:3000/api/users `
  -Headers @{Authorization="Bearer $($adm.token)"}
# Resultado esperado: JSON con lista de usuarios
```

### Acceder al Frontend
```
http://localhost (puerto 80)
```

---

## OPCIÓN 2: Levantar SIN Docker (Desarrollo local - más rápido para testing)

### Requisitos previos
- Node.js v18+ instalado
- MySQL 8.0 corriendo localmente en puerto 3306 (o usar Docker solo para MySQL)

### Paso 1: MySQL local (si no tienes Docker completo)
```powershell
# Solo levantar MySQL con Docker
docker run --name mysql-dev -e MYSQL_ROOT_PASSWORD=rootpass -e MYSQL_DATABASE=ticketvue -e MYSQL_USER=ticketuser -e MYSQL_PASSWORD=ticketpass -p 3306:3306 -d mysql:8.0
```

### Paso 2: Configurar variables de entorno
Crea archivo `.env` en la raíz de `backend/`:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ticketvue
DB_USER=ticketuser
DB_PASSWORD=ticketpass
JWT_SECRET=mi-secreto-super-seguro-123
NODE_ENV=development
PORT=3000
```

### Paso 3: Instalar dependencias y arrancar backend
```powershell
cd backend
npm install
npm start
```

### Paso 4: En otra terminal, arrancar frontend
```powershell
cd C:\Users\fesal\ingenieriaSoftware-Boleteria-main\ingenieriaSoftware-Boleteria-main
npm install
npm run dev
```

### Paso 5: Probar HU7 (igual que Opción 1 pero en puerto según vite.config.js)
```powershell
# Backend estará en http://localhost:3000
# Frontend estará en http://localhost:5173 (o el puerto que muestre npm run dev)

# Probar login operador/admin (igual que arriba)
```

---

## OPCIÓN 3: Si Docker se queda bloqueado/colgado

### Síntomas comunes:
- `docker-compose up` se queda esperando indefinidamente
- MySQL no llega a "healthy"
- Backend no conecta a MySQL

### Solución 1: Revisar logs en tiempo real
```powershell
# En una terminal, seguir logs de MySQL
docker logs ticketvue-mysql -f

# En otra terminal, seguir logs de backend
docker logs ticketvue-backend -f

# Levantar servicios (observa los logs mientras se levanta)
docker-compose up --build
```

### Solución 2: Verificar puertos ocupados
```powershell
# Ver qué está usando el puerto 3306 (MySQL)
netstat -ano | findstr :3306

# Ver qué está usando el puerto 3000 (Backend)
netstat -ano | findstr :3000

# Si hay procesos, matar o cambiar puerto en docker-compose.yml
```

### Solución 3: Resetear Docker completamente
```powershell
# Detener todos los contenedores
docker stop $(docker ps -aq)

# Eliminar todos los contenedores
docker rm $(docker ps -aq)

# Eliminar volúmenes huérfanos
docker volume prune -f

# Reintentar
docker-compose up -d --build
```

### Solución 4: Revisar archivo SQL de inicialización
Si MySQL falla al inicializar, puede ser por error en:
`backend/database-schema-init.sql`

Ver logs de MySQL para encontrar el error de SQL.

---

## VERIFICACIÓN FINAL HU7 (Criterios de Aceptación)

### ✅ Criterio A: Operador solo puede validar tickets
**Prueba:**
1. Login como operador y obtener token
2. Intentar POST a `/api/tickets/validate/:ticketCode` → debe funcionar (200)
3. Intentar GET a `/api/users` → debe fallar (403)
4. Intentar POST a `/api/events` → debe fallar (403)

**Comandos:**
```powershell
$op = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/users/login -Body (@{email='operador1@ticketvue.com'; password='oper123'; user_type='Operador'} | ConvertTo-Json) -ContentType 'application/json'

# Debe FALLAR (403)
Invoke-RestMethod -Method Get -Uri http://localhost:3000/api/users -Headers @{Authorization="Bearer $($op.token)"}
```

### ✅ Criterio B: Operador no puede acceder a reportes
**Prueba:**
1. Login como operador en el frontend (http://localhost o http://localhost:5173)
2. Intentar navegar a `/admin/panel` → debe redirigir o denegar acceso
3. Login como admin → debe permitir acceso a `/admin/panel`

---

## Comandos de Diagnóstico (pega esto si algo falla)

```powershell
# Ejecuta todo esto y pega la salida completa
Write-Host "=== Docker Version ===" -ForegroundColor Cyan
docker version

Write-Host "`n=== Docker Compose Version ===" -ForegroundColor Cyan
docker-compose version

Write-Host "`n=== Contenedores Activos ===" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host "`n=== Health MySQL ===" -ForegroundColor Cyan
docker inspect ticketvue-mysql --format='{{json .State.Health}}' | ConvertTo-Json

Write-Host "`n=== Logs MySQL (últimas 100) ===" -ForegroundColor Cyan
docker logs ticketvue-mysql --tail 100

Write-Host "`n=== Logs Backend (últimas 100) ===" -ForegroundColor Cyan
docker logs ticketvue-backend --tail 100

Write-Host "`n=== Health Endpoint ===" -ForegroundColor Cyan
try { Invoke-RestMethod http://localhost:3000/health | ConvertTo-Json } catch { "ERROR: $_" }
```

---

## Resumen
- **HU7 está implementada** (código listo)
- **Falta probar** en tu entorno (necesitas ejecutar Docker o dev local)
- **Elige OPCIÓN 1 o 2** y sigue los pasos
- **Si se bloquea**, usa OPCIÓN 3 para diagnosticar
- **Pega salida de "Comandos de Diagnóstico"** si necesitas ayuda

## Próximos pasos
1. Ejecuta OPCIÓN 1 (Docker) o OPCIÓN 2 (local)
2. Si algo falla, ejecuta "Comandos de Diagnóstico" y pega la salida
3. Yo reviso y te doy la solución exacta
