/**
 * Servicio de Auditoría para Validaciones de Tickets
 * Registra todas las operaciones para seguridad y análisis
 */

export class AuditService {
  
  /**
   * Registra una validación de ticket (localStorage Y base de datos)
   */
  static async logValidation(ticketCode, operator, success, details = {}) {
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
        validationType: details.validationType || 'manual' // 'qr', 'manual', 'rut'
      }
    }

    audits.push(auditEntry)

    // Mantener solo los últimos 1000 registros para no sobrecargar localStorage
    if (audits.length > 1000) {
      audits.splice(0, audits.length - 1000)
    }

    localStorage.setItem('scanAudits', JSON.stringify(audits))
    
    console.log('📋 Auditoría registrada (local):', auditEntry)
    
    // NUEVO: También registrar en la base de datos
    try {
      await this.logToDatabase(auditEntry);
    } catch (error) {
      console.error('⚠️ Error al registrar en BD:', error);
      // No fallar si el registro en BD falla, el localStorage es backup
    }
    
    return auditEntry
  }

  /**
   * Registra la auditoría en la base de datos
   */
  static async logToDatabase(auditEntry) {
    try {
      const ticketInfo = auditEntry.details.ticketInfo;
      
      const payload = {
        ticket_code: auditEntry.ticketCode,
        operator_name: auditEntry.operator,
        operator_email: localStorage.getItem('userEmail') || null,
        validation_result: auditEntry.success ? 'approved' : 'rejected',
        validation_type: auditEntry.details.validationType || 'manual',
        event_id: ticketInfo?.eventoId || null,
        event_name: ticketInfo?.evento || null,
        ticket_type: ticketInfo?.tipo || null,
        ticket_category: this.categorizeTicket(ticketInfo?.tipo),
        user_name: ticketInfo?.nombre || null,
        user_rut: ticketInfo?.rut || null,
        message: auditEntry.details.message,
        rejection_reason: auditEntry.success ? null : auditEntry.details.message,
        fraud_detected: auditEntry.details.fraudDetected || false,
        metadata: {
          deviceInfo: auditEntry.deviceFingerprint,
          localAuditId: auditEntry.id
        },
        timestamp: new Date(auditEntry.timestamp)
      };

      const response = await fetch('/api/audit/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('✅ Auditoría guardada en base de datos');
      } else {
        console.warn('⚠️ No se pudo guardar en BD:', await response.text());
      }
    } catch (error) {
      console.error('❌ Error al guardar auditoría en BD:', error);
      throw error;
    }
  }

  /**
   * Categoriza el tipo de ticket para estadísticas
   */
  static categorizeTicket(ticketType) {
    if (!ticketType) return 'other';
    
    const type = ticketType.toLowerCase();
    
    if (type.includes('vip')) return 'vip';
    if (type.includes('premium')) return 'premium';
    if (type.includes('general')) return 'general';
    if (type.includes('normal') || type.includes('estándar')) return 'normal';
    
    return 'other';
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
   * Obtiene el historial de auditorías desde el backend
   */
  static async getAuditHistory(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.eventId) params.append('eventId', filters.eventId);
      if (filters.operator) params.append('operator', filters.operator);
      if (filters.validationType) params.append('validationType', filters.validationType);
      if (filters.validationResult) params.append('validationResult', filters.validationResult);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await fetch(`/api/audit/logs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener historial de auditorías');
      }

      const data = await response.json();
      console.log('📊 Historial obtenido desde BD:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Error al obtener historial:', error);
      // Fallback a localStorage si falla el backend
      return this.getAuditHistoryLocal(filters);
    }
  }

  /**
   * Obtiene el historial local (fallback)
   */
  static getAuditHistoryLocal(filters = {}) {
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
    const sorted = audits.sort((a, b) => b.timestamp - a.timestamp);
    
    return {
      logs: sorted,
      pagination: {
        total: sorted.length,
        page: 1,
        totalPages: 1
      }
    };
  }

  /**
   * Obtiene estadísticas desde el backend
   */
  static async getStatistics(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.eventId) params.append('eventId', filters.eventId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/audit/stats?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
      }

      const data = await response.json();
      console.log('📈 Estadísticas obtenidas desde BD:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      // Fallback a localStorage si falla el backend
      return this.getStatisticsLocal(filters.operator);
    }
  }

  /**
   * Obtiene estadísticas locales (fallback)
   */
  static getStatisticsLocal(operator = null) {
    const audits = operator 
      ? this.getAuditHistoryLocal({ operator }).logs
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
   * Genera reporte PDF desde el backend
   */
  static async generatePDFReport(eventId, filters = {}) {
    try {
      const payload = {
        eventId,
        startDate: filters.startDate,
        endDate: filters.endDate
      };

      const response = await fetch('/api/audit/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Error al generar reporte PDF');
      }

      // Descargar el PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-auditoria-${eventId}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('✅ Reporte PDF generado y descargado');
      return true;
      
    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      throw error;
    }
  }

  /**
   * Obtiene reporte detallado de un evento
   */
  static async getEventReport(eventId) {
    try {
      const response = await fetch(`/api/audit/report/${eventId}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener reporte del evento');
      }

      const data = await response.json();
      console.log('📑 Reporte del evento obtenido:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Error al obtener reporte:', error);
      throw error;
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
