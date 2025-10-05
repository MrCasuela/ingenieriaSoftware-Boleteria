import { createRouter, createWebHistory } from 'vue-router'
import EventList from '../views/EventList.vue'
import TicketSelection from '../views/TicketSelection.vue'
import PersonalData from '../views/PersonalData.vue'
import Confirmation from '../views/Confirmation.vue'
import OperatorLogin from '../views/OperatorLogin.vue'
import OperatorPanel from '../views/OperatorPanel.vue'
import { useAuthStore } from '../stores/authStore'

const routes = [
  {
    path: '/',
    name: 'EventList',
    component: EventList
  },
  {
    path: '/tickets/:eventId',
    name: 'TicketSelection',
    component: TicketSelection,
    props: true
  },
  {
    path: '/personal-data',
    name: 'PersonalData',
    component: PersonalData
  },
  {
    path: '/confirmation',
    name: 'Confirmation',
    component: Confirmation
  },
  {
    path: '/operator/login',
    name: 'OperatorLogin',
    component: OperatorLogin,
    meta: { hideNavigation: true }
  },
  {
    path: '/operator/panel',
    name: 'OperatorPanel',
    component: OperatorPanel,
    meta: { requiresAuth: true, hideNavigation: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard para proteger rutas del operador
router.beforeEach((to, from, next) => {
  // Evitar error si Pinia no está inicializado aún
  try {
    const authStore = useAuthStore()
    
    // Verificar sesión existente
    if (!authStore.isAuthenticated) {
      authStore.checkSession()
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      // Redirigir al login si se requiere autenticación
      next('/operator/login')
    } else if (to.name === 'OperatorLogin' && authStore.isAuthenticated) {
      // Redirigir al panel si ya está autenticado
      next('/operator/panel')
    } else {
      next()
    }
  } catch (error) {
    console.error('Error en navigation guard:', error)
    next()
  }
})

export default router