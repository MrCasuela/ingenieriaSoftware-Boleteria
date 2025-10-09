# 📊 Guía del Panel de Administrador - HU5

## 🎯 Historia de Usuario 5 (ING-6)

**Como administrador quiero gestionar eventos, tipos de tickets y aforos desde un panel web para mantener el sistema actualizado.**

---

## 🚀 Acceso al Sistema

### URL de Acceso
- **Login:** `/operator/login`
- **Panel Admin:** `/admin/panel`

### Credenciales de Administrador

| Usuario | Contraseña | Nivel | Permisos |
|---------|-----------|-------|----------|
| admin1 | admin123 | Super Admin | Acceso completo |
| admin2 | admin456 | Moderador | Gestión de eventos y tickets |

### Credenciales de Operador (para comparación)

| Usuario | Contraseña |
|---------|-----------|
| operador1 | admin123 |
| operador2 | admin456 |

---

## 📋 Características Principales

### 1. 🎭 Gestión de Eventos

#### Crear Nuevo Evento
1. Click en **"➕ Nuevo Evento"**
2. Completar el formulario:
   - **Nombre del Evento** (requerido)
   - **Categoría** (Concierto, Teatro, Deporte, Festival, Conferencia, Otro)
   - **Descripción** (requerido)
   - **Fecha y Hora** (requerido)
   - **Lugar/Venue** (requerido)
   - **Ciudad** (requerido)
   - **Aforo Total** (requerido)
   - **URL de Imagen** (opcional)
3. Click en **"Crear Evento"**

#### Editar Evento
1. Localizar el evento en la lista
2. Click en **"✏️ Editar"**
3. Modificar los campos deseados
4. Click en **"Actualizar Evento"**

#### Eliminar Evento
1. Localizar el evento en la lista
2. Click en **"🗑️ Eliminar"**
3. Confirmar la eliminación
4. **Nota:** Se eliminarán también todos los tipos de ticket asociados

#### Gestionar Tipos de Ticket
1. Localizar el evento en la lista
2. Click en **"🎫 Tipos de Ticket"**
3. El sistema cambiará automáticamente a la pestaña de tipos de ticket

---

### 2. 🎫 Gestión de Tipos de Ticket

#### Crear Tipo de Ticket
1. Ir a la pestaña **"Tipos de Ticket"**
2. Seleccionar un evento del dropdown
3. Click en **"➕ Nuevo Tipo de Ticket"**
4. Completar el formulario:
   - **Evento** (pre-seleccionado)
   - **Nombre del Tipo** (ej: VIP, Platea, General)
   - **Precio** (en pesos chilenos)
   - **Descripción** (opcional)
   - **Aforo/Capacidad** (número máximo de tickets)
5. Click en **"Crear Tipo de Ticket"**

#### Editar Tipo de Ticket
1. Seleccionar el evento correspondiente
2. Localizar el tipo de ticket
3. Click en **"✏️ Editar"**
4. Modificar los campos deseados
5. Click en **"Actualizar Tipo de Ticket"**

#### Eliminar Tipo de Ticket
1. Localizar el tipo de ticket
2. Click en **"🗑️ Eliminar"**
3. Confirmar la eliminación

#### Control de Aforo
- **Aforo Total:** Capacidad máxima de cada tipo de ticket
- **Vendidos:** Número de tickets ya vendidos (simulado)
- **Disponibles:** Capacidad - Vendidos
- **Barra de Progreso:** Visualización del porcentaje de ocupación
- **Porcentaje:** Cálculo automático de ocupación

---

### 3. 📈 Estadísticas y Reportes

#### Dashboard General
- **Total Eventos:** Contador de eventos activos
- **Tipos de Ticket:** Contador total de tipos de ticket
- **Aforo Total:** Suma de todos los aforos
- **Ingresos Potenciales:** Cálculo de ingresos máximos posibles

#### Tabla de Detalles por Evento
- **Evento:** Nombre del evento
- **Fecha:** Fecha formateada del evento
- **Tipos de Ticket:** Cantidad de tipos de ticket por evento
- **Aforo Total:** Capacidad total del evento
- **Ocupación:** Porcentaje de tickets vendidos
- **Ingresos:** Ingresos generados por evento

---

## 🔧 Funcionalidades Técnicas

### Almacenamiento de Datos
- **LocalStorage:**
  - `adminEvents`: Array de eventos
  - `adminTicketTypes`: Array de tipos de ticket
  - `adminSession`: Sesión del administrador

### Autenticación
- **Store:** `authStore` (Pinia)
- **Sesión:** 24 horas de duración
- **Roles:** Diferenciación entre operador y administrador
- **Permisos:**
  - Super Admin: Acceso completo
  - Moderador: Gestión de eventos y tickets

### Rutas Protegidas
- **Login Universal:** `/operator/login`
- **Panel Operador:** `/operator/panel` (requiere rol operador)
- **Panel Admin:** `/admin/panel` (requiere rol administrador)
- **Redirección Automática:** Según el rol del usuario

### Guards de Navegación
```javascript
// Verificaciones automáticas:
- Sesión activa
- Rol correcto (operador vs administrador)
- Redirección al panel correspondiente
- Expiración de sesión (24 horas)
```

---

## 🎨 Interfaz de Usuario

### Diseño
- **Header:** 
  - Gradiente morado/azul
  - Nombre de usuario
  - Botón de cerrar sesión
  
- **Pestañas:**
  - 🎭 Eventos
  - 🎫 Tipos de Ticket
  - 📈 Estadísticas

- **Cards de Evento:**
  - Imagen destacada
  - Categoría (badge)
  - Información detallada
  - Acciones rápidas

- **Cards de Tipo de Ticket:**
  - Nombre y precio destacados
  - Estadísticas de ventas
  - Barra de progreso
  - Porcentaje de ocupación

### Responsive
- **Desktop:** Vista completa con grid de 3 columnas
- **Tablet:** Grid de 2 columnas
- **Mobile:** Vista de 1 columna con scroll

---

## 📊 Cálculos Automáticos

### Precio Mínimo del Evento
```javascript
// Se actualiza automáticamente al:
- Crear un tipo de ticket
- Editar precio de un tipo de ticket
- Eliminar un tipo de ticket

minPrice = Math.min(...ticketTypes.map(tt => tt.price))
```

### Ocupación por Evento
```javascript
totalSold = sum(ticketTypes.sold)
totalCapacity = sum(ticketTypes.capacity)
occupancy = (totalSold / totalCapacity) * 100
```

### Ingresos por Evento
```javascript
revenue = sum(ticketTypes.price * ticketTypes.sold)
```

### Ingresos Potenciales Totales
```javascript
potentialRevenue = sum(ticketTypes.price * ticketTypes.capacity)
```

---

## 🔄 Flujo de Trabajo Típico

### Crear un Evento Completo

1. **Crear Evento Base**
   ```
   Eventos → ➕ Nuevo Evento → Completar formulario → Crear
   ```

2. **Agregar Tipos de Ticket**
   ```
   Tipos de Ticket → Seleccionar evento → ➕ Nuevo Tipo
   Repetir para: VIP, Platea, General, etc.
   ```

3. **Verificar Estadísticas**
   ```
   Estadísticas → Revisar aforo total → Verificar ingresos potenciales
   ```

4. **Ajustar si es Necesario**
   ```
   Editar tipos de ticket → Modificar precios/aforos → Guardar
   ```

---

## 🆚 Diferencias con el Panel de Operador

| Característica | Administrador | Operador |
|---------------|---------------|----------|
| **Función Principal** | Gestión de eventos | Validación de tickets |
| **Permisos** | Crear/Editar/Eliminar | Solo lectura y validación |
| **Estadísticas** | Completas y agregadas | Solo del evento actual |
| **Navegación** | 3 pestañas principales | Dashboard único |
| **Acciones** | CRUD completo | Escaneo y validación |
| **URL** | `/admin/panel` | `/operator/panel` |

---

## 🔐 Seguridad

### Control de Acceso
- **Autenticación requerida** para acceder al panel
- **Verificación de rol** en cada carga de página
- **Sesión persistente** pero con expiración
- **Redirección automática** si el rol no coincide

### Validaciones
- **Formularios:** Campos requeridos marcados con *
- **Tipos de datos:** Validación numérica en aforos y precios
- **Confirmaciones:** Diálogos antes de eliminar
- **Integridad:** Actualización automática de relaciones

---

## 💾 Persistencia de Datos

### Datos de Ejemplo Iniciales

#### Eventos
```javascript
{
  id: 1,
  name: 'Concierto Rock en Vivo',
  category: 'Concierto',
  date: '2025-12-15',
  time: '20:00',
  venue: 'Estadio Nacional',
  city: 'Santiago',
  totalCapacity: 5000,
  imageUrl: 'https://picsum.photos/seed/concert1/400/300'
}
```

#### Tipos de Ticket
```javascript
[
  {
    id: 1,
    eventId: 1,
    name: 'VIP',
    price: 50000,
    capacity: 100,
    sold: 45
  },
  {
    id: 2,
    eventId: 1,
    name: 'Platea',
    price: 30000,
    capacity: 500,
    sold: 320
  },
  {
    id: 3,
    eventId: 1,
    name: 'General',
    price: 15000,
    capacity: 4400,
    sold: 2100
  }
]
```

---

## 🚦 Estados y Comportamientos

### Modales
- **Overlay oscuro** con click para cerrar
- **Formulario centrado** con scroll si es necesario
- **Botón X** en la esquina superior derecha
- **Validación antes de enviar**

### Mensajes al Usuario
- **Confirmaciones:** Diálogos nativos del navegador
- **Validaciones:** Campos requeridos marcados
- **Feedback visual:** Botones deshabilitados cuando corresponde

---

## 📱 Accesibilidad

- **Navegación por teclado:** Enter para enviar formularios
- **Etiquetas claras:** Labels descriptivos en todos los campos
- **Contraste:** Colores con buena legibilidad
- **Responsive:** Adaptable a diferentes dispositivos
- **Iconos intuitivos:** Emojis y símbolos reconocibles

---

## 🎯 Casos de Uso

### Caso 1: Crear Evento Musical
```
1. Admin inicia sesión
2. Va a "Eventos"
3. Click "➕ Nuevo Evento"
4. Completa:
   - Nombre: "Festival de Jazz 2025"
   - Categoría: Festival
   - Fecha: 2025-11-20
   - Aforo: 3000
5. Guarda evento
6. Va a "Tipos de Ticket"
7. Crea 3 tipos: VIP ($80.000), Preferente ($50.000), General ($30.000)
```

### Caso 2: Modificar Aforo por Demanda
```
1. Admin revisa estadísticas
2. Ve que VIP está 95% ocupado
3. Edita tipo VIP
4. Aumenta aforo de 100 a 150
5. Guarda cambios
6. Verifica nueva ocupación en estadísticas
```

### Caso 3: Cancelar Evento
```
1. Admin localiza evento
2. Click "🗑️ Eliminar"
3. Confirma eliminación
4. Sistema elimina evento y todos sus tipos de ticket
5. Estadísticas se actualizan automáticamente
```

---

## 🔮 Próximas Mejoras Sugeridas

- [ ] Integración con backend real (MySQL)
- [ ] Sistema de notificaciones
- [ ] Exportación de reportes en PDF/Excel
- [ ] Gráficos interactivos de ventas
- [ ] Historial de cambios (auditoría)
- [ ] Búsqueda y filtros avanzados
- [ ] Clonación de eventos
- [ ] Templates de eventos recurrentes
- [ ] Sistema de roles más granular
- [ ] Módulo de promociones y descuentos

---

## 📞 Soporte

Para problemas o consultas sobre el panel de administrador:
- Revisar esta guía
- Consultar el código fuente en `src/views/AdminPanel.vue`
- Verificar el authStore en `src/stores/authStore.js`
- Revisar las rutas en `src/router/index.js`

---

## ✅ Checklist de Implementación HU5

- [x] Login unificado para operadores y administradores
- [x] Panel de administrador con 3 pestañas
- [x] CRUD completo de eventos
- [x] CRUD completo de tipos de ticket
- [x] Control de aforo por tipo de ticket
- [x] Cálculo automático de estadísticas
- [x] Dashboard con métricas clave
- [x] Tabla de reportes detallados
- [x] Guards de navegación por rol
- [x] Sesiones persistentes (24h)
- [x] Diseño responsive
- [x] Validaciones de formularios
- [x] Persistencia en localStorage
- [x] Actualización automática de precios mínimos
- [x] Barras de progreso de ocupación

---

**Fecha de Creación:** Octubre 2025  
**Versión:** 1.0  
**Autor:** Sistema TicketVue - Ingeniería de Software
