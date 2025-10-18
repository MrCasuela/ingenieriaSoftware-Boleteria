/**
 * Servicio de Pago Simulado
 * Simula el procesamiento de pagos con validaciones realistas
 */

class PaymentService {
  /**
   * Números de tarjeta de prueba válidos (para desarrollo)
   * Estos números pasarán la validación sin verificar Luhn
   */
  static TEST_CARDS = [
    '4111111111111111', // Visa
    '5555555555554444', // Mastercard
    '378282246310005',  // American Express
    '6011111111111117', // Discover
    '4532015112830366', // Visa
    '5425233430109903', // Mastercard
    // Agregamos la que el usuario está usando
    '5555555555555555'  // Mastercard (prueba)
  ]

  /**
   * Valida el número de tarjeta usando el algoritmo de Luhn
   * @param {string} cardNumber - Número de tarjeta
   * @returns {boolean} - True si es válido
   */
  validateCardNumber(cardNumber) {
    // Remover espacios
    const cleaned = cardNumber.replace(/\s/g, '')
    
    // Verificar si es una tarjeta de prueba
    if (PaymentService.TEST_CARDS.includes(cleaned)) {
      console.log('💳 Tarjeta de prueba detectada:', cleaned)
      return true
    }
    
    // Verificar que solo tenga números y longitud correcta
    if (!/^\d{13,19}$/.test(cleaned)) {
      return false
    }
    
    // Algoritmo de Luhn
    let sum = 0
    let isEven = false
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i])
      
      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }
      
      sum += digit
      isEven = !isEven
    }
    
    return sum % 10 === 0
  }

  /**
   * Detecta el tipo de tarjeta
   * @param {string} cardNumber - Número de tarjeta
   * @returns {string} - Tipo de tarjeta (visa, mastercard, amex, etc.)
   */
  detectCardType(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '')
    
    // Visa: empieza con 4
    if (/^4/.test(cleaned)) {
      return 'visa'
    }
    
    // Mastercard: empieza con 51-55 o 2221-2720
    if (/^5[1-5]/.test(cleaned) || /^2(?:2(?:2[1-9]|[3-9]\d)|[3-6]\d{2}|7(?:[01]\d|20))/.test(cleaned)) {
      return 'mastercard'
    }
    
    // American Express: empieza con 34 o 37
    if (/^3[47]/.test(cleaned)) {
      return 'amex'
    }
    
    // Discover: empieza con 6011, 622126-622925, 644-649, 65
    if (/^6(?:011|5|4[4-9]|22(?:1(?:2[6-9]|[3-9]\d)|[2-8]\d{2}|9(?:[01]\d|2[0-5])))/.test(cleaned)) {
      return 'discover'
    }
    
    return 'unknown'
  }

  /**
   * Valida la fecha de vencimiento
   * @param {string} expiry - Fecha en formato MM/YY
   * @returns {boolean} - True si es válida y no está vencida
   */
  validateExpiry(expiry) {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      return false
    }
    
    const [month, year] = expiry.split('/').map(Number)
    
    // Validar mes
    if (month < 1 || month > 12) {
      return false
    }
    
    // Obtener fecha actual
    const now = new Date()
    const currentYear = now.getFullYear() % 100 // Últimos 2 dígitos
    const currentMonth = now.getMonth() + 1
    
    // Comparar año
    if (year < currentYear) {
      return false
    }
    
    // Si es el mismo año, comparar mes
    if (year === currentYear && month < currentMonth) {
      return false
    }
    
    return true
  }

  /**
   * Valida el CVV
   * @param {string} cvv - Código de seguridad
   * @param {string} cardType - Tipo de tarjeta
   * @returns {boolean} - True si es válido
   */
  validateCVV(cvv, cardType) {
    // American Express usa 4 dígitos, otros usan 3
    const expectedLength = cardType === 'amex' ? 4 : 3
    return /^\d+$/.test(cvv) && cvv.length === expectedLength
  }

  /**
   * Simula el procesamiento de un pago
   * @param {Object} paymentData - Datos del pago
   * @param {Object} personalData - Datos personales
   * @param {number} amount - Monto a cobrar
   * @returns {Promise<Object>} - Resultado del pago
   */
  async processPayment(paymentData, personalData, amount) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Validar número de tarjeta
    if (!this.validateCardNumber(paymentData.cardNumber)) {
      throw new Error('Número de tarjeta inválido')
    }
    
    // Detectar tipo de tarjeta
    const cardType = this.detectCardType(paymentData.cardNumber)
    
    // Validar fecha de vencimiento
    if (!this.validateExpiry(paymentData.expiry)) {
      throw new Error('Fecha de vencimiento inválida o tarjeta vencida')
    }
    
    // Validar CVV
    if (!this.validateCVV(paymentData.cvv, cardType)) {
      throw new Error(`CVV inválido (debe tener ${cardType === 'amex' ? 4 : 3} dígitos)`)
    }
    
    // Validar datos personales
    if (!personalData.firstName || !personalData.lastName) {
      throw new Error('Nombre completo requerido')
    }
    
    if (!personalData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalData.email)) {
      throw new Error('Email inválido')
    }
    
    // Simular verificación con banco (más realista)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simular casos de rechazo (5% de probabilidad para hacerlo más realista)
    const shouldReject = Math.random() < 0.05
    
    if (shouldReject) {
      const rejectionReasons = [
        'Fondos insuficientes',
        'Tarjeta bloqueada temporalmente',
        'Transacción rechazada por el banco',
        'Límite de crédito excedido'
      ]
      const reason = rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)]
      throw new Error(reason)
    }
    
    // Generar ID de transacción
    const transactionId = this.generateTransactionId()
    
    // Generar código de autorización
    const authCode = this.generateAuthCode()
    
    // Pago exitoso
    return {
      success: true,
      transactionId,
      authCode,
      amount,
      cardType,
      cardLast4: paymentData.cardNumber.replace(/\s/g, '').slice(-4),
      timestamp: new Date().toISOString(),
      message: 'Pago procesado exitosamente'
    }
  }

  /**
   * Genera un ID de transacción único
   * @returns {string} - ID de transacción
   */
  generateTransactionId() {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `TXN${timestamp}${random}`
  }

  /**
   * Genera un código de autorización
   * @returns {string} - Código de autorización de 6 dígitos
   */
  generateAuthCode() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * Formatea el número de tarjeta para mostrar (oculta dígitos del medio)
   * @param {string} cardNumber - Número de tarjeta
   * @returns {string} - Número formateado (ej: 4532 **** **** 1234)
   */
  formatCardForDisplay(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '')
    if (cleaned.length < 13) return cardNumber
    
    const first4 = cleaned.slice(0, 4)
    const last4 = cleaned.slice(-4)
    return `${first4} **** **** ${last4}`
  }
}

// Exportar instancia singleton
export default new PaymentService()
