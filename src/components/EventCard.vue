<template>
  <div class="card event-card h-100" @click="$emit('select', event)">
    <img :src="event.image" class="card-img-top" :alt="event.name" style="height: 200px; object-fit: cover;">
    <div class="card-body d-flex flex-column">
      <h5 class="card-title">{{ event.name }}</h5>
      <p class="card-text flex-grow-1">{{ event.description }}</p>
      <div class="mt-auto">
        <p class="card-text">
          <small class="text-muted">
            <i class="fas fa-calendar me-2"></i>{{ event.date }}
          </small>
        </p>
        <p class="card-text">
          <small class="text-muted">
            <i class="fas fa-map-marker-alt me-2"></i>{{ event.location }}
          </small>
        </p>
        <p class="card-text">
          <strong class="text-primary">Desde ${{ event.minPrice }}</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EventCard',
  props: {
    event: {
      type: Object,
      required: true
    }
  },
  emits: ['select']
}
</script>