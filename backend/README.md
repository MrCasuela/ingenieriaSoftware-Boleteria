# 🚀 Backend API - Sistema de Boletería

API REST para el sistema de boletería construida con Node.js, Express y MySQL.

## 🏗️ Tecnologías

- **Node.js 16+** - Runtime
- **Express.js** - Framework web
- **MySQL 8.0+** - Base de datos
- **Sequelize** - ORM
- **bcrypt** - Hash de contraseñas
- **JWT** - Autenticación (futuro)

## 📁 Estructura

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # Conexión Sequelize
│   │   └── seed.js           # Datos iniciales
│   ├── models/              # Modelos Sequelize
│   │   ├── User.js          # Usuario base
│   │   ├── Cliente.js       # Hereda de User
│   │   ├── Operador.js      # Hereda de User
│   │   ├── Administrador.js # Hereda de User
│   │   ├── Event.js
│   │   ├── TicketType.js
│   │   ├── Ticket.js
│   │   ├── AuditLog.js      # ⭐ NUEVO: Auditoría
│   │   └── index.js         # Relaciones
│   ├── controllers/         # Lógica de negocio
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── ticketController.js
│   │   ├── ticketTypeController.js
│   │   ├── userController.js
│   │   └── auditController.js  # ⭐ NUEVO: Auditoría
│   ├── routes/             # Rutas de API
│   │   ├── eventRoutes.js
│   │   ├── ticketRoutes.js
│   │   ├── auditRoutes.js   # ⭐ NUEVO: Auditoría
│   │   └── ...
│   ├── services/           # Servicios
│   │   └── pdfService.js   # Generación de PDFs
│   └── utils/             # Utilidades
├── migrations/            # ⭐ NUEVO: Migraciones SQL
│   ├── create-audit-logs-table.sql
│   └── insert-audit-sample-data.sql
├── database-schema-init.sql  # Schema inicial con audit_logs
├── database-schema.sql       # Schema completo
└── server.js             # Punto de entrada
```

## 🚀 Instalación

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crear archivo `.env`:

```env
# Puerto del servidor
PORT=3000
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ticketing_system
DB_USER=root
DB_PASSWORD=tu_password

# JWT (futuro)
JWT_SECRET=tu_clave_secreta
JWT_EXPIRE=7d
```

### 3. Crear Base de Datos

```sql
CREATE DATABASE ticketing_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Inicializar Datos

```bash
npm run seed
```

Esto crea:
- Usuarios de prueba (admin, operador, clientes)
- Eventos de ejemplo
- Tipos de tickets
- Lugares (venues)

### 5. Iniciar Servidor

**Desarrollo (con auto-reload):**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

Servidor disponible en: `http://localhost:3000`

## 📊 Modelo de Datos

### Herencia de Usuarios

Single Table Inheritance - todos los usuarios en tabla `users`:

```
User (base)
├── Cliente (user_type='cliente')
├── Operador (user_type='operador')
└── Administrador (user_type='administrador')
```

### Relaciones

```
users (1:N) tickets (como comprador)
users (1:N) tickets (como validador - operadores)
events (1:N) ticket_types
events (1:N) tickets
ticket_types (1:N) tickets
venues (1:N) events
```

### Tablas

#### users
- id, email, password, first_name, last_name
- user_type (cliente/operador/administrador)
- phone, document, address
- is_active, created_at, updated_at

#### events
- id, name, description, date
- location, venue (JSON), image
- total_capacity, total_sold, revenue
- category, status, created_at, updated_at

#### ticket_types
- id, event_id (FK), name, description
- price, quantity, available
- features (JSON), is_active

#### tickets
- id, ticket_code (único), event_id (FK)
- ticket_type_id (FK), buyer_id (FK)
- quantity, price, service_charge, total_amount
- status (pending/paid/validated/cancelled/refunded)
- payment_method, payment_reference, qr_code
- buyer_name, buyer_email, buyer_document, buyer_phone
- validated_by (FK a users), validated_at
- purchase_date, created_at, updated_at

#### audit_logs ⭐ NUEVA
- id, ticket_code, operator_name, operator_email
- event_id (FK), event_name
- validation_result (approved/rejected/error)
- validation_type (qr/manual/rut)
- ticket_category (normal/vip/general/premium)
- message, rejection_reason, fraud_detected
- user_name, user_rut
- metadata (JSON), ip_address, user_agent
- timestamp, created_at, updated_at

**Propósito:** Registra TODAS las validaciones de tickets (exitosas y fallidas) para:
- Auditoría y trazabilidad
- Detección de fraudes (múltiples intentos de uso)
- Análisis de rendimiento de operadores
- Reportes y estadísticas
- Cumplimiento legal

## 🔌 API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/users/register | Registrar usuario |
| POST | /api/users/login | Iniciar sesión |

### Eventos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/events | Listar eventos |
| GET | /api/events/:id | Obtener evento |
| POST | /api/events | Crear evento |
| PUT | /api/events/:id | Actualizar evento |
| DELETE | /api/events/:id | Eliminar evento |

### Tipos de Tickets

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/ticket-types | Listar tipos |
| GET | /api/ticket-types/:id | Obtener tipo |
| GET | /api/ticket-types/event/:eventId | Tipos por evento |
| POST | /api/ticket-types | Crear tipo |
| PUT | /api/ticket-types/:id | Actualizar tipo |
| DELETE | /api/ticket-types/:id | Eliminar tipo |

### Tickets

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/tickets | Listar tickets |
| GET | /api/tickets/:id | Obtener ticket |
| GET | /api/tickets/code/:code | Buscar por código |
| POST | /api/tickets | Crear ticket (compra) |
| PUT | /api/tickets/:code/validate | Validar ticket |
| DELETE | /api/tickets/:id | Cancelar ticket |

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/users | Listar usuarios |
| GET | /api/users/:id | Obtener usuario |
| PUT | /api/users/:id | Actualizar usuario |
| DELETE | /api/users/:id | Eliminar usuario |

### Auditoría ⭐ NUEVO

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/audit/logs | Obtener logs con filtros |
| GET | /api/audit/stats | Obtener estadísticas |
| GET | /api/audit/report/:eventId | Reporte de evento |
| POST | /api/audit/log | Crear registro de auditoría |
| POST | /api/audit/generate-pdf | Generar reporte PDF |

**Parámetros de filtro para `/api/audit/logs`:**
- `eventId` - Filtrar por evento
- `validationType` - qr, manual, o rut
- `validationResult` - approved, rejected, o error
- `operatorEmail` - Email del operador
- `startDate` - Fecha inicio (YYYY-MM-DD)
- `endDate` - Fecha fin (YYYY-MM-DD)
- `limit` - Límite de registros (default: 100)
- `offset` - Offset para paginación (default: 0)

**Ejemplo:**
```bash
GET /api/audit/logs?eventId=1&validationType=qr&limit=50
GET /api/audit/stats?eventId=1&startDate=2025-01-01&endDate=2025-12-31
POST /api/audit/generate-pdf
{
  "eventId": 1,
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

## 💾 Transacciones

### Crear Ticket (Compra)

El controlador `ticketController.createTicket` usa transacciones atómicas:

```javascript
const transaction = await sequelize.transaction();
try {
  // 1. Verificar disponibilidad con lock
  const ticketType = await TicketType.findByPk(id, {
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  
  // 2. Verificar capacidad
  if (ticketType.available_capacity < quantity) {
    throw new Error('Sin capacidad');
  }
  
  // 3. Crear ticket
  await Ticket.create(data, { transaction });
  
  // 4. Reducir capacidad
  await ticketType.decrement('available_capacity', {
    by: quantity,
    transaction
  });
  
  // 5. Actualizar evento
  await event.decrement('available_capacity', {
    by: quantity,
    transaction
  });
  
  // 6. Confirmar todo
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

**Beneficios:**
- ✅ Atomicidad: Todo o nada
- ✅ Consistencia: No overselling
- ✅ Aislamiento: Locks previenen condiciones de carrera
- ✅ Durabilidad: Datos persistentes

## 🔐 Seguridad

### Hash de Contraseñas

```javascript
// En User model
beforeCreate: async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
}
```

### Validaciones

```javascript
// En modelos Sequelize
email: {
  type: DataTypes.STRING,
  allowNull: false,
  unique: true,
  validate: {
    isEmail: true
  }
}
```

## 🧪 Datos de Prueba

El seed crea:

**Usuarios:**
- Admin: `admin@ticketsystem.com` / `Admin123!`
- Operador: `operador@ticketsystem.com` / `Operador123!`
- Cliente: `cliente@test.com` / `Cliente123!`

**Eventos:**
- Conciertos, deportes, teatro
- Con diferentes tipos de tickets (VIP, General, Estudiante)

## 🛠️ Scripts

```bash
# Desarrollo con auto-reload
npm run dev

# Producción
npm start

# Inicializar DB
npm run seed

# Resetear DB (borra todo)
npm run reset-db
```

## 📝 Logging

El servidor registra:
- Solicitudes HTTP (método, ruta, status)
- Errores con stack trace
- Operaciones de BD

Ejemplo:
```
[2025-10-10 15:30:45] GET /api/events - 200 OK
[2025-10-10 15:31:12] POST /api/tickets - 201 Created
```

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"
- Verificar MySQL corriendo
- Verificar credenciales en `.env`
- Verificar que la BD existe

### Error: "Port 3000 already in use"
- Cambiar PORT en `.env`
- O matar proceso en puerto 3000:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### Error: "Table doesn't exist"
- Ejecutar `npm run seed`
- Verificar conexión a BD correcta

## 🔄 Integración con Frontend

El frontend (Vue.js) consume esta API:

```javascript
// Ejemplo en frontend
const response = await fetch('http://localhost:3000/api/events');
const data = await response.json();
```

**CORS configurado** para permitir solicitudes desde:
- `http://localhost:5173` (desarrollo)
- Configurar origen en producción

## 📈 Escalabilidad

Para escalar:
- [ ] Implementar caché (Redis)
- [ ] Pool de conexiones a BD
- [ ] Rate limiting
- [ ] Load balancer (múltiples instancias)
- [ ] Separar microservicios

## 🤝 Contribuir

1. Fork el repo
2. Crea rama feature
3. Commit cambios
4. Push y abre PR

## 📄 Licencia

MIT

---

**Versión:** 2.0.0  
**Última actualización:** Octubre 2025
