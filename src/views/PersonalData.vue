<template>
  <div>
    <HomeButton position="top-right" />
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-8">
        <h2 class="mb-4">Datos Personales</h2>
        <form @submit.prevent="processPayment">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="firstName" class="form-label">Nombre *</label>
              <input type="text" class="form-control" id="firstName" v-model="personalData.firstName" required>
            </div>
            <div class="col-md-6 mb-3">
              <label for="lastName" class="form-label">Apellido *</label>
              <input type="text" class="form-control" id="lastName" v-model="personalData.lastName" required>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="email" class="form-label">Email *</label>
              <input type="email" class="form-control" id="email" v-model="personalData.email" required>
            </div>
            <div class="col-md-6 mb-3">
              <label for="phone" class="form-label">Teléfono *</label>
              <input type="tel" class="form-control" id="phone" v-model="personalData.phone" required>
            </div>
          </div>
          <div class="mb-3">
            <label for="document" class="form-label">Documento de Identidad *</label>
            <input type="text" class="form-control" id="document" v-model="personalData.document" required>
          </div>
          
          <h4 class="mt-4 mb-3">Datos de Pago</h4>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="cardNumber" class="form-label">Número de Tarjeta *</label>
              <input type="text" class="form-control" id="cardNumber" v-model="paymentData.cardNumber" 
                     placeholder="1234 5678 9012 3456" maxlength="19" required>
            </div>
            <div class="col-md-6 mb-3">
              <label for="cardName" class="form-label">Nombre en la Tarjeta *</label>
              <input type="text" class="form-control" id="cardName" v-model="paymentData.cardName" required>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="expiry" class="form-label">Fecha de Vencimiento *</label>
              <input type="text" class="form-control" id="expiry" v-model="paymentData.expiry" 
                     placeholder="MM/AA" maxlength="5" required>
            </div>
            <div class="col-md-6 mb-3">
              <label for="cvv" class="form-label">CVV *</label>
              <input type="text" class="form-control" id="cvv" v-model="paymentData.cvv" 
                     placeholder="123" maxlength="4" required>
            </div>
          </div>

          <div class="d-flex justify-content-between mt-4">
            <button type="button" class="btn btn-outline-secondary" @click="goBack">
              <i class="fas fa-arrow-left me-2"></i>Volver
            </button>
            <button type="submit" class="btn btn-success" :disabled="processing">
              <span v-if="processing">
                <i class="fas fa-spinner fa-spin me-2"></i>Procesando...
              </span>
              <span v-else>
                Procesar Pago <i class="fas fa-credit-card ms-2"></i>
              </span>
            </button>
          </div>
        </form>
      </div>
      <div class="col-md-4">
        <div class="ticket-summary">
          <h5 class="text-white mb-3">Resumen de Compra</h5>
          <div class="mb-2">
            <strong>{{ selectedEvent.name }}</strong>
          </div>
          <div class="mb-2">
            <small>{{ selectedEvent.date }} - {{ selectedEvent.location }}</small>
          </div>
          <hr class="bg-white">
          <div class="d-flex justify-content-between mb-2">
            <span>{{ selectedTicket.name }}</span>
            <span>${{ selectedTicket.price }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span>Cargos por servicio</span>
            <span>${{ serviceCharge }}</span>
          </div>
          <hr class="bg-white">
          <div class="d-flex justify-content-between">
            <strong>Total:</strong>
            <strong>${{ totalAmount }}</strong>
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
import { useFormFormatting } from '../composables/useFormFormatting.js'
import HomeButton from '../components/HomeButton.vue'

export default {
  name: 'PersonalData',
  components: {
    HomeButton
  },
  setup() {
    const store = useTicketStore()
    const router = useRouter()
    const { setupCardNumberFormatting, setupExpiryFormatting } = useFormFormatting()
    
    const { 
      selectedEvent, 
      selectedTicket, 
      personalData, 
      paymentData, 
      processing, 
      serviceCharge, 
      totalAmount 
    } = storeToRefs(store)

    // Verificar que tenemos evento y ticket seleccionados
    if (!selectedEvent.value || !selectedTicket.value) {
      router.push('/')
      return
    }

    const processPayment = async () => {
      try {
        await store.processPayment()
        router.push('/confirmation')
      } catch (error) {
        console.error('Error processing payment:', error)
        alert('Error procesando el pago. Intenta nuevamente.')
      }
    }

    const goBack = () => {
      store.goBack()
      router.push(`/tickets/${selectedEvent.value.id}`)
    }

    onMounted(() => {
      setupCardNumberFormatting(paymentData.value.cardNumber)
      setupExpiryFormatting(paymentData.value.expiry)
    })

    return {
      selectedEvent,
      selectedTicket,
      personalData,
      paymentData,
      processing,
      serviceCharge,
      totalAmount,
      processPayment,
      goBack
    }
  }
}
</script>

<style scoped>
/* Estilos específicos de PersonalData si son necesarios */
</style>