# 🐳 Dockerización del Sistema TicketVue - Resumen

## ✅ Archivos Creados

### Configuración Docker

| Archivo | Descripción | Ubicación |
|---------|-------------|-----------|
| `Dockerfile` | Build frontend (Vue.js + Nginx) | Raíz |
| `backend/Dockerfile` | Build backend (Node.js) | backend/ |
| `docker-compose.yml` | Orquestación de servicios | Raíz |
| `nginx.conf` | Configuración de Nginx | Raíz |
| `.dockerignore` | Exclusiones frontend | Raíz |
| `backend/.dockerignore` | Exclusiones backend | backend/ |
| `.env.docker.example` | Plantilla de variables | Raíz |

### Scripts de Automatización (Windows)

| Script | Descripción |
|--------|-------------|
| `docker-setup.bat` | Configuración inicial |
| `docker-up.bat` | Iniciar servicios |
| `docker-down.bat` | Detener servicios |
| `docker-logs.bat` | Ver logs en tiempo real |
| `docker-down-clean.bat` | Limpieza completa |
| `docker-backup.bat` | Backup de base de datos |

### Documentación

| Archivo | Contenido |
|---------|-----------|
| `DOCKER_GUIDE.md` | Guía completa de uso |
| `DOCKER_SUMMARY.md` | Este resumen |

---

## 🏗️ Arquitectura

### 3 Contenedores Principales

```
┌─────────────────┐
│   Frontend      │ ← Vue.js + Nginx (Puerto 80)
│   (ticketvue-   │
│    frontend)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Backend       │ ← Node.js + Express (Puerto 3000)
│   (ticketvue-   │
│    backend)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   MySQL         │ ← Base de datos (Puerto 3306)
│   (ticketvue-   │
│    mysql)       │
└─────────────────┘
```

### Características Técnicas

#### Frontend
- **Build multi-etapa:** Node.js → Nginx
- **Optimizaciones:**
  - Gzip compression
  - Cache de assets estáticos
  - Security headers
  - SPA routing

#### Backend
- **Usuario no-root** (seguridad)
- **Health checks** automáticos
- **Logs persistentes**
- **Variables de entorno seguras**

#### MySQL
- **Volumen persistente** (datos no se pierden)
- **Inicialización automática** con schema
- **Health checks**
- **Backups fáciles**

---

## 🚀 Inicio Rápido

### Opción 1: Scripts Automatizados (Windows)

```bash
# 1. Setup inicial
docker-setup.bat

# 2. Editar .env.docker con tus credenciales

# 3. Iniciar sistema
docker-up.bat
```

### Opción 2: Comandos Manuales

```bash
# 1. Copiar variables de entorno
copy .env.docker.example .env.docker

# 2. Editar .env.docker

# 3. Build y start
docker-compose build
docker-compose up -d

# 4. Ver logs
docker-compose logs -f
```

---

## 🌐 Acceso al Sistema

Una vez iniciado:

| Servicio | URL | Puerto |
|----------|-----|--------|
| **Frontend** | http://localhost | 80 |
| **Backend API** | http://localhost:3000 | 3000 |
| **Health Check** | http://localhost:3000/api/health | 3000 |
| **MySQL** | localhost:3306 | 3306 |

### Credenciales de la Aplicación

**Administradores:**
- `admin1` / `admin123`
- `admin2` / `admin456`

**Operadores:**
- `operador1` / `admin123`
- `operador2` / `admin456`

---

## ⚙️ Configuración

### Variables de Entorno Críticas

Editar `.env.docker`:

```env
# Base de Datos (CAMBIAR)
DB_PASSWORD=tu_password_seguro_aqui
DB_ROOT_PASSWORD=tu_root_password_aqui

# JWT Secret (CAMBIAR)
JWT_SECRET=generar_uno_muy_largo_y_aleatorio

# Email (opcional)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password
```

### Generar JWT Secret Seguro

```bash
# PowerShell
[System.Convert]::ToBase64String((1..64|%{Get-Random -Min 0 -Max 256}))

# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🎮 Comandos Principales

### Gestión Básica

```bash
# Iniciar
docker-compose up -d

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Reiniciar
docker-compose restart
```

### Base de Datos

```bash
# Backup
docker exec ticketvue-mysql mysqldump -u root -p ticketvue > backup.sql

# Restaurar
docker exec -i ticketvue-mysql mysql -u root -p ticketvue < backup.sql

# Acceder a MySQL
docker exec -it ticketvue-mysql mysql -u ticketuser -p
```

### Mantenimiento

```bash
# Ver recursos
docker stats

# Limpiar (sin datos)
docker-compose down
docker image prune

# Limpiar TODO (¡cuidado! elimina BD)
docker-compose down -v
```

---

## 📊 Volúmenes y Persistencia

### Volúmenes Creados

| Volumen | Contenido | Persistencia |
|---------|-----------|--------------|
| `mysql_data` | Base de datos MySQL | ✅ Persistente |
| `./backend/logs` | Logs del backend | ✅ Persistente |

### Backup y Restauración

**Backup automático:**
```bash
# Ejecutar docker-backup.bat
# Se guarda en: backups/ticketvue_backup_YYYYMMDD_HHMMSS.sql
```

**Restaurar:**
```bash
docker exec -i ticketvue-mysql mysql -u root -p ticketvue < backups/tu_backup.sql
```

---

## 🔧 Troubleshooting

### Problema: Puerto ya en uso

```bash
# Ver qué usa el puerto
netstat -ano | findstr :80

# Cambiar puerto en .env.docker
FRONTEND_PORT=8080
```

### Problema: Base de datos no conecta

```bash
# Ver logs
docker-compose logs mysql

# Verificar health
docker ps

# Reiniciar
docker-compose restart mysql
```

### Problema: Build lento

```bash
# Limpiar caché
docker builder prune

# Build sin caché
docker-compose build --no-cache
```

---

## 🚀 Producción

### Consideraciones

1. **Variables de entorno seguras:**
   - Generar nuevos passwords
   - JWT_SECRET único
   - Email de producción

2. **HTTPS:**
   - Configurar SSL/TLS
   - Let's Encrypt con Nginx
   - Reverse proxy

3. **Backups:**
   - Programar backups automáticos
   - Almacenar en ubicación segura
   - Probar restauración

4. **Monitoreo:**
   - Logs centralizados
   - Alertas de errores
   - Métricas de recursos

5. **Seguridad:**
   - Firewall configurado
   - Puertos mínimos expuestos
   - Actualizaciones regulares

### Deploy de Producción

```bash
# 1. Crear .env.production

# 2. Build para producción
docker-compose build --no-cache

# 3. Iniciar con restart automático
docker-compose up -d

# 4. Verificar
docker-compose ps
docker-compose logs
```

---

## 📋 Checklist de Verificación

### Antes de Iniciar

- [ ] Docker Desktop instalado y corriendo
- [ ] Archivo `.env.docker` creado y configurado
- [ ] Passwords cambiados de los valores por defecto
- [ ] JWT_SECRET generado y configurado
- [ ] Puertos 80, 3000, 3306 disponibles

### Después de Iniciar

- [ ] Todos los contenedores en estado "healthy"
- [ ] Frontend accesible en http://localhost
- [ ] Backend responde en http://localhost:3000/api/health
- [ ] MySQL acepta conexiones
- [ ] Login funciona correctamente
- [ ] Datos persisten después de restart

---

## 📈 Beneficios de Docker

### Para Desarrollo

✅ **Entorno consistente** - Mismo ambiente en todos los equipos  
✅ **Setup rápido** - Un comando para iniciar todo  
✅ **Aislamiento** - No afecta tu sistema local  
✅ **Fácil de limpiar** - Eliminar sin dejar rastros  

### Para Producción

✅ **Portabilidad** - Funciona igual en cualquier servidor  
✅ **Escalabilidad** - Fácil de replicar  
✅ **Actualizaciones** - Deploy sin downtime  
✅ **Rollback** - Volver a versión anterior fácilmente  

---

## 🔒 Seguridad

### Archivos Protegidos por .gitignore

```
✅ .env.docker (credenciales)
✅ backups/*.sql (datos sensibles)
✅ docker-compose.override.yml
```

### Archivos que SÍ se Suben

```
✅ Dockerfile
✅ docker-compose.yml
✅ .env.docker.example (plantilla)
✅ nginx.conf
✅ .dockerignore
✅ Scripts .bat
✅ Documentación
```

---

## 📚 Recursos de Aprendizaje

- **DOCKER_GUIDE.md** - Guía detallada de uso
- **Docker Docs:** https://docs.docker.com/
- **Docker Compose Docs:** https://docs.docker.com/compose/
- **Best Practices:** https://docs.docker.com/develop/dev-best-practices/

---

## 🎯 Próximos Pasos

### Inmediato
1. ✅ Ejecutar `docker-setup.bat`
2. ✅ Configurar `.env.docker`
3. ✅ Iniciar con `docker-up.bat`
4. ✅ Probar la aplicación

### Corto Plazo
- [ ] Configurar backups automáticos
- [ ] Documentar proceso de deploy
- [ ] Crear scripts de monitoreo
- [ ] Configurar CI/CD

### Largo Plazo
- [ ] Deploy en servidor de producción
- [ ] Configurar HTTPS con Let's Encrypt
- [ ] Implementar logging centralizado
- [ ] Configurar auto-scaling

---

## ✨ Resumen Ejecutivo

### Lo que Tienes Ahora

🐳 **Sistema completamente dockerizado** con:
- Frontend servido por Nginx
- Backend con Node.js
- Base de datos MySQL persistente
- Scripts de automatización
- Documentación completa

### Ventajas

1. **Setup en minutos** - `docker-setup.bat` y listo
2. **Ambiente reproducible** - Funciona igual en cualquier PC
3. **Fácil de mantener** - Un comando para actualizar
4. **Listo para producción** - Deploy simplificado

### Comandos Esenciales

```bash
docker-setup.bat      # Primera vez
docker-up.bat         # Iniciar
docker-logs.bat       # Ver logs
docker-backup.bat     # Backup BD
docker-down.bat       # Detener
```

---

**Creado:** Octubre 2025  
**Proyecto:** Sistema de Boletería TicketVue  
**Versión:** 1.0  
**Estado:** ✅ Listo para usar
