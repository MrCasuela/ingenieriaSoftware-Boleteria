# 📋 Plan de Trabajo - ING-6-HU5

## Historia de Usuario
**Como administrador quiero gestionar eventos, tipos de tickets y aforos desde un panel web para mantener el sistema actualizado**

---

## 🎯 Objetivo
Conectar el panel de administrador (AdminPanel.vue) con el backend para permitir la gestión completa de:
- ✅ **Eventos** (CRUD completo)
- ✅ **Tipos de Tickets** (CRUD completo)
- ✅ **Aforos** (control de capacidad)

---

## 📊 Estado Actual del Sistema

### ✅ Backend (Completado)
- ✅ API REST funcional en `http://localhost:3000`
- ✅ Endpoints de eventos: `/api/events`
- ✅ Endpoints de tipos de tickets: `/api/ticket-types`
- ✅ Endpoints de tickets: `/api/tickets`
- ✅ Base de datos MySQL operativa
- ✅ 3 eventos de prueba
- ✅ 8 tipos de tickets de prueba
- ✅ Autenticación funcionando correctamente

### ⚠️ Frontend (Pendiente de Integración)
- ✅ AdminPanel.vue existe con UI completa
- ❌ Usa localStorage en lugar de API
- ❌ No persiste datos en MySQL
- ❌ No hay sincronización con backend

---

## 🔧 Tareas a Realizar

### **FASE 1: Integración de Servicios** ⏱️ 1 hora

#### Tarea 1.1: Crear servicio de API para Eventos
**Archivo:** `src/services/eventApiService.js`

```javascript
// Funciones a implementar:
- getAllEvents()
- getEventById(id)
- createEvent(eventData)
- updateEvent(id, eventData)
- deleteEvent(id)
```

**Criterios de Aceptación:**
- [ ] Todas las funciones retornan Promises
- [ ] Manejo de errores con try/catch
- [ ] Headers correctos (Content-Type: application/json)
- [ ] URL base configurable

---

#### Tarea 1.2: Crear servicio de API para Tipos de Tickets
**Archivo:** `src/services/ticketTypeApiService.js`

```javascript
// Funciones a implementar:
- getAllTicketTypes()
- getTicketTypesByEvent(eventId)
- createTicketType(ticketTypeData)
- updateTicketType(id, ticketTypeData)
- deleteTicketType(id)
```

**Criterios de Aceptación:**
- [ ] Todas las funciones retornan Promises
- [ ] Filtrado por evento funcional
- [ ] Validación de capacidad

---

### **FASE 2: Actualización del AdminPanel** ⏱️ 2 horas

#### Tarea 2.1: Integrar API de Eventos en AdminPanel.vue

**Modificaciones necesarias:**

1. **Importar el servicio:**
```javascript
import * as eventApi from '@/services/eventApiService.js'
```

2. **Cargar eventos desde API (onMounted):**
```javascript
const loadEvents = async () => {
  try {
    loading.value = true
    const response = await eventApi.getAllEvents()
    events.value = response.data
  } catch (error) {
    showError('Error al cargar eventos')
  } finally {
    loading.value = false
  }
}
```

3. **Crear evento (saveEvent):**
```javascript
const saveEvent = async () => {
  try {
    if (editingEvent.value) {
      await eventApi.updateEvent(editingEvent.value.id, eventForm)
    } else {
      await eventApi.createEvent(eventForm)
    }
    await loadEvents()
    closeEventForm()
    showSuccess('Evento guardado exitosamente')
  } catch (error) {
    showError('Error al guardar evento')
  }
}
```

4. **Eliminar evento (deleteEvent):**
```javascript
const deleteEvent = async (id) => {
  if (!confirm('¿Eliminar evento?')) return
  try {
    await eventApi.deleteEvent(id)
    await loadEvents()
    showSuccess('Evento eliminado')
  } catch (error) {
    showError('Error al eliminar evento')
  }
}
```

**Criterios de Aceptación:**
- [ ] Eventos se cargan desde MySQL al abrir el panel
- [ ] Crear nuevo evento lo guarda en BD
- [ ] Editar evento actualiza en BD
- [ ] Eliminar evento lo borra de BD
- [ ] Loading states mientras carga
- [ ] Mensajes de éxito/error

---

#### Tarea 2.2: Integrar API de Tipos de Tickets

**Modificaciones necesarias:**

1. **Cargar tipos de tickets por evento:**
```javascript
const loadTicketTypes = async (eventId) => {
  try {
    const response = await ticketTypeApi.getTicketTypesByEvent(eventId)
    ticketTypes.value = response.data
  } catch (error) {
    showError('Error al cargar tipos de ticket')
  }
}
```

2. **Crear tipo de ticket:**
```javascript
const saveTicketType = async () => {
  try {
    if (editingTicketType.value) {
      await ticketTypeApi.updateTicketType(editingTicketType.value.id, ticketTypeForm)
    } else {
      await ticketTypeApi.createTicketType({
        ...ticketTypeForm,
        eventId: selectedEventForTickets.value
      })
    }
    await loadTicketTypes(selectedEventForTickets.value)
    closeTicketTypeForm()
    showSuccess('Tipo de ticket guardado')
  } catch (error) {
    showError('Error al guardar tipo de ticket')
  }
}
```

**Criterios de Aceptación:**
- [ ] Tipos de tickets se cargan desde BD
- [ ] Crear tipo de ticket asociado a evento
- [ ] Editar tipo de ticket
- [ ] Eliminar tipo de ticket
- [ ] Validación de capacidad (no exceder aforo del evento)

---

#### Tarea 2.3: Control de Aforo y Disponibilidad

**Funcionalidad a implementar:**

1. **Calcular disponibilidad:**
```javascript
const calculateAvailability = (event) => {
  const ticketTypes = getTicketTypesByEvent(event.id)
  const totalCapacity = ticketTypes.reduce((sum, tt) => sum + tt.capacity, 0)
  const totalSold = ticketTypes.reduce((sum, tt) => sum + (tt.soldCount || 0), 0)
  
  return {
    totalCapacity,
    totalSold,
    available: totalCapacity - totalSold,
    percentage: (totalSold / totalCapacity) * 100
  }
}
```

2. **Mostrar indicadores visuales:**
```html
<div class="capacity-indicator">
  <div class="progress">
    <div class="progress-bar" :style="`width: ${availability.percentage}%`"></div>
  </div>
  <span>{{ availability.totalSold }} / {{ availability.totalCapacity }} vendidos</span>
</div>
```

**Criterios de Aceptación:**
- [ ] Muestra capacidad total del evento
- [ ] Muestra tickets vendidos en tiempo real
- [ ] Muestra disponibilidad restante
- [ ] Indicador visual (barra de progreso)
- [ ] Alerta cuando aforo está cerca del límite

---

### **FASE 3: Mejoras UX** ⏱️ 1 hora

#### Tarea 3.1: Estados de Carga

**Implementar:**
- [ ] Skeleton loaders mientras carga datos
- [ ] Spinners en botones durante operaciones
- [ ] Desactivar botones durante carga
- [ ] Mensajes de "Cargando..."

**Ejemplo:**
```vue
<div v-if="loading" class="loading-skeleton">
  <div class="skeleton-card"></div>
  <div class="skeleton-card"></div>
</div>
<div v-else class="events-grid">
  <!-- Contenido real -->
</div>
```

---

#### Tarea 3.2: Notificaciones Toast

**Crear componente:** `src/components/Toast.vue`

```vue
<template>
  <div v-if="show" :class="['toast', type]">
    {{ message }}
  </div>
</template>
```

**Integrar en AdminPanel:**
```javascript
const toast = ref({ show: false, message: '', type: '' })

const showSuccess = (msg) => {
  toast.value = { show: true, message: msg, type: 'success' }
  setTimeout(() => toast.value.show = false, 3000)
}

const showError = (msg) => {
  toast.value = { show: true, message: msg, type: 'error' }
  setTimeout(() => toast.value.show = false, 3000)
}
```

---

#### Tarea 3.3: Validaciones de Formularios

**Validaciones a implementar:**

1. **Evento:**
   - [ ] Nombre no vacío (min 3 caracteres)
   - [ ] Fecha no puede ser en el pasado
   - [ ] Aforo total > 0
   - [ ] URL de imagen válida (opcional)

2. **Tipo de Ticket:**
   - [ ] Nombre no vacío
   - [ ] Precio >= 0
   - [ ] Capacidad > 0
   - [ ] Capacidad no excede aforo del evento

---

### **FASE 4: Testing** ⏱️ 1 hora

#### Tarea 4.1: Pruebas Funcionales

**Casos de prueba:**

| # | Caso | Pasos | Resultado Esperado |
|---|------|-------|-------------------|
| 1 | Crear evento | 1. Llenar formulario<br>2. Click "Crear" | Evento aparece en lista y BD |
| 2 | Editar evento | 1. Click "Editar"<br>2. Modificar datos<br>3. Guardar | Cambios reflejados en BD |
| 3 | Eliminar evento | 1. Click "Eliminar"<br>2. Confirmar | Evento borrado de BD |
| 4 | Crear tipo ticket | 1. Seleccionar evento<br>2. Llenar form<br>3. Crear | Tipo ticket asociado a evento |
| 5 | Validar capacidad | 1. Crear tickets que excedan aforo | Mostrar error |
| 6 | Ver disponibilidad | 1. Abrir evento con tickets vendidos | Muestra disponibilidad correcta |

---

#### Tarea 4.2: Pruebas de Integración

**Verificar:**
- [ ] Frontend se conecta correctamente a `http://localhost:3000`
- [ ] Errores de red se manejan correctamente
- [ ] Sesión de admin se mantiene
- [ ] CORS configurado correctamente
- [ ] Respuestas del backend son consistentes

---

### **FASE 5: Documentación** ⏱️ 30 min

#### Tarea 5.1: Actualizar README

**Agregar sección:**
```markdown
## 👨‍💼 Panel de Administrador

### Funcionalidades

1. **Gestión de Eventos**
   - Crear, editar y eliminar eventos
   - Visualizar aforo total y disponibilidad
   - Categorización de eventos

2. **Gestión de Tipos de Tickets**
   - Crear tipos de tickets por evento
   - Definir precios y capacidad
   - Control de disponibilidad por tipo

3. **Control de Aforo**
   - Visualización en tiempo real de tickets vendidos
   - Indicadores de capacidad
   - Alertas de aforo completo
```

---

#### Tarea 5.2: Crear Guía de Usuario

**Archivo:** `ADMIN_PANEL_GUIDE.md`

**Contenido:**
- Cómo acceder al panel
- Cómo crear un evento
- Cómo gestionar tipos de tickets
- Cómo monitorear disponibilidad
- Screenshots/capturas

---

## 📁 Archivos a Crear/Modificar

### Nuevos Archivos
- [ ] `src/services/eventApiService.js`
- [ ] `src/services/ticketTypeApiService.js`
- [ ] `src/components/Toast.vue`
- [ ] `src/components/LoadingSkeleton.vue`
- [ ] `ADMIN_PANEL_GUIDE.md`

### Archivos a Modificar
- [ ] `src/views/AdminPanel.vue` (integrar API calls)
- [ ] `src/services/apiService.js` (si existe, reutilizar)
- [ ] `README.md` (documentar funcionalidad)

---

## 🔗 Endpoints Backend Disponibles

### Eventos
```
GET    /api/events              - Listar todos
GET    /api/events/:id          - Obtener por ID
POST   /api/events              - Crear
PUT    /api/events/:id          - Actualizar
DELETE /api/events/:id          - Eliminar
GET    /api/events/active       - Solo activos
```

### Tipos de Tickets
```
GET    /api/ticket-types                  - Listar todos
GET    /api/ticket-types/:id              - Obtener por ID
GET    /api/ticket-types/event/:eventId   - Por evento
POST   /api/ticket-types                  - Crear
PUT    /api/ticket-types/:id              - Actualizar
DELETE /api/ticket-types/:id              - Eliminar
```

---

## ✅ Criterios de Aceptación General

### Funcionales
- [ ] Admin puede crear eventos con todos los campos
- [ ] Admin puede editar eventos existentes
- [ ] Admin puede eliminar eventos (con confirmación)
- [ ] Admin puede crear tipos de tickets asociados a eventos
- [ ] Admin puede editar tipos de tickets
- [ ] Admin puede eliminar tipos de tickets
- [ ] Sistema valida que capacidad de tickets no exceda aforo
- [ ] Se muestra disponibilidad en tiempo real
- [ ] Cambios persisten en base de datos MySQL

### No Funcionales
- [ ] Tiempo de carga < 2 segundos
- [ ] UI responsiva en tablets/desktop
- [ ] Feedback visual en todas las acciones
- [ ] Manejo de errores graceful
- [ ] Validaciones client-side antes de enviar
- [ ] Sesión de admin persistente

---

## 🚀 Orden de Ejecución Recomendado

### **Sprint 1 - Backend Integration (2 horas)**
1. Crear `eventApiService.js`
2. Crear `ticketTypeApiService.js`
3. Probar servicios con Postman/Thunder Client

### **Sprint 2 - Frontend Update (3 horas)**
4. Modificar AdminPanel - Tab Eventos
5. Modificar AdminPanel - Tab Tipos de Tickets
6. Implementar control de aforo

### **Sprint 3 - Polish & Testing (2 horas)**
7. Agregar loading states
8. Crear componente Toast
9. Validaciones de formularios
10. Testing completo

### **Sprint 4 - Documentation (30 min)**
11. Actualizar README
12. Crear guía de usuario

---

## 🎨 Mockup de Cambios Visuales

### Antes (localStorage)
```
📊 Gestión de Eventos
[➕ Nuevo Evento]

┌─────────────────────────┐
│ Evento 1                │
│ Guardado en localStorage│
└─────────────────────────┘
```

### Después (MySQL + API)
```
📊 Gestión de Eventos
[➕ Nuevo Evento]  [🔄 Actualizar]

┌─────────────────────────────────┐
│ 🎭 Evento 1                     │
│ ━━━━━━━━━━━━━━━━━ 75%         │
│ 750/1000 tickets vendidos       │
│ [✏️ Editar] [🗑️ Eliminar]       │
└─────────────────────────────────┘
```

---

## 📊 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Tiempo de respuesta API | < 500ms |
| Tasa de error | < 1% |
| Cobertura de validación | 100% |
| Satisfacción de usuario | 4.5/5 |

---

## 🔍 Checklist Final

- [ ] Todos los endpoints funcionan correctamente
- [ ] Datos persisten en MySQL
- [ ] No quedan referencias a localStorage
- [ ] UI muestra loading states
- [ ] Errores se manejan correctamente
- [ ] Validaciones client-side implementadas
- [ ] Tests funcionales pasando
- [ ] Documentación actualizada
- [ ] Code review completado
- [ ] Deploy a staging exitoso

---

## 🎯 ¡Listo para Comenzar!

**Próximo paso:** Ejecutar Sprint 1 - Crear los servicios de API

¿Quieres que comience con la creación de `eventApiService.js`?
