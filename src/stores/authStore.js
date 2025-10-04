import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    operator: null,
    isAuthenticated: false
  }),

  getters: {
    isOperator: (state) => state.isAuthenticated && state.operator !== null,
    operatorName: (state) => state.operator?.username || ''
  },

  actions: {
    // Inicializar operadores por defecto si no existen
    initializeOperators() {
      const operators = localStorage.getItem('operators')
      if (!operators) {
        const defaultOperators = [
          { username: 'operador1', password: 'admin123', name: 'Juan Pérez' },
          { username: 'operador2', password: 'admin456', name: 'María González' }
        ]
        localStorage.setItem('operators', JSON.stringify(defaultOperators))
      }
    },

    // Login de operador
    login(username, password) {
      this.initializeOperators()
      
      const operators = JSON.parse(localStorage.getItem('operators') || '[]')
      const operator = operators.find(
        op => op.username === username && op.password === password
      )

      if (operator) {
        this.operator = {
          username: operator.username,
          name: operator.name
        }
        this.isAuthenticated = true
        
        // Guardar sesión en localStorage
        localStorage.setItem('operatorSession', JSON.stringify({
          username: operator.username,
          name: operator.name,
          timestamp: Date.now()
        }))
        
        return true
      }
      
      return false
    },

    // Logout
    logout() {
      this.operator = null
      this.isAuthenticated = false
      localStorage.removeItem('operatorSession')
    },

    // Verificar sesión existente
    checkSession() {
      const session = localStorage.getItem('operatorSession')
      if (session) {
        const sessionData = JSON.parse(session)
        
        // Verificar que la sesión no tenga más de 24 horas
        const hoursSinceLogin = (Date.now() - sessionData.timestamp) / (1000 * 60 * 60)
        
        if (hoursSinceLogin < 24) {
          this.operator = {
            username: sessionData.username,
            name: sessionData.name
          }
          this.isAuthenticated = true
          return true
        } else {
          // Sesión expirada
          this.logout()
        }
      }
      
      return false
    }
  }
})
