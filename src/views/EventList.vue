<template>
  <div>
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="container text-center">
        <h1 class="display-4 mb-4">¡Descubre Eventos Increíbles!</h1>
        <p class="lead">Compra tu entrada de forma rápida y segura</p>
      </div>
    </div>

    <div class="container mt-5">
      <div class="row">
        <div class="col-md-4 mb-4" v-for="event in events" :key="event.id">
          <EventCard :event="event" @select="selectEvent" />
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
import EventCard from '../components/EventCard.vue'

export default {
  name: 'EventList',
  components: {
    EventCard
  },
  setup() {
    const store = useTicketStore()
    const router = useRouter()
    const { events } = storeToRefs(store)

    const selectEvent = (event) => {
      store.selectEvent(event)
      router.push(`/tickets/${event.id}`)
    }

    // Resetear el progreso cuando se vuelve a la lista de eventos
    onMounted(() => {
      store.currentStep = 1
    })

    return {
      events,
      selectEvent
    }
  }
}
</script>