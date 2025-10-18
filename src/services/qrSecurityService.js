/**
 * Servicio de Seguridad para Códigos QR
 * Proporciona validación, encriptación y detección de fraudes
 */

export class QRSecurityService {
  
  /**
   * Genera un checksum simple para validar integridad del código
   */
  static generateChecksum(data) {
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convertir a entero de 32 bits
    }
    return Math.abs(hash).toString(36).toUpperCase().substring(0, 4)
  }

  /**
   * Valida el formato del código QR
   * Formato esperado: TKT-XXXXX-CHECKSUM
   */
  static validateFormat(code) {
    // Patrón: TKT-seguido de 5 caracteres alfanuméricos-seguido de checksum de 4 caracteres
    const pattern = /^TKT-[A-Z0-9]{5}-[A-Z0-9]{4}$/
    return pattern.test(code)
  }

  /**
   * Verifica el checksum de un código QR
   */
  static verifyChecksum(code) {
    if (!this.validateFormat(code)) {
      return false
    }

    const parts = code.split('-')
    const baseCode = `${parts[0]}-${parts[1]}` // TKT-XXXXX
    const providedChecksum = parts[2]
    const calculatedChecksum = this.generateChecksum(baseCode)

    return providedChecksum === calculatedChecksum
  }

  /**
   * Genera un código QR seguro con checksum
   */
  static generateSecureCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'TKT-'
    
    // Generar 5 caracteres aleatorios
    for (let i = 0; i < 5; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    
    // Agregar checksum
    const checksum = this.generateChecksum(code)
    code += `-${checksum}`
    
    return code
  }

  /**
   * Encripta datos sensibles (simulación simple)
   */
  static encryptData(data, key = 'BOLETERIA2025') {
    let encrypted = ''
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      encrypted += String.fromCharCode(charCode)
    }
    return btoa(encrypted) // Base64
  }

  /**
   * Desencripta datos
   */
  static decryptData(encryptedData, key = 'BOLETERIA2025') {
    try {
      const decoded = atob(encryptedData)
      let decrypted = ''
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        decrypted += String.fromCharCode(charCode)
      }
      return decrypted
    } catch (error) {
      return null
    }
  }

  /**
   * Valida que el código no haya sido escaneado múltiples veces en poco tiempo
   * (Detección de fraude por duplicación)
   */
  static checkRecentScans(code) {
    const recentScans = JSON.parse(localStorage.getItem('recentScans') || '[]')
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000

    // Limpiar escaneos antiguos
    const validScans = recentScans.filter(scan => now - scan.timestamp < fiveMinutes)

    // Verificar si este código fue escaneado recientemente
    const recentScan = validScans.find(scan => scan.code === code)
    
    if (recentScan) {
      return {
        isDuplicate: true,
        timeSinceLastScan: Math.floor((now - recentScan.timestamp) / 1000),
        operator: recentScan.operator
      }
    }

    return { isDuplicate: false }
  }

  /**
   * Registra un escaneo reciente
   */
  static recordScan(code, operator) {
    const recentScans = JSON.parse(localStorage.getItem('recentScans') || '[]')
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000

    // Limpiar escaneos antiguos
    const validScans = recentScans.filter(scan => now - scan.timestamp < fiveMinutes)

    // Agregar nuevo escaneo
    validScans.push({
      code,
      operator,
      timestamp: now
    })

    localStorage.setItem('recentScans', JSON.stringify(validScans))
  }

  /**
   * Genera un token de sesión temporal para el operador
   */
  static generateSessionToken(operatorId) {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const data = `${operatorId}-${timestamp}-${random}`
    return this.encryptData(data)
  }

  /**
   * Valida un token de sesión
   */
  static validateSessionToken(token) {
    const decrypted = this.decryptData(token)
    if (!decrypted) return false

    const parts = decrypted.split('-')
    if (parts.length !== 3) return false

    const timestamp = parseInt(parts[1])
    const now = Date.now()
    const twentyFourHours = 24 * 60 * 60 * 1000

    // Token válido por 24 horas
    return (now - timestamp) < twentyFourHours
  }

  /**
   * Detección de patrones sospechosos
   */
  static detectSuspiciousActivity(code, operator) {
    const audits = JSON.parse(localStorage.getItem('scanAudits') || '[]')
    const oneHour = 60 * 60 * 1000
    const now = Date.now()

    // Contar escaneos del mismo operador en la última hora
    const recentOperatorScans = audits.filter(
      audit => audit.operator === operator && (now - audit.timestamp) < oneHour
    )

    // Contar intentos fallidos
    const failedAttempts = recentOperatorScans.filter(audit => !audit.success).length
    const totalAttempts = recentOperatorScans.length

    return {
      suspicious: failedAttempts > 5, // Más de 5 intentos fallidos es sospechoso
      failedAttempts,
      totalAttempts,
      failureRate: totalAttempts > 0 ? (failedAttempts / totalAttempts) * 100 : 0
    }
  }

  /**
   * Sanitiza la entrada del usuario
   */
  static sanitizeInput(input) {
    // Eliminar espacios, convertir a mayúsculas
    return input.trim().toUpperCase().replace(/\s+/g, '')
  }

  /**
   * Valida que el código QR no haya sido alterado
   */
  static validateIntegrity(ticketData) {
    if (!ticketData || !ticketData.codigo) {
      return { valid: false, reason: 'Datos de ticket incompletos' }
    }

    // Verificar checksum si el formato lo incluye
    if (ticketData.codigo.includes('-')) {
      if (!this.verifyChecksum(ticketData.codigo)) {
        return { valid: false, reason: 'Checksum inválido - Código posiblemente alterado' }
      }
    }

    // Verificar que las fechas sean consistentes
    if (ticketData.fechaCompra) {
      const purchaseDate = new Date(ticketData.fechaCompra)
      const now = new Date()
      
      if (purchaseDate > now) {
        return { valid: false, reason: 'Fecha de compra inválida - Ticket falsificado' }
      }

      // No permitir tickets con más de 1 año de antigüedad
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      
      if (purchaseDate < oneYearAgo) {
        return { valid: false, reason: 'Ticket demasiado antiguo' }
      }
    }

    return { valid: true }
  }

  /**
   * Genera un hash único para el dispositivo del operador
   */
  static getDeviceFingerprint() {
    const nav = window.navigator
    const screen = window.screen
    
    const fingerprint = [
      nav.userAgent,
      nav.language,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset()
    ].join('|')

    return this.generateChecksum(fingerprint)
  }
}

export default QRSecurityService
