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
    events: [
      {
        id: 1,
        name: 'Concierto Rock en Vivo',
        description: 'Una noche increíble con las mejores bandas de rock nacional e internacional.',
        date: '15 de Noviembre, 2025',
        location: 'Estadio Nacional',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
        minPrice: 50,
        tickets: [
          {
            id: 1,
            name: 'Entrada General',
            description: 'Acceso a la zona general del estadio',
            price: 50,
            available: 500
          },
          {
            id: 2,
            name: 'Entrada VIP',
            description: 'Acceso preferencial con bebida incluida',
            price: 120,
            available: 100
          }
        ]
      },
      {
        id: 2,
        name: 'Festival de Comida Gourmet',
        description: 'Disfruta de los mejores platos de chefs reconocidos internacionalmente.',
        date: '22 de Noviembre, 2025',
        location: 'Centro de Convenciones',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop',
        minPrice: 30,
        tickets: [
          {
            id: 3,
            name: 'Entrada Básica',
            description: 'Acceso al festival sin degustaciones',
            price: 30,
            available: 300
          },
          {
            id: 4,
            name: 'Entrada Premium',
            description: 'Acceso completo con degustaciones incluidas',
            price: 75,
            available: 150
          }
        ]
      },
      {
        id: 3,
        name: 'Conferencia de Tecnología',
        description: 'Los líderes tecnológicos más importantes compartirán sus conocimientos.',
        date: '5 de Diciembre, 2025',
        location: 'Auditorio Universitario',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop',
        minPrice: 25,
        tickets: [
          {
            id: 5,
            name: 'Entrada Estudiante',
            description: 'Acceso con descuento para estudiantes',
            price: 25,
            available: 200
          },
          {
            id: 6,
            name: 'Entrada Profesional',
            description: 'Acceso completo con material adicional',
            price: 60,
            available: 100
          }
        ]
      }
    ]
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

    // Guardar eventos actualizados en localStorage
    saveEventsToStorage() {
      localStorage.setItem('eventsData', JSON.stringify(this.events))
    },

    // Cargar eventos desde localStorage al inicializar
    loadEventsFromStorage() {
      const savedEvents = localStorage.getItem('eventsData')
      if (savedEvents) {
        this.events = JSON.parse(savedEvents)
      }
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
