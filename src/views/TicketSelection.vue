<template>
  <div>
    <HomeButton position="top-center" />
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-8">
        <h2 class="mb-4">{{ selectedEvent.name }}</h2>
        <p class="text-muted mb-4">{{ selectedEvent.description }}</p>
        
        <h4 class="mb-3">Selecciona tu entrada:</h4>
        <div class="row">
          <div class="col-md-6 mb-3" v-for="ticket in selectedEvent.tickets" :key="ticket.id">
            <TicketCard 
              :ticket="ticket" 
              :isSelected="selectedTicket && selectedTicket.id === ticket.id"
              @select="selectTicket" 
            />
          </div>
        </div>

        <!-- Selector de cantidad -->
        <div v-if="selectedTicket" class="card mt-3">
          <div class="card-body">
            <h5 class="mb-3">Cantidad de Entradas</h5>
            <div class="d-flex align-items-center justify-content-between">
              <button 
                class="btn btn-outline-secondary" 
                @click="decreaseQuantity" 
                :disabled="ticketQuantity <= 1"
              >
                <i class="fas fa-minus"></i>
              </button>
              <div class="text-center mx-3">
                <h3 class="mb-0">{{ ticketQuantity }}</h3>
                <small class="text-muted">Disponibles: {{ selectedTicket.available }}</small>
              </div>
              <button 
                class="btn btn-outline-secondary" 
                @click="increaseQuantity" 
                :disabled="ticketQuantity >= selectedTicket.available"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-between mt-4">
          <button class="btn btn-outline-secondary" @click="goBack">
            <i class="fas fa-arrow-left me-2"></i>Volver
          </button>
          <button class="btn btn-primary" @click="proceedToPersonalData" :disabled="!selectedTicket">
            Continuar <i class="fas fa-arrow-right ms-2"></i>
          </button>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Resumen del Evento</h5>
          </div>
          <div class="card-body">
            <img :src="selectedEvent.image" class="img-fluid rounded mb-3" :alt="selectedEvent.name">
            <p><strong>Fecha:</strong> {{ selectedEvent.date }}</p>
            <p><strong>Ubicación:</strong> {{ selectedEvent.location }}</p>
            <div v-if="selectedTicket" class="mt-3 p-3 bg-light rounded">
              <h6>Entrada Seleccionada:</h6>
              <p class="mb-1">{{ selectedTicket.name }} x{{ ticketQuantity }}</p>
              <p class="mb-1 text-muted">${{ selectedTicket.price }} c/u</p>
              <strong class="text-primary">Subtotal: ${{ subtotal }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import { useTicketStore } from '../stores/ticketStore.js'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import TicketCard from '../components/TicketCard.vue'
import HomeButton from '../components/HomeButton.vue'

export default {
  name: 'TicketSelection',
  components: {
    TicketCard,
    HomeButton
  },
  props: {
    eventId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const store = useTicketStore()
    const router = useRouter()
    const { selectedEvent, selectedTicket, ticketQuantity, subtotal } = storeToRefs(store)

    // Si no hay evento seleccionado, buscarlo por ID
    if (!selectedEvent.value) {
      const event = store.getEventById(props.eventId)
      if (event) {
        store.selectEvent(event)
      } else {
        router.push('/')
      }
    }

    const selectTicket = (ticket) => {
      store.selectTicket(ticket)
    }

    const proceedToPersonalData = () => {
      store.proceedToPersonalData()
      router.push('/personal-data')
    }

    const goBack = () => {
      router.push('/')
    }

    const increaseQuantity = () => {
      store.increaseQuantity()
    }

    const decreaseQuantity = () => {
      store.decreaseQuantity()
    }

    return {
      selectedEvent,
      selectedTicket,
      ticketQuantity,
      subtotal,
      selectTicket,
      proceedToPersonalData,
      goBack,
      increaseQuantity,
      decreaseQuantity
    }
  }
}
</script>

<style scoped>
/* Estilos específicos de TicketSelection si son necesarios */
</style>