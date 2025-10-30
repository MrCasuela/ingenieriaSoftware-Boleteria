# Generación de Reportes PDF de Auditoría

## 📊 Descripción

El sistema incluye un endpoint para generar reportes PDF profesionales con el historial de validaciones y accesos de un evento específico. El PDF incluye estadísticas detalladas, información del evento y un listado completo de todas las validaciones registradas.

## 🚀 Endpoint

### Generar Reporte PDF

```http
POST /api/audit/generate-pdf
Content-Type: application/json
```

#### Parámetros del Body

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `eventId` | Number | ✅ Sí | ID del evento para el cual generar el reporte |
| `startDate` | String (ISO 8601) | ❌ No | Fecha inicial del período a reportar (ej: "2025-10-01") |
| `endDate` | String (ISO 8601) | ❌ No | Fecha final del período a reportar (ej: "2025-10-31") |
| `action` | String | ❌ No | Filtrar por tipo de acción específica |

#### Ejemplo de Solicitud

```json
{
  "eventId": 1,
  "startDate": "2025-10-01",
  "endDate": "2025-10-31"
}
```

#### Respuesta Exitosa

- **Status Code:** `200 OK`
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="reporte-auditoria-{nombre-evento}-{timestamp}.pdf"`

El navegador descargará automáticamente el archivo PDF generado.

#### Errores Posibles

| Status Code | Mensaje | Descripción |
|-------------|---------|-------------|
| `400 Bad Request` | "El ID del evento es requerido" | No se proporcionó el `eventId` |
| `404 Not Found` | "Evento no encontrado" | El evento con el `eventId` especificado no existe |
| `404 Not Found` | "No se encontraron registros de auditoría" | No hay datos para generar el reporte |
| `500 Internal Server Error` | "Error al generar reporte PDF" | Error interno del servidor |

## 📄 Contenido del PDF

El PDF generado incluye las siguientes secciones:

### 1. Encabezado
- Título del reporte
- Nombre del evento
- Ubicación y fecha del evento

### 2. Información del Reporte
- Fecha de generación
- Total de registros incluidos
- Período de análisis (si se aplicaron filtros de fecha)
- Filtros aplicados

### 3. Estadísticas Generales

#### Validaciones
- ✓ **Aprobadas**: Cantidad de validaciones exitosas
- ✗ **Rechazadas**: Cantidad de validaciones fallidas
- **Total**: Suma total de validaciones

#### Tipo de Registro
- **QR Scanner**: Validaciones mediante código QR
- **Manual**: Validaciones mediante ingreso manual del código

#### Categorías
- **Normal**: Cantidad de entradas normales validadas
- **VIP**: Cantidad de entradas VIP validadas

### 4. Detalle de Registros

Tabla con todos los registros de auditoría que incluye:
- **Fecha**: Día de la validación
- **Hora**: Hora exacta de la validación
- **Acción**: Tipo de acción realizada (Validación, Creación, etc.)
- **Resultado**: Aprobado/Rechazado
- **Método**: QR Scan / Manual / RUT
- **Categoría**: Normal / VIP / Premium

### 5. Pie de Página
- Información de copyright
- Sistema TicketVue

## 💻 Ejemplo de Uso

### Desde JavaScript/Frontend

```javascript
async function descargarReportePDF(eventId) {
  try {
    const response = await fetch('http://localhost:3000/api/audit/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eventId: eventId,
        startDate: '2025-10-01',
        endDate: '2025-10-31'
      })
    });

    if (response.ok) {
      // Obtener el blob del PDF
      const blob = await response.blob();
      
      // Crear URL del blob
      const url = window.URL.createObjectURL(blob);
      
      // Crear link temporal y hacer click para descargar
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-auditoria-evento-${eventId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Liberar memoria
      window.URL.revokeObjectURL(url);
      
      console.log('✅ PDF descargado exitosamente');
    } else {
      const error = await response.json();
      console.error('❌ Error:', error.message);
    }
  } catch (error) {
    console.error('❌ Error al descargar PDF:', error);
  }
}

// Uso
descargarReportePDF(1);
```

### Desde cURL (Línea de Comandos)

```bash
curl -X POST http://localhost:3000/api/audit/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"eventId": 1}' \
  --output reporte-auditoria.pdf
```

### Desde PowerShell

```powershell
$body = @{
    eventId = 1
    startDate = "2025-10-01"
    endDate = "2025-10-31"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/audit/generate-pdf" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body `
  -OutFile "reporte-auditoria.pdf"
```

## 🔧 Configuración Técnica

### Dependencias
- **pdfkit**: Generación de documentos PDF
- **qrcode**: Generación de códigos QR (para tickets)

### Columnas de Base de Datos Requeridas

La tabla `audit_logs` debe tener las siguientes columnas:
- `id`, `ticket_code`, `operator_name`, `operator_email`
- `validation_result`, `validation_type`, `event_id`, `event_name`
- `ticket_type`, `ticket_category`, `user_name`, `user_rut`
- `message`, `rejection_reason`, `fraud_detected`, `metadata`
- `ip_address`, `user_agent`, `timestamp`
- `created_at`, `updated_at`

### Archivos Involucrados

```
backend/
├── src/
│   ├── controllers/
│   │   └── auditController.js      # Controlador que maneja la generación
│   ├── services/
│   │   └── pdfService.js            # Servicio de generación de PDF
│   └── routes/
│       └── auditRoutes.js           # Definición de rutas
```

## 📋 Notas Importantes

1. **Límite de Registros**: El endpoint recupera hasta 5000 registros de auditoría por solicitud
2. **Formato de Fechas**: Las fechas deben estar en formato ISO 8601 (YYYY-MM-DD)
3. **Tamaño del PDF**: El tamaño depende de la cantidad de registros (aprox. 3-5KB por página)
4. **Performance**: La generación es sincrónica y puede tomar unos segundos para eventos grandes
5. **Codificación**: El PDF usa fuentes estándar (Helvetica) y soporte completo para caracteres especiales

## 🎨 Personalización

El diseño del PDF puede personalizarse editando el archivo `backend/src/services/pdfService.js`:

- **Colores**: Definidos en las variables `primaryColor`, `textColor`, etc.
- **Fuentes**: Helvetica, Helvetica-Bold (fuentes estándar de PDF)
- **Tamaño de Página**: A4 (595 x 842 puntos)
- **Márgenes**: 50 puntos en todos los lados

## ✅ Verificación

Para verificar que el endpoint funciona correctamente:

1. Asegúrate de que el evento existe en la base de datos
2. Verifica que existan registros de auditoría para ese evento
3. Revisa que todas las columnas requeridas existan en la tabla `audit_logs`
4. Confirma que el servicio backend esté corriendo en el puerto 3000

## 📧 Soporte

Si encuentras problemas al generar el PDF:
- Revisa los logs del backend con: `docker logs ticketvue-backend`
- Verifica la estructura de la tabla `audit_logs` en MySQL
- Confirma que el `eventId` proporcionado sea válido

---

**Última actualización**: Octubre 2025
**Versión del Sistema**: 1.0
