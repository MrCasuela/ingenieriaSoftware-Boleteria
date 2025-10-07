# TicketVue Backend - Sistema de Boletería

Backend API REST para el sistema de boletería TicketVue, construido con Node.js, Express y MySQL.

## 🏗️ Arquitectura

### Tecnologías Principales
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **MySQL** - Base de datos relacional
- **Sequelize** - ORM para MySQL
- **JWT** - Autenticación
- **bcryptjs** - Hash de contraseñas

### Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de Sequelize/MySQL
│   ├── models/
│   │   ├── User.js              # Modelo base Usuario
│   │   ├── Cliente.js           # Hereda de User
│   │   ├── Operador.js          # Hereda de User
│   │   ├── Administrador.js     # Hereda de User
│   │   ├── Event.js             # Modelo Evento
│   │   ├── TicketType.js        # Modelo Tipo de Entrada
│   │   ├── Ticket.js            # Modelo Entrada/Ticket
│   │   └── index.js             # Exporta modelos y relaciones
│   ├── controllers/             # Controladores de la API
│   ├── routes/                  # Rutas de la API
│   ├── middlewares/             # Middlewares personalizados
│   └── utils/                   # Utilidades
├── server.js                    # Punto de entrada del servidor
├── package.json
└── .env.example                 # Variables de entorno de ejemplo
```

## 📊 Modelo de Datos

### Herencia de Usuarios (Single Table Inheritance)

El sistema utiliza **herencia de clases** donde `Usuario` es la clase base y `Cliente`, `Operador` y `Administrador` heredan de ella. Todos se almacenan en la misma tabla `users` con un campo discriminador `user_type`.

```
Usuario (Clase Base)
├── Cliente        (user_type = 'Cliente')
├── Operador       (user_type = 'Operador')
└── Administrador  (user_type = 'Administrador')
```

### Relaciones

```
Event (1:N) TicketType
Event (1:N) Ticket
TicketType (1:N) Ticket
Cliente (1:N) Ticket (como comprador)
Operador (1:N) Ticket (como validador)
Administrador (1:N) Event (como organizador)
```

## 🚀 Instalación

### Prerrequisitos
- Node.js 16+
- MySQL 8.0+
- npm o yarn

### Pasos

1. **Instalar dependencias**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

3. **Crear base de datos MySQL**
```sql
CREATE DATABASE ticketvue CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. **Iniciar servidor en desarrollo**
```bash
npm run dev
```

## 📋 Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
PORT=3000
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ticketvue
DB_USER=root
DB_PASSWORD=tu_contraseña

# JWT
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRE=7d
```

## 🗄️ Esquema de Base de Datos

### Tabla: `users`
Almacena todos los tipos de usuarios usando Single Table Inheritance.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | PK, Auto-increment |
| email | VARCHAR(100) | Unique, email del usuario |
| password | VARCHAR(255) | Contraseña hasheada |
| first_name | VARCHAR(50) | Nombre |
| last_name | VARCHAR(50) | Apellido |
| phone | VARCHAR(20) | Teléfono |
| user_type | ENUM | 'Cliente', 'Operador', 'Administrador' |
| is_active | BOOLEAN | Estado activo |
| document | VARCHAR(12) | RUT (solo Cliente) |
| total_purchases | INT | Total de compras (solo Cliente) |
| total_spent | DECIMAL(10,2) | Total gastado (solo Cliente) |
| preferences | JSON | Preferencias (solo Cliente) |
| employee_id | VARCHAR(20) | ID empleado (solo Operador) |
| total_validations | INT | Total validaciones (solo Operador) |
| shift | ENUM | Turno (solo Operador) |
| admin_level | ENUM | Nivel admin (solo Administrador) |
| permissions | JSON | Permisos (solo Administrador) |
| last_login | DATETIME | Último login (solo Administrador) |
| created_at | TIMESTAMP | Fecha creación |
| updated_at | TIMESTAMP | Fecha actualización |

### Tabla: `events`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | PK, Auto-increment |
| name | VARCHAR(200) | Nombre del evento |
| description | TEXT | Descripción |
| date | DATETIME | Fecha del evento |
| location | VARCHAR(200) | Ubicación |
| venue | JSON | Datos del lugar |
| image | VARCHAR(500) | URL de imagen |
| category | ENUM | Categoría del evento |
| status | ENUM | Estado del evento |
| organizer_id | INT | FK a users (Administrador) |
| total_sold | INT | Total de entradas vendidas |
| revenue | DECIMAL(12,2) | Ingresos totales |
| created_at | TIMESTAMP | Fecha creación |
| updated_at | TIMESTAMP | Fecha actualización |

### Tabla: `ticket_types`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | PK, Auto-increment |
| event_id | INT | FK a events |
| name | VARCHAR(100) | Nombre del tipo |
| description | TEXT | Descripción |
| price | DECIMAL(10,2) | Precio |
| quantity | INT | Cantidad total |
| available | INT | Cantidad disponible |
| features | JSON | Características |
| is_active | BOOLEAN | Estado activo |
| created_at | TIMESTAMP | Fecha creación |
| updated_at | TIMESTAMP | Fecha actualización |

### Tabla: `tickets`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | PK, Auto-increment |
| ticket_code | VARCHAR(50) | Código único del ticket |
| event_id | INT | FK a events |
| ticket_type_id | INT | FK a ticket_types |
| buyer_id | INT | FK a users (Cliente) |
| quantity | INT | Cantidad de entradas |
| price | DECIMAL(10,2) | Precio unitario |
| service_charge | DECIMAL(10,2) | Cargo por servicio |
| total_amount | DECIMAL(10,2) | Monto total |
| status | ENUM | Estado del ticket |
| qr_data | TEXT | Datos del código QR |
| validated_by | INT | FK a users (Operador) |
| validated_at | DATETIME | Fecha de validación |
| purchase_date | DATETIME | Fecha de compra |
| payment_method | ENUM | Método de pago |
| payment_details | JSON | Detalles del pago |
| additional_info | JSON | Información adicional |
| created_at | TIMESTAMP | Fecha creación |
| updated_at | TIMESTAMP | Fecha actualización |

## 🔐 Autenticación

El sistema utiliza **JWT (JSON Web Tokens)** para autenticación:

1. Usuario hace login → Servidor valida credenciales
2. Si es válido → Genera JWT con el ID del usuario
3. Cliente guarda el token → Lo envía en cada request
4. Servidor valida el token → Permite acceso a recursos protegidos

## 🎯 Características Principales

### 1. Herencia de Usuarios
- Implementación de Single Table Inheritance
- Usuario como clase base
- Cliente, Operador y Administrador heredan propiedades y métodos
- Campos específicos para cada tipo de usuario

### 2. Gestión de Eventos
- CRUD completo de eventos
- Categorización y estados
- Relación con tipos de entrada

### 3. Sistema de Tickets
- Generación automática de códigos únicos
- Integración con QR codes
- Control de disponibilidad
- Validación por operadores

### 4. Seguridad
- Contraseñas hasheadas con bcrypt
- Autenticación JWT
- Validación de datos con Sequelize

## 📝 Próximos Pasos

- [ ] Implementar controladores
- [ ] Crear rutas de la API
- [ ] Agregar middlewares de autenticación
- [ ] Implementar validaciones con express-validator
- [ ] Crear seeds para datos de prueba
- [ ] Agregar documentación de API con Swagger
- [ ] Implementar tests unitarios

## 🤝 Contribución

Este proyecto es parte del curso de Ingeniería de Software.

## 📄 Licencia

ISC
