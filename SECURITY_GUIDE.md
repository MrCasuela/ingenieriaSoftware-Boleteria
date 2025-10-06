# 🔐 Guía de Seguridad - Sistema de Escaneo QR

## Resumen de Mejoras Implementadas

Este documento describe las mejoras de seguridad y eficacia implementadas en el sistema de escaneo QR del panel de operadores.

---

## 📋 Tabla de Contenidos

1. [Códigos QR Seguros](#códigos-qr-seguros)
2. [Sistema de Validación Multi-Capa](#sistema-de-validación-multi-capa)
3. [Auditoría y Trazabilidad](#auditoría-y-trazabilidad)
4. [Detección de Fraudes](#detección-de-fraudes)
5. [Feedback Mejorado](#feedback-mejorado)
6. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🎫 Códigos QR Seguros

### Formato

Los códigos QR ahora incluyen un checksum de seguridad:

```
TKT-XXXXX-XXXX
│   │     │
│   │     └─ Checksum (4 dígitos)
│   └─────── Código único (5 caracteres alfanuméricos)
└─────────── Prefijo estándar
```

### Ejemplo de Código Válido

```
TKT-A7B2C-9F4E
```

### Generación de Códigos

```javascript
import QRSecurityService from '@/services/qrSecurityService'

// Generar código seguro automáticamente
const newCode = QRSecurityService.generateSecureCode()
console.log(newCode) // Output: "TKT-K3M9P-7A2F"
```

### Validación de Formato

```javascript
const code = "TKT-A7B2C-9F4E"

// Validar formato
if (QRSecurityService.validateFormat(code)) {
  console.log("✅ Formato válido")
} else {
  console.log("❌ Formato inválido")
}

// Verificar checksum
if (QRSecurityService.verifyChecksum(code)) {
  console.log("✅ Checksum correcto")
} else {
  console.log("🚨 Código alterado o falsificado")
}
```

---

## 🛡️ Sistema de Validación Multi-Capa

### Flujo de Validación

```
Entrada del usuario
    ↓
1. Sanitización
    ↓
2. Validación de formato
    ↓
3. Verificación de checksum
    ↓
4. Control de duplicados
    ↓
5. Búsqueda en BD
    ↓
6. Validación de integridad
    ↓
7. Verificación de uso
    ↓
8. Registro de auditoría
    ↓
Resultado (válido/inválido)
```

### Ejemplo de Validación Completa

```javascript
import { useTicketStore } from '@/stores/ticketStore'
import { useAuthStore } from '@/stores/authStore'

const ticketStore = useTicketStore()
const authStore = useAuthStore()

// Validar un código QR
const code = "TKT-A7B2C-9F4E"
const operatorName = authStore.operatorName

const result = ticketStore.validateTicket(code, operatorName)

if (result.valid) {
  console.log("✅ Acceso autorizado")
  console.log("Ticket:", result.ticket)
  console.log("Mensaje:", result.message)
  
  // Marcar como usado
  ticketStore.markTicketAsUsed(code)
} else {
  console.log("❌ Acceso denegado")
  console.log("Motivo:", result.message)
  
  if (result.fraudDetected) {
    console.log("🚨 ALERTA: Posible intento de fraude")
  }
}
```

---

## 📊 Auditoría y Trazabilidad

### Registro Automático

Cada validación se registra automáticamente con:
- ID único de auditoría
- Código del ticket
- Operador que realizó la validación
- Resultado (éxito/fallo)
- Timestamp
- Información del dispositivo
- Detalles adicionales (tipo de validación, fraude detectado, etc.)

### Consultar Historial

```javascript
import AuditService from '@/services/auditService'

// Obtener todo el historial
const allAudits = AuditService.getAuditHistory()

// Filtrar por operador
const operatorAudits = AuditService.getAuditHistory({
  operator: 'operador1'
})

// Filtrar por fecha
const todayAudits = AuditService.getAuditHistory({
  startDate: new Date().toISOString().split('T')[0]
})

// Solo validaciones exitosas
const successfulScans = AuditService.getAuditHistory({
  success: true
})
```

### Estadísticas

```javascript
// Estadísticas globales
const stats = AuditService.getStatistics()
console.log(stats)
/*
{
  total: 150,
  successful: 140,
  failed: 10,
  fraudAttempts: 2,
  successRate: "93.33",
  lastHour: 25,
  lastDay: 150
}
*/

// Estadísticas por operador
const operatorStats = AuditService.getStatistics('operador1')
```

### Métricas de Rendimiento

```javascript
// Obtener métricas de un operador
const metrics = AuditService.getOperatorMetrics('operador1')
console.log(metrics)
/*
{
  operator: "operador1",
  totalValidations: 85,
  successfulValidations: 80,
  failedValidations: 5,
  successRate: "94.12",
  averageTimeBetweenScans: 45, // segundos
  firstScan: "5/10/2025, 10:00:00",
  lastScan: "5/10/2025, 15:30:00"
}
*/
```

### Exportar Datos

```javascript
// Exportar a CSV
const csv = AuditService.exportToCSV()

// Descargar archivo
const blob = new Blob([csv], { type: 'text/csv' })
const url = window.URL.createObjectURL(blob)
const link = document.createElement('a')
link.href = url
link.download = `auditoria_${new Date().toISOString()}.csv`
link.click()
```

---

## 🚨 Detección de Fraudes

### Tipos de Fraude Detectados

1. **Códigos Falsificados**
   - Checksum inválido
   - Formato incorrecto
   - Códigos que no existen en la BD

2. **Intentos de Reutilización**
   - Mismo código escaneado múltiples veces en 5 minutos
   - Tickets ya marcados como usados

3. **Datos Inconsistentes**
   - Fechas de compra futuras
   - Tickets muy antiguos (>1 año)
   - Fechas de uso antes de la compra

4. **Actividad Sospechosa**
   - Múltiples intentos fallidos (>5)
   - Alta tasa de fallos de un operador

### Detección de Duplicados

```javascript
import QRSecurityService from '@/services/qrSecurityService'

const code = "TKT-A7B2C-9F4E"
const duplicateCheck = QRSecurityService.checkRecentScans(code)

if (duplicateCheck.isDuplicate) {
  console.log(`⚠️ Código escaneado hace ${duplicateCheck.timeSinceLastScan}s`)
  console.log(`Por operador: ${duplicateCheck.operator}`)
} else {
  console.log("✅ Primera vez escaneado en los últimos 5 minutos")
}
```

### Reportes de Actividad Sospechosa

```javascript
const suspicious = AuditService.getSuspiciousActivity()

console.log(suspicious)
/*
[
  {
    type: "MULTIPLE_FAILED_ATTEMPTS",
    ticketCode: "TKT-INVALID",
    attempts: { success: 0, failed: 8 },
    severity: "HIGH"
  },
  {
    type: "FRAUD_DETECTED",
    count: 3,
    cases: [
      {
        ticketCode: "TKT-FAKE1-XXXX",
        operator: "operador1",
        timestamp: "2025-10-05T14:30:00.000Z"
      }
    ],
    severity: "CRITICAL"
  }
]
*/
```

### Análisis de Patrones

```javascript
const activity = QRSecurityService.detectSuspiciousActivity(
  "TKT-TEST-1234",
  "operador1"
)

if (activity.suspicious) {
  console.log("🚨 Actividad sospechosa detectada")
  console.log(`Intentos fallidos: ${activity.failedAttempts}`)
  console.log(`Tasa de fallos: ${activity.failureRate.toFixed(2)}%`)
}
```

---

## 📱 Feedback Mejorado

### Feedback Visual

Los resultados de validación ahora muestran:
- ✅ **Verde** con ícono de checkmark para éxitos
- ❌ **Rojo** con ícono de cruz para errores
- 🚨 **Rojo parpadeante** con ícono de alerta para fraudes

### Feedback Sonoro

```javascript
// Reproducir sonido de éxito
playSuccessSound()

// Reproducir sonido de error
playErrorSound()
```

### Feedback Táctil (Vibración)

```javascript
// Vibración simple (éxito)
vibrateDevice([100]) // 100ms

// Vibración doble (error)
vibrateDevice([200, 100, 200]) // 200ms, pausa 100ms, 200ms

// Vibración múltiple (fraude)
vibrateDevice([200, 100, 200, 100, 200]) // Patrón de alarma
```

### Implementación Completa

```javascript
const showValidationResult = (isValid, isFraud, message) => {
  if (isValid) {
    // Éxito
    playSuccessSound()
    vibrateDevice([100])
    showModal('✅ Ticket Válido', message, 'success')
  } else if (isFraud) {
    // Fraude detectado
    playErrorSound()
    vibrateDevice([200, 100, 200, 100, 200])
    showModal('🚨 ALERTA DE FRAUDE', message, 'danger')
  } else {
    // Error normal
    playErrorSound()
    vibrateDevice([200, 100, 200])
    showModal('❌ Error de Validación', message, 'error')
  }
}
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Validación Manual con Auditoría

```javascript
import { ref } from 'vue'
import { useTicketStore } from '@/stores/ticketStore'
import { useAuthStore } from '@/stores/authStore'
import AuditService from '@/services/auditService'

const ticketStore = useTicketStore()
const authStore = useAuthStore()
const manualInput = ref('')

const validateManualTicket = () => {
  const code = manualInput.value.trim()
  
  if (!code) return
  
  // Validar
  const result = ticketStore.validateTicket(code, authStore.operatorName)
  
  // Registrar en auditoría
  AuditService.logValidation(
    code,
    authStore.operatorName,
    result.valid,
    {
      message: result.message,
      ticketInfo: result.ticket,
      fraudDetected: result.fraudDetected || false,
      validationType: 'manual'
    }
  )
  
  // Mostrar resultado
  if (result.valid) {
    ticketStore.markTicketAsUsed(code)
    showSuccessFeedback(result)
  } else {
    showErrorFeedback(result)
  }
  
  manualInput.value = ''
}
```

### Ejemplo 2: Generación de Código Seguro al Comprar

```javascript
import QRSecurityService from '@/services/qrSecurityService'

const processPayment = async () => {
  // ... validar datos de compra ...
  
  // Generar código QR seguro
  const ticketCode = QRSecurityService.generateSecureCode()
  
  // Guardar ticket con código seguro
  const ticket = {
    codigo: ticketCode, // TKT-A7B2C-9F4E
    nombre: formData.name,
    email: formData.email,
    // ... otros datos ...
  }
  
  saveTicket(ticket)
  
  return ticketCode
}
```

### Ejemplo 3: Dashboard de Seguridad

```javascript
import { onMounted, ref } from 'vue'
import AuditService from '@/services/auditService'

const stats = ref({})
const suspicious = ref([])
const recentAudits = ref([])

onMounted(() => {
  // Cargar estadísticas
  stats.value = AuditService.getStatistics()
  
  // Cargar actividad sospechosa
  suspicious.value = AuditService.getSuspiciousActivity()
  
  // Cargar auditorías recientes
  recentAudits.value = AuditService.getAuditHistory().slice(0, 10)
  
  // Actualizar cada 30 segundos
  setInterval(() => {
    stats.value = AuditService.getStatistics()
    suspicious.value = AuditService.getSuspiciousActivity()
  }, 30000)
})
```

---

## 🔧 Mantenimiento

### Limpieza de Datos Antiguos

```javascript
// Ejecutar periódicamente para mantener el rendimiento
const cleanOldData = () => {
  // Limpiar auditorías mayores a 30 días
  const deleted = AuditService.cleanOldAudits()
  console.log(`${deleted} registros antiguos eliminados`)
  
  // Limpiar escaneos recientes (se hace automáticamente)
  // Solo se mantienen los últimos 5 minutos
}

// Ejecutar al iniciar la aplicación o diariamente
cleanOldData()
```

### Verificar Integridad del Sistema

```javascript
import QRSecurityService from '@/services/qrSecurityService'

const verifySystemIntegrity = () => {
  const tickets = JSON.parse(localStorage.getItem('purchasedTickets') || '[]')
  const issues = []
  
  tickets.forEach(ticket => {
    // Verificar cada ticket
    const integrity = QRSecurityService.validateIntegrity(ticket)
    if (!integrity.valid) {
      issues.push({
        code: ticket.codigo,
        reason: integrity.reason
      })
    }
  })
  
  if (issues.length > 0) {
    console.warn('⚠️ Se encontraron problemas de integridad:', issues)
  } else {
    console.log('✅ Todos los tickets son válidos')
  }
  
  return issues
}
```

---

## 📚 Referencias

### Servicios Implementados

- `src/services/qrSecurityService.js` - Seguridad y validación de QR
- `src/services/auditService.js` - Auditoría y análisis

### Stores Actualizados

- `src/stores/ticketStore.js` - Integración con servicios de seguridad
- `src/stores/authStore.js` - Gestión de sesiones de operadores

### Componentes Actualizados

- `src/views/OperatorPanel.vue` - Panel mejorado con todas las funcionalidades

---

## ✅ Checklist de Seguridad

- [x] Códigos QR con checksum
- [x] Validación de formato
- [x] Verificación de integridad
- [x] Control de duplicados
- [x] Registro de auditoría
- [x] Detección de fraudes
- [x] Feedback visual/sonoro/táctil
- [x] Sanitización de entradas
- [x] Encriptación de sesiones
- [x] Fingerprinting de dispositivos
- [x] Análisis de patrones sospechosos
- [x] Reportes de seguridad
- [x] Exportación de auditorías
- [x] Limpieza automática de datos antiguos

---

**Última actualización:** 5 de Octubre, 2025
**Versión del sistema:** 2.0.0
