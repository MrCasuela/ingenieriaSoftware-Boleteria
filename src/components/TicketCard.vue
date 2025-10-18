<template>
  <div class="card ticket-option" 
       :class="{selected: isSelected, 'sold-out': ticket.available <= 0}"
       @click="ticket.available > 0 ? $emit('select', ticket) : null"
       :style="ticket.available <= 0 ? 'cursor: not-allowed; opacity: 0.6;' : ''"
       :title="ticket.available <= 0 ? 'Este tipo de entrada está agotado' : ''">
    <div class="card-body">
      <h5 class="card-title">{{ ticket.name }}</h5>
      <p class="card-text">{{ ticket.description }}</p>
      <div class="d-flex justify-content-between align-items-center">
        <strong class="text-primary h4">${{ ticket.price }}</strong>
        <span class="badge" :class="ticket.available > 0 ? 'bg-success' : 'bg-danger'">
          {{ ticket.available > 0 ? `${ticket.available} disponibles` : 'AGOTADO' }}
        </span>
      </div>
      <div v-if="ticket.available <= 0" class="text-center mt-2">
        <small class="text-muted">Este tipo de entrada no está disponible</small>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TicketCard',
  props: {
    ticket: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select']
}
</script>