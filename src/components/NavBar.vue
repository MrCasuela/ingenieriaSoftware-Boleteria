<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
      <router-link class="navbar-brand" to="/">
        <i class="fas fa-ticket-alt me-2"></i>
        TicketVue
      </router-link>
      <div class="navbar-nav ms-auto">
        <router-link class="nav-link operator-link" to="/operator/login">
          <i class="fas fa-user-shield me-1"></i>
          Acceso Operador
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBar'
}
</script>

<style scoped>
.operator-link {
  color: rgba(255, 255, 255, 0.8);
  transition: color 0.3s;
}

.operator-link:hover {
  color: white;
}
</style>
