// Simulación de API para manejo de eventos y tickets
export const eventService = {
  async getEvents() {
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return [
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
      // ... más eventos
    ]
  },

  async getEventById(id) {
    const events = await this.getEvents()
    return events.find(event => event.id === parseInt(id))
  }
}

export const paymentService = {
  async processPayment(paymentData, personalData, ticket) {
    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Validaciones básicas
    if (!paymentData.cardNumber || !paymentData.cardName || !paymentData.expiry || !paymentData.cvv) {
      throw new Error('Datos de pago incompletos')
    }

    if (!personalData.firstName || !personalData.lastName || !personalData.email) {
      throw new Error('Datos personales incompletos')
    }

    // Simular respuesta exitosa
    return {
      success: true,
      transactionId: 'TXN-' + Date.now(),
      ticketCode: 'TKT-' + Date.now().toString().slice(-8)
    }
  }
}