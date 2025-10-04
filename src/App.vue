<template>
  <div id="app">
    <NavBar />
    <ProgressIndicator />
    <router-view />
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
import ProgressIndicator from './components/ProgressIndicator.vue'

export default {
  name: 'App',
  components: {
    NavBar,
    ProgressIndicator
  }
}
</script>