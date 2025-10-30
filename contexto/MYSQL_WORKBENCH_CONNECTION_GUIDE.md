# 🔐 Guía de Conexión a MySQL con Workbench

## ✅ Problema Resuelto

Se ha solucionado el problema de conexión a MySQL Workbench creando usuarios con los permisos correctos.

---

## 📋 Credenciales Disponibles

### **Opción 1: Usuario Admin (Recomendado)**
```
Host: 127.0.0.1
Puerto: 3307
Usuario: admin
Contraseña: admin123
Base de datos: ticketvue
```

### **Opción 2: Usuario Root**
```
Host: 127.0.0.1
Puerto: 3307
Usuario: root
Contraseña: rootpassword
Base de datos: ticketvue
```

---

## 🔧 Pasos para Conectar en MySQL Workbench

### **1. Abrir MySQL Workbench**

### **2. Crear Nueva Conexión**
- Click en el botón **"+"** junto a "MySQL Connections"
- O ir a: **Database → Manage Connections → New**

### **3. Configurar Conexión (Usuario Admin)**

**Connection Name:** `TicketVue Local (Admin)`

**Parameters:**
- **Connection Method:** Standard (TCP/IP)
- **Hostname:** `127.0.0.1`
- **Port:** `3307`
- **Username:** `admin`

**Password:**
- Click en **"Store in Vault..."** o **"Store in Keychain..."**
- Ingresa: `admin123`

**Default Schema:** `ticketvue` (opcional)

### **4. Probar Conexión**
- Click en **"Test Connection"**
- Debe aparecer: ✅ "Successfully made the MySQL connection"

### **5. Conectar**
- Click en **"OK"**
- Doble click en la nueva conexión para conectar

---

## 🔍 Verificar Tabla audit_logs

Una vez conectado, ejecuta estos comandos:

```sql
-- Seleccionar base de datos
USE ticketvue;

-- Ver todas las tablas
SHOW TABLES;

-- Ver estructura de audit_logs
DESCRIBE audit_logs;

-- Ver registros de auditoría
SELECT * FROM audit_logs;

-- Ver estadísticas
SELECT 
    validation_result,
    COUNT(*) as total
FROM audit_logs
GROUP BY validation_result;

-- Ver por tipo de validación
SELECT 
    validation_type,
    COUNT(*) as total
FROM audit_logs
GROUP BY validation_type;

-- Ver últimas 10 validaciones
SELECT 
    id,
    ticket_code,
    operator_name,
    validation_result,
    validation_type,
    timestamp
FROM audit_logs
ORDER BY timestamp DESC
LIMIT 10;
```

---

## ❌ Si Aún Tienes Problemas

### **Problema 1: Puerto 3307 no responde**

Verificar que Docker esté corriendo:
```powershell
docker ps
```

Debe mostrar `ticketvue-mysql` en estado "Up" con puerto `0.0.0.0:3307->3306/tcp`

### **Problema 2: Access denied for user**

1. Asegúrate de usar el puerto **3307** (no 3306)
2. Verifica que la contraseña sea exactamente: `admin123` o `rootpassword`
3. Usa el hostname `127.0.0.1` (no `localhost`)

### **Problema 3: Can't connect to MySQL server**

Reiniciar el contenedor MySQL:
```powershell
docker restart ticketvue-mysql
```

Espera 30 segundos y prueba nuevamente.

---

## 🔐 Seguridad en Producción

⚠️ **IMPORTANTE:** Estas credenciales son para desarrollo local únicamente.

En producción debes:
1. ✅ Cambiar todas las contraseñas
2. ✅ Usar contraseñas fuertes (mínimo 16 caracteres)
3. ✅ Limitar acceso por IP
4. ✅ Usar SSL/TLS para conexiones
5. ✅ No exponer el puerto 3307 públicamente
6. ✅ Crear usuarios con permisos específicos (no root)

---

## 📊 Consultas Útiles para Auditoría

### **Validaciones por Evento**
```sql
SELECT 
    event_name,
    COUNT(*) as total_validaciones,
    SUM(CASE WHEN validation_result = 'approved' THEN 1 ELSE 0 END) as aprobadas,
    SUM(CASE WHEN validation_result = 'rejected' THEN 1 ELSE 0 END) as rechazadas,
    SUM(CASE WHEN fraud_detected = 1 THEN 1 ELSE 0 END) as fraudes
FROM audit_logs
GROUP BY event_name;
```

### **Validaciones por Operador**
```sql
SELECT 
    operator_name,
    COUNT(*) as total_validaciones,
    SUM(CASE WHEN validation_result = 'approved' THEN 1 ELSE 0 END) as aprobadas,
    SUM(CASE WHEN validation_result = 'rejected' THEN 1 ELSE 0 END) as rechazadas
FROM audit_logs
GROUP BY operator_name
ORDER BY total_validaciones DESC;
```

### **Validaciones por Categoría de Ticket**
```sql
SELECT 
    ticket_category,
    COUNT(*) as total
FROM audit_logs
GROUP BY ticket_category;
```

### **Intentos de Fraude**
```sql
SELECT 
    ticket_code,
    operator_name,
    event_name,
    message,
    timestamp
FROM audit_logs
WHERE fraud_detected = 1
ORDER BY timestamp DESC;
```

### **Validaciones del Último Día**
```sql
SELECT 
    DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') as hora,
    COUNT(*) as validaciones
FROM audit_logs
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY)
GROUP BY hora
ORDER BY hora DESC;
```

### **Tickets con Múltiples Intentos**
```sql
SELECT 
    ticket_code,
    COUNT(*) as intentos,
    GROUP_CONCAT(validation_result) as resultados
FROM audit_logs
GROUP BY ticket_code
HAVING intentos > 1
ORDER BY intentos DESC;
```

---

## 🔄 Backup de Auditoría

### **Exportar Datos**
```sql
-- En MySQL Workbench:
-- Server → Data Export
-- Seleccionar: ticketvue → audit_logs
-- Export to Self-Contained File
-- Click "Start Export"
```

### **Desde Terminal**
```powershell
docker exec ticketvue-mysql mysqldump -u admin -padmin123 ticketvue audit_logs > audit_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql
```

---

## 📞 Comandos de Diagnóstico

```powershell
# Ver logs de MySQL
docker logs ticketvue-mysql

# Ver últimas 50 líneas
docker logs --tail 50 ticketvue-mysql

# Ver logs en tiempo real
docker logs -f ticketvue-mysql

# Entrar al contenedor
docker exec -it ticketvue-mysql bash

# Conectar a MySQL desde dentro del contenedor
mysql -u admin -padmin123 ticketvue
```

---

## ✅ Checklist de Conexión

- [ ] Docker está corriendo (`docker ps`)
- [ ] Container `ticketvue-mysql` está "Up"
- [ ] Puerto 3307 está mapeado
- [ ] MySQL Workbench instalado
- [ ] Nueva conexión creada con:
  - Host: `127.0.0.1`
  - Puerto: `3307`
  - Usuario: `admin`
  - Password: `admin123`
- [ ] Test Connection exitoso
- [ ] Conectado y base de datos `ticketvue` visible
- [ ] Tabla `audit_logs` existe y tiene datos

---

## 🎉 ¡Conexión Exitosa!

Una vez conectado, podrás:
- ✅ Ver todas las tablas del sistema
- ✅ Consultar registros de auditoría
- ✅ Ejecutar queries personalizadas
- ✅ Exportar datos
- ✅ Analizar estadísticas
- ✅ Monitorear fraudes

---

**Fecha:** 21 de Octubre, 2025  
**Sistema:** TicketVue - Sistema de Auditoría  
**Base de Datos:** MySQL 8.0 en Docker
