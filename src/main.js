import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useTicketStore } from './stores/ticketStore'
import { useAuthStore } from './stores/authStore'
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/styles.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Inicializar stores después de montar Pinia
app.mount('#app')

// Inicializar el store de tickets para cargar datos persistidos
const ticketStore = useTicketStore()
ticketStore.initializeStore()

// Inicializar el store de autenticación
const authStore = useAuthStore()
authStore.checkSession()
console.log('🔐 Auth Store inicializado:', authStore.isAuthenticated)
