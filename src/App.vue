<template>
  <div id="app">
    <NavBar v-if="!hideNavigation" />
    <ProgressIndicator v-if="!hideNavigation" />
    <router-view />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import ProgressIndicator from './components/ProgressIndicator.vue'

export default {
  name: 'App',
  components: {
    NavBar,
    ProgressIndicator
  },
  setup() {
    const route = useRoute()
    
    const hideNavigation = computed(() => {
      return route.meta.hideNavigation === true
    })

    return {
      hideNavigation
    }
  }
}
</script>