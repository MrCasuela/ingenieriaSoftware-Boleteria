import QRCode from 'qrcode'

export const qrService = {
  async generateQR(data, canvasId, options = { width: 250 }) {
    const canvas = document.getElementById(canvasId)
    if (!canvas) {
      throw new Error(`Canvas with id '${canvasId}' not found`)
    }

    try {
      await QRCode.toCanvas(canvas, JSON.stringify(data), options)
    } catch (error) {
      console.error('Error generating QR code:', error)
      throw error
    }
  },

  createTicketData(ticketCode, event, ticket, personalData) {
    return {
      ticketCode,
      event: event.name,
      date: event.date,
      location: event.location,
      ticketType: ticket.name,
      holder: `${personalData.firstName} ${personalData.lastName}`,
      document: personalData.document,
      timestamp: new Date().toISOString()
    }
  }
}