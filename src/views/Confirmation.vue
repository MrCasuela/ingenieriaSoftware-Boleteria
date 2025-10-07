<template>
  <div>
    <HomeButton position="top-right" />
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
      totalAmount
    } = storeToRefs(store)

    // Verificar que llegamos aquí correctamente
    if (!selectedEvent.value || !selectedTicket.value || !ticketCode.value) {
      router.push('/')
      return
    }

    const downloadTicket = () => {
      alert('Descargando entrada... (Funcionalidad de ejemplo)')
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
      downloadTicket,
      startOver
    }
  }
}
</script>

<style scoped>
/* Estilos específicos de Confirmation si son necesarios */
</style>