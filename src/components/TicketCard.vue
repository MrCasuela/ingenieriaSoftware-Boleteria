<template>
  <div class="card ticket-option" 
       :class="{selected: isSelected}"
       @click="$emit('select', ticket)">
    <div class="card-body">
      <h5 class="card-title">{{ ticket.name }}</h5>
      <p class="card-text">{{ ticket.description }}</p>
      <div class="d-flex justify-content-between align-items-center">
        <strong class="text-primary h4">${{ ticket.price }}</strong>
        <span class="badge bg-secondary">{{ ticket.available }} disponibles</span>
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