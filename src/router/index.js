import { createRouter, createWebHistory } from 'vue-router'
import EventList from '../views/EventList.vue'
import TicketSelection from '../views/TicketSelection.vue'
import PersonalData from '../views/PersonalData.vue'
import Confirmation from '../views/Confirmation.vue'
import OperatorLogin from '../views/OperatorLogin.vue'
import OperatorPanel from '../views/OperatorPanel.vue'
import AdminPanel from '../views/AdminPanel.vue'
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
    meta: { requiresAuth: true, requiresOperator: true, hideNavigation: true }
  },
  {
    path: '/admin/panel',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true, hideNavigation: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard para proteger rutas
router.beforeEach((to, from, next) => {
  // Evitar error si Pinia no está inicializado aún
  try {
    const authStore = useAuthStore()
    
    // Verificar sesión existente
    if (!authStore.isAuthenticated) {
      authStore.checkSession()
    }

    // Verificar autenticación
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      // Redirigir al login si se requiere autenticación
      next('/operator/login')
      return
    }

    // Verificar rol de operador - NO puede acceder a admin
    if (to.meta.requiresOperator) {
      if (!authStore.isOperator) {
        if (authStore.isAdministrator) {
          // Admin no puede acceder al panel de operador, tiene su propio panel
          next('/admin/panel')
        } else {
          next('/operator/login')
        }
        return
      }
    }

    // Verificar rol de administrador - Solo admin puede acceder
    if (to.meta.requiresAdmin) {
      if (!authStore.isAdministrator) {
        if (authStore.isOperator) {
          // Operador no puede acceder al panel de admin
          alert('⚠️ No tienes permisos para acceder al panel de administrador. Solo administradores pueden ver reportes y gestionar usuarios.')
          next('/operator/panel')
        } else {
          next('/operator/login')
        }
        return
      }
    }

    // Redirigir al panel correspondiente si ya está autenticado y va al login
    if (to.name === 'OperatorLogin' && authStore.isAuthenticated) {
      if (authStore.isAdministrator) {
        next('/admin/panel')
      } else if (authStore.isOperator) {
        next('/operator/panel')
      } else {
        next()
      }
      return
    }

    // Continuar con la navegación
    next()
  } catch (error) {
    console.error('Error en navigation guard:', error)
    next()
  }
})

export default router
