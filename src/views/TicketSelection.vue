<template>
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
              <p class="mb-1">{{ selectedTicket.name }}</p>
              <strong class="text-primary">${{ selectedTicket.price }}</strong>
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

export default {
  name: 'TicketSelection',
  components: {
    TicketCard
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
    const { selectedEvent, selectedTicket } = storeToRefs(store)

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

    return {
      selectedEvent,
      selectedTicket,
      selectTicket,
      proceedToPersonalData,
      goBack
    }
  }
}
</script>