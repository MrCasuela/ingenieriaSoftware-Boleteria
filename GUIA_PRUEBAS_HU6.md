# 🚀 Guía Rápida: Probar HU6 - Reportes de Asistencia

## ✅ Implementación Completada

Se ha implementado exitosamente la **HU6: Reportes de Asistencia y Accesos** con las siguientes características:

### Funcionalidades Implementadas:
- ✅ Panel de reportes con filtros avanzados
- ✅ Estadísticas en tiempo real por evento, sector y operador
- ✅ Exportación a CSV (detallado y estadísticas)
- ✅ Exportación a PDF con reporte completo
- ✅ Actualización automática de datos

---

## 🧪 Cómo Probar

### 1. Iniciar el Sistema

```powershell
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd ..
npm run dev
```

### 2. Acceder como Administrador

1. Abrir navegador en `http://localhost:5173`
2. Navegar a `/operator/login` o hacer clic en el botón de login de operador
3. Usar credenciales de administrador:
   - **Email:** admin@boleteria.com (o el que tengas configurado)
   - **Contraseña:** la contraseña del admin

### 3. Navegar a la Pestaña de Reportes

1. En el panel de administración, verás las pestañas:
   - 🎭 Eventos
   - 🎫 Tipos de Ticket
   - 👥 Usuarios
   - **📊 Reportes** ← Click aquí
   - 📈 Estadísticas

### 4. Usar los Filtros

**Filtros disponibles:**
- **Evento:** Selecciona un evento específico o "Todos"
- **Estado:** Validados, Pagados, Pendientes, Cancelados o "Todos"
- **Sector:** Escribe el nombre del sector (ej: VIP, General)
- **Fecha Desde:** Selecciona fecha inicial
- **Fecha Hasta:** Selecciona fecha final

**Ejemplo de búsqueda:**
1. Selecciona un evento
2. Elige "Validados" en estado
3. Click en "🔍 Buscar"

### 5. Ver Estadísticas en Tiempo Real

Después de buscar, verás:
- **Total Tickets:** Cantidad total encontrada
- **Validados:** Con indicador verde
- **Pendientes:** Con indicador amarillo
- **Cancelados:** Con indicador rojo
- **Ingresos Totales:** Suma de todos los montos

### 6. Explorar las Tablas

Verás 3 tablas con datos:

**📊 Check-ins por Evento:**
- Nombre del evento
- Fecha y lugar
- Total de check-ins
- Cantidad validados
- Ingresos generados

**🎯 Check-ins por Sector:**
- Nombre del sector
- Total de check-ins
- Cantidad validados
- Ingresos

**👤 Validaciones por Operador:**
- Nombre del operador
- Total de validaciones
- Última validación realizada

### 7. Exportar Reportes

**Exportar CSV Detallado:**
1. Click en "📄 Exportar CSV (Detallado)"
2. Se descargará un archivo con todos los tickets y sus detalles
3. Abre con Excel o Google Sheets

**Exportar CSV Estadísticas:**
1. Click en "📊 Exportar CSV (Estadísticas)"
2. Se descargará un archivo con resúmenes agrupados
3. Perfecto para análisis rápidos

**Exportar PDF:**
1. Click en "📕 Exportar PDF"
2. Se generará un reporte ejecutivo completo
3. Incluye portada, estadísticas y detalles
4. Listo para presentar a gerencia

### 8. Actualizar Datos

- Click en "🔄 Actualizar" para refrescar las estadísticas
- Los datos se actualizan automáticamente desde la base de datos
- Verás el tiempo de última actualización

### 9. Limpiar Filtros

- Click en "🔄 Limpiar" para resetear todos los filtros
- Vuelve al estado inicial

---

## 🎯 Escenarios de Prueba

### Escenario 1: Reporte General
```
1. No aplicar ningún filtro
2. Click en "Buscar"
3. Ver todas las estadísticas
4. Exportar PDF
```

### Escenario 2: Reporte por Evento
```
1. Seleccionar un evento específico
2. Click en "Buscar"
3. Ver solo datos de ese evento
4. Exportar CSV detallado
```

### Escenario 3: Reporte de Validaciones
```
1. Seleccionar estado "Validados"
2. Establecer rango de fechas (última semana)
3. Click en "Buscar"
4. Ver solo tickets validados en ese período
5. Exportar CSV estadísticas
```

### Escenario 4: Análisis por Sector
```
1. Escribir nombre de sector (ej: "VIP")
2. Click en "Buscar"
3. Ver datos solo de ese sector
4. Exportar PDF
```

### Escenario 5: Rendimiento de Operadores
```
1. Seleccionar estado "Validados"
2. Click en "Buscar"
3. Revisar tabla de "Validaciones por Operador"
4. Identificar operador más activo
```

---

## 📊 Ejemplo de Datos en CSV

**CSV Detallado incluye:**
```csv
Código Ticket,Evento,Fecha Evento,Sector,Tipo Ticket,Precio,Total,Estado,Comprador,Email,Documento,Validado por,Fecha Validación,Fecha Compra
TKT-ABC123,Concierto Rock,15/11/2025,VIP,Entrada VIP,$120.00,$125.00,validated,Juan Pérez,juan@email.com,12345678-9,María López,23/10/2025 15:30,20/10/2025 10:15
```

**CSV Estadísticas incluye:**
```csv
ESTADÍSTICAS POR EVENTO
Evento,Fecha,Lugar,Total Check-ins,Validados,Ingresos
Concierto Rock,15/11/2025,Estadio Nacional,450,380,"$54,500.00"

ESTADÍSTICAS POR SECTOR
Sector,Total Check-ins,Validados,Ingresos
VIP,120,115,"$14,400.00"
General,330,265,"$16,500.00"
```

---

## 🔍 Verificación de Funcionamiento

### Backend
Verificar en la consola del backend:
```
✅ POST /api/auth/login
✅ GET /api/admin/reports/attendance
✅ GET /api/admin/reports/attendance/export/csv
✅ GET /api/admin/reports/attendance/export/pdf
```

### Frontend
Verificar en la consola del navegador:
```
🔍 Cargando reporte con filtros: {...}
✅ Reporte cargado: {...}
📄 Exportando CSV con filtros: {...}
✅ CSV exportado exitosamente
```

---

## ⚠️ Solución de Problemas

### No se cargan datos
- ✅ Verificar que estés autenticado como administrador
- ✅ Verificar que el backend esté corriendo
- ✅ Revisar la consola del navegador para errores
- ✅ Verificar que haya datos en la base de datos

### No se descarga el archivo
- ✅ Verificar que el navegador permita descargas
- ✅ Revisar la carpeta de Descargas
- ✅ Verificar la consola para errores de red

### Error 403 (Forbidden)
- ✅ Asegurarse de tener rol de administrador
- ✅ Verificar que el token sea válido
- ✅ Volver a iniciar sesión

### Error 500 (Server Error)
- ✅ Verificar logs del backend
- ✅ Verificar que la base de datos esté conectada
- ✅ Verificar que las relaciones de modelos estén correctas

---

## 📱 Responsive

La interfaz es responsive y funciona en:
- 💻 Desktop (óptimo)
- 📱 Tablet (funcional)
- 📲 Móvil (adaptado)

---

## 🎓 Tips de Uso

1. **Filtros combinados:** Puedes usar múltiples filtros a la vez
2. **Actualización frecuente:** Click en "Actualizar" para datos recientes
3. **Exportación selectiva:** Aplica filtros antes de exportar
4. **CSV vs PDF:** Usa CSV para análisis, PDF para presentaciones
5. **Rango de fechas:** Usa fechas para análisis históricos

---

## ✨ Características Destacadas

- 🚀 **Tiempo Real:** Datos actualizados al instante
- 🎨 **Visual Atractivo:** Cards coloridos y tablas organizadas
- 📥 **Múltiples Formatos:** CSV y PDF según necesidad
- 🔍 **Filtros Flexibles:** Combina múltiples criterios
- 📊 **Estadísticas Agrupadas:** Por evento, sector y operador
- 🎯 **UX Optimizada:** Interfaz intuitiva y responsive

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa la documentación completa en `HU6_REPORTES_IMPLEMENTACION.md`
2. Verifica los logs del backend y frontend
3. Asegúrate de tener los permisos correctos

---

**¡Listo para probar! 🎉**

La implementación está completa y funcional. Puedes comenzar a usar la funcionalidad de reportes inmediatamente.
