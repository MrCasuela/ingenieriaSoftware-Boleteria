🎫 TicketVue — Sistema de Boletería para Eventos

Aplicación completa para la compra, validación y administración de tickets de eventos, desarrollada con Vue.js, Node.js, Express y MySQL.
Incluye arquitectura Docker, validación por QR, panel de operador y administración con autenticación JWT.

📋 Descripción General

TicketVue es un sistema web que permite:

🛒 Comprar tickets de manera rápida y segura.

🔍 Validar entradas por código QR, ticket o RUT.

🧑‍💼 Administrar eventos, usuarios y reportes.

🗄️ Gestionar la base de datos MySQL con transacciones atómicas.

🏗️ Arquitectura del Proyecto
🖥️ Frontend (Vue.js 3)

Framework: Vue 3 + Composition API

Estado: Pinia

Ruteo: Vue Router

Interfaz: Bootstrap 5

Generación QR/PDF: QRCode.js + jsPDF

⚙️ Backend (Node.js + Express)

Framework: Express.js

ORM: Sequelize

Base de Datos: MySQL 8.0

Autenticación: bcrypt + JWT

🐳 Infraestructura Docker

Servicios: Frontend + Backend + Base de Datos (MySQL)

Administración simplificada con docker-compose.

🚀 Instalación y Ejecución
🔧 Prerrequisitos

Asegúrate de tener instalado:

Node.js 16 o superior

MySQL 8.0 o superior

npm o yarn

Docker Desktop 🐋

GitHub Desktop (opcional para clonar el repo)

🧭 1. Descargar el Repositorio

Abre GitHub Desktop

Presiona Ctrl + Shift + O

Pega la URL del repositorio

Haz clic en Clonar

📦 2. Instalar Dependencias

Frontend:

npm install


Backend:

cd backend
npm install

🐋 3. Levantar el Sistema con Docker
docker compose up -d --build


👉 Este comando:

Construye las imágenes necesarias

Levanta todos los servicios en segundo plano

🧠 4. Verificar que todo funcione
docker compose ps


Si todo está correcto, deberías ver algo como:

NAME                STATE           PORTS
backend-1           running         0.0.0.0:3000->3000/tcp
db-1                running         3306/tcp
frontend-1          running         0.0.0.0:80->80/tcp


⏳ Espera unos 20 segundos para que la base de datos inicie completamente.

🌐 5. Abrir en el Navegador
http://localhost

🗃️ 6. Configurar Base de Datos

Si prefieres hacerlo manualmente:

CREATE DATABASE ticketing_system;


Luego edita backend/.env:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=ticketing_system
DB_PORT=3306
PORT=3000
NODE_ENV=development


Inicializa datos:

cd backend
npm run seed

🔑 Accesos Rápidos
Tipo de Usuario	Ruta	Usuario	Contraseña
🧾 Operador	/operator/login	operador@ticketsystem.com
	Operador123!
👨‍💻 Administrador	/admin	admin@ticketsystem.com
	Admin123!
✨ Funcionalidades Principales
🎟️ Compra de Tickets

Selección del evento

Elección del tipo y cantidad

Ingreso de datos y pago

Confirmación con QR

✔️ Características:

Transacciones seguras en MySQL

Validación en tiempo real

QR único y antifraude

PDF + Envío por email

🎫 Validación de Tickets (Panel Operador)

Escaneo QR con cámara del dispositivo

Ingreso Manual por código o RUT

Detección de duplicados, falsos o expirados

Registro de auditoría y control de accesos

🧑‍💼 Panel de Administración

Gestión completa de eventos y tipos de tickets

Control de usuarios y roles

Reportes, estadísticas y auditoría

Actualización en tiempo real

📊 Estructura del Proyecto
ingenieriaSoftware-Boleteria/
├── src/
│   ├── views/            # Vistas principales
│   ├── components/       # Componentes reutilizables
│   ├── stores/           # Gestión de estado (Pinia)
│   ├── services/         # Servicios API
│   └── router/           # Configuración de rutas
├── backend/
│   ├── src/
│   │   ├── models/       # Modelos Sequelize
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── routes/       # Endpoints REST
│   │   └── config/       # Configuración
│   └── server.js
├── docker-compose.yml
└── package.json

🔧 API Endpoints Principales
Módulo	Método	Endpoint	Descripción
Eventos	GET	/api/events	Listar eventos
	POST	/api/events	Crear evento
Tickets	POST	/api/tickets	Comprar ticket
	PUT	/api/tickets/:code/validate	Validar ticket
Usuarios	POST	/api/users/login	Iniciar sesión
	GET	/api/users	Listar usuarios
🛡️ Seguridad

Códigos QR con checksum (TKT-XXXXX-XXXX)

Autenticación JWT (roles: cliente, operador, admin)

Prevención de reuso (anti-replay)

Auditoría de accesos

💾 Base de Datos

Diagrama simplificado:

USERS ─┐
       ├─► TICKETS ◄─┬─ TICKET_TYPES ◄─── EVENTS ◄─── VENUES
       │             │
       └─────────────┘

🐛 Solución de Problemas
❌ El Frontend no conecta

Asegúrate de que el backend corre en puerto 3000

Verifica CORS en backend/server.js

Comprueba variable VITE_API_URL

🧱 La base de datos no conecta

Revisa credenciales en .env

Asegura que MySQL corre en 3306

Verifica que ticketing_system exista

⏱️ QR valida sin código

Solucionado: ahora espera 15 s antes de validar

Si no hay QR → muestra “Tiempo de Escaneo Expirado”

📚 Documentación Complementaria

Para más detalles, consulta:
📄 backend/README.md
📘 Guía de Usuario - TicketVue.pdf

👥 Equipo de Desarrollo
Rol	Nombre	Responsabilidades
💻 Developer	Benjamín Vivanco	Backend, vista operador, integración visual
🧠 Scrum Master	Pablo Sepúlveda	Integración DB, Docker y API

🧩 Product Owner	Javier Cancino	Jira, Historias de Usuario y subtareas




🪪 Licencia

Proyecto de código abierto — Licencia MIT
🗓️ Versión: 2.0.0 — Última actualización: Noviembre 2025
