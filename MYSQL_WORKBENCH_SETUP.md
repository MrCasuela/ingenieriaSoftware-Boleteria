# 🔧 Cómo Conectar MySQL Workbench al Docker

## 📍 Ubicación de MySQL

Tu MySQL **NO** está en tu sistema local, está corriendo dentro de un **contenedor Docker** llamado `ticketvue-mysql`.

---

## 🔌 Datos de Conexión para MySQL Workbench

### Configuración Actual (Docker)

| Parámetro | Valor |
|-----------|-------|
| **Host** | `localhost` o `127.0.0.1` |
| **Puerto** | `3307` ⚠️ (NO 3306, ese está ocupado por tu MySQL local) |
| **Usuario** | `ticketuser` |
| **Contraseña** | `change_this_secure_password_123` |
| **Base de Datos** | `ticketvue` |

### Usuario Root (Administrador)

| Parámetro | Valor |
|-----------|-------|
| **Host** | `localhost` o `127.0.0.1` |
| **Puerto** | `3307` |
| **Usuario** | `root` |
| **Contraseña** | `change_this_root_password_456` |
| **Base de Datos** | `ticketvue` |

---

## 📝 Paso a Paso: Conectar MySQL Workbench

### 1️⃣ Abrir MySQL Workbench

### 2️⃣ Crear Nueva Conexión
1. Click en el botón **"+"** junto a "MySQL Connections"
2. O ir a: **Database → Manage Connections → New**

### 3️⃣ Configurar la Conexión

Ingresa los siguientes datos:

```
Connection Name: TicketVue Docker
Connection Method: Standard (TCP/IP)

Parameters:
  Hostname: 127.0.0.1
  Port: 3307
  Username: ticketuser
  Password: [Click "Store in Vault..."] → change_this_secure_password_123
  Default Schema: ticketvue
```

### 4️⃣ Probar Conexión
1. Click en **"Test Connection"**
2. Deberías ver: ✅ "Successfully made the MySQL connection"

### 5️⃣ Conectar
1. Click en **"OK"** para guardar
2. Haz doble click en la nueva conexión "TicketVue Docker"

---

## 🎯 Verificación Rápida

### Opción 1: Desde PowerShell
```powershell
# Conectarte al contenedor MySQL
docker exec -it ticketvue-mysql mysql -u ticketuser -p

# Cuando te pida la contraseña, ingresa:
# change_this_secure_password_123

# Luego ejecuta:
USE ticketvue;
SHOW TABLES;
```

### Opción 2: Desde MySQL Workbench
Una vez conectado, ejecuta:
```sql
USE ticketvue;
SHOW TABLES;
SELECT * FROM users;
```

---

## 📊 Estructura de la Base de Datos

### Tablas Creadas (schema inicial)

La base de datos debería tener las siguientes tablas según `backend/database-schema.sql`:

```
ticketvue
├── users          (operadores y administradores)
├── events         (eventos de boletería)
├── ticket_types   (tipos de tickets por evento)
└── tickets        (tickets vendidos)
```

### Ver el Schema Completo
```sql
-- Ver todas las tablas
SHOW TABLES;

-- Descripción de cada tabla
DESCRIBE users;
DESCRIBE events;
DESCRIBE ticket_types;
DESCRIBE tickets;

-- Ver datos
SELECT * FROM users;
SELECT * FROM events;
```

---

## 🚨 Problemas Comunes

### ❌ "Can't connect to MySQL server on '127.0.0.1:3307'"

**Causa:** El contenedor no está corriendo.

**Solución:**
```powershell
# Verificar que el contenedor esté activo
docker ps | Select-String "ticketvue-mysql"

# Si no está corriendo, iniciarlo
docker-compose --env-file .env.docker up -d mysql

# O iniciar todos los servicios
docker-compose --env-file .env.docker up -d
```

### ❌ "Access denied for user 'ticketuser'@'...' "

**Causa:** Contraseña incorrecta.

**Solución:** Verifica que estés usando la contraseña correcta: `change_this_secure_password_123`

Para ver la contraseña actual:
```powershell
# Leer el archivo .env.docker
Get-Content .env.docker | Select-String "DB_PASSWORD"
```

### ❌ "Error connecting to port 3306"

**Causa:** Estás intentando conectarte al puerto incorrecto.

**Solución:** Asegúrate de usar el puerto **3307**, NO el 3306 (ese es tu MySQL local).

---

## 🔄 Diferencias entre MySQL Local y MySQL Docker

| Aspecto | MySQL Local (Sistema) | MySQL Docker |
|---------|----------------------|--------------|
| **Puerto** | 3306 | 3307 |
| **Ubicación** | Instalado en Windows | Contenedor Docker |
| **Datos** | C:\ProgramData\MySQL | Volumen Docker `mysql_data` |
| **Acceso** | Siempre disponible | Solo cuando contenedor corre |
| **Configuración** | my.ini en Windows | Variables de entorno Docker |

---

## 📂 Ubicación de los Datos

### Datos Persistentes (Volumen Docker)
```powershell
# Ver información del volumen
docker volume inspect ticketvue_mysql_data

# Ubicación aproximada en Windows:
# \\wsl$\docker-desktop-data\data\docker\volumes\ticketvue_mysql_data\_data
```

### Backup Manual de la Base de Datos
```powershell
# Crear backup
docker exec ticketvue-mysql mysqldump -u root -pchange_this_root_password_456 ticketvue > backup_ticketvue_$(Get-Date -Format 'yyyy-MM-dd').sql

# Restaurar backup
Get-Content backup_ticketvue_2025-10-09.sql | docker exec -i ticketvue-mysql mysql -u root -pchange_this_root_password_456 ticketvue
```

---

## 🔐 Cambiar Contraseñas (Producción)

Para cambiar las contraseñas por seguridad:

### 1. Editar .env.docker
```bash
DB_PASSWORD=TuNuevaContraseñaSegura123!
DB_ROOT_PASSWORD=OtraContraseñaRootSegura456!
```

### 2. Recrear el contenedor
```powershell
# Detener y eliminar contenedor (los datos persisten en el volumen)
docker-compose --env-file .env.docker down

# Eliminar el volumen SI quieres empezar de cero
docker volume rm ticketvue_mysql_data

# Iniciar de nuevo con nuevas contraseñas
docker-compose --env-file .env.docker up -d
```

---

## 📞 Comandos Útiles

### Ver logs de MySQL
```powershell
docker logs ticketvue-mysql --tail 50
```

### Conectarse directamente al contenedor
```powershell
# Como usuario ticketuser
docker exec -it ticketvue-mysql mysql -u ticketuser -pchange_this_secure_password_123 ticketvue

# Como root
docker exec -it ticketvue-mysql mysql -u root -pchange_this_root_password_456
```

### Ver estado del contenedor
```powershell
docker ps -f name=ticketvue-mysql
```

### Reiniciar MySQL
```powershell
docker restart ticketvue-mysql
```

---

## 🎯 Resumen Rápido

**Para conectarte a MySQL Docker desde Workbench:**

```
Host: 127.0.0.1
Port: 3307  ← ¡IMPORTANTE!
User: ticketuser
Pass: change_this_secure_password_123
Database: ticketvue
```

**¡Eso es todo!** 🎉

---

## 📚 Ver También

- **DOCKER_GUIDE.md** - Guía completa de Docker
- **DOCKER_EXECUTION_SUMMARY.md** - Estado actual de los contenedores
- **backend/database-schema.sql** - Schema completo de la base de datos
