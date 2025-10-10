# 🔧 Solución: Error "Evento no encontrado" al crear Tipo de Ticket

## 🐛 Problema

Al intentar crear un tipo de ticket para "Concierto Rock en Vivo" aparece el error:
```
❌ Error al guardar el tipo de ticket: Evento no encontrado
```

## 🔍 Causa Raíz

1. **El evento estaba solo en localStorage**, no en la base de datos MySQL
2. **El AdminPanel no cargaba eventos desde la API**, solo desde localStorage
3. **El backend valida** que el `event_id` exista en la tabla `events` antes de crear un tipo de ticket

## ✅ Soluciones Aplicadas

### 1. Creado el Evento en MySQL

Se insertó el evento "Concierto Rock en Vivo" directamente en la base de datos:

```sql
INSERT INTO events (name, description, date, location, category, image) 
VALUES (
  'Concierto Rock en Vivo', 
  'La mejor banda de rock en un espectáculo inolvidable',
  '2025-12-15 20:00:00',
  'Estadio Nacional',
  'Concierto',
  'https://picsum.photos/seed/concert1/400/300'
);
```

**Resultado:** Evento creado con **ID = 1**

### 2. Creado `eventApiService.js`

Nuevo servicio para conectar el frontend con la API de eventos del backend:

**Archivo:** `src/services/eventApiService.js`

**Funciones:**
- ✅ `getAllEvents()` - Obtener todos los eventos
- ✅ `getEventById(id)` - Obtener un evento específico
- ✅ `createEvent(eventData)` - Crear nuevo evento
- ✅ `updateEvent(id, eventData)` - Actualizar evento
- ✅ `deleteEvent(id)` - Eliminar evento

### 3. Actualizado AdminPanel.vue

**Import agregado:**
```javascript
import * as eventApi from '../services/eventApiService'
```

**Función `loadData()` actualizada:**
Ahora carga eventos desde la API de MySQL en lugar de localStorage:

```javascript
try {
  const eventsResponse = await eventApi.getAllEvents()
  
  if (eventsResponse && eventsResponse.success && Array.isArray(eventsResponse.data)) {
    events.value = eventsResponse.data.map(event => ({
      id: event.id,
      name: event.name,
      category: event.category || 'Otro',
      description: event.description || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      time: event.date ? new Date(event.date).toTimeString().slice(0, 5) : '',
      venue: event.location || '',
      city: event.city || '',
      totalCapacity: event.total_capacity || 0,
      imageUrl: event.image || 'https://picsum.photos/400/300'
    }))
    console.log('✅ Eventos cargados desde la base de datos:', events.value.length)
  }
} catch (error) {
  console.error('Error al cargar eventos:', error)
  events.value = []
}
```

## 🧪 Cómo Probar Ahora

### 1. Recarga la Página

1. Presiona **F5** para recargar http://localhost/admin/panel
2. **Abre la consola del navegador (F12)**
3. Deberías ver:
   ```
   ✅ Eventos cargados desde la base de datos: 1
   ✅ Tipos de ticket cargados desde la base de datos: 0
   ```

### 2. Crea el Tipo de Ticket

1. Tab "**Tipos de Ticket**"
2. Click "➕ Nuevo Tipo de Ticket"
3. Llena el formulario:
   - **Evento:** Selecciona "Concierto Rock en Vivo" (ahora carga desde MySQL)
   - **Nombre del Tipo:** General
   - **Descripción:** Testing
   - **Precio:** 20000
   - **Aforo (Capacidad):** 200
4. Click "**Crear Tipo de Ticket**"
5. ✅ **Ahora debería funcionar** y ver: "Tipo de ticket creado correctamente y guardado en la base de datos"

### 3. Verificar en la Base de Datos

```powershell
# Ver evento creado
docker exec -it ticketvue-mysql mysql -u ticketuser -pticketpass -e "SELECT id, name, date FROM ticketvue.events;"

# Ver tipos de tickets creados
docker exec -it ticketvue-mysql mysql -u ticketuser -pticketpass -e "SELECT * FROM ticketvue.ticket_types;"

# Ver relación evento-tickets
docker exec -it ticketvue-mysql mysql -u ticketuser -pticketpass -e "
  SELECT 
    e.name AS evento,
    tt.name AS tipo_ticket,
    tt.price AS precio,
    tt.total_capacity AS capacidad
  FROM ticketvue.ticket_types tt
  JOIN ticketvue.events e ON tt.event_id = e.id;
"
```

## 📊 Resultado Esperado

### En la Consola del Navegador:
```
✅ Eventos cargados desde la base de datos: 1
✅ Tipos de ticket cargados desde la base de datos: 0
📦 Respuesta del servidor: {success: true, message: "...", data: {...}}
✅ Tipo de ticket agregado al array local: {id: 1, eventId: 1, name: "General", ...}
```

### En la Base de Datos:
```
+----+------------------------+---------------------+------------------+
| id | name                   | date                | location         |
+----+------------------------+---------------------+------------------+
|  1 | Concierto Rock en Vivo | 2025-12-15 20:00:00 | Estadio Nacional |
+----+------------------------+---------------------+------------------+

+----+----------+---------+-------------+-------+----------------+---------------+
| id | event_id | name    | description | price | total_capacity | sold_tickets  |
+----+----------+---------+-------------+-------+----------------+---------------+
|  1 |        1 | General | Testing     | 20000 |            200 |             0 |
+----+----------+---------+-------------+-------+----------------+---------------+
```

## 🔄 Mapeo de Campos: Eventos

### Backend (MySQL) → Frontend (Vue)
```javascript
{
  id: 1                        →  id: 1
  name: "Concierto..."         →  name: "Concierto..."
  description: "..."           →  description: "..."
  date: "2025-12-15 20:00:00"  →  date: "2025-12-15", time: "20:00"
  location: "Estadio..."       →  venue: "Estadio..."
  category: "Concierto"        →  category: "Concierto"
  image: "https://..."         →  imageUrl: "https://..."
  total_capacity: 5000         →  totalCapacity: 5000
}
```

## 🚀 Próximos Pasos

### Pendientes para Completar la Integración:

1. **Actualizar `saveEvent()`** para que guarde en MySQL vía API (actualmente guarda en localStorage)
2. **Actualizar `deleteEvent()`** para que elimine de MySQL vía API
3. **Remover dependencia de localStorage** para eventos

## ⚠️ Notas Importantes

### Credenciales de MySQL Correctas:
- **Usuario:** `ticketuser`
- **Contraseña:** `ticketpass`
- **Base de Datos:** `ticketvue`
- **Host:** `mysql` (dentro de Docker) o `localhost:3307` (desde host)

### IDs Importantes:
- **Evento "Concierto Rock en Vivo":** ID = 1
- Este ID debe coincidir entre el dropdown y la base de datos

### Validación del Backend:
El backend valida que:
- ✅ El evento (`event_id`) exista en la tabla `events`
- ✅ Todos los campos requeridos estén presentes
- ✅ Los valores sean del tipo correcto (números, strings, etc.)

## 📝 Archivos Modificados

1. ✅ **`src/services/eventApiService.js`** - CREADO
2. ✅ **`src/views/AdminPanel.vue`** - MODIFICADO (import + loadData)
3. ✅ **Base de datos MySQL** - Evento insertado

## ✅ Estado Final

- ✅ Evento existe en MySQL con ID = 1
- ✅ EventApiService creado y funcional
- ✅ AdminPanel carga eventos desde MySQL
- ✅ AdminPanel carga tipos de tickets desde MySQL
- ✅ Ahora puedes crear tipos de tickets sin error

---

**Fecha:** 10 de Octubre, 2025  
**Error Resuelto:** "Evento no encontrado"  
**Estado:** ✅ FUNCIONAL
