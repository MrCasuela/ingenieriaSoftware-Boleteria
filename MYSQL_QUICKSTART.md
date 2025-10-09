# 🔍 Guía Rápida - MySQL Workbench para TicketVue

## 📋 RESUMEN DE CONEXIÓN

```
╔════════════════════════════════════════╗
║   DATOS PARA MYSQL WORKBENCH          ║
╠════════════════════════════════════════╣
║  Host:       127.0.0.1                ║
║  Puerto:     3307  ⚠️ NO 3306!        ║
║  Usuario:    ticketuser               ║
║  Contraseña: change_this_secure_...   ║
║  Database:   ticketvue                ║
╚════════════════════════════════════════╝
```

---

## ✅ TABLAS ACTUALES EN LA BASE DE DATOS

La base de datos `ticketvue` tiene las siguientes tablas:

1. **`users`** - Clientes, Operadores y Administradores
2. **`events`** - Eventos de boletería
3. **`ticket_types`** - Tipos de tickets por evento
4. **`tickets`** - Tickets vendidos

---

## 📊 ESTRUCTURA DE LA TABLA `users`

La tabla `users` tiene un diseño **Single Table Inheritance** (todos los tipos de usuarios en una tabla):

### Campos Comunes
- `id` - Identificador único
- `email` - Email único del usuario
- `password` - Contraseña hasheada
- `first_name` - Nombre
- `last_name` - Apellido
- `phone` - Teléfono
- **`user_type`** - Tipo: `'Cliente'`, `'Operador'`, `'Administrador'`
- `is_active` - Estado activo/inactivo
- `last_login` - Último inicio de sesión
- `created_at` - Fecha de creación
- `updated_at` - Fecha de actualización

### Campos para Clientes
- `document` - DNI/Documento
- `total_purchases` - Total de compras
- `total_spent` - Total gastado
- `preferences` - Preferencias (JSON)

### Campos para Operadores
- `employee_id` - ID de empleado
- `total_validations` - Total de validaciones
- `shift` - Turno: `'mañana'`, `'tarde'`, `'noche'`, `'completo'`

### Campos para Administradores
- `employee_id` - ID de empleado
- `admin_level` - Nivel: `'super'`, `'moderador'`, `'soporte'`
- `permissions` - Permisos (JSON)

---

## 🎯 CONSULTAS ÚTILES PARA WORKBENCH

### Ver todos los usuarios
```sql
SELECT 
    id,
    email,
    CONCAT(first_name, ' ', last_name) AS nombre_completo,
    user_type,
    is_active,
    last_login,
    created_at
FROM users
ORDER BY created_at DESC;
```

### Ver solo Administradores
```sql
SELECT 
    id,
    email,
    CONCAT(first_name, ' ', last_name) AS nombre,
    admin_level,
    employee_id,
    permissions,
    last_login
FROM users
WHERE user_type = 'Administrador'
ORDER BY created_at DESC;
```

### Ver solo Operadores
```sql
SELECT 
    id,
    email,
    CONCAT(first_name, ' ', last_name) AS nombre,
    employee_id,
    shift,
    total_validations,
    last_login
FROM users
WHERE user_type = 'Operador'
ORDER BY created_at DESC;
```

### Ver solo Clientes
```sql
SELECT 
    id,
    email,
    CONCAT(first_name, ' ', last_name) AS nombre,
    document,
    total_purchases,
    total_spent,
    created_at
FROM users
WHERE user_type = 'Cliente'
ORDER BY total_spent DESC;
```

### Ver todos los eventos
```sql
SELECT 
    id,
    name,
    description,
    date,
    location,
    total_capacity,
    available_capacity,
    is_active,
    created_at
FROM events
ORDER BY date DESC;
```

### Ver tipos de tickets por evento
```sql
SELECT 
    tt.id,
    e.name AS evento,
    tt.name AS tipo_ticket,
    tt.price AS precio,
    tt.total_capacity AS capacidad_total,
    tt.available_capacity AS disponibles,
    tt.is_active
FROM ticket_types tt
JOIN events e ON tt.event_id = e.id
ORDER BY e.date DESC, tt.price ASC;
```

### Ver tickets vendidos
```sql
SELECT 
    t.id,
    t.ticket_code,
    e.name AS evento,
    tt.name AS tipo_ticket,
    CONCAT(u.first_name, ' ', u.last_name) AS cliente,
    t.purchase_date,
    t.status,
    t.is_used
FROM tickets t
JOIN ticket_types tt ON t.ticket_type_id = tt.id
JOIN events e ON tt.event_id = e.id
JOIN users u ON t.user_id = u.id
ORDER BY t.purchase_date DESC;
```

---

## 🔧 COMANDOS DE ADMINISTRACIÓN

### Activar/Desactivar Usuario
```sql
-- Desactivar usuario
UPDATE users 
SET is_active = 0 
WHERE email = 'usuario@ejemplo.com';

-- Activar usuario
UPDATE users 
SET is_active = 1 
WHERE email = 'usuario@ejemplo.com';
```

### Cambiar Tipo de Usuario
```sql
-- Promover a Administrador
UPDATE users 
SET user_type = 'Administrador',
    admin_level = 'moderador'
WHERE email = 'usuario@ejemplo.com';
```

### Ver estadísticas generales
```sql
-- Resumen de usuarios por tipo
SELECT 
    user_type,
    COUNT(*) AS total,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS activos
FROM users
GROUP BY user_type;

-- Resumen de eventos
SELECT 
    COUNT(*) AS total_eventos,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS eventos_activos,
    SUM(total_capacity) AS capacidad_total,
    SUM(available_capacity) AS tickets_disponibles
FROM events;
```

---

## 🚀 PASOS PARA CONECTAR

### 1. Abrir MySQL Workbench

### 2. Nueva Conexión
Click en **"+"** junto a "MySQL Connections"

### 3. Configurar
```
Connection Name: TicketVue Docker
Hostname: 127.0.0.1
Port: 3307
Username: ticketuser
```

### 4. Guardar Contraseña
Click en **"Store in Vault..."** → Ingresar: `change_this_secure_password_123`

### 5. Test Connection
Click en **"Test Connection"** → Debe decir ✅ "Successfully made the MySQL connection"

### 6. Conectar
Click **"OK"** y luego doble click en la conexión creada

---

## ⚡ VERIFICACIÓN RÁPIDA DESDE POWERSHELL

```powershell
# Ver si el contenedor está corriendo
docker ps -f name=ticketvue-mysql

# Ver las tablas
docker exec ticketvue-mysql mysql -u ticketuser -pchange_this_secure_password_123 -e "USE ticketvue; SHOW TABLES;"

# Ver estructura de tabla users
docker exec ticketvue-mysql mysql -u ticketuser -pchange_this_secure_password_123 -e "USE ticketvue; DESCRIBE users;"

# Contar usuarios por tipo
docker exec ticketvue-mysql mysql -u ticketuser -pchange_this_secure_password_123 -e "USE ticketvue; SELECT user_type, COUNT(*) as total FROM users GROUP BY user_type;"
```

---

## 📖 Documentación Relacionada

- **MYSQL_WORKBENCH_SETUP.md** - Guía detallada completa
- **backend/database-schema.sql** - Schema SQL completo
- **DOCKER_EXECUTION_SUMMARY.md** - Estado de contenedores

---

**¡Listo para trabajar con la base de datos!** 🎉
