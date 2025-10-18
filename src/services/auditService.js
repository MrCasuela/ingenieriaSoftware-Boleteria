/**
 * Servicio de Auditoría para Validaciones de Tickets
 * Registra todas las operaciones para seguridad y análisis
 */

export class AuditService {
  
  /**
   * Registra una validación de ticket
   */
  static logValidation(ticketCode, operator, success, details = {}) {
    const audits = JSON.parse(localStorage.getItem('scanAudits') || '[]')
    
    const auditEntry = {
      id: this.generateAuditId(),
      ticketCode,
      operator,
      success,
      timestamp: Date.now(),
      datetime: new Date().toISOString(),
      deviceFingerprint: this.getDeviceInfo(),
      details: {
        message: details.message || '',
        ticketInfo: details.ticketInfo || null,
        fraudDetected: details.fraudDetected || false,
        validationType: details.validationType || 'manual' // 'qr' o 'manual'
      }
    }

    audits.push(auditEntry)

    // Mantener solo los últimos 1000 registros para no sobrecargar localStorage
    if (audits.length > 1000) {
      audits.splice(0, audits.length - 1000)
    }

    localStorage.setItem('scanAudits', JSON.stringify(audits))
    
    console.log('📋 Auditoría registrada:', auditEntry)
    
    return auditEntry
  }

  /**
   * Genera un ID único para el registro de auditoría
   */
  static generateAuditId() {
    return `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
  }

  /**
   * Obtiene información del dispositivo
   */
  static getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`
    }
  }

  /**
   * Obtiene el historial de auditorías
   */
  static getAuditHistory(filters = {}) {
    let audits = JSON.parse(localStorage.getItem('scanAudits') || '[]')

    // Aplicar filtros
    if (filters.operator) {
      audits = audits.filter(a => a.operator === filters.operator)
    }

    if (filters.success !== undefined) {
      audits = audits.filter(a => a.success === filters.success)
    }

    if (filters.startDate) {
      const startTime = new Date(filters.startDate).getTime()
      audits = audits.filter(a => a.timestamp >= startTime)
    }

    if (filters.endDate) {
      const endTime = new Date(filters.endDate).getTime()
      audits = audits.filter(a => a.timestamp <= endTime)
    }

    // Ordenar por timestamp descendente (más reciente primero)
    return audits.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Obtiene estadísticas de validaciones
   */
  static getStatistics(operator = null) {
    const audits = operator 
      ? this.getAuditHistory({ operator })
      : JSON.parse(localStorage.getItem('scanAudits') || '[]')

    const total = audits.length
    const successful = audits.filter(a => a.success).length
    const failed = total - successful
    const fraudAttempts = audits.filter(a => a.details.fraudDetected).length

    // Estadísticas por hora
    const now = Date.now()
    const lastHour = audits.filter(a => now - a.timestamp < 3600000).length
    const lastDay = audits.filter(a => now - a.timestamp < 86400000).length

    return {
      total,
      successful,
      failed,
      fraudAttempts,
      successRate: total > 0 ? ((successful / total) * 100).toFixed(2) : 0,
      lastHour,
      lastDay
    }
  }

  /**
   * Genera un reporte de actividad sospechosa
   */
  static getSuspiciousActivity() {
    const audits = JSON.parse(localStorage.getItem('scanAudits') || '[]')
    const suspicious = []

    // Detectar múltiples intentos fallidos del mismo código
    const codeAttempts = {}
    audits.forEach(audit => {
      if (!codeAttempts[audit.ticketCode]) {
        codeAttempts[audit.ticketCode] = { success: 0, failed: 0 }
      }
      if (audit.success) {
        codeAttempts[audit.ticketCode].success++
      } else {
        codeAttempts[audit.ticketCode].failed++
      }
    })

    // Códigos con múltiples intentos fallidos
    Object.keys(codeAttempts).forEach(code => {
      if (codeAttempts[code].failed >= 3) {
        suspicious.push({
          type: 'MULTIPLE_FAILED_ATTEMPTS',
          ticketCode: code,
          attempts: codeAttempts[code],
          severity: 'HIGH'
        })
      }
    })

    // Detectar fraudes registrados
    const frauds = audits.filter(a => a.details.fraudDetected)
    if (frauds.length > 0) {
      suspicious.push({
        type: 'FRAUD_DETECTED',
        count: frauds.length,
        cases: frauds.map(f => ({
          ticketCode: f.ticketCode,
          operator: f.operator,
          timestamp: f.datetime
        })),
        severity: 'CRITICAL'
      })
    }

    return suspicious
  }

  /**
   * Exporta los registros de auditoría como CSV
   */
  static exportToCSV() {
    const audits = JSON.parse(localStorage.getItem('scanAudits') || '[]')
    
    const headers = ['ID', 'Fecha/Hora', 'Código Ticket', 'Operador', 'Éxito', 'Mensaje', 'Tipo Validación']
    const rows = audits.map(audit => [
      audit.id,
      audit.datetime,
      audit.ticketCode,
      audit.operator,
      audit.success ? 'Sí' : 'No',
      audit.details.message,
      audit.details.validationType
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csv
  }

  /**
   * Limpia registros antiguos (más de 30 días)
   */
  static cleanOldAudits() {
    const audits = JSON.parse(localStorage.getItem('scanAudits') || '[]')
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    
    const recentAudits = audits.filter(audit => audit.timestamp > thirtyDaysAgo)
    
    localStorage.setItem('scanAudits', JSON.stringify(recentAudits))
    
    return audits.length - recentAudits.length // Cantidad de registros eliminados
  }

  /**
   * Obtiene métricas de rendimiento del operador
   */
  static getOperatorMetrics(operator) {
    const audits = this.getAuditHistory({ operator })
    
    if (audits.length === 0) {
      return null
    }

    const validations = audits.length
    const successful = audits.filter(a => a.success).length
    const avgTimePerScan = this.calculateAverageTimeBetweenScans(audits)

    return {
      operator,
      totalValidations: validations,
      successfulValidations: successful,
      failedValidations: validations - successful,
      successRate: ((successful / validations) * 100).toFixed(2),
      averageTimeBetweenScans: avgTimePerScan,
      firstScan: new Date(audits[audits.length - 1].timestamp).toLocaleString(),
      lastScan: new Date(audits[0].timestamp).toLocaleString()
    }
  }

  /**
   * Calcula el tiempo promedio entre escaneos
   */
  static calculateAverageTimeBetweenScans(audits) {
    if (audits.length < 2) return 0

    let totalTime = 0
    for (let i = 0; i < audits.length - 1; i++) {
      totalTime += audits[i].timestamp - audits[i + 1].timestamp
    }

    const avgMs = totalTime / (audits.length - 1)
    return Math.round(avgMs / 1000) // Retornar en segundos
  }
}

export default AuditService
