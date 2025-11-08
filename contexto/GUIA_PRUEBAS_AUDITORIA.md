# 🧪 GUÍA DE PRUEBAS - Sistema de Auditoría y Reportes

## ✅ Verificación Rápida del Sistema

### 1️⃣ Verificar que los contenedores están corriendo
```bash
docker ps
```
**Deberías ver:**
- `ticketvue-frontend` - Estado: Up (healthy)
- `ticketvue-backend` - Estado: Up (healthy)
- `ticketvue-mysql` - Estado: Up (healthy)

---

### 2️⃣ Verificar datos en la base de datos
```bash
docker exec ticketvue-mysql mysql -u ticketuser -pticketpass ticketvue -e "SELECT COUNT(*) as total_registros FROM audit_logs;"
```
**Resultado esperado:** Al menos 13 registros

---

### 3️⃣ Probar endpoints del backend

#### Estadísticas
```bash
curl http://localhost:3000/api/audit/stats | jq
```
**Deberías ver:**
```json
{
  "success": true,
  "stats": {
    "total": 13,
    "frauds": 2,
    "byResult": [...],
    "byType": [...],
    "byCategory": [...]
  }
}
```

#### Logs
```bash
curl http://localhost:3000/api/audit/logs | jq '.data | length'
```
**Resultado esperado:** Número mayor a 0

#### PDF
```bash
curl -X POST http://localhost:3000/api/audit/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"eventId": 1}' \
  -o test-pdf.pdf && file test-pdf.pdf
```
**Resultado esperado:** `test-pdf.pdf: PDF document, version 1.3, 2 page(s)`

---

## 🌐 Pruebas en el Navegador

### Paso 1: Acceder al Panel de Administrador
1. Abrir navegador y ir a: **http://localhost/admin/panel**
2. Iniciar sesión con:
   - **Email:** `carlos@ticketvue.com`
   - **Contraseña:** `carlos123`

### Paso 2: Verificar Pestaña de Estadísticas
1. Hacer clic en **"📈 Estadísticas"**
2. Verificar que muestre:
   - Total Eventos (debe ser > 0)
   - Tipos de Ticket (debe ser > 0)
   - Aforo Total
   - Ingresos Potenciales

3. **Probar descarga de PDF:**
   - Hacer clic en **"📄 Descargar Reporte PDF"**
   - Debe aparecer un modal
   - Seleccionar un evento del dropdown
   - Hacer clic en **"📥 Descargar PDF"**
   - ✅ Debe descargarse un archivo PDF

### Paso 3: Verificar Pestaña de Historial
1. Hacer clic en **"📋 Historial"**
2. **Verificar Estadísticas Generales:**
   - ✅ Validaciones Exitosas (debe ser > 0)
   - ❌ Validaciones Rechazadas (debe ser > 0)
   - ⚠️ Errores (debe ser > 0)
   - 🚨 Fraudes Detectados (debe ser > 0)

3. **Verificar Desglose:**
   - Por Tipo de Validación (QR, Manual, RUT)
   - Por Categoría de Ticket (Normal, VIP, General, Premium)

4. **Verificar Tabla de Registros:**
   - Debe mostrar al menos 13 filas
   - Cada fila debe tener:
     - Fecha/Hora
     - Código de Ticket
     - Operador
     - Evento
     - Tipo (con badge de color)
     - Categoría (con badge de color)
     - Resultado (con badge de color)
     - Mensaje

5. **Probar Filtros:**
   - Filtrar por Evento: Seleccionar "Concierto de Rock 2025"
   - Hacer clic en **"🔍 Buscar"**
   - Los resultados deben filtrarse
   - Hacer clic en **"🗑️ Limpiar Filtros"**
   - Todos los registros deben reaparecer

6. **Probar Botón de PDF:**
   - Hacer clic en **"📄 Generar Reporte PDF"**
   - ✅ Debe descargarse un PDF con el historial completo

### Paso 4: Probar Creación de Registro desde Operador
1. **Cerrar sesión** del panel de administrador
2. Ir a: **http://localhost/operador/login**
3. Iniciar sesión como operador:
   - **Email:** `pedro.operador@ticketvue.com`
   - **Contraseña:** `pedro123`

4. En el panel de operador:
   - Validar un ticket (escanear QR o ingresar código)
   - ✅ Debe registrarse la validación

5. **Volver al panel de administrador**
   - Ir a **"📋 Historial"**
   - Hacer clic en **"🔄 Actualizar"**
   - ✅ El nuevo registro debe aparecer

---

## 🐛 Checklist de Problemas Resueltos

### ✅ Problema 1: Error al generar PDF
- **Antes:** `Error: Table 'ticketvue.audit_logs' doesn't exist`
- **Ahora:** PDF se genera correctamente

**Verificación:**
```bash
curl -X POST http://localhost:3000/api/audit/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"eventId": 1}' -o test.pdf && echo "✅ OK"
```

### ✅ Problema 2: Historial vacío o con pocos datos
- **Antes:** 0-2 registros
- **Ahora:** 13+ registros con datos realistas

**Verificación:**
```bash
curl http://localhost:3000/api/audit/logs | jq '.data | length'
```
Debe retornar: `13` o más

### ✅ Problema 3: Registros con poca información
- **Antes:** Muchos campos N/A
- **Ahora:** Registros completos con:
  - Código de ticket
  - Nombre del operador
  - Email del operador
  - Evento asociado
  - Tipo de validación
  - Resultado
  - Categoría de ticket
  - Mensaje descriptivo
  - Datos del usuario

**Verificación:**
```bash
curl http://localhost:3000/api/audit/logs?limit=1 | jq '.data[0]'
```
Todos los campos deben tener valores (no null)

---

## 📊 Datos de Prueba Disponibles

### Eventos
- **ID 1:** Concierto de Rock 2025
- **ID 2:** Obra de Teatro: Hamlet
- **ID 3:** Festival de Música Electrónica

### Operadores de Prueba
- **Carlos Administrador** (carlos@ticketvue.com)
- **Pedro Operador** (pedro.operador@ticketvue.com)
- **Ana Operadora** (ana.operadora@ticketvue.com)

### Tipos de Validación
- **QR:** 6 registros
- **Manual:** 4 registros
- **RUT:** 2 registros

### Resultados
- **Aprobados:** 9 registros
- **Rechazados:** 3 registros
- **Errores:** 1 registro

### Categorías
- **Normal:** Varios
- **VIP:** Varios
- **General:** Varios
- **Premium:** Varios

---

## 🎯 Resultado Esperado Final

Al completar todas las pruebas, deberías poder:

1. ✅ Ver estadísticas completas y actualizadas
2. ✅ Ver historial de auditoría con múltiples registros
3. ✅ Generar y descargar PDFs desde dos ubicaciones:
   - Pestaña de Estadísticas (modal con selección de evento)
   - Pestaña de Historial (botón directo con filtros aplicados)
4. ✅ Filtrar registros por:
   - Evento
   - Tipo de validación
   - Resultado
   - Operador
   - Rango de fechas
5. ✅ Crear nuevos registros desde el panel de operador
6. ✅ Ver registros detallados con toda la información

---

## 🆘 Si algo no funciona

### El backend no responde
```bash
docker logs ticketvue-backend --tail 50
docker restart ticketvue-backend
```

### La tabla no existe
```bash
docker exec -i ticketvue-mysql mysql -u ticketuser -pticketpass ticketvue < backend/migrations/create-audit-logs-table.sql
```

### No hay datos
```bash
docker exec -i ticketvue-mysql mysql -u ticketuser -pticketpass ticketvue < backend/migrations/insert-audit-sample-data.sql
```

### El frontend no muestra datos
1. Abrir consola del navegador (F12)
2. Ver pestaña Network
3. Verificar que las peticiones a `/api/audit/*` retornen status 200
4. Ver pestaña Console para errores de JavaScript

---

**¡Listo para usar!** 🚀

Fecha: 8 de Noviembre de 2025
