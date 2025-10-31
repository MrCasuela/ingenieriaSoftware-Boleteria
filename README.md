# 🎫 Sistema de Boletería para Eventos

Sistema completo de compra y validación de tickets para eventos con Vue.js, Node.js, Express y MySQL.

## 📋 Descripción

Aplicación web completa que permite:
- **Compra de tickets**: Exploración de eventos y compra segura de entradas
- **Validación QR**: Validación mediante escaneo QR o ingreso manual (RUT/código)
- **Panel de administración**: Gestión de eventos, tipos de tickets y usuarios
- **Base de datos MySQL**: Almacenamiento persistente con transacciones atómicas

## 🏗️ Arquitectura
:) 
### Frontend (Vue.js 3)
- Framework: Vue 3 + Composition API
- State Management: Pinia
- Routing: Vue Router
- UI: Bootstrap 5
- QR: QRCode.js + jsPDF

### Backend (Node.js + Express)
- Framework: Express.js
- ORM: Sequelize
- DB: MySQL 8.0
- Auth: bcrypt + JWT

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 16+
- MySQL 8.0+
- npm o yarn

### 1. Instalar Dependencias

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 2. Configurar Base de Datos

Crear base de datos en MySQL:
```sql
CREATE DATABASE ticketing_system;
```

Configurar variables de entorno (`backend/.env`):
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=ticketing_system
DB_PORT=3306
PORT=3000
NODE_ENV=development
```

Inicializar datos:
```bash
cd backend
npm run seed
```

### 3. Ejecutar Aplicación

#### Opción A: Docker (Recomendado)
```bash
docker-compose up
```

#### Opción B: Ejecución Local

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Acceso:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

## ✨ Funcionalidades Principales

### 1. Sistema de Compra de Tickets

**Flujo:**
1. Selección de Evento
2. Selección de Tipo de Ticket y Cantidad
3. Datos Personales y Pago
4. Confirmación con QR

**Características:**
- ✅ Transacciones atómicas en MySQL
- ✅ Verificación de disponibilidad en tiempo real
- ✅ Actualización automática de tickets disponibles después de compra
- ✅ Generación de QR único y seguro con checksum
- ✅ Descarga de ticket en PDF
- ✅ Envío por email (configuración requerida)

### 2. Sistema de Validación QR (Panel Operador)

**Acceso:** `/operator/login`
- Usuario: `operador@ticketsystem.com`
- Contraseña: `Operador123!`

**Métodos de Validación:**
1. **Escaneo QR:**
   - Activa cámara del dispositivo
   - **Espera 15 segundos a que se presente el código**
   - **Muestra "Tiempo de Escaneo Expirado" si no hay código**
   - Valida solo cuando detecta un QR válido
   - Presiona Enter para simular detección

2. **Ingreso Manual:**
   - Por código de ticket (TKT-XXXXX-XXXX)
   - Por RUT del comprador

**Características de Seguridad:**
- ✅ Verificación de checksum
- ✅ Detección de tickets duplicados
- ✅ Detección de códigos falsificados
- ✅ Registro de auditoría
- ✅ Protección anti-replay
- ✅ Validación de integridad

### 3. Panel de Administración

**Acceso:** `/admin`
- Usuario: `admin@ticketsystem.com`
- Contraseña: `Admin123!`

**Funcionalidades:**
- Gestión de eventos
- Gestión de tipos de tickets
- Gestión de usuarios
- Estadísticas en tiempo real
- Exportación de datos

## 📊 Estructura del Proyecto

```
ingenieriaSoftware-Boleteria/
├── src/                         # Frontend
│   ├── views/
│   │   ├── EventList.vue       # Lista de eventos
│   │   ├── TicketSelection.vue # Selección de tickets
│   │   ├── PersonalData.vue    # Datos y pago
│   │   ├── Confirmation.vue    # Confirmación con QR
│   │   ├── OperatorPanel.vue   # Panel de validación
│   │   └── AdminPanel.vue      # Panel admin
│   ├── components/             # Componentes
│   ├── stores/                 # Pinia stores
│   ├── services/               # Servicios
│   └── router/                 # Rutas
├── backend/
│   ├── src/
│   │   ├── models/            # Modelos Sequelize
│   │   ├── controllers/       # Controladores
│   │   ├── routes/            # Rutas API
│   │   └── config/            # Configuración
│   └── server.js              # Servidor Express
├── docker-compose.yml
└── package.json
```

## 🔧 API Endpoints

### Eventos
- `GET /api/events` - Listar eventos
- `GET /api/events/:id` - Obtener evento
- `POST /api/events` - Crear evento
- `PUT /api/events/:id` - Actualizar evento
- `DELETE /api/events/:id` - Eliminar evento

### Tipos de Tickets
- `GET /api/ticket-types` - Listar tipos
- `GET /api/ticket-types/event/:eventId` - Tipos por evento
- `GET /api/ticket-types/:id` - Obtener tipo
- `POST /api/ticket-types` - Crear tipo
- `PUT /api/ticket-types/:id` - Actualizar tipo
- `DELETE /api/ticket-types/:id` - Eliminar tipo

### Tickets
- `GET /api/tickets` - Listar tickets
- `GET /api/tickets/code/:ticketCode` - Obtener por código
- `POST /api/tickets` - Crear ticket (compra)
- `PUT /api/tickets/:ticketCode/validate` - Validar ticket
- `DELETE /api/tickets/:id` - Cancelar ticket

### Usuarios
- `POST /api/users/register` - Registrar
- `POST /api/users/login` - Login
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

## 🔐 Seguridad

### Sistema QR
- Códigos con checksum (TKT-XXXXX-XXXX)
- Verificación de integridad
- Detección de códigos falsificados
- Control anti-replay (caché 5 min)

### Autenticación
- Tokens JWT
- Roles: cliente, operador, administrador
- Protección de rutas

## 💾 Base de Datos

### Diagrama ER Simplificado
```
USERS ─┐
       ├─► TICKETS ◄─┬─ TICKET_TYPES ◄─── EVENTS ◄─── VENUES
       │             │
       └─────────────┘
```

### Tablas Principales
- `users`: Usuarios (clientes, operadores, admins)
- `events`: Eventos
- `ticket_types`: Tipos de tickets por evento  
- `tickets`: Tickets comprados
- `venues`: Lugares de eventos

## 🎯 Mejoras Implementadas

### ✅ Sistema de Compra
- Transacciones atómicas en MySQL
- Validación de stock en tiempo real
- Actualización automática de disponibilidad
- Recarga de datos desde BD al volver a vistas

### ✅ Sistema de Validación QR
- **NO valida automáticamente sin código QR**
- Espera 15 segundos a que se presente el QR
- Muestra "Tiempo de Escaneo Expirado" si no hay código
- Feedback visual, sonoro y táctil
- Registro de auditoría completo

### ✅ Actualización de Tickets
- Se recargan automáticamente desde MySQL
- Sincronización entre frontend y backend
- Refleja cambios en tiempo real

## 🐛 Solución de Problemas

### Frontend no conecta al backend
- Verificar backend corriendo en puerto 3000
- Revisar CORS en `backend/server.js`
- Verificar `VITE_API_URL` en configuración

### Base de datos no conecta
- Verificar credenciales en `backend/.env`
- Asegurar MySQL corriendo en puerto 3306
- Verificar que la BD `ticketing_system` exista

### Tickets no se actualizan
- Verificar que backend guarde correctamente
- Revisar consola del navegador
- Verificar transacciones en MySQL

### QR valida sin código
- **SOLUCIONADO**: Ahora espera 15s a que se presente QR
- Muestra timeout si no hay código
- Presiona Enter para simular detección en pruebas

## 📚 Documentación Adicional

Para más detalles, consulta:
- **Backend:** `backend/README.md`

## 🤝 Contribuir

1. Fork el repositorio
2. Crea rama (`git checkout -b feature/NuevaFeature`)
3. Commit cambios (`git commit -m 'Agregar NuevaFeature'`)
4. Push (`git push origin feature/NuevaFeature`)
5. Abre Pull Request

## 📄 Licencia

Proyecto de código abierto - Licencia MIT

## 👥 Equipo

Equipo de Desarrollo - Ingeniería de Software

Product Owner: Javier Cancino

Scrum Master: Pablo Sepúlveda

Developers: Benjamín Vivanco y Fernando Salazar

Historias de Usuario Implementadas


HU1 — Comprar entrada y generar QR único

Qué hace: Tras el pago, se genera un ticket digital con código QR único y firmado que incluye datos personales del cliente. Se puede seleccionar evento, tipo de entrada y cantidad, y el sistema envía automáticamente el ticket por email y habilita descarga inmediata desde la plataforma.
  
 
HU2 — Guardar ticket en teléfono/correo (offline-friendly)

Qué hace: Entrega del ticket por correo electrónico y descarga inmediata, para que el cliente acceda sin depender de conectividad. Estado: Finalizada (07/oct/25).
 

 

HU3 — Validar en puerta con QR o carnet

Qué hace: El operador escanea QR o carnet (RUT/código) para autorizar acceso y entregar pulsera. Criterios: muestra “Acceso autorizado” si válido; “Ticket inválido” si no; valida identidad con carnet. Estado: Finalizada (06/oct/25).
 

HU4 — Fallback: validación manual por RUT

Qué hace: Si el QR está dañado, el operador valida manual por RUT; si el RUT no corresponde a un ticket, se rechaza el acceso. Estado: Finalizada (11/oct/25).
 
HU5: Gestión de eventos y aforos

Objetivo: Permitir al administrador crear, editar y actualizar eventos con parámetros clave: fecha, lugar, aforo y estado.
Implementaciones:

Creación de interfaz de gestión en el panel web.

Validación de unicidad de ticket (USED una sola vez).

Vinculación de tickets con la base de datos.
Responsable: Pablo Sepúlveda (Scrum Master)

 

HU6: Exportación de reportes

Objetivo: Generar reportes de asistencia y accesos exportables en distintos formatos (CSV/PDF).
Implementaciones:

Estructura predeterminada de reportes en tablas dinámicas.

Botón de descarga automática.

Persistencia mensual de reportes en base de datos.
Responsable: Fernando Salazar (Developer)

 

HU7: Configuración de roles de usuario

Objetivo: Establecer roles de Administrador, Operador y Cliente, asegurando control de permisos.
Implementaciones:

Visualización dinámica de roles en la interfaz.

Validación de autenticación por tipo de usuario.

Roles mostrados para transparencia y seguridad.
Responsable: Fernando Salazar (Developer)

 

HU8: Historial de accesos y trazabilidad

Objetivo: Registrar errores, accesos y fallos de validación para auditar el uso de la plataforma.
Implementaciones:

Reporte automático de los últimos 15 intentos de acceso fallidos.

Generación y exportación de logs en formato PDF/CSV.

Almacenamiento mensual de registros.
Responsable: Benjamín Vivanco (Developer)
 

**Versión:** 2.0.0  
**Última actualización:** Octubre 2025
