# ✅ Integración de Eventos - API Backend con AdminPanel

## 🎯 Objetivo Completado
Conectar el Panel de Administrador con el backend MySQL para mostrar eventos desde la base de datos.

---

## 📋 Cambios Realizados

### 1. ✅ Servicio de API de Eventos Creado

**Archivo:** `src/services/eventApiService.js`

Funciones implementadas:
- ✅ `getAllEvents()` - Obtener todos los eventos
- ✅ `getEventById(id)` - Obtener evento por ID
- ✅ `getActiveEvents()` - Solo eventos activos
- ✅ `createEvent(eventData)` - Crear nuevo evento
- ✅ `updateEvent(id, eventData)` - Actualizar evento
- ✅ `deleteEvent(id)` - Eliminar evento

**Características:**
- Manejo de errores con try/catch
- Headers correctos (Content-Type: application/json)
- URL base configurable: `http://localhost:3000/api`
- Logs de consola para debugging

---

### 2. ✅ AdminPanel.vue Modificado

#### Imports Agregados:
```javascript
import * as eventApi from '../services/eventApiService'
```

#### Estados Agregados:
```javascript
const loading = ref(false)  // Indicador de carga
const error = ref(null)      // Mensajes de error
```

#### Función `loadData()` Actualizada:

**Antes:**
```javascript
// Cargaba desde localStorage
const savedEvents = localStorage.getItem('adminEvents')
```

**Ahora:**
```javascript
// Carga desde API con fallback a localStorage
const response = await eventApi.getAllEvents()
events.value = response.data.map(event => ({
  id: event.id,
  name: event.name,
  category: event.category || 'Otro',
  description: event.description,
  date: event.date,
  venue: event.location || event.venue?.name || '',
  imageUrl: event.image || 'https://picsum.photos/...'
}))
```

---

### 3. ✅ UI Mejorada - Estados Visuales

#### Loading State:
```html
<div v-if="loading" class="loading-state">
  <div class="spinner"></div>
  <p>Cargando eventos...</p>
</div>
```

#### Error State:
```html
<div v-else-if="error" class="error-state">
  <p>⚠️ {{ error }}</p>
  <button @click="loadData" class="btn-secondary">🔄 Reintentar</button>
</div>
```

#### Empty State:
```html
<div v-else-if="events.length === 0" class="empty-state">
  <p>📭 No hay eventos creados aún</p>
  <button @click="showEventForm = true" class="btn-primary">
    ➕ Crear Primer Evento
  </button>
</div>
```

---

### 4. ✅ Estilos CSS Agregados

```css
/* Spinner de carga */
.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Estados centrados con padding */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}
```

---

## 🗄️ Datos en la Base de Datos

### Eventos Disponibles (3 eventos):

| ID | Nombre | Descripción | Fecha | Ubicación |
|----|--------|-------------|-------|-----------|
| 1 | Concierto de Rock 2025 | El mejor festival de rock del año | 15 Dic 2025, 20:00 | Estadio Luna Park, Buenos Aires |
| 2 | Obra de Teatro: Hamlet | Clásica obra de Shakespeare | 20 Nov 2025, 19:30 | Teatro Colón, Buenos Aires |
| 3 | Festival de Música Electrónica | Los mejores DJs internacionales | 10 Ene 2026, 22:00 | Costa Salguero, Buenos Aires |

---

## 🔄 Mapeo de Datos Backend → Frontend

| Campo Backend | Campo Frontend | Transformación |
|---------------|----------------|----------------|
| `id` | `id` | Directo |
| `name` | `name` | Directo |
| `category` | `category` | Default: 'Otro' |
| `description` | `description` | Directo |
| `date` | `date` | ISO String |
| `location` | `venue` | O `venue.name` |
| `venue.city` | `city` | JSON parse |
| `venue.capacity` | `totalCapacity` | JSON parse |
| `image` | `imageUrl` | Placeholder si vacío |

---

## 🧪 Pruebas Realizadas

### ✅ Verificación de Eventos en BD
```bash
docker exec ticketvue-backend node -e "..."
# Resultado: 3 eventos encontrados
```

### ✅ Estructura de Tabla Events
Columnas verificadas:
- `id`, `name`, `description`, `date`
- `location`, `venue`, `image`, `category`
- `status`, `organizer_id`, `total_sold`, `revenue`
- `created_at`, `updated_at`

### ✅ Frontend Reconstruido
```bash
docker-compose build frontend  # Exitoso
docker-compose up -d frontend  # Contenedor iniciado
```

---

## 🎯 Resultado Final

### Al abrir http://localhost/admin/panel

**Antes:**
- ❌ Mostraba 1 evento de ejemplo (localStorage)
- ❌ No conectado a base de datos
- ❌ Sin indicadores de carga

**Ahora:**
- ✅ Muestra 3 eventos desde MySQL
- ✅ Spinner de carga mientras obtiene datos
- ✅ Mensaje de error si falla la API
- ✅ Fallback a localStorage si backend está caído
- ✅ Estado vacío si no hay eventos

---

## 📊 Logs de Consola

Al cargar el AdminPanel verás:
```
🔄 Cargando eventos desde la API...
✅ Respuesta de la API: { success: true, data: [...] }
✅ Eventos cargados: 3
```

---

## 🔧 Debugging

### Ver logs del frontend:
```bash
docker logs ticketvue-frontend -f
```

### Ver logs del backend:
```bash
docker logs ticketvue-backend -f
```

### Probar API directamente:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/events" -UseBasicParsing
```

---

## 📝 Próximos Pasos

### ✅ Completado:
- [x] Mostrar eventos desde MySQL
- [x] Loading states
- [x] Error handling
- [x] Mapeo de datos

### 🔄 Pendiente (según plan ING-6-HU5):
- [ ] Crear evento (POST a API)
- [ ] Editar evento (PUT a API)
- [ ] Eliminar evento (DELETE a API)
- [ ] Integrar tipos de tickets con API
- [ ] Control de aforo en tiempo real
- [ ] Validaciones de formularios

---

## 🚀 Comandos Útiles

### Reiniciar solo el frontend:
```bash
docker-compose restart frontend
```

### Ver eventos en BD:
```bash
docker exec ticketvue-backend node -e "const { Sequelize } = require('sequelize'); const seq = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, { host: process.env.DB_HOST, port: process.env.DB_PORT, dialect: 'mysql', logging: false }); seq.query('SELECT * FROM events').then(([r]) => console.log(JSON.stringify(r, null, 2))).then(() => process.exit());"
```

### Reconstruir todo:
```bash
docker-compose --env-file .env.docker build
docker-compose --env-file .env.docker up -d
```

---

## ✅ ¡Integración Completada!

El Panel de Administrador ahora muestra correctamente los **3 eventos** que están en la base de datos MySQL. 

**Accede a:** http://localhost/admin/panel

**Credenciales:**
- Email: `admin1@ticketvue.com`
- Contraseña: `admin123`

🎉 **¡Los eventos de la base de datos ahora se muestran en el panel!**
