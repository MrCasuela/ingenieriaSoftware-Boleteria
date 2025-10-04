import { onMounted, nextTick } from 'vue'
import { qrService } from '../services/qrService.js'

export function useQRGenerator() {
  const generateTicketQR = async (ticketCode, event, ticket, personalData, canvasId = 'qrcode') => {
    await nextTick()
    
    const qrData = qrService.createTicketData(ticketCode, event, ticket, personalData)
    
    try {
      await qrService.generateQR(qrData, canvasId)
    } catch (error) {
      console.error('Error generating QR:', error)
    }
  }

  return {
    generateTicketQR
  }
}