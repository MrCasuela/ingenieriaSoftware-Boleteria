import { defineStore } from 'pinia'
import QRSecurityService from '../services/qrSecurityService'

export const useTicketStore = defineStore('ticket', {
  state: () => ({
    currentStep: 1,
    selectedEvent: null,
    selectedTicket: null,
    ticketQuantity: 1,
    ticketCode: '',
    processing: false,
    serviceCharge: 5.00,
    tickets: [], // Array de tickets comprados (cargado desde localStorage)
    personalData: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      document: ''
    },
    paymentData: {
      cardNumber: '',
      cardName: '',
      expiry: '',
      cvv: ''
    },
    ticketDetails: {
      gate: '', // Puerta asignada
      seat: ''  // Puedes agregar más campos si lo necesitas
    },
    // EVENTOS MOVIDOS A MySQL - Ya no hardcodeados aquí
    // Los eventos ahora se cargan dinámicamente desde la API
    events: []
  }),

  getters: {
    totalAmount: (state) => {
      if (!state.selectedTicket || !state.ticketQuantity) return 0
      return (state.selectedTicket.price * state.ticketQuantity) + state.serviceCharge
    },

    subtotal: (state) => {
      if (!state.selectedTicket || !state.ticketQuantity) return 0
      return state.selectedTicket.price * state.ticketQuantity
    },
    
    progressWidth: (state) => {
      return (state.currentStep - 1) * 33.33
    },

    getEventById: (state) => (id) => {
      return state.events.find(event => event.id === parseInt(id))
    }
  },

  actions: {
    selectEvent(event) {
      this.selectedEvent = event
      this.currentStep = 2
    },

    selectTicket(ticket) {
      this.selectedTicket = ticket
      this.ticketQuantity = 1 // Resetear cantidad al seleccionar nuevo ticket
    },

    increaseQuantity() {
      if (this.selectedTicket && this.ticketQuantity < this.selectedTicket.available) {
        this.ticketQuantity++
      }
    },

    decreaseQuantity() {
      if (this.ticketQuantity > 1) {
        this.ticketQuantity--
      }
    },

    proceedToPersonalData() {
      if (this.selectedTicket) {
        this.currentStep = 3
      }
    },

    async processPayment() {
      this.processing = true
      
      // Verificar disponibilidad antes del pago
      if (this.selectedTicket.available <= 0) {
        this.processing = false
        throw new Error('No hay entradas disponibles para este tipo de ticket')
      }
      
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generar código de entrada único con checksum de seguridad
      this.ticketCode = QRSecurityService.generateSecureCode()
      console.log('🔐 Código QR seguro generado:', this.ticketCode)
      
      // Reducir la cantidad disponible
      this.updateAvailableTickets()
      
      // Guardar ticket en localStorage
      this.saveTicketToStorage()
      
      this.processing = false
      this.currentStep = 4
      
      return this.ticketCode
    },

    // Actualizar cantidad disponible después de la compra
    updateAvailableTickets() {
      if (this.selectedTicket && this.selectedTicket.available > 0) {
        this.selectedTicket.available--
        
        // También actualizar en el evento padre
        const event = this.events.find(e => e.id === this.selectedEvent.id)
        if (event) {
          const ticket = event.tickets.find(t => t.id === this.selectedTicket.id)
          if (ticket) {
            ticket.available--
          }
        }
        
        // Guardar el estado actualizado en localStorage para persistencia
        this.saveEventsToStorage()
      }
    },

    // DEPRECATED: Ya no guardamos eventos en localStorage
    // Los eventos se gestionan exclusivamente desde MySQL vía API
    saveEventsToStorage() {
      // No hacer nada - los eventos se guardan en MySQL
      console.log('⚠️ saveEventsToStorage() está deprecado - eventos en MySQL')
    },

    // DEPRECATED: Ya no usamos localStorage para eventos
    // Los eventos ahora se cargan desde la API en cada vista
    loadEventsFromStorage() {
      // Ya no cargar desde localStorage
      // Los eventos se obtienen de la API cuando se necesitan
      console.log('⚠️ loadEventsFromStorage() está deprecado - usar API en su lugar')
    },

    // Guardar ticket comprado en localStorage
    saveTicketToStorage() {
      const tickets = JSON.parse(localStorage.getItem('purchasedTickets') || '[]')
      
      const newTicket = {
        codigo: this.ticketCode,
        rut: this.personalData.document,
        nombre: `${this.personalData.firstName} ${this.personalData.lastName}`,
        email: this.personalData.email,
        telefono: this.personalData.phone,
        evento: this.selectedEvent.name,
        tipo: this.selectedTicket.name,
        precio: this.selectedTicket.price,
        fecha: this.selectedEvent.date,
        ubicacion: this.selectedEvent.location,
        usado: false,
        fechaCompra: new Date().toISOString(),
        // Agregar detalles del ticket
        gate: this.ticketDetails.gate,
        seat: this.ticketDetails.seat
      }
      
      tickets.push(newTicket)
      localStorage.setItem('purchasedTickets', JSON.stringify(tickets))
      
      // También actualizar el array de tickets en el state
      this.tickets = tickets
    },

    // Validar un ticket (para el operador) con seguridad mejorada
    validateTicket(identifier, operator = 'unknown') {
      const tickets = JSON.parse(localStorage.getItem('purchasedTickets') || '[]')
      
      // 1. Sanitizar entrada
      const sanitizedInput = QRSecurityService.sanitizeInput(identifier)
      
      // 2. Validar formato si es un código QR
      if (sanitizedInput.startsWith('TKT-')) {
        if (!QRSecurityService.validateFormat(sanitizedInput)) {
          return { 
            valid: false, 
            message: '❌ Formato de código QR inválido',
            fraudDetected: true
          }
        }
        
        // 3. Verificar checksum
        if (!QRSecurityService.verifyChecksum(sanitizedInput)) {
          return { 
            valid: false, 
            message: '🚨 Código QR alterado o falsificado',
            fraudDetected: true
          }
        }
      }
      
      // 4. Verificar duplicados recientes
      const duplicateCheck = QRSecurityService.checkRecentScans(sanitizedInput)
      if (duplicateCheck.isDuplicate) {
        return { 
          valid: false, 
          message: `⚠️ Este código fue escaneado hace ${duplicateCheck.timeSinceLastScan}s por ${duplicateCheck.operator}`,
          fraudDetected: true,
          ticket: null
        }
      }
      
      // 5. Buscar ticket
      const normalizedInput = sanitizedInput.replace(/\./g, '').replace(/-/g, '').toUpperCase()
      const ticket = tickets.find(t => {
        const normalizedCode = t.codigo.replace(/\./g, '').replace(/-/g, '').toUpperCase()
        const normalizedRut = t.rut.replace(/\./g, '').replace(/-/g, '').toUpperCase()
        return normalizedCode === normalizedInput || normalizedRut === normalizedInput
      })
      
      if (!ticket) {
        return { 
          valid: false, 
          message: '❌ Ticket no encontrado en el sistema',
          fraudDetected: false
        }
      }
      
      // 6. Validar integridad del ticket
      const integrityCheck = QRSecurityService.validateIntegrity(ticket)
      if (!integrityCheck.valid) {
        return {
          valid: false,
          message: `🚨 ${integrityCheck.reason}`,
          fraudDetected: true,
          ticket
        }
      }
      
      // 7. Verificar si ya fue usado
      if (ticket.usado) {
        const usedDate = ticket.fechaUso ? new Date(ticket.fechaUso).toLocaleString() : 'Fecha desconocida'
        return { 
          valid: false, 
          message: `⛔ Ticket ya utilizado el ${usedDate}`,
          ticket,
          fraudDetected: false
        }
      }
      
      // 8. Registrar escaneo exitoso
      QRSecurityService.recordScan(sanitizedInput, operator)
      
      return { 
        valid: true, 
        message: '✅ Ticket válido - Acceso autorizado',
        ticket,
        fraudDetected: false
      }
    },

    // Marcar ticket como usado
    markTicketAsUsed(ticketCode) {
      const tickets = JSON.parse(localStorage.getItem('purchasedTickets') || '[]')
      
      const ticketIndex = tickets.findIndex(t => t.codigo === ticketCode)
      
      if (ticketIndex !== -1) {
        tickets[ticketIndex].usado = true
        tickets[ticketIndex].fechaUso = new Date().toISOString()
        localStorage.setItem('purchasedTickets', JSON.stringify(tickets))
        
        // Actualizar el array de tickets en el state
        this.tickets = tickets
        
        return true
      }
      
      return false
    },

    // Obtener estadísticas para el operador
    getTicketStats() {
      const tickets = JSON.parse(localStorage.getItem('purchasedTickets') || '[]')
      
      return {
        total: tickets.length,
        usados: tickets.filter(t => t.usado).length,
        disponibles: tickets.filter(t => !t.usado).length
      }
    },

    goBack() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },

    getStepClass(step) {
      if (step < this.currentStep) return 'completed'
      if (step === this.currentStep) return 'active'
      return 'inactive'
    },

    resetStore() {
      this.currentStep = 1
      this.selectedEvent = null
      this.selectedTicket = null
      this.ticketQuantity = 1
      this.personalData = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        document: ''
      }
      this.paymentData = {
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: ''
      }
      this.ticketDetails = {
        gate: '',
        seat: ''
      }
      this.ticketCode = ''
      this.processing = false
    },

    // Inicializar el store (llamar al montar la aplicación)
    initializeStore() {
      this.loadEventsFromStorage()
      this.loadPurchasedTickets()
    },
    
    // Cargar tickets comprados desde localStorage
    loadPurchasedTickets() {
      const purchasedTickets = JSON.parse(localStorage.getItem('purchasedTickets') || '[]')
      this.tickets = purchasedTickets
      console.log('📋 Tickets cargados desde localStorage:', this.tickets.length)
    }
  }
})
