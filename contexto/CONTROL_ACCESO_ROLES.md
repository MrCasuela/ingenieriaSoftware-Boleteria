# Sistema de Control de Acceso Basado en Roles (RBAC)

## 📋 Descripción General

El sistema implementa un control de acceso basado en roles (Role-Based Access Control) con tres niveles de usuario:

### 👥 Roles de Usuario

#### 1. **Cliente**
- **Permisos**: 
  - ✅ Ver eventos disponibles
  - ✅ Comprar tickets
  - ✅ Ver sus propios tickets
  - ❌ NO puede acceder a paneles de operador o administrador
  
#### 2. **Operador**
- **Permisos**:
  - ✅ Validar tickets (escanear QR)
  - ✅ Buscar tickets por código o RUT
  - ✅ Acceder al panel de operador
  - ❌ NO puede acceder al panel de administrador
  - ❌ NO puede ver reportes
  - ❌ NO puede gestionar eventos o usuarios

#### 3. **Administrador**
- **Permisos**:
  - ✅ Acceso completo al panel de administrador
  - ✅ Ver reportes y estadísticas
  - ✅ Gestionar eventos (crear, editar, eliminar)
  - ✅ Gestionar usuarios y roles
  - ✅ Crear operadores
  - ✅ Ver todos los tickets
  - ✅ Acceder a todas las funcionalidades del sistema

- **Niveles de Administrador**:
  - **Super Admin**: Puede crear otros administradores y modificar permisos
  - **Moderador**: Puede gestionar eventos y ver reportes, pero no crear otros admins

---

## 🔐 Autenticación y Autorización

### Middleware de Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación:

```javascript
// Proteger rutas
import { protect, adminOnly, operadorOnly, operadorOrAdmin } from './middleware/auth.js';

// Ejemplo de uso
router.get('/admin/panel', protect, adminOnly, getAdminPanel);
router.get('/operator/validate', protect, operadorOrAdmin, validateTicket);
```

### Middlewares Disponibles

1. **`protect`**: Verifica que el usuario esté autenticado
2. **`adminOnly`**: Solo administradores
3. **`operadorOnly`**: Solo operadores
4. **`operadorOrAdmin`**: Operadores o administradores
5. **`clienteOnly`**: Solo clientes
6. **`checkAdminPermission(permission)`**: Verifica permisos específicos de admin

---

## 🎫 Envío Automático de Tickets por Email

Cuando un cliente compra un ticket, el sistema automáticamente:

1. ✅ Genera un PDF con todos los detalles del ticket
2. ✅ Incluye el código QR en el PDF
3. ✅ Envía el PDF por email al comprador
4. ✅ Muestra un mensaje de confirmación

### Configuración del Email

Edita el archivo `.env` en la carpeta `backend`:

```env
# Configuración de Email - Opción 1: Gmail
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-contraseña-de-aplicacion

# Configuración de Email - Opción 2: SMTP Genérico
SMTP_HOST=smtp.tu-servidor.com
SMTP_PORT=587
SMTP_USER=tu-usuario
SMTP_PASSWORD=tu-contraseña

# Remitente
EMAIL_FROM="Sistema de Boletería <noreply@ticketvue.com>"
```

**Nota**: Para Gmail, necesitas generar una "Contraseña de Aplicación" en la configuración de tu cuenta de Google.

---

## 🛣️ Rutas Protegidas

### Rutas de Frontend

```javascript
// Cliente (público)
/ → EventList (compra de tickets)
/tickets/:eventId → TicketSelection
/personal-data → PersonalData
/confirmation → Confirmation

// Operador (requiere autenticación)
/operator/login → Login
/operator/panel → Panel de Operador (validar tickets)

// Administrador (requiere autenticación + rol admin)
/admin/panel → Panel de Administrador (reportes, gestión)
```

### Rutas de Backend API

```javascript
// Autenticación (público)
POST /api/users/login
POST /api/users/register

// Tickets
POST /api/tickets → Crear ticket (público - compra)
GET /api/tickets → Ver todos (solo admin)
GET /api/tickets/code/:code → Buscar por código (operador/admin)
GET /api/tickets/by-rut/:rut → Buscar por RUT (operador/admin)
POST /api/tickets/validate/:code → Validar ticket (operador/admin)

// Eventos
GET /api/events → Ver eventos (público)
POST /api/events → Crear evento (solo admin)
PUT /api/events/:id → Editar evento (solo admin)
DELETE /api/events/:id → Eliminar evento (solo admin)

// Administración
GET /api/admin/users → Ver todos los usuarios
POST /api/admin/operators → Crear operador
POST /api/admin/administrators → Crear administrador (solo super admin)
PUT /api/admin/users/:id/role → Cambiar rol de usuario
PUT /api/admin/users/:id/toggle-status → Activar/desactivar usuario
GET /api/admin/stats → Estadísticas de usuarios
```

---

## 🚀 Instalación y Configuración

### Backend

```bash
cd backend
npm install
```

Crea un archivo `.env`:

```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu-password
DB_NAME=ticketvue
DB_PORT=3306

# JWT
JWT_SECRET=tu-clave-secreta-muy-segura
JWT_EXPIRE=7d

# Email (ver sección anterior)
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-contraseña-de-aplicacion
EMAIL_FROM="Sistema de Boletería <noreply@ticketvue.com>"

# Servidor
PORT=3000
NODE_ENV=development
```

Inicia el servidor:

```bash
npm run dev
```

### Frontend

```bash
cd ..
npm install
npm run dev
```

---

## 👤 Usuarios de Prueba

### Administrador
- **Email**: admin@ticketvue.com
- **Password**: admin123
- **Nivel**: Super Admin

### Operador
- **Email**: operador@ticketvue.com
- **Password**: operador123

### Cliente
- Registro público desde la interfaz

---

## 🔄 Flujo de Compra con Email

1. Cliente selecciona evento y tipo de ticket
2. Ingresa datos personales
3. Realiza el pago
4. Sistema crea el ticket en la base de datos
5. ✨ **Automáticamente**:
   - Genera PDF con código QR
   - Envía email con PDF adjunto
   - Mensaje: "¡Compra exitosa! Revisa tu email"
6. Cliente recibe email con:
   - Código QR
   - Código de entrada
   - Detalles del evento
   - Instrucciones de uso

---

## 📊 Gestión de Roles (Administrador)

### Crear Operador

```javascript
POST /api/admin/operators
{
  "email": "nuevo.operador@ticketvue.com",
  "password": "password123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+56912345678",
  "employeeId": "OP-001",
  "shift": "mañana"
}
```

### Crear Administrador (Solo Super Admin)

```javascript
POST /api/admin/administrators
{
  "email": "nuevo.admin@ticketvue.com",
  "password": "password123",
  "firstName": "María",
  "lastName": "González",
  "phone": "+56987654321",
  "adminLevel": "moderador",
  "permissions": ["manage_events", "view_reports"]
}
```

### Cambiar Rol de Usuario

```javascript
PUT /api/admin/users/:id/role
{
  "newRole": "Operador",
  "employeeId": "OP-002",
  "shift": "tarde"
}
```

---

## 🛡️ Seguridad

- ✅ Passwords hasheadas con bcrypt
- ✅ Tokens JWT con expiración
- ✅ Validación de permisos en backend y frontend
- ✅ Protección contra acceso no autorizado
- ✅ Sesiones seguras con localStorage
- ✅ Validación de entrada de datos

---

## 📝 Notas Importantes

1. **Operadores NO pueden acceder a reportes**: Si un operador intenta acceder al panel de administrador, será redirigido automáticamente con un mensaje de error.

2. **Administradores tienen panel separado**: Los administradores tienen su propio panel con acceso completo a reportes y gestión.

3. **Email automático**: El PDF se envía automáticamente al crear un ticket. Si el email falla, el ticket se crea de todas formas (no bloquea la compra).

4. **PDF incluido en email**: El mismo PDF que se puede descargar en la confirmación se envía por email adjunto.

---

## 🆘 Solución de Problemas

### Email no se envía

1. Verifica la configuración en `.env`
2. Para Gmail, activa "Acceso de aplicaciones menos seguras" o usa "Contraseña de aplicación"
3. Revisa los logs del servidor para errores específicos

### Usuario no puede acceder

1. Verifica que el token JWT sea válido
2. Confirma que el rol del usuario es correcto
3. Revisa que la cuenta esté activa (`isActive: true`)

### Errores de permisos

1. Usa las herramientas de desarrollador del navegador
2. Revisa la consola del backend
3. Verifica que los middlewares estén en el orden correcto

---

## 📧 Soporte

Para más información o soporte, contacta al equipo de desarrollo.
