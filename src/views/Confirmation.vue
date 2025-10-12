<template>
  <div>
    <HomeButton position="bottom-right" />
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8 text-center">
          <div class="alert alert-success" role="alert">
            <i class="fas fa-check-circle fa-3x mb-3"></i>
            <h3>¡Compra Exitosa!</h3>
            <p>Tu entrada ha sido procesada correctamente.</p>
          </div>

        <div class="card mt-4">
          <div class="card-body">
            <h4 class="card-title mb-4">Tu Entrada Digital</h4>
            
            <div class="row">
              <div class="col-md-6">
                <div class="qr-container">
                  <canvas id="qrcode" class="img-fluid"></canvas>
                </div>
                <p class="mt-3"><strong>Código de Entrada:</strong> {{ ticketCode }}</p>
              </div>
              <div class="col-md-6 text-start">
                <h5 class="mb-3">Detalles del Evento</h5>
                <p><strong>Evento:</strong> {{ selectedEvent.name }}</p>
                <p><strong>Fecha:</strong> {{ selectedEvent.date }}</p>
                <p><strong>Ubicación:</strong> {{ selectedEvent.location }}</p>
                <p><strong>Tipo de Entrada:</strong> {{ selectedTicket.name }}</p>
                <p><strong>Cantidad:</strong> {{ ticketQuantity }}</p>
                <p><strong>Precio Total:</strong> ${{ totalAmount }}</p>
                
                <hr>
                
                <h5 class="mb-3">Detalles del Pago</h5>
                <div v-if="paymentResult">
                  <p><strong>ID Transacción:</strong> <code>{{ paymentResult.transactionId }}</code></p>
                  <p><strong>Código Autorización:</strong> <code>{{ paymentResult.authCode }}</code></p>
                  <p><strong>Método de Pago:</strong> 
                    <span class="badge bg-primary">
                      <i :class="getCardIcon(paymentResult.cardType)"></i>
                      {{ getCardName(paymentResult.cardType) }} **** {{ paymentResult.cardLast4 }}
                    </span>
                  </p>
                  <p><strong>Monto Cobrado:</strong> ${{ paymentResult.amount.toFixed(2) }}</p>
                  <p><strong>Estado:</strong> 
                    <span class="badge bg-success">
                      <i class="fas fa-check-circle"></i> Aprobado
                    </span>
                  </p>
                </div>
                
                <hr>
                
                <h5 class="mb-3">Datos del Comprador</h5>
                <p><strong>Nombre:</strong> {{ personalData.firstName }} {{ personalData.lastName }}</p>
                <p><strong>Email:</strong> {{ personalData.email }}</p>
                <p><strong>Teléfono:</strong> {{ personalData.phone }}</p>
                <p><strong>Documento:</strong> {{ personalData.document }}</p>
              </div>
            </div>
            
            <div class="alert alert-info mt-4">
              <i class="fas fa-info-circle me-2"></i>
              <strong>Importante:</strong> Presenta este código QR en la entrada del evento. 
              También hemos enviado una copia a tu email. Tu entrada puede ser validada usando el código 
              <code class="bg-white px-2 py-1">{{ ticketCode }}</code> o tu RUT 
              <code class="bg-white px-2 py-1">{{ personalData.document }}</code>.
            </div>

            <div class="mt-4">
              <button class="btn btn-primary me-3" @click="downloadTicket">
                <i class="fas fa-download me-2"></i>Descargar Entrada
              </button>
              <button class="btn btn-success me-3" @click="sendTicketByEmail">
                <i class="fas fa-envelope me-2"></i>Enviar por Email
              </button>
              <button class="btn btn-outline-danger" @click="startOver">
                <i class="fas fa-home me-2"></i>Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useTicketStore } from '../stores/ticketStore.js'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useQRGenerator } from '../composables/useQRGenerator.js'
import HomeButton from '../components/HomeButton.vue'
import jsPDF from 'jspdf'

export default {
  name: 'Confirmation',
  components: {
    HomeButton
  },
  setup() {
    const store = useTicketStore()
    const router = useRouter()
    const { generateTicketQR } = useQRGenerator()
    
    const { 
      selectedEvent, 
      selectedTicket, 
      personalData, 
      ticketCode,
      ticketQuantity,
      totalAmount,
      paymentResult
    } = storeToRefs(store)

    // Verificar que llegamos aquí correctamente
    if (!selectedEvent.value || !selectedTicket.value || !ticketCode.value) {
      router.push('/')
      return
    }

    const getCardName = (cardType) => {
      const names = {
        'visa': 'Visa',
        'mastercard': 'Mastercard',
        'amex': 'American Express',
        'discover': 'Discover',
        'unknown': 'Tarjeta'
      }
      return names[cardType] || 'Tarjeta'
    }

    const getCardIcon = (cardType) => {
      const icons = {
        'visa': 'fab fa-cc-visa',
        'mastercard': 'fab fa-cc-mastercard',
        'amex': 'fab fa-cc-amex',
        'discover': 'fab fa-cc-discover',
        'unknown': 'fas fa-credit-card'
      }
      return icons[cardType] || 'fas fa-credit-card'
    }

    const downloadTicket = () => {
      try {
        const pdf = generatePDFBlob()
        // Guardar el PDF
        pdf.save(`Entrada-${ticketCode.value}.pdf`)
      } catch (error) {
        console.error('Error al generar el PDF:', error)
        alert('Hubo un error al generar el PDF. Por favor, intenta nuevamente.')
      }
    }

    const generatePDFBlob = () => {
      try {
        const pdf = new jsPDF()
        
        // Configurar fuente
        pdf.setFont('helvetica', 'normal')
        
        // Título principal
        pdf.setFontSize(24)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Tu Entrada Digital', 105, 20, { align: 'center' })
        
        // Obtener el QR code del canvas
        const canvas = document.getElementById('qrcode')
        if (canvas) {
          const qrImage = canvas.toDataURL('image/png')
          // QR code en la izquierda (x, y, width, height)
          pdf.addImage(qrImage, 'PNG', 20, 40, 80, 80)
        }
        
        // Código de entrada debajo del QR
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Código de Entrada:', 20, 130)
        pdf.setFont('helvetica', 'normal')
        pdf.text(ticketCode.value, 20, 137)
        
        // Detalles del Evento (lado derecho)
        let yPosition = 40
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Detalles del Evento', 110, yPosition)
        
        yPosition += 10
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Evento:', 110, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(selectedEvent.value.name, 145, yPosition)
        
        yPosition += 8
        pdf.setFont('helvetica', 'bold')
        pdf.text('Fecha:', 110, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(selectedEvent.value.date, 145, yPosition)
        
        yPosition += 8
        pdf.setFont('helvetica', 'bold')
        pdf.text('Ubicación:', 110, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(selectedEvent.value.location, 145, yPosition)
        
        yPosition += 8
        pdf.setFont('helvetica', 'bold')
        pdf.text('Tipo de Entrada:', 110, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(selectedTicket.value.name, 155, yPosition)
        
        yPosition += 8
        pdf.setFont('helvetica', 'bold')
        pdf.text('Cantidad:', 110, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(String(ticketQuantity.value), 145, yPosition)
        
        yPosition += 8
        pdf.setFont('helvetica', 'bold')
        pdf.text('Precio Total:', 110, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`$${totalAmount.value}`, 145, yPosition)
        
        // Línea separadora
        yPosition += 15
        pdf.line(110, yPosition, 200, yPosition)
        
        // Datos del Comprador
        yPosition += 10
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Datos del Comprador', 110, yPosition)
        
        yPosition += 10
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Nombre:', 110, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`${personalData.value.firstName} ${personalData.value.lastName}`, 145, yPosition)
        
        yPosition += 8
        pdf.setFont('helvetica', 'bold')
        pdf.text('Email:', 110, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(personalData.value.email, 145, yPosition)
        
        yPosition += 8
        pdf.setFont('helvetica', 'bold')
        pdf.text('Teléfono:', 110, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(personalData.value.phone, 145, yPosition)
        
        yPosition += 8
        pdf.setFont('helvetica', 'bold')
        pdf.text('Documento:', 110, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(personalData.value.document, 145, yPosition)
        
        return pdf
      } catch (error) {
        console.error('Error al generar el PDF:', error)
        throw error
      }
    }

    const sendTicketByEmail = async () => {
      try {
        const pdf = generatePDFBlob()
        const pdfBlob = pdf.output('blob')
        
        // Crear FormData para enviar el archivo
        const formData = new FormData()
        formData.append('email', personalData.value.email)
        formData.append('firstName', personalData.value.firstName)
        formData.append('lastName', personalData.value.lastName)
        formData.append('eventName', selectedEvent.value.name)
        formData.append('ticketCode', ticketCode.value)
        formData.append('pdf', pdfBlob, `Entrada-${ticketCode.value}.pdf`)
        
        // URL del backend - ajusta según tu configuración
        const backendUrl = import.meta.env.VITE_API_URL || ''
        
        const response = await fetch(`${backendUrl}/api/send-ticket-email`, {
          method: 'POST',
          body: formData
        })
        
        const result = await response.json()
        
        if (response.ok) {
          alert(`✅ Entrada enviada exitosamente a ${personalData.value.email}`)
          
          // Si hay una URL de preview (para desarrollo), mostrarla en consola
          if (result.previewUrl) {
            console.log('Preview del email:', result.previewUrl)
          }
        } else {
          throw new Error(result.message || 'Error al enviar el email')
        }
      } catch (error) {
        console.error('Error al enviar el email:', error)
        
        // Fallback: usar mailto como alternativa
        const subject = encodeURIComponent(`Tu Entrada - ${selectedEvent.value.name}`)
        const body = encodeURIComponent(
          `Hola ${personalData.value.firstName},\n\n` +
          `Aquí está tu entrada para ${selectedEvent.value.name}.\n` +
          `Código: ${ticketCode.value}\n\n` +
          `Por favor, descarga el PDF desde la página web usando el botón "Descargar Entrada".\n\n` +
          `Nota: Para recibir el PDF por email automáticamente, asegúrate de que el servidor backend esté configurado correctamente.`
        )
        
        // Preguntar al usuario si desea abrir el cliente de email
        if (confirm('No se pudo enviar el email automáticamente. ¿Deseas abrir tu cliente de email para enviarlo manualmente?')) {
          window.location.href = `mailto:${personalData.value.email}?subject=${subject}&body=${body}`
        }
      }
    }

    const startOver = () => {
      store.resetStore()
      router.push('/')
    }

    onMounted(async () => {
      if (ticketCode.value) {
        await generateTicketQR(
          ticketCode.value, 
          selectedEvent.value, 
          selectedTicket.value, 
          personalData.value,
          ticketQuantity.value
        )
      }
    })

    return {
      selectedEvent,
      selectedTicket,
      personalData,
      ticketCode,
      ticketQuantity,
      totalAmount,
      paymentResult,
      getCardName,
      getCardIcon,
      downloadTicket,
      sendTicketByEmail,
      startOver
    }
  }
}
</script>

<style scoped>
/* Estilos específicos de Confirmation si son necesarios */
</style>