# 🐳 Guía de Docker - Sistema de Boletería TicketVue

## 📋 Contenido

- [Requisitos Previos](#requisitos-previos)
- [Arquitectura Docker](#arquitectura-docker)
- [Instalación y Configuración](#instalación-y-configuración)
- [Comandos Útiles](#comandos-útiles)
- [Troubleshooting](#troubleshooting)
- [Producción](#producción)

---

## 🎯 Requisitos Previos

### Software Necesario

1. **Docker Desktop** (Windows/Mac) o **Docker Engine** (Linux)
   - Descargar: https://www.docker.com/products/docker-desktop
   - Versión mínima: 20.10+

2. **Docker Compose**
   - Incluido en Docker Desktop
   - Versión mínima: 2.0+

### Verificar Instalación

```bash
# Verificar Docker
docker --version
# Salida esperada: Docker version 24.x.x

# Verificar Docker Compose
docker-compose --version
# Salida esperada: Docker Compose version v2.x.x
```

---

## 🏗️ Arquitectura Docker

El sistema está compuesto por 3 contenedores:

```
┌─────────────────────────────────────────────┐
│                                             │
│  🌐 Frontend (Vue.js + Nginx)              │
│  Puerto: 80                                 │
│  Container: ticketvue-frontend              │
│                                             │
└──────────────┬──────────────────────────────┘
               │
               │ API Calls
               ↓
┌─────────────────────────────────────────────┐
│                                             │
│  ⚙️  Backend (Node.js + Express)           │
│  Puerto: 3000                               │
│  Container: ticketvue-backend               │
│                                             │
└──────────────┬──────────────────────────────┘
               │
               │ SQL Queries
               ↓
┌─────────────────────────────────────────────┐
│                                             │
│  🗄️  MySQL Database                        │
│  Puerto: 3306                               │
│  Container: ticketvue-mysql                 │
│  Volume: mysql_data (persistente)           │
│                                             │
└─────────────────────────────────────────────┘
```

### Componentes

#### 1. Frontend (Nginx + Vue.js)
- **Imagen base:** `node:18-alpine` (build) + `nginx:alpine` (runtime)
- **Puerto:** 80
- **Features:**
  - Build de producción optimizado
  - Servido con Nginx
  - Gzip compression
  - Security headers
  - SPA routing con history mode

#### 2. Backend (Node.js)
- **Imagen base:** `node:18-alpine`
- **Puerto:** 3000
- **Features:**
  - Express API
  - Health checks
  - Usuario no-root
  - Logs persistentes

#### 3. Database (MySQL)
- **Imagen:** `mysql:8.0`
- **Puerto:** 3306
- **Features:**
  - Inicialización automática con schema
  - Datos persistentes con volumes
  - Health checks

---

## 🚀 Instalación y Configuración

### 1. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
copy .env.docker.example .env.docker

# Editar con tus credenciales
notepad .env.docker
```

**Variables críticas a configurar:**
```env
# Base de datos
DB_PASSWORD=tu_password_seguro_123
DB_ROOT_PASSWORD=tu_root_password_456

# JWT Secret (genera uno único)
JWT_SECRET=genera_un_secret_muy_largo_y_aleatorio

# Email (opcional para desarrollo)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password
```

**Generar JWT Secret seguro:**
```bash
# Opción 1: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Opción 2: PowerShell
[System.Convert]::ToBase64String((1..64|%{Get-Random -Min 0 -Max 256}))
```

### 2. Construir Imágenes

```bash
# Construir todas las imágenes
docker-compose build

# Construir sin caché (limpio)
docker-compose build --no-cache

# Construir solo un servicio
docker-compose build frontend
docker-compose build backend
```

### 3. Iniciar Servicios

```bash
# Iniciar todos los servicios
docker-compose up

# Iniciar en segundo plano (detached)
docker-compose up -d

# Iniciar con archivo .env específico
docker-compose --env-file .env.docker up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
```

### 4. Verificar Estado

```bash
# Ver contenedores en ejecución
docker-compose ps

# Ver logs
docker-compose logs

# Ver recursos utilizados
docker stats
```

---

## 🎮 Comandos Útiles

### Gestión de Contenedores

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener, eliminar contenedores Y volúmenes (¡cuidado! elimina la BD)
docker-compose down -v

# Reiniciar servicios
docker-compose restart

# Reiniciar un servicio específico
docker-compose restart backend
```

### Acceso a Contenedores

```bash
# Acceder al contenedor de frontend
docker exec -it ticketvue-frontend sh

# Acceder al contenedor de backend
docker exec -it ticketvue-backend sh

# Acceder a MySQL
docker exec -it ticketvue-mysql mysql -u root -p

# Ver logs en tiempo real
docker-compose logs -f backend
```

### Base de Datos

```bash
# Backup de la base de datos
docker exec ticketvue-mysql mysqldump -u root -p ticketvue > backup.sql

# Restaurar backup
docker exec -i ticketvue-mysql mysql -u root -p ticketvue < backup.sql

# Acceder a MySQL shell
docker exec -it ticketvue-mysql mysql -u ticketuser -p ticketvue

# Ver tablas
docker exec ticketvue-mysql mysql -u ticketuser -p ticketvue -e "SHOW TABLES;"
```

### Limpieza

```bash
# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes no utilizadas
docker image prune

# Eliminar todo (contenedores, imágenes, volúmenes, redes)
docker system prune -a --volumes

# Ver espacio utilizado
docker system df
```

---

## 🌐 Acceso a la Aplicación

Una vez iniciados los servicios:

### Frontend
- **URL:** http://localhost
- **Puerto:** 80

### Backend API
- **URL:** http://localhost:3000
- **Health Check:** http://localhost:3000/api/health
- **API Docs:** http://localhost:3000/

### Base de Datos
- **Host:** localhost
- **Puerto:** 3306
- **Usuario:** ticketuser
- **Password:** (configurado en .env.docker)
- **Base de datos:** ticketvue

### Credenciales de la Aplicación

**Administradores:**
- Usuario: `admin1` / Password: `admin123`
- Usuario: `admin2` / Password: `admin456`

**Operadores:**
- Usuario: `operador1` / Password: `admin123`
- Usuario: `operador2` / Password: `admin456`

---

## 🔍 Monitoreo y Logs

### Ver Logs

```bash
# Todos los servicios
docker-compose logs

# Últimas 100 líneas
docker-compose logs --tail=100

# Seguir logs en tiempo real
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Logs desde una hora específica
docker-compose logs --since 1h
```

### Health Checks

```bash
# Ver estado de salud de los contenedores
docker ps

# Inspeccionar health check
docker inspect --format='{{json .State.Health}}' ticketvue-backend

# Probar health check manualmente
curl http://localhost:3000/api/health
```

---

## 🐛 Troubleshooting

### Problema: Contenedores no inician

```bash
# Ver logs de error
docker-compose logs

# Verificar configuración
docker-compose config

# Reconstruir imágenes
docker-compose build --no-cache
docker-compose up -d
```

### Problema: Base de datos no conecta

```bash
# Verificar que MySQL esté healthy
docker ps

# Ver logs de MySQL
docker-compose logs mysql

# Verificar variables de entorno
docker-compose config

# Reiniciar MySQL
docker-compose restart mysql
```

### Problema: Puerto ya en uso

```bash
# Windows: Ver qué usa el puerto
netstat -ano | findstr :80
netstat -ano | findstr :3000

# Cambiar puerto en .env.docker
FRONTEND_PORT=8080
BACKEND_PORT=3001

# Reiniciar
docker-compose down
docker-compose up -d
```

### Problema: Build lento

```bash
# Limpiar caché
docker builder prune

# Build sin caché
docker-compose build --no-cache

# Verificar espacio
docker system df
docker system prune
```

### Problema: Volumen con datos viejos

```bash
# Detener y eliminar volúmenes
docker-compose down -v

# Reiniciar limpio
docker-compose up -d

# La base de datos se reinicializará
```

---

## 🚀 Producción

### 1. Variables de Entorno de Producción

Crear `.env.production`:

```env
NODE_ENV=production

# Puertos
FRONTEND_PORT=80
BACKEND_PORT=3000

# Base de Datos (usar valores seguros)
DB_PASSWORD=PASSWORD_MUY_SEGURO_Y_LARGO
DB_ROOT_PASSWORD=ROOT_PASSWORD_SUPER_SEGURO

# JWT (generar uno nuevo)
JWT_SECRET=jwt_secret_production_muy_largo_y_aleatorio

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=produccion@ticketvue.com
EMAIL_PASSWORD=app_password_produccion
```

### 2. Configuración Adicional

**docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  frontend:
    environment:
      - NODE_ENV=production
    restart: always

  backend:
    environment:
      - NODE_ENV=production
    restart: always

  mysql:
    restart: always
    volumes:
      - /var/lib/mysql:/var/lib/mysql  # Ruta absoluta en servidor
```

### 3. Deploy

```bash
# Build para producción
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Iniciar en producción
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verificar estado
docker-compose ps
docker-compose logs -f
```

### 4. Backup Automático

Crear script `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup de MySQL
docker exec ticketvue-mysql mysqldump -u root -p${DB_ROOT_PASSWORD} ticketvue > ${BACKUP_DIR}/backup_${DATE}.sql

# Comprimir
gzip ${BACKUP_DIR}/backup_${DATE}.sql

# Eliminar backups antiguos (más de 7 días)
find ${BACKUP_DIR} -name "backup_*.sql.gz" -mtime +7 -delete
```

### 5. Monitoreo

```bash
# Configurar logging
docker-compose logs --follow --tail=100 > app.log

# Configurar restart automático
# Ya configurado con: restart: unless-stopped
```

---

## 📊 Recursos y Límites

### Configuración de Recursos

Agregar a `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          memory: 256M
```

### Ver Uso de Recursos

```bash
# Ver estadísticas en tiempo real
docker stats

# Ver tamaño de imágenes
docker images

# Ver tamaño de volúmenes
docker volume ls
docker system df -v
```

---

## 🔒 Seguridad

### Mejores Prácticas

1. **No usar credenciales por defecto en producción**
2. **Generar JWT_SECRET único y largo**
3. **Usar HTTPS en producción (Nginx + Let's Encrypt)**
4. **Mantener imágenes actualizadas**
5. **Usar secretos de Docker en lugar de .env para producción**
6. **Limitar recursos de contenedores**
7. **Hacer backups regulares**

### Actualizar Imágenes

```bash
# Actualizar imagen base
docker-compose pull

# Rebuild con última versión
docker-compose build --pull

# Reiniciar con nuevas imágenes
docker-compose up -d
```

---

## 📝 Archivos Docker

### Estructura de Archivos

```
proyecto/
├── Dockerfile                    # Frontend (Vue.js + Nginx)
├── .dockerignore                # Archivos ignorados en build
├── nginx.conf                   # Configuración de Nginx
├── docker-compose.yml           # Configuración de servicios
├── .env.docker.example          # Variables de ejemplo
├── .env.docker                  # Variables reales (no subir)
│
└── backend/
    ├── Dockerfile               # Backend (Node.js)
    └── .dockerignore           # Archivos ignorados en build
```

---

## 🎯 Comandos Rápidos

```bash
# Setup inicial
copy .env.docker.example .env.docker
# Editar .env.docker con tus credenciales

# Build y start
docker-compose build
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver estado
docker-compose ps

# Backup BD
docker exec ticketvue-mysql mysqldump -u root -p ticketvue > backup.sql

# Detener todo
docker-compose down

# Limpiar todo (¡cuidado!)
docker-compose down -v
```

---

## 📚 Recursos Adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MySQL Docker Image](https://hub.docker.com/_/mysql)

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs`
2. Verifica la configuración: `docker-compose config`
3. Consulta esta guía
4. Revisa la documentación oficial de Docker

---

**Creado:** Octubre 2025  
**Proyecto:** Sistema de Boletería TicketVue  
**Versión Docker:** 1.0
