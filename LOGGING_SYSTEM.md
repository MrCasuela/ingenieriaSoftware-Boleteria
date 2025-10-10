# 📋 Sistema de Logging Mejorado

## ✅ Implementación Completada

Se ha implementado un sistema profesional de logging que escribe en archivos en el backend, eliminando la dependencia de `console.log` y proporcionando un historial permanente de eventos.

---

## 🎯 Características del Sistema

### 1. **Archivos de Log Separados**

El sistema crea automáticamente archivos específicos en `backend/logs/`:

- **`errors.log`** - Solo errores críticos
- **`combined.log`** - Todos los eventos (información, advertencias, errores)
- **`ticket-types.log`** - Eventos relacionados con tipos de tickets
- **`events.log`** - Eventos relacionados con eventos
- **`database.log`** - Operaciones de base de datos

### 2. **Niveles de Log**

- **INFO** (ℹ️) - Información general
- **SUCCESS** (✅) - Operaciones exitosas
- **WARN** (⚠️) - Advertencias
- **ERROR** (❌) - Errores críticos
- **DEBUG** (🔍) - Debug (solo en desarrollo)
- **HTTP** (🌐) - Peticiones HTTP
- **DATABASE** (🗄️) - Operaciones de BD

### 3. **Formato de Log**

```
[2025-10-10T15:30:45.123Z] [ERROR] [TICKET_TYPES] Error al crear tipo de ticket
{
  "message": "Cannot read properties of undefined (reading 'id')",
  "stack": "TypeError: Cannot read properties...",
  "name": "TypeError"
}
```

### 4. **Rotación Automática**

- Los archivos que superan **10MB** se rotan automáticamente
- Se crea un backup con timestamp: `errors-2025-10-10T15-30-45.log`
- Los logs antiguos (más de 30 días) se eliminan automáticamente

---

## 📖 Uso del Logger

### En el Backend

```javascript
import logger from '../utils/logger.js';

// Log de información
logger.info('TICKET_TYPES', 'Iniciando creación de tipo de ticket');

// Log de éxito
logger.success('TICKET_TYPES', 'Tipo de ticket creado exitosamente', { id: 123 });

// Log de advertencia
logger.warn('TICKET_TYPES', 'Faltan datos opcionales', { field: 'description' });

// Log de error
logger.error('TICKET_TYPES', 'Error al crear tipo de ticket', error);

// Log de debug (solo en desarrollo)
logger.debug('TICKET_TYPES', 'Datos recibidos', req.body);

// Log de base de datos
logger.database('SELECT', 'Buscando evento por ID', { eventId: 1 });

// Log HTTP
logger.http('POST', '/api/ticket-types', 201, { id: 123 });
```

---

## 🔍 Ver los Logs

### Desde Docker

```bash
# Ver logs en tiempo real
docker exec -it ticketvue-backend tail -f /app/logs/combined.log

# Ver solo errores
docker exec -it ticketvue-backend tail -f /app/logs/errors.log

# Ver logs de ticket types
docker exec -it ticketvue-backend tail -f /app/logs/ticket-types.log

# Ver últimas 50 líneas
docker exec -it ticketvue-backend tail -50 /app/logs/combined.log
```

### Copiar logs a tu máquina

```bash
# Copiar todos los logs
docker cp ticketvue-backend:/app/logs ./logs-backup

# Copiar un archivo específico
docker cp ticketvue-backend:/app/logs/errors.log ./errors.log
```

---

## 📊 Logs Implementados en Ticket Types

El controlador `ticketTypeController.js` ahora registra:

1. **Inicio de operación** - Cuando se inicia la creación
2. **Datos recibidos** - El body completo de la petición
3. **Validaciones** - Si faltan datos requeridos
4. **Búsqueda de evento** - ID y tipo del evento buscado
5. **Evento encontrado/no encontrado** - Resultado de la búsqueda
6. **Datos a crear** - Objeto que se enviará a la BD
7. **Éxito** - Cuando se crea correctamente
8. **Respuesta** - Datos que se envían al cliente
9. **Errores** - Stack trace completo de cualquier error

---

## 🐛 Debugging del Error Actual

Con el nuevo sistema, ahora podemos ver exactamente dónde está fallando:

```bash
# Ver logs de ticket-types
docker exec -it ticketvue-backend cat /app/logs/ticket-types.log

# Buscar errores específicos
docker exec -it ticketvue-backend grep "ERROR" /app/logs/ticket-types.log

# Ver las últimas operaciones
docker exec -it ticketvue-backend tail -100 /app/logs/ticket-types.log
```

---

## 🔧 Próximos Pasos

1. **Recarga la página del frontend**
2. **Intenta crear un nuevo tipo de ticket**
3. **Verifica los logs** con:
   ```bash
   docker exec -it ticketvue-backend tail -100 /app/logs/ticket-types.log
   ```
4. **Comparte los logs** para analizar el problema

---

## 💡 Ventajas del Nuevo Sistema

✅ **Persistencia** - Los logs se guardan en archivos, no se pierden al recargar
✅ **Organización** - Archivos separados por categoría
✅ **Detalle** - Stack traces completos de errores
✅ **Rotación** - No crece infinitamente, se rotan automáticamente
✅ **Producción** - Funciona tanto en desarrollo como producción
✅ **Debugging** - Fácil seguimiento de flujo de ejecución

---

## 📝 Archivos Modificados

- ✅ `backend/src/utils/logger.js` - Sistema de logging (NUEVO)
- ✅ `backend/src/controllers/ticketTypeController.js` - Implementación de logs
- ✅ `backend/server.js` - Logs de inicio del servidor
- ✅ `src/views/AdminPanel.vue` - Logs mejorados en frontend

---

## 🎯 Estado Actual

- ✅ Sistema de logging implementado
- ✅ Backend reiniciado
- ⏳ **Pendiente**: Probar creación de ticket type y revisar logs
