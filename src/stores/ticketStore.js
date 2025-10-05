import { defineStore } from 'pinia'

export const useTicketStore = defineStore('ticket', {
  state: () => ({
    currentStep: 1,
    selectedEvent: null,
    selectedTicket: null,
    ticketQuantity: 1,
    ticketCode: '',
    processing: false,
    serviceCharge: 5.00,
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
      
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generar código de entrada único
      this.ticketCode = 'TKT-' + Date.now().toString().slice(-8)
      
      // Guardar ticket en localStorage
      this.saveTicketToStorage()
      
      this.processing = false
      this.currentStep = 4
      
      return this.ticketCode
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
    },

    // Validar un ticket (para el operador)
    validateTicket(identifier) {
      const tickets = JSON.parse(localStorage.getItem('purchasedTickets') || '[]')
      
      // Normalizar identificador (quitar puntos y guiones)
      const normalizedInput = identifier.replace(/\./g, '').replace(/-/g, '').toUpperCase()
      
      // Buscar ticket por código o RUT
      const ticket = tickets.find(t => {
        const normalizedCode = t.codigo.replace(/\./g, '').replace(/-/g, '').toUpperCase()
        const normalizedRut = t.rut.replace(/\./g, '').replace(/-/g, '').toUpperCase()
        
        return normalizedCode === normalizedInput || normalizedRut === normalizedInput
      })
      
      if (!ticket) {
        return { valid: false, message: 'Ticket no encontrado' }
      }
      
      if (ticket.usado) {
        return { valid: false, message: 'Ticket ya utilizado', ticket }
      }
      
      return { valid: true, ticket }
    },

    // Marcar ticket como usado
    markTicketAsUsed(ticketCode) {
      const tickets = JSON.parse(localStorage.getItem('purchasedTickets') || '[]')
      
      const ticketIndex = tickets.findIndex(t => t.codigo === ticketCode)
      
      if (ticketIndex !== -1) {
        tickets[ticketIndex].usado = true
        tickets[ticketIndex].fechaUso = new Date().toISOString()
        localStorage.setItem('purchasedTickets', JSON.stringify(tickets))
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

    // Funciones agregadas del segundo código
    updateTicketDetails(details) {
      this.ticketDetails = { ...this.ticketDetails, ...details }
    },

    async downloadTicketPDF() {
      // Esta función debe llamarse desde el componente Vue, donde puedes usar jsPDF
      // Aquí solo se prepara la data
      return {
        event: this.selectedEvent,
        ticket: this.selectedTicket,
        personalData: this.personalData,
        ticketCode: this.ticketCode,
        ticketDetails: this.ticketDetails
      }
    },

    async sendTicketByEmail(email) {
      // Simulación: en producción, llamarías a un endpoint backend
      // Aquí solo retorna los datos que se enviarían
      const to = email || this.personalData.email
      if (!to) throw new Error('No se ha proporcionado un correo electrónico válido.')

      // Aquí deberías hacer una petición HTTP a tu backend para enviar el correo
      // Por ejemplo:
      // await fetch('/api/send-ticket', { method: 'POST', body: JSON.stringify({ ... }) })

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
