# Sistema de Boletería - Vue.js

Un sistema moderno de compra de entradas con código QR único desarrollado con Vue.js 3, Vue Router y Pinia. Incluye **sistema completo de control de acceso para operadores** con validación de tickets mediante escaneo QR o ingreso manual.

## 🎯 Historias de Usuario

**ING-1-HU1**: Como cliente quiero comprar una entrada y recibir un código QR único con mis datos personales para poder ingresar al evento en menos de 2 minutos.

**ING-4-HU3**: Como operador q---

## 🚀 Próximos Pasos Sugeridosro escanear el código QR o carnet con la tablet para confirmar si la persona puede ingresar al evento y entregar la pulsera.

---

## 📑 Tabla de Contenidos

- [Características](#-características)
- [Instalación y Uso](#-instalación-y-uso)
- [Sistema de Operadores](#-sistema-de-operadores)
- [Rutas del Sistema](#-rutas-del-sistema)
- [localStorage](#️-localstorage)
- [Estructura del Proyecto](#️-estructura-del-proyecto)
- [Comandos de Consola](#-comandos-de-consola-útiles)
- [Tecnologías](#️-tecnologías-utilizadas)

---

## ✨ Características

### Cliente
- ✅ **Arquitectura Vue Modular** con separación de responsabilidades
- ✅ **4 Vistas principales**: Lista de eventos, Selección de entradas, Datos personales, Confirmación
- ✅ **Código QR único** generado con datos del ticket y comprador
- ✅ **Estado global** con Pinia para manejo de datos
- ✅ **Routing** con Vue Router para navegación entre vistas
- ✅ **Componentes reutilizables** (EventCard, TicketCard, etc.)
- ✅ **Validación de formularios** y formateo automático
- ✅ **Diseño responsivo** con Bootstrap 5
- ✅ **Proceso de compra** en menos de 2 minutos
- ✅ **Almacenamiento automático** de tickets en localStorage

### Operador
- ✅ **Panel de control** dedicado para validación de tickets
- ✅ **Autenticación** con sesión persistente
- ✅ **Escaneo QR** mediante cámara (simulado)
- ✅ **Validación manual** por código o RUT
- ✅ **Dashboard con estadísticas** en tiempo real
- ✅ **Control de tickets usados** para evitar duplicados
- ✅ **Interfaz intuitiva** adaptada a tablets

---

## 🚀 Instalación y Uso

### Configuración Inicial

1. **Instalar dependencias** (solo la primera vez):
```bash
npm install
```

2. **Ejecutar en desarrollo**:
```bash
npm run dev
```

3. **Abrir en el navegador**:
```
http://localhost:3003/
```

### Build para Producción

```bash
npm run build
```

Los archivos optimizados se generan en la carpeta `dist/`

### Probar en Móvil/Tablet

1. Averigua tu IP local:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. Accede desde el móvil:
   ```
   http://TU_IP_LOCAL:3003
   ```

---

## 🔐 Sistema de Operadores

### Acceso al Panel de Operador

**URL:** `/operator/login`

**Credenciales predefinidas:**
- **Usuario:** `operador1` | **Contraseña:** `admin123`
- **Usuario:** `operador2` | **Contraseña:** `admin456`

### Funcionalidades del Panel

#### 📊 Dashboard con Estadísticas
- **Total Tickets**: Todos los tickets en el sistema
- **Ingresos**: Tickets ya validados (usados)
- **Disponibles**: Tickets pendientes de validar

#### 📷 Escaneo de Código QR
1. Click en "📷 Escanear Código QR"
2. Permite acceso a la cámara del dispositivo
3. Apunta al código QR del ticket
4. El sistema valida automáticamente

**Nota:** La versión actual simula el escaneo (3 segundos). Para producción, se recomienda integrar librerías como `jsQR` o `html5-qrcode`.

#### ⌨️ Validación Manual
Puedes validar tickets ingresando:
- **Código del ticket** (ej: `TKT-12345678`)
- **RUT del comprador** (ej: `12.345.678-9` o `123456789`)

El sistema acepta diferentes formatos (con o sin puntos/guiones).

#### ✅ Proceso de Validación

1. Ingresa código o RUT en el campo de búsqueda
2. Click en "Validar"
3. El sistema verifica:
   - ✅ **Ticket válido**: Muestra datos del asistente y marca como usado
   - ❌ **Ticket no encontrado**: Error de validación
   - ❌ **Ticket ya utilizado**: Impide acceso duplicado

#### 🔒 Seguridad
- Sesión persistente de 24 horas
- Rutas protegidas con navigation guards
- Solo operadores autenticados pueden validar tickets
- Control de tickets duplicados

---

## 🗺️ Rutas del Sistema

### Área de Clientes (Pública)

| Ruta | Vista | Descripción |
|------|-------|-------------|
| `/` | EventList.vue | Lista de eventos disponibles |
| `/tickets/:eventId` | TicketSelection.vue | Selección de tipo de entrada |
| `/personal-data` | PersonalData.vue | Formulario de datos y pago |
| `/confirmation` | Confirmation.vue | Confirmación con código QR |

### Área de Operadores (Protegida 🔒)

| Ruta | Vista | Descripción |
|------|-------|-------------|
| `/operator/login` | OperatorLogin.vue | Autenticación de operadores |
| `/operator/panel` 🔒 | OperatorPanel.vue | Panel de validación de tickets |

**🔒 = Requiere autenticación**

### Flujo de Navegación - Cliente

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Eventos │ -> │ Tickets │ -> │  Datos  │ -> │   QR    │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
     /         /tickets/:id   /personal-data /confirmation
```

### Flujo de Navegación - Operador

```
┌───────────────┐          ┌──────────────┐
│ Login         │  --->    │ Panel        │
│ /operator/login│ (auth)  │ /operator/panel│
└───────────────┘          └──────────────┘
```

---

## 🗄️ localStorage

El sistema utiliza localStorage para almacenar datos de manera persistente en el navegador.

### Claves Utilizadas

#### 1. `purchasedTickets` - Tickets Comprados
Almacena todos los tickets adquiridos por los clientes.

**Estructura:**
```javascript
{
  codigo: "TKT-12345678",
  rut: "12.345.678-9",
  nombre: "Juan Pérez González",
  email: "juan@example.com",
  telefono: "+56912345678",
  evento: "Concierto Rock en Vivo",
  tipo: "Entrada VIP",
  precio: 120,
  fecha: "15 de Noviembre, 2025",
  ubicacion: "Estadio Nacional",
  usado: false,              // true cuando es validado
  fechaCompra: "2025-10-04T12:30:00.000Z",
  fechaUso: "2025-11-15T18:45:00.000Z"  // solo si usado=true
}
```

#### 2. `operators` - Operadores del Sistema
Lista de operadores autorizados.

**Estructura:**
```javascript
{
  username: "operador1",
  password: "admin123",      // ⚠️ En producción usar hash
  name: "Juan Pérez"
}
```

#### 3. `operatorSession` - Sesión Activa
Almacena la sesión del operador actual (válida por 24 horas).

**Estructura:**
```javascript
{
  username: "operador1",
  name: "Juan Pérez",
  timestamp: 1728043200000   // Timestamp del login
}
```

---

## 🏗️ Estructura del Proyecto

```
📦 ingenieriaSoftware-Boleteria/
├── 📄 index.html            # HTML principal (punto de entrada Vite)
├── 📄 operador.html         # Vista HTML del operador (referencia legacy)
├── 📄 package.json          # Dependencias del proyecto
├── ⚙️ vite.config.js        # Configuración de Vite
└── 📁 src/                 # Código fuente organizado
    ├── 📁 components/      # Componentes reutilizables
    │   ├── NavBar.vue
    │   ├── ProgressIndicator.vue
    │   ├── EventCard.vue
    │   └── TicketCard.vue
    ├── 📁 views/           # Páginas principales
    │   ├── EventList.vue
    │   ├── TicketSelection.vue
    │   ├── PersonalData.vue
    │   ├── Confirmation.vue
    │   ├── OperatorLogin.vue      # 🆕 Login de operador
    │   └── OperatorPanel.vue      # 🆕 Panel de control
    ├── 📁 stores/          # Estado global (Pinia)
    │   ├── ticketStore.js         # 🔄 Actualizado con localStorage
    │   └── authStore.js           # 🆕 Autenticación de operadores
    ├── 📁 services/        # APIs y servicios
    │   ├── apiService.js
    │   └── qrService.js
    ├── 📁 composables/     # Funciones reutilizables
    │   ├── useFormFormatting.js
    │   └── useQRGenerator.js
    ├── 📁 router/          # Configuración de rutas
    │   └── index.js               # 🔄 Con guards de autenticación
    ├── 📁 utils/           # Utilidades
    │   └── sampleData.js          # 🆕 Datos de ejemplo
    ├── 📁 assets/          # Recursos estáticos
    │   └── styles.css
    ├── App.vue             # Componente principal
    └── main.js             # Punto de entrada JavaScript
```

---

## 🧪 Comandos de Consola Útiles

Abre la consola del navegador (F12) para ejecutar estos comandos:

### Ver Datos Almacenados

```javascript
// Ver todos los tickets
console.table(JSON.parse(localStorage.getItem('purchasedTickets') || '[]'))

// Ver operadores
console.table(JSON.parse(localStorage.getItem('operators') || '[]'))

// Ver sesión actual
console.log(JSON.parse(localStorage.getItem('operatorSession')))
```

### Gestionar Tickets

```javascript
// Agregar ticket de prueba
const tickets = JSON.parse(localStorage.getItem('purchasedTickets') || '[]')
tickets.push({
  codigo: "TKT-99999999",
  rut: "11.111.111-1",
  nombre: "Usuario de Prueba",
  email: "prueba@test.com",
  telefono: "+56900000000",
  evento: "Evento de Prueba",
  tipo: "General",
  precio: 50,
  fecha: "31 de Diciembre, 2025",
  ubicacion: "Lugar de Prueba",
  usado: false,
  fechaCompra: new Date().toISOString()
})
localStorage.setItem('purchasedTickets', JSON.stringify(tickets))
console.log('✅ Ticket de prueba agregado!')

// Resetear tickets usados
const tickets = JSON.parse(localStorage.getItem('purchasedTickets') || '[]')
tickets.forEach(t => {
  t.usado = false
  delete t.fechaUso
})
localStorage.setItem('purchasedTickets', JSON.stringify(tickets))
console.log('♻️ Todos los tickets reseteados!')

// Limpiar todo
localStorage.clear()
console.log('🗑️ localStorage limpiado completamente')
```

### Estadísticas

```javascript
// Obtener estadísticas de tickets
function getTicketStats() {
  const tickets = JSON.parse(localStorage.getItem('purchasedTickets') || '[]')
  return {
    total: tickets.length,
    usados: tickets.filter(t => t.usado).length,
    disponibles: tickets.filter(t => !t.usado).length
  }
}

console.log(getTicketStats())
```

---

## 🎮 Guía de Prueba Completa

### Escenario 1: Compra y Validación Exitosa

1. **Como Cliente:**
   - Ve a `http://localhost:3003/`
   - Selecciona "Concierto Rock en Vivo"
   - Elige "Entrada VIP"
   - Completa datos personales (anota el RUT usado)
   - Procesa el pago
   - **Anota el código generado** (ej: `TKT-12345678`)

2. **Como Operador:**
   - Ve a `http://localhost:3003/operator/login`
   - Login: `operador1` / `admin123`
   - Ingresa el código del ticket
   - Click en "Validar"
   - ✅ Verás "Acceso autorizado" con datos del asistente

3. **Intentar validar de nuevo:**
   - Ingresa el mismo código
   - ❌ Verás "Ticket ya utilizado"

### Escenario 2: Validación por RUT

1. Usa el RUT del ticket comprado
2. Ingresa sin formato: `123456789`
3. El sistema lo encontrará igual
4. ✅ Validación exitosa

### Escenario 3: Ticket No Encontrado

1. Ingresa código inventado: `TKT-00000000`
2. ❌ Sistema muestra "Ticket no encontrado"

---

## 🔧 Inspeccionar localStorage en DevTools

### Chrome/Edge
1. Presiona `F12`
2. Ve a **Application** → **Storage** → **Local Storage**
3. Selecciona tu dominio
4. Verás las claves: `purchasedTickets`, `operators`, `operatorSession`

### Firefox
1. Presiona `F12`
2. Ve a **Storage** → **Local Storage**
3. Verás las mismas claves

---

## 🛠️ Tecnologías Utilizadas

- **Vue.js 3** - Framework progresivo
- **Vue Router 4** - Enrutamiento oficial
- **Pinia** - Estado global moderno
- **QRCode.js** - Generación de códigos QR
- **Bootstrap 5** - Framework CSS
- **Font Awesome** - Iconos
- **Vite** - Build tool moderno (opcional)

---

## 🎨 Componentes y Servicios

### Componentes Vue
- **NavBar.vue** - Barra de navegación principal
- **ProgressIndicator.vue** - Indicador de progreso del proceso de compra
- **EventCard.vue** - Tarjeta individual de evento
- **TicketCard.vue** - Tarjeta de tipo de entrada

### Vistas
**Cliente:**
- **EventList.vue** - Lista de eventos disponibles
- **TicketSelection.vue** - Selección de tipo de entrada
- **PersonalData.vue** - Formulario de datos personales y pago
- **Confirmation.vue** - Confirmación con código QR

**Operador:**
- **OperatorLogin.vue** - Formulario de autenticación
- **OperatorPanel.vue** - Panel de control y validación

### Stores (Pinia)
- **ticketStore.js** - Gestión de tickets y proceso de compra
- **authStore.js** - Autenticación y sesiones de operadores

### Servicios
- **qrService.js** - Generación y manejo de códigos QR
- **apiService.js** - Simulación de APIs de eventos y pagos

### Composables
- **useFormFormatting.js** - Formateo de campos de formulario
- **useQRGenerator.js** - Generación de códigos QR

---

## 🔄 Flujo de Usuario Completo

### Para Clientes
1. **Seleccionar Evento** → El usuario ve la lista de eventos disponibles
2. **Elegir Entrada** → Selecciona el tipo de entrada y precio
3. **Datos Personales** → Completa información personal y de pago
4. **Confirmación** → Recibe el código QR único para el evento
5. **Almacenamiento** → El ticket se guarda automáticamente en localStorage

### Para Operadores
1. **Login** → Accede a `/operator/login` con credenciales
2. **Dashboard** → Ve estadísticas de tickets (total, usados, disponibles)
3. **Validación** → Escanea QR o ingresa código/RUT manualmente
4. **Verificación** → Sistema valida el ticket y muestra datos del asistente
5. **Confirmación** → Ticket se marca como usado en localStorage

---

## 📱 Características Técnicas

- **Responsive Design** - Optimizado para mobile y desktop
- **Progressive Enhancement** - Funciona sin JavaScript básico
- **Estado Reactivo** - Actualizaciones en tiempo real
- **Validación de Formularios** - Campos requeridos y formatos
- **Navegación SPA** - Sin recargas de página
- **Código QR Dinámico** - Generado con datos únicos del usuario

---

## 🎯 Cumplimiento de Requisitos

### Historia de Usuario 1 (Cliente)
✅ **Compra rápida**: Proceso completado en menos de 2 minutos  
✅ **Código QR único**: Generado con datos del evento y comprador  
✅ **Datos personales**: Integrados en el código QR  
✅ **Interfaz intuitiva**: Navegación clara y progreso visible  
✅ **Arquitectura moderna**: Código modular y mantenible

### Historia de Usuario 3 (Operador)
✅ **Escaneo QR**: Implementado con acceso a cámara (simulado)  
✅ **Validación de identidad**: Por código de ticket o RUT  
✅ **Confirmación de ingreso**: Marca tickets como usados  
✅ **Interfaz para tablet**: Diseño responsive optimizado  
✅ **Control de duplicados**: Evita uso múltiple de tickets

---

## � Próximos Pasos Sugeridos

- [ ] Implementar librería real de escaneo QR (jsQR, html5-qrcode)
- [ ] Backend con base de datos real (PostgreSQL, MongoDB)
- [ ] Sistema de reportes para operadores
- [ ] Autenticación JWT
- [ ] Panel de administración
- [ ] Logs de acceso y auditoría

---

## 📝 Notas de Seguridad

⚠️ **Este sistema con localStorage es ideal para desarrollo y demos**, pero para producción se recomienda:

1. **NO almacenar contraseñas en texto plano** - Usar hash (bcrypt)
2. **Usar tokens JWT** para sesiones
3. **Implementar backend** con base de datos real
4. **Encriptar datos sensibles**
5. **Validaciones del lado del servidor**

---

**¡Sistema completo y funcionando!** 🎉
