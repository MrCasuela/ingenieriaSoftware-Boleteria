<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
      <router-link class="navbar-brand" to="/" @click="handleLogoClick">
        <i class="fas fa-ticket-alt me-2"></i>
        TicketVue
      </router-link>
    </div>
  </nav>
</template>

<script>
import { useTicketStore } from '../stores/ticketStore.js'
import { useRouter } from 'vue-router'

export default {
  name: 'NavBar',
  setup() {
    const store = useTicketStore()
    const router = useRouter()

    const handleLogoClick = () => {
      // Resetear el progreso cuando se vuelve al inicio
      store.currentStep = 1
      store.selectedEvent = null
      store.selectedTicket = null
    }

    return {
      handleLogoClick
    }
  }
}
</script>