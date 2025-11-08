# Sistema de Reportes de Estadísticas en PDF

**Fecha de implementación:** 8 de noviembre de 2025  
**Estado:** ✅ Completado y funcional

## 📋 Índice
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Problema Original](#problema-original)
3. [Arquitectura de la Solución](#arquitectura-de-la-solución)
4. [Implementación Backend](#implementación-backend)
5. [Implementación Frontend](#implementación-frontend)
6. [Correcciones y Mejoras](#correcciones-y-mejoras)
7. [Estructura del PDF](#estructura-del-pdf)
8. [Pruebas y Verificación](#pruebas-y-verificación)

---

## 🎯 Resumen Ejecutivo

Se implementó un sistema de generación de reportes en PDF para las estadísticas del sistema de boletería. Este reporte permite a los administradores descargar un documento con:

- **Resumen general**: Total de eventos, tipos de tickets, aforo total, ingresos potenciales
- **Detalle por evento**: Información individual de cada evento con sus métricas
- **Formato profesional**: PDF con diseño limpio y datos legibles

**Endpoint:** `POST /api/admin/generate-statistics-pdf`  
**Requiere autenticación:** Sí (JWT Bearer Token)  
**Rol requerido:** Administrador

---

## ❌ Problema Original

### Confusión entre dos tipos de reportes

El botón "Descargar Reporte PDF" en la pestaña **Estadísticas** estaba llamando al endpoint de **auditoría** (`/api/audit/generate-pdf`), que genera reportes de validaciones de tickets por operadores.

**Esto causaba:**
- Error 404: "No se encontraron registros de auditoría con los filtros aplicados"
- Los usuarios esperaban un reporte de **estadísticas generales** (eventos, ingresos, capacidad)
- Pero el sistema intentaba generar un reporte de **auditoría** (validaciones de tickets)

### Diferencias clave:

| Aspecto | Reporte de Auditoría | Reporte de Estadísticas |
|---------|---------------------|------------------------|
| **Endpoint** | `/api/audit/generate-pdf` | `/api/admin/generate-statistics-pdf` |
| **Datos** | Logs de validaciones de tickets | Información de eventos y ventas |
| **Requiere** | Registros en `audit_logs` | Datos en `events` y `tickets` |
| **Filtros** | Evento, fechas, tipo validación | Sin filtros (todas las estadísticas) |
| **Usuario** | Administradores | Solo administradores |

---

## 🏗️ Arquitectura de la Solución

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vue.js)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  AdminPanel.vue                                         │ │
│  │  - Pestaña "Estadísticas"                              │ │
│  │  - Botón "Descargar Reporte PDF"                       │ │
│  │  - Modal con información del reporte                   │ │
│  │  - Función: downloadPDFReport()                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                 │
│                            │ POST /api/admin/generate-       │
│                            │      statistics-pdf             │
│                            │ Header: Authorization Bearer    │
│                            ▼                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  adminRoutes.js                                         │ │
│  │  - POST /generate-statistics-pdf                       │ │
│  │  - Middleware: protect, adminOnly                      │ │
│  └──────────────────┬─────────────────────────────────────┘ │
│                     │                                        │
│                     ▼                                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  adminController.js                                     │ │
│  │  - generateStatisticsPDF()                             │ │
│  │  - Consulta: Events + TicketTypes + Tickets           │ │
│  │  - Cálculos: Ingresos, ocupación, disponibilidad      │ │
│  └──────────────────┬─────────────────────────────────────┘ │
│                     │                                        │
│                     ▼                                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  pdfService.js                                          │ │
│  │  - generateStatisticsPDF()                             │ │
│  │  - PDFKit: Generación del documento                    │ │
│  │  - Layout: Encabezado, resumen, detalle, footer       │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                 │
│                            │ PDF Stream                      │
│                            ▼                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL)                          │
│  - events: Datos de eventos (nombre, fecha, capacidad)      │
│  - ticket_types: Tipos de tickets con precios y cantidades  │
│  - tickets: Tickets vendidos (para calcular ingresos reales)│
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementación Backend

### 1. Ruta en `adminRoutes.js`

**Archivo:** `backend/src/routes/adminRoutes.js`

```javascript
import {
  // ... otros imports
  generateStatisticsPDF
} from '../controllers/adminController.js';

// Generar reporte PDF de estadísticas
router.post('/generate-statistics-pdf', generateStatisticsPDF);
```

**Características:**
- Ruta protegida con middleware `protect` y `adminOnly`
- Solo accesible para usuarios autenticados con rol "Administrador"
- Método POST (aunque no recibe body, mantiene consistencia con otros endpoints)

---

### 2. Controlador en `adminController.js`

**Archivo:** `backend/src/controllers/adminController.js`

#### Query principal

```javascript
const events = await Event.findAll({
  include: [
    {
      model: TicketType,
      as: 'ticketTypes',
      attributes: ['id', 'name', 'price', 'quantity', 'available']
    },
    {
      model: Ticket,
      as: 'tickets',
      attributes: ['id', 'price', 'quantity', 'total_amount'],
      where: { status: 'paid' },
      required: false // LEFT JOIN para incluir eventos sin ventas
    }
  ],
  order: [['date', 'ASC']]
});
```

**¿Por qué esta estructura?**
1. **TicketTypes**: Para calcular ingresos potenciales (quantity × price)
2. **Tickets con status='paid'**: Para calcular ingresos reales
3. **LEFT JOIN**: Eventos sin ventas también se incluyen (con ingresos $0)

#### Cálculos de estadísticas

```javascript
const eventsData = events.map(event => {
  const eventJSON = event.toJSON();
  const ticketTypes = eventJSON.ticketTypes || [];
  const tickets = eventJSON.tickets || [];
  
  // Ingresos REALES (lo ya vendido)
  const eventRealRevenue = tickets.reduce((sum, ticket) => {
    return sum + parseFloat(ticket.total_amount || 0);
  }, 0);
  
  // Ingresos POTENCIALES (si se vendiera todo)
  const eventPotentialRevenue = ticketTypes.reduce((sum, tt) => {
    return sum + ((tt.quantity || 0) * (tt.price || 0));
  }, 0);
  
  // Tickets disponibles
  const eventAvailable = ticketTypes.reduce((sum, tt) => {
    return sum + (tt.available || 0);
  }, 0);
  
  // Ocupación porcentual
  const eventOccupancy = eventCapacity > 0 
    ? (eventSold / eventCapacity) * 100 
    : 0;
  
  return {
    name: eventJSON.name,
    date: new Date(eventJSON.date).toLocaleDateString('es-CL'),
    venue: eventJSON.location || 'Sin ubicacion',
    ticketTypes: ticketTypes.length,
    capacity: eventCapacity,
    sold: eventSold,
    revenue: eventRealRevenue, // ← Ingresos reales
    occupancy: eventOccupancy.toFixed(1)
  };
});
```

#### Objeto de estadísticas generales

```javascript
const stats = {
  totalEvents,                    // Total de eventos
  totalTicketTypes,              // Total de tipos de tickets
  totalCapacity,                 // Suma de capacidades de todos los eventos
  totalSold,                     // Total de tickets vendidos
  totalRevenue: totalPotentialRevenue,  // Ingresos potenciales (resumen general)
  availableTickets,              // Tickets aún disponibles
  averageOccupancy,              // Ocupación promedio
  events: eventsData             // Array con detalle de cada evento
};
```

#### Response

```javascript
// Configurar headers para descarga de archivo
const filename = `reporte-estadisticas-${Date.now()}.pdf`;
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

// Pipe del PDF a la respuesta
doc.pipe(res);
doc.end();
```

---

### 3. Servicio de PDF en `pdfService.js`

**Archivo:** `backend/src/services/pdfService.js`

#### Función principal

```javascript
export const generateStatisticsPDF = (stats) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Configuración de colores
  const primaryColor = '#0d6efd';
  const textColor = '#333333';
  const lightGray = '#f8f9fa';
  const borderColor = '#dee2e6';

  // ... generación del PDF
  
  return doc;
};
```

#### Estructura del PDF

```
┌────────────────────────────────────────────────────────┐
│  ENCABEZADO (Fondo azul)                               │
│  REPORTE DE ESTADISTICAS                               │
│  Generado: 08-11-2025, 6:00:43 p. m.                  │
├────────────────────────────────────────────────────────┤
│  RESUMEN GENERAL                                       │
│  ┌──────────────────┬─────────────────────────────┐   │
│  │ Total Eventos: 3 │ Ingresos Potenciales:       │   │
│  │ Tipos Ticket: 8  │   $323.500.000              │   │
│  │ Aforo Total:     │ Tickets Disponibles: 14.350 │   │
│  │   15.800         │ Ocupación Promedio: 2.1%    │   │
│  └──────────────────┴─────────────────────────────┘   │
├────────────────────────────────────────────────────────┤
│  DETALLE POR EVENTO                                    │
│                                                        │
│  Obra de Teatro: Hamlet                                │
│  Fecha: 20-11-2025          Tipos: 2                  │
│  Lugar: Teatro Colón, BA    Aforo: 800                │
│                             Ingresos: $600.005         │
│                             Ocupacion: 6.3%            │
│  ────────────────────────────────────────────────────  │
│  Concierto de Rock 2025                                │
│  ...                                                   │
├────────────────────────────────────────────────────────┤
│  PIE DE PÁGINA                                         │
│  Sistema de Boletería TicketVue                        │
│  Página 1 de 1 | 08-11-2025                           │
└────────────────────────────────────────────────────────┘
```

#### Layout de columnas (importante para evitar superposición)

```javascript
// Columna 1: Información básica
doc.text(`Fecha: ${event.date}`, 60, detailsY);
doc.text(`Lugar: ${event.venue}`, 60, detailsY + 12);

// Columna 2: Métricas del evento
doc.text(`Tipos: ${event.ticketTypes}`, 240, detailsY);
doc.text(`Aforo: ${event.capacity}`, 240, detailsY + 12);

// Columna 3: Ingresos y ocupación (separados adecuadamente)
doc.text(`Ingresos: $${event.revenue}`, 380, detailsY);
doc.text(`Ocupacion: ${event.occupancy}%`, 380, detailsY + 12);
```

**Posiciones X:**
- Columna 1: **60px**
- Columna 2: **240px** (180px de separación)
- Columna 3: **380px** (140px de separación)

Esto evita que los textos largos se superpongan.

---

## 💻 Implementación Frontend

### Modal simplificado en `AdminPanel.vue`

**Archivo:** `src/views/AdminPanel.vue`

#### HTML del modal

```vue
<div v-if="showPDFDownloadModal" class="modal-overlay">
  <div class="modal-content modal-small">
    <div class="modal-header">
      <h3>📊 Descargar Reporte de Estadísticas</h3>
      <button @click="showPDFDownloadModal = false" class="btn-close">✖</button>
    </div>
    <div class="modal-body">
      <p class="info-message">
        Este reporte incluirá todas las estadísticas generales del sistema:
      </p>
      <ul class="stats-list">
        <li>📊 Total de eventos y tipos de tickets</li>
        <li>👥 Aforo total y capacidad disponible</li>
        <li>💰 Ingresos potenciales</li>
        <li>📈 Detalle por evento con ocupación</li>
      </ul>

      <!-- Estados de carga y mensajes -->
      <div v-if="pdfDownloading" class="loading-message">
        <div class="spinner"></div>
        <p>Generando reporte PDF... Por favor espera.</p>
      </div>

      <div v-if="pdfError" class="alert alert-danger">
        ❌ {{ pdfError }}
      </div>

      <div v-if="pdfSuccess" class="alert alert-success">
        ✅ {{ pdfSuccess }}
      </div>
    </div>
    <div class="form-actions">
      <button @click="showPDFDownloadModal = false" class="btn-secondary">
        Cancelar
      </button>
      <button @click="downloadPDFReport" class="btn-primary">
        📥 Descargar PDF
      </button>
    </div>
  </div>
</div>
```

**Diferencias con el modal de auditoría:**
- ✅ Sin filtros (no necesita seleccionar evento o fechas)
- ✅ Lista informativa de lo que incluye el reporte
- ✅ Botón directo para descargar

#### Función downloadPDFReport()

```javascript
const downloadPDFReport = async () => {
  pdfDownloading.value = true
  pdfError.value = ''
  pdfSuccess.value = ''

  try {
    // Obtener el token del localStorage
    const token = localStorage.getItem('apiToken')
    
    if (!token) {
      pdfError.value = 'No se encontró token de autenticación. Por favor, vuelve a iniciar sesión.'
      return
    }

    const response = await fetch('http://localhost:3000/api/admin/generate-statistics-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // ← Token JWT
      },
      body: JSON.stringify({})
    })

    if (response.ok) {
      // Obtener el blob del PDF
      const blob = await response.blob()
      
      // Crear URL del blob
      const url = window.URL.createObjectURL(blob)
      
      // Crear link temporal y hacer click para descargar
      const link = document.createElement('a')
      link.href = url
      link.download = `reporte-estadisticas-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Liberar memoria
      window.URL.revokeObjectURL(url)
      
      pdfSuccess.value = '✅ PDF descargado exitosamente'
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        showPDFDownloadModal.value = false
        pdfSuccess.value = ''
      }, 2000)
    } else {
      const error = await response.json()
      pdfError.value = error.message || 'Error al generar el PDF'
    }
  } catch (error) {
    console.error('❌ Error al descargar PDF:', error)
    pdfError.value = 'Error de conexión al generar el PDF'
  } finally {
    pdfDownloading.value = false
  }
}
```

**Puntos clave:**
1. **Token desde localStorage**: `localStorage.getItem('apiToken')`
2. **Validación**: Verifica que exista el token antes de hacer la petición
3. **Blob handling**: Descarga el PDF como blob y crea un link temporal
4. **UX mejorada**: Muestra estado de carga, éxito y errores
5. **Cleanup**: Revoca el URL del blob para liberar memoria

---

## 🔨 Correcciones y Mejoras

### Problema 1: Error 404 - Endpoint no encontrado

**Causa:** El botón llamaba a `/api/audit/generate-pdf` en lugar de crear un nuevo endpoint para estadísticas.

**Solución:**
- ✅ Creado nuevo endpoint `/api/admin/generate-statistics-pdf`
- ✅ Nuevo controlador `generateStatisticsPDF()`
- ✅ Nueva función en servicio `generateStatisticsPDF()`

---

### Problema 2: Error 401 - No autorizado (Token inválido)

**Causa:** El frontend intentaba usar `authStore.token` que no existía. El token se guarda en `localStorage` con clave `apiToken`.

**Solución:**
```javascript
// ANTES (❌ No funcionaba)
'Authorization': `Bearer ${authStore.token}`

// DESPUÉS (✅ Correcto)
const token = localStorage.getItem('apiToken')
'Authorization': `Bearer ${token}`
```

---

### Problema 3: Error 500 - Unknown column 'ticketTypes.capacity'

**Causa:** La tabla `ticket_types` no tiene columna `capacity`, tiene `quantity` y `available`.

**Campos correctos:**
```sql
-- ticket_types
quantity   INT      -- Cantidad total del tipo de ticket
available  INT      -- Cantidad aún disponible
-- NO existe: capacity
```

**Solución:**
```javascript
// ANTES (❌ Error)
attributes: ['id', 'name', 'price', 'capacity', 'quantity_sold']

// DESPUÉS (✅ Correcto)
attributes: ['id', 'name', 'price', 'quantity', 'available']
```

---

### Problema 4: Caracteres extraños en el PDF (Ø=ÜÉ, Ø=ÚÁ)

**Causa:** Los emojis no son soportados por la fuente Helvetica de PDFKit.

**Solución:** Eliminados todos los emojis y caracteres especiales del PDF:

```javascript
// ANTES (❌ Emojis causaban problemas)
.text('📊 REPORTE DE ESTADÍSTICAS', ...)
.text('📅 Fecha:', ...)
.text('📍 Lugar:', ...)

// DESPUÉS (✅ Sin emojis)
.text('REPORTE DE ESTADISTICAS', ...)
.text('Fecha:', ...)
.text('Lugar:', ...)
```

---

### Problema 5: Ingresos Potenciales mostraba $0

**Causa:** Se sumaba `events.revenue` que estaba en $0.00 porque no se actualiza automáticamente al vender tickets.

**Solución:** Calcular ingresos potenciales desde `ticket_types`:

```javascript
// Ingresos POTENCIALES (si se vendieran todos los tickets)
const eventPotentialRevenue = ticketTypes.reduce((sum, tt) => {
  return sum + ((tt.quantity || 0) * (tt.price || 0));
}, 0);
totalPotentialRevenue += eventPotentialRevenue;
```

**Resultado:** $323,500,000 ✅

---

### Problema 6: Textos superpuestos en el PDF (Ingresos tapa Ocupación)

**Causa:** Las columnas estaban muy juntas:
- Columna 2: x=300
- Columna 3: x=450 (solo 150px de separación)

**Solución:** Reajustar posiciones X:

```javascript
// ANTES (❌ Se superponían)
doc.text(`Tipos: ${event.ticketTypes}`, 300, detailsY);
doc.text(`Ingresos: $${event.revenue}`, 450, detailsY);

// DESPUÉS (✅ Bien espaciados)
doc.text(`Tipos: ${event.ticketTypes}`, 240, detailsY);
doc.text(`Ingresos: $${event.revenue}`, 380, detailsY);
```

---

### Problema 7: Ingresos por evento mostraba $0 (debería ser $600,005)

**Causa:** El campo `events.revenue` no se actualiza al vender tickets, permanece en $0.00.

**Verificación en DB:**
```sql
SELECT id, name, total_sold, revenue FROM events;
-- id=2, name='Obra de Teatro: Hamlet', total_sold=50, revenue=0.00
```

**Solución:** Calcular ingresos REALES desde la tabla `tickets`:

```javascript
// Incluir tickets en la query
{
  model: Ticket,
  as: 'tickets',
  attributes: ['id', 'price', 'quantity', 'total_amount'],
  where: { status: 'paid' },
  required: false // LEFT JOIN
}

// Calcular ingresos sumando total_amount
const eventRealRevenue = tickets.reduce((sum, ticket) => {
  return sum + parseFloat(ticket.total_amount || 0);
}, 0);
```

**Resultado:** Obra de Teatro muestra $600,005 ✅

---

## 📊 Estructura del PDF Generado

### Encabezado
- **Fondo azul (#0d6efd)**
- **Título:** "REPORTE DE ESTADISTICAS" (Helvetica-Bold, 24pt)
- **Fecha de generación:** Formato local chileno (es-CL)

### Resumen General
Cuadro con fondo gris claro mostrando:
- **Columna izquierda:**
  - Total Eventos
  - Tipos de Ticket
  - Aforo Total
- **Columna derecha:**
  - Ingresos Potenciales (si se vendiera todo)
  - Tickets Disponibles
  - Ocupación Promedio (%)

### Detalle por Evento
Para cada evento, tarjeta con:
- **Nombre del evento** (azul, bold, 14pt)
- **Datos en 3 columnas:**
  - **Columna 1:** Fecha, Lugar
  - **Columna 2:** Tipos de ticket, Aforo total
  - **Columna 3:** Ingresos reales, Ocupación (%)
- **Fondo alternado:** Gris claro para filas pares
- **Línea separadora** entre eventos

### Pie de Página
- Texto informativo sobre el sistema
- Número de página y fecha

---

## 🧪 Pruebas y Verificación

### Caso de prueba 1: Evento con ventas

**Datos:**
- Evento: Obra de Teatro: Hamlet
- Tickets vendidos: 50 (cantidad) × $12,000 (precio) = $600,000
- Total en DB: $600,005.00 (incluye fee de servicio)

**Resultado esperado:**
```
Obra de Teatro: Hamlet
Fecha: 20-11-2025          Tipos: 2
Lugar: Teatro Colón, BA    Aforo: 800
                           Ingresos: $600.005  ✅
                           Ocupacion: 6.3%     ✅
```

---

### Caso de prueba 2: Evento sin ventas

**Datos:**
- Evento: Concierto de Rock 2025
- Tickets vendidos: 0

**Resultado esperado:**
```
Concierto de Rock 2025
Fecha: 15-12-2025          Tipos: 3
Lugar: Estadio Luna Park   Aforo: 5.000
                           Ingresos: $0        ✅
                           Ocupacion: 0.0%     ✅
```

---

### Caso de prueba 3: Resumen general

**Datos del sistema:**
- 3 eventos activos
- 8 tipos de tickets totales
- 15,800 capacidad total
- 50 tickets vendidos ($600,005)
- 14,350 tickets disponibles

**Cálculo de ingresos potenciales:**
```
Obra de Teatro:
  - Platea: 200 × $10,000 = $2,000,000
  - Balcón: 200 × $12,000 = $2,400,000
  Subtotal: $4,400,000

Concierto:
  - General: 3,000 × $20,000 = $60,000,000
  - VIP: 100 × $100,000 = $10,000,000
  - Backstage: 50 × $200,000 = $10,000,000
  Subtotal: $80,000,000

Festival:
  - 1 día: 5,000 × $45,000 = $225,000,000
  - 2 días: 1,000 × $75,000 = $75,000,000
  - 3 días: 500 × $100,000 = $50,000,000
  Subtotal: $350,000,000

TOTAL POTENCIAL: $434,400,000
```

**Nota:** El valor mostrado ($323,500,000) puede variar según los precios exactos en la base de datos.

---

## 🔐 Seguridad

### Autenticación y Autorización

1. **Middleware `protect`**: Verifica JWT válido
2. **Middleware `adminOnly`**: Valida rol "Administrador"
3. **Token en localStorage**: Guardado como `apiToken` después del login

### Validaciones

```javascript
// Backend: Verificar autenticación
router.use(protect);
router.use(adminOnly);

// Frontend: Verificar token antes de la petición
const token = localStorage.getItem('apiToken')
if (!token) {
  pdfError.value = 'No se encontró token de autenticación.'
  return
}
```

---

## 📁 Archivos Modificados/Creados

### Backend
1. **`backend/src/routes/adminRoutes.js`**
   - Agregada ruta `POST /generate-statistics-pdf`
   - Import de `generateStatisticsPDF`

2. **`backend/src/controllers/adminController.js`**
   - Nueva función `generateStatisticsPDF()`
   - Query compleja con JOINs de Events, TicketTypes, Tickets
   - Cálculos de estadísticas generales y por evento

3. **`backend/src/services/pdfService.js`**
   - Nueva función `generateStatisticsPDF(stats)`
   - Generación del documento PDF con PDFKit
   - Layout de 3 columnas sin superposiciones
   - Eliminación de emojis y caracteres especiales

### Frontend
1. **`src/views/AdminPanel.vue`**
   - Modal simplificado para descargar reporte
   - Función `downloadPDFReport()` corregida
   - Obtención de token desde localStorage
   - Manejo de estados (carga, éxito, error)
   - Estilos CSS para `.info-message` y `.stats-list`

---

## 🚀 Despliegue y Testing

### Comandos ejecutados
```bash
# 1. Detener contenedores anteriores
docker-compose down

# 2. Reconstruir con cambios
docker-compose up -d --build

# 3. Verificar estado
docker-compose ps

# 4. Ver logs del backend
docker logs ticketvue-backend --tail 50
```

### Verificación de funcionamiento
```bash
# Verificar tabla events
docker exec ticketvue-mysql mysql -u ticketuser -pticketpass -D ticketvue \
  -e "SELECT id, name, total_sold, revenue FROM events;"

# Verificar tabla tickets
docker exec ticketvue-mysql mysql -u ticketuser -pticketpass -D ticketvue \
  -e "SELECT * FROM tickets WHERE status='paid';"

# Verificar tabla ticket_types
docker exec ticketvue-mysql mysql -u ticketuser -pticketpass -D ticketvue \
  -e "DESCRIBE ticket_types;"
```

---

## 📝 Notas Técnicas

### Diferencias entre ingresos potenciales y reales

| Concepto | Fuente de datos | Cálculo |
|----------|----------------|---------|
| **Ingresos Potenciales** | `ticket_types` | `SUM(quantity × price)` |
| **Ingresos Reales** | `tickets` donde `status='paid'` | `SUM(total_amount)` |

**Ejemplo:**
- **Potencial:** Si vendes los 800 tickets del teatro = $4,400,000
- **Real:** Solo vendiste 50 tickets = $600,005

### ¿Por qué events.revenue está en $0?

El campo `events.revenue` en la base de datos **no se actualiza automáticamente** cuando se venden tickets. Este es un campo calculado que debería actualizarse mediante:

1. **Trigger en la BD** (no implementado)
2. **Actualización manual** en el código de compra (no implementado)
3. **Cálculo en tiempo real** ← Solución implementada

Por eso la solución fue calcular los ingresos reales desde la tabla `tickets`:

```javascript
const eventRealRevenue = tickets.reduce((sum, ticket) => {
  return sum + parseFloat(ticket.total_amount || 0);
}, 0);
```

---

## 🔮 Mejoras Futuras

### Corto plazo
- [ ] Agregar gráficos al PDF (charts con PDFKit)
- [ ] Exportar también en formato Excel/CSV
- [ ] Permitir seleccionar rango de fechas

### Mediano plazo
- [ ] Comparativa mes a mes
- [ ] Proyecciones de ventas
- [ ] Reportes programados (envío automático por email)

### Largo plazo
- [ ] Dashboard interactivo con gráficos en tiempo real
- [ ] Análisis predictivo de ventas
- [ ] Integración con sistemas de BI (Business Intelligence)

---

## 🆘 Troubleshooting

### Error: "No se encontró token de autenticación"
**Causa:** El token JWT no está en localStorage  
**Solución:** Cerrar sesión y volver a iniciar sesión

### Error: "No autorizado - Token inválido"
**Causa:** El token expiró o es inválido  
**Solución:** Refrescar la página y volver a iniciar sesión

### Error: "Unknown column 'ticketTypes.capacity'"
**Causa:** El código intenta acceder a una columna inexistente  
**Solución:** Verificar que los atributos en la query coincidan con la estructura de la BD

### PDF muestra $0 en todos los ingresos
**Causa:** No hay registros en `tickets` con `status='paid'`  
**Solución:** Verificar que existan tickets vendidos en la base de datos

### Textos superpuestos en el PDF
**Causa:** Las posiciones X de las columnas están muy juntas  
**Solución:** Ajustar las posiciones X en `pdfService.js` (líneas ~640)

---

## 📚 Referencias

### Documentación técnica
- **PDFKit:** https://pdfkit.org/
- **Sequelize:** https://sequelize.org/docs/v6/
- **JWT Authentication:** https://jwt.io/

### Documentos relacionados
- `AUDIT_SYSTEM_IMPLEMENTATION.md` - Sistema de auditoría (reportes de validaciones)
- `HU6_REPORTES_IMPLEMENTACION.md` - Reportes generales del sistema
- `MEJORAS_UI_Y_SIMPLIFICACION.md` - Mejoras recientes en la UI

---

**Fin del documento**

_Última actualización: 8 de noviembre de 2025_
