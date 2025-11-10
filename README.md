# 🎫 TicketVue — Sistema de Boletería para Eventos

Sistema completo para compra, validación y administración de tickets con Vue.js, Node.js, Express y MySQL. Incluye validación por QR, panel de operador, panel de administración con JWT y orquestación con Docker.

## 📚 Tabla de Contenidos
- [Descripción](#-descripción)
- [Arquitectura](#-arquitectura)
- [Instalación y Ejecución](#-instalación-y-ejecución)
- [Funcionalidades](#-funcionalidades)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Seguridad](#-seguridad)
- [Base de Datos](#-base-de-datos)
- [Solución de Problemas](#-solución-de-problemas)
- [Logs y Monitoreo](#-logs-y-monitoreo)
- [Equipo](#-equipo)
- [Licencia](#-licencia)

## 📋 Descripción
- 🛒 Compra de tickets rápida y segura
- 🔍 Validación de entradas por QR, código o RUT (si aplica)
- 🧑‍💼 Administración de eventos, tipos de tickets y usuarios
- 🗄 Transacciones atómicas en MySQL y auditoría de validaciones

## 🏗 Arquitectura
- Frontend: Vue 3 (Composition API), Pinia, Vue Router, Bootstrap 5, QRCode.js, jsPDF
- Backend: Node.js, Express, Sequelize, MySQL 8.0, bcrypt, JWT
- Infraestructura: Docker Compose (frontend + backend + MySQL)

---

## 🚀 Instalación y Ejecución

Hay DOS caminos independientes. Elige solo uno.

### Opción 1: Docker (Automática, “Docker lo hace todo”)
Docker levanta frontend, backend y base de datos sin pasos manuales adicionales.

Requisitos:
- Docker Desktop instalado y en ejecución

Comandos:
bash
docker compose up -d --build
docker compose ps


Accesos:
- Frontend: http://localhost
- Backend API: http://localhost:3000

Apagar/limpiar:
bash
docker compose down
# Reset total (incluye borrar volúmenes/DB):
docker compose down -v
docker compose up -d --build


### Opción 2: Manual (Frontend + Backend + MySQL por separado)
Instalas y gestionas cada parte tú mismo.

Requisitos:
- Node.js 16+ y npm/yarn
- MySQL 8.0+

1) Frontend:
bash
npm install


2) Backend:
bash
cd backend
npm install


3) Base de datos:
sql
CREATE DATABASE ticketing_system;


4) Variables de entorno (backend/.env):
env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=ticketing_system
DB_PORT=3306
PORT=3000
NODE_ENV=development


5) Semillas iniciales:
bash
cd backend
npm run seed


6) Ejecutar:
- Backend (Terminal 1)
bash
cd backend
npm start

- Frontend (Terminal 2)
bash
npm run dev


Accesos:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

Resumen diferencias:
- Docker: rápido, todo automatizado.
- Manual: mayor control y depuración fina.

---

## ✨ Funcionalidades
- Compra con stock consistente y transacciones atómicas
- QR único con checksum y PDF descargable
- Validación por QR, código y (opcional) RUT con antifraude
- Auditoría de validaciones y métricas por operador
- Autenticación por roles (cliente, operador, admin)

Accesos rápidos:
- Operador: /operator/login — operador@ticketsystem.com / Operador123!
- Admin: /admin — admin@ticketsystem.com / Admin123!

---

## 📊 Estructura del Proyecto

ingenieriaSoftware-Boleteria/
├── src/                      # Frontend
│   ├── views/
│   ├── components/
│   ├── stores/
│   ├── services/
│   └── router/
├── backend/                  # API Node/Express
│   ├── src/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── config/
│   └── server.js
├── docker-compose.yml
└── package.json


---

## 🔌 API Endpoints

Autenticación
- POST /api/users/register — registrar usuario
- POST /api/users/login — login (JWT)

Eventos
- GET /api/events — listar eventos
- GET /api/events/:id — obtener evento
- POST /api/events — crear
- PUT /api/events/:id — actualizar
- DELETE /api/events/:id — eliminar

Tipos de tickets
- GET /api/ticket-types — listar
- GET /api/ticket-types/:id — obtener
- GET /api/ticket-types/event/:eventId — por evento
- POST /api/ticket-types — crear
- PUT /api/ticket-types/:id — actualizar
- DELETE /api/ticket-types/:id — eliminar

Tickets
- GET /api/tickets — listar
- GET /api/tickets/:id — obtener
- GET /api/tickets/code/:code — buscar por código
- POST /api/tickets — comprar
- PUT /api/tickets/:code/validate — validar
- DELETE /api/tickets/:id — cancelar
- (Opcional) GET /api/tickets/rut/:rut — buscar por RUT

Auditoría
- GET /api/audit/logs — logs con filtros
- GET /api/audit/stats — estadísticas
- GET /api/audit/report/:eventId — reporte por evento
- POST /api/audit/log — crear registro
- POST /api/audit/generate-pdf — generar PDF

Salud
- GET /api/health — estado del servicio

Ejemplos cURL
bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ticketsystem.com","password":"Admin123!"}'

curl http://localhost:3000/api/events

curl -X PUT http://localhost:3000/api/tickets/TKT-ABCDE-1234/validate

curl "http://localhost:3000/api/audit/logs?eventId=1&validationType=qr&limit=50"


---

## 🔐 Seguridad
- Hash de contraseñas con bcrypt
- JWT por roles: cliente, operador, admin
- Control anti-replay, duplicados y checksum en QR
- Recomendado producción: Helmet, rate limiting, HTTPS, rotación de secretos

---

## 💾 Base de Datos

Diagrama ER simplificado (sin VENUES):

USERS ─┐
       ├─► TICKETS ◄─┬─ TICKET_TYPES ◄── EVENTS
       │             │
       └─────────────┘


Tablas clave:
- users, events, ticket_types, tickets, audit_logs

Nota: Se removieron referencias a “venues” porque no existe un modelo/tabla Venue en el proyecto actual.

---

## 🐛 Solución de Problemas
Frontend no conecta
- Backend en puerto 3000
- CORS habilitado
- VITE_API_URL correcto

Base de datos no conecta
- Revisar .env
- MySQL en 3306
- BD ticketing_system creada
- En Docker, esperar ~20s al inicio

Puertos ocupados (Windows)
powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F


Recrear servicios Docker
bash
docker compose down -v
docker compose up -d --build


---

## 📈 Logs y Monitoreo
Docker
bash
docker compose ps
docker compose logs -f
docker compose logs -f backend
docker compose logs -f db


Backend local
bash
cd backend
npm run dev


MySQL (Windows)
powershell
sc query MySQL
Get-Content "C:\ProgramData\MySQL\MySQL Server 8.0\Data\DESKTOP.err" -Wait


---

## 👥 Equipo
- 💻 Benjamín Vivanco — Backend, panel operador, integración visual
- 🧠 Pablo Sepúlveda — Integración DB, Docker, API
- 🧩 Javier Cancino — Jira, Historias de Usuario y subtareas

---

## 🪪 Licencia
MIT — Versión 2.0.0 — Última actualización: Noviembre 2025
