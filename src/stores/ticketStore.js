import { defineStore } from 'pinia'
import QRSecurityService from '../services/qrSecurityService'
import PaymentService from '../services/paymentService'

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
    paymentResult: null, // Guardar resultado del pago
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
      this.ticketQuantity = 1
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
      
      try {
        // Verificar disponibilidad antes del pago
        if (this.selectedTicket.available <= 0) {
          throw new Error('No hay entradas disponibles para este tipo de ticket')
        }
        
        console.log('💳 Iniciando procesamiento de pago...')
        console.log('📦 Datos personales:', this.personalData)
        console.log('💰 Monto total:', this.totalAmount)
        
        // Procesar pago usando el servicio de pago simulado
        this.paymentResult = await PaymentService.processPayment(
          this.paymentData,
          this.personalData,
          this.totalAmount
        )
        
        console.log('✅ Pago procesado exitosamente:', this.paymentResult)
        
        // Generar código de entrada único con checksum de seguridad
        this.ticketCode = QRSecurityService.generateSecureCode()
        console.log('🔐 Código QR seguro generado:', this.ticketCode)
        
        // Guardar la compra en la base de datos
        await this.saveTicketToDatabase()
        
        // Reducir la cantidad disponible localmente
        await this.updateAvailableTickets()
        
        // Guardar ticket en localStorage (para compatibilidad)
        this.saveTicketToStorage()
        
        this.currentStep = 4
        
        return {
          ticketCode: this.ticketCode,
          paymentResult: this.paymentResult
        }
      } catch (error) {
        console.error('❌ Error al procesar pago:', error)
        throw error
      } finally {
        this.processing = false
      }
    },

    // Actualizar cantidad disponible después de la compra
    async updateAvailableTickets() {
      if (this.selectedTicket && this.selectedTicket.available > 0) {
        try {
          // Actualizar en el frontend localmente
          this.selectedTicket.available -= this.ticketQuantity
          
          // También actualizar en el evento padre
          const event = this.events.find(e => e.id === this.selectedEvent.id)
          if (event) {
            const ticket = event.tickets.find(t => t.id === this.selectedTicket.id)
            if (ticket) {
              ticket.available -= this.ticketQuantity
            }
          }
          
          // TODO: En el futuro, se puede hacer una llamada al backend para actualizar la disponibilidad
          // await fetch(`/api/ticket-types/${this.selectedTicket.id}/reduce`, {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ quantity: this.ticketQuantity })
          // })
          
          console.log(`✅ Disponibilidad actualizada: ${this.selectedTicket.name} - ${this.selectedTicket.available} disponibles`)
        } catch (error) {
          console.error('❌ Error al actualizar disponibilidad:', error)
        }
      }
    },

    // Cargar eventos desde la API
    async loadEventsFromAPI() {
      try {
        console.log('🔄 Cargando eventos desde la API...')
        const response = await fetch('/api/events')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success && data.data) {
          // Mapear eventos de la BD al formato del frontend
          this.events = await Promise.all(data.data.map(async (event) => {
            // Cargar los tipos de tickets para cada evento
            const ticketTypes = await this.loadTicketTypesForEvent(event.id)
            
            return {
              id: event.id,
              name: event.name,
              description: event.description,
              date: new Date(event.date).toLocaleDateString('es-CL'),
              time: new Date(event.date).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
              location: event.location || event.venue?.name || '',
              image: event.image || `https://picsum.photos/seed/event${event.id}/400/300`,
              category: event.category || 'otro',
              minPrice: ticketTypes.length > 0 ? Math.min(...ticketTypes.map(t => t.price)) : 0,
              tickets: ticketTypes
            }
          }))
          
          console.log('✅ Eventos cargados desde API:', this.events.length)
          return true
        } else {
          console.warn('⚠️ No se recibieron eventos válidos')
          this.events = []
          return false
        }
      } catch (error) {
        console.error('❌ Error al cargar eventos desde API:', error)
        this.events = []
        return false
      }

    },

    // Cargar tipos de tickets para un evento específico
    async loadTicketTypesForEvent(eventId) {
      try {
        console.log(`🎫 Cargando tipos de tickets para evento ${eventId}...`)
        const response = await fetch(`/api/ticket-types/event/${eventId}`)
        
        if (!response.ok) {
          console.warn(`⚠️ No se pudieron cargar tickets para evento ${eventId}`)
          return []
        }
        
        const data = await response.json()
        
        if (data.success && data.data) {
          // Mapear tipos de tickets al formato del frontend
          const tickets = data.data.map(ticketType => {
            const ticket = {
              id: ticketType.id,
              name: ticketType.name,
              description: ticketType.description || `Entrada ${ticketType.name}`,
              price: parseFloat(ticketType.price),
              quantity: parseInt(ticketType.total_capacity || ticketType.quantity),
              available: parseInt(ticketType.available_capacity || ticketType.available)
            }
            console.log(`🎫 Ticket mapeado:`, ticket)
            return ticket
          })
          
          console.log(`✅ ${tickets.length} tipos de tickets cargados para evento ${eventId}`, tickets)
          return tickets
        }
        
        return []
      } catch (error) {
        console.error(`❌ Error al cargar tipos de tickets para evento ${eventId}:`, error)
        return []
      }
    },

    // Guardar ticket en la base de datos
    async saveTicketToDatabase() {
      try {
        console.log('💾 Guardando ticket en la base de datos...')
        
        // 1. Crear o buscar el usuario (cliente)
        const userResponse = await fetch('/api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.personalData.email,
            first_name: this.personalData.firstName,
            last_name: this.personalData.lastName,
            phone: this.personalData.phone,
            document: this.personalData.document,
            password: 'Cliente123!', // Password temporal para clientes
            user_type: 'cliente'
          })
        })
        
        let userId
        const userData = await userResponse.json()
        
        if (userResponse.ok) {
          userId = userData.data.id
          console.log('✅ Usuario creado:', userId)
        } else if (userData.message && userData.message.includes('ya está registrado')) {
          // Si el email ya existe, buscar el usuario
          console.log('⚠️ Email ya registrado, buscando usuario...')
          const allUsersResponse = await fetch('/api/users')
          if (allUsersResponse.ok) {
            const allUsersData = await allUsersResponse.json()
            const existingUser = allUsersData.data.find(u => u.email === this.personalData.email)
            if (existingUser) {
              userId = existingUser.id
              console.log('✅ Usuario encontrado:', userId)
            }
          }
        }
        
        if (!userId) {
          throw new Error('No se pudo crear o encontrar el usuario')
        }
        
        // 2. Crear el ticket en la base de datos
        const ticketResponse = await fetch('/api/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: userId,
            ticket_type_id: this.selectedTicket.id,
            ticket_code: this.ticketCode,
            quantity: this.ticketQuantity,
            unit_price: this.selectedTicket.price,
            total_price: this.subtotal,
            service_charge: this.serviceCharge,
            final_price: this.totalAmount,
            payment_method: this.paymentResult.cardType,
            transaction_id: this.paymentResult.transactionId,
            purchase_date: new Date().toISOString(),
            status: 'active'
          })
        })
        
        if (!ticketResponse.ok) {
          const errorData = await ticketResponse.json()
          throw new Error(errorData.message || 'Error al crear ticket en BD')
        }
        
        const ticketData = await ticketResponse.json()
        console.log('✅ Ticket guardado en BD:', ticketData.data)
        
        return ticketData.data
      } catch (error) {
        console.error('❌ Error al guardar ticket en BD:', error)
        // No lanzar error para no bloquear el flujo
        // El ticket se guardó en localStorage como respaldo
      }
    },

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
        gate: this.ticketDetails.gate,
        seat: this.ticketDetails.seat
      }
      
      tickets.push(newTicket)
      localStorage.setItem('purchasedTickets', JSON.stringify(tickets))
      
      this.tickets = tickets
    },

    validateTicket(identifier, operator = 'unknown') {
      const tickets = JSON.parse(localStorage.getItem('purchasedTickets') || '[]')
      const sanitizedInput = QRSecurityService.sanitizeInput(identifier)
      
      if (sanitizedInput.startsWith('TKT-')) {
        if (!QRSecurityService.validateFormat(sanitizedInput)) {
          return { valid: false, message: '❌ Formato de código QR inválido', fraudDetected: true }
        }
        if (!QRSecurityService.verifyChecksum(sanitizedInput)) {
          return { valid: false, message: '🚨 Código QR alterado o falsificado', fraudDetected: true }
        }
      }
      
      const duplicateCheck = QRSecurityService.checkRecentScans(sanitizedInput)
      if (duplicateCheck.isDuplicate) {
        return { 
          valid: false, 
          message: `⚠️ Este código fue escaneado hace ${duplicateCheck.timeSinceLastScan}s por ${duplicateCheck.operator}`,
          fraudDetected: true,
          ticket: null
        }
      }
      
      const normalizedInput = sanitizedInput.replace(/\./g, '').replace(/-/g, '').toUpperCase()
      const ticket = tickets.find(t => {
        const normalizedCode = t.codigo.replace(/\./g, '').replace(/-/g, '').toUpperCase()
        const normalizedRut = t.rut.replace(/\./g, '').replace(/-/g, '').toUpperCase()
        return normalizedCode === normalizedInput || normalizedRut === normalizedInput
      })
      
      if (!ticket) {
        return { valid: false, message: '❌ Ticket no encontrado en el sistema', fraudDetected: false }
      }
      
      const integrityCheck = QRSecurityService.validateIntegrity(ticket)
      if (!integrityCheck.valid) {
        return { valid: false, message: `🚨 ${integrityCheck.reason}`, fraudDetected: true, ticket }
      }
      
      if (ticket.usado) {
        const usedDate = ticket.fechaUso ? new Date(ticket.fechaUso).toLocaleString() : 'Fecha desconocida'
        return { valid: false, message: `⛔ Ticket ya utilizado el ${usedDate}`, ticket, fraudDetected: false }
      }
      
      QRSecurityService.recordScan(sanitizedInput, operator)
      
      return { valid: true, message: '✅ Ticket válido - Acceso autorizado', ticket, fraudDetected: false }
    },

    markTicketAsUsed(ticketCode) {
      const tickets = JSON.parse(localStorage.getItem('purchasedTickets') || '[]')
      const ticketIndex = tickets.findIndex(t => t.codigo === ticketCode)
      if (ticketIndex !== -1) {
        tickets[ticketIndex].usado = true
        tickets[ticketIndex].fechaUso = new Date().toISOString()
        localStorage.setItem('purchasedTickets', JSON.stringify(tickets))
        this.tickets = tickets
        return true
      }
      return false
    },

    getTicketStats() {
      const tickets = JSON.parse(localStorage.getItem('purchasedTickets') || '[]')
      return {
        total: tickets.length,
        usados: tickets.filter(t => t.usado).length,
        disponibles: tickets.filter(t => !t.usado).length
      }
    },

    goBack() {
      if (this.currentStep > 1) this.currentStep--
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
      this.personalData = { firstName: '', lastName: '', email: '', phone: '', document: '' }
      this.paymentData = { cardNumber: '', cardName: '', expiry: '', cvv: '' }
      this.ticketDetails = { gate: '', seat: '' }
      this.ticketCode = ''
      this.processing = false
    },

    // Inicializar el store (llamar al montar la aplicación)
    async initializeStore() {
      await this.loadEventsFromAPI()
      this.loadPurchasedTickets()
    },
    
    loadPurchasedTickets() {
      const purchasedTickets = JSON.parse(localStorage.getItem('purchasedTickets') || '[]')
      this.tickets = purchasedTickets
      console.log('📋 Tickets cargados desde localStorage:', this.tickets.length)
    },

    // 🔹 Funciones agregadas del segundo código:
    updateTicketDetails(details) {
      this.ticketDetails = { ...this.ticketDetails, ...details }
    },

    async downloadTicketPDF() {
      return {
        event: this.selectedEvent,
        ticket: this.selectedTicket,
        personalData: this.personalData,
        ticketCode: this.ticketCode,
        ticketDetails: this.ticketDetails
      }
    },

    async sendTicketByEmail(email) {
      const to = email || this.personalData.email
      if (!to) throw new Error('No se ha proporcionado un correo electrónico válido.')

      return {
        to,
        subject: `Tu ticket para ${this.selectedEvent?.name}`,
        body: {
          event: this.selectedEvent,
          ticket: this.selectedTicket,
          personalData: this.personalData,
          ticketCode: this.ticketCode,
          ticketDetails: this.ticketDetails
        }
      }
    }
  }
})

  }
})
