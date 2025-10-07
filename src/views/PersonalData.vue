<template>
  <div>
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
            <label for="document" class="form-label">RUT *</label>
            <input type="text" class="form-control" id="document" v-model="personalData.document" 
                   placeholder="12345678-9" maxlength="10" required
                   @input="formatRut">
          </div>
          
          <h4 class="mt-4 mb-3">Datos de Pago</h4>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="cardNumber" class="form-label">Número de Tarjeta *</label>
              <input type="text" class="form-control" id="cardNumber" v-model="paymentData.cardNumber" 
                     placeholder="1234 5678 9012 3456" maxlength="19" 
                     pattern="[0-9 ]{16,19}" inputmode="numeric" required
                     @input="formatCardNumber">
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
                     placeholder="MM/AA" maxlength="5" required
                     @input="formatExpiry">
            </div>
            <div class="col-md-6 mb-3">
              <label for="cvv" class="form-label">CVV *</label>
              <input type="text" class="form-control" id="cvv" v-model="paymentData.cvv" 
                     placeholder="123" maxlength="3" required
                     @input="formatCVV">
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
            <span>{{ selectedTicket.name }} x{{ ticketQuantity }}</span>
            <span>${{ subtotal }}</span>
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

export default {
  name: 'PersonalData',
  setup() {
    const store = useTicketStore()
    const router = useRouter()
    const { setupCardNumberFormatting, setupExpiryFormatting } = useFormFormatting()
    
    const { 
      selectedEvent, 
      selectedTicket,
      ticketQuantity,
      personalData, 
      paymentData, 
      processing, 
      serviceCharge,
      subtotal,
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

    // Formatear RUT autom\u00e1ticamente (ej: 12345678-9)
    const formatRut = (event) => {
      let value = event.target.value.replace(/[^0-9kK]/g, '') // Solo n\u00fameros y K
      
      if (value.length > 1) {
        // Separar n\u00fameros del d\u00edgito verificador
        const numbers = value.slice(0, -1)
        const dv = value.slice(-1).toUpperCase()
        
        if (numbers.length > 0) {
          value = `${numbers}-${dv}`
        }
      }
      
      personalData.value.document = value
    }

    // Formatear n\u00famero de tarjeta (ej: 1234 5678 9012 3456)
    const formatCardNumber = (event) => {
      let value = event.target.value.replace(/\\s/g, '').replace(/\\D/g, '') // Solo n\u00fameros
      
      // Limitar a 16 d\u00edgitos
      if (value.length > 16) {
        value = value.substring(0, 16)
      }
      
      // Agregar espacios cada 4 d\u00edgitos
      const formatted = value.replace(/(\\d{4})/g, '$1 ').trim()
      paymentData.value.cardNumber = formatted
    }

    // Formatear fecha de vencimiento (ej: MM/AA)
    const formatExpiry = (event) => {
      // Remover todo lo que no sea número
      let value = event.target.value.replace(/\D/g, '')

      // Limitar a 4 dígitos (MMAA)
      if (value.length > 4) {
        value = value.substring(0, 4)
      }

      // Agregar barra después del mes (solo si hay más de 2 dígitos)
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2)
      }

      
      paymentData.value.expiry = value
    }

    // Formatear CVV (solo 3 n\u00fameros)
    const formatCVV = (event) => {
      let value = event.target.value.replace(/\\D/g, '') // Solo n\u00fameros
      
      // Limitar a 3 d\u00edgitos
      if (value.length > 3) {
        value = value.substring(0, 3)
      }
      
      paymentData.value.cvv = value
    }

    onMounted(() => {
      setupCardNumberFormatting(paymentData.value.cardNumber)
      setupExpiryFormatting(paymentData.value.expiry)
    })

    return {
      selectedEvent,
      selectedTicket,
      ticketQuantity,
      personalData,
      paymentData,
      processing,
      serviceCharge,
      subtotal,
      totalAmount,
      processPayment,
      goBack,
      formatRut,
      formatCardNumber,
      formatExpiry,
      formatCVV
    }
  }
}
</script>

<style scoped>
/* Estilos específicos de PersonalData si son necesarios */
</style>
