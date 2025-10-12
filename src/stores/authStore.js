import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    userType: null, // 'operador' o 'administrador'
    isAuthenticated: false
  }),

  getters: {
    isOperator: (state) => state.isAuthenticated && state.userType === 'operador',
    isAdministrator: (state) => state.isAuthenticated && state.userType === 'administrador',
    userName: (state) => state.user?.name || ''
  },

  actions: {
    // Inicializar usuarios por defecto si no existen
    initializeUsers() {
      // Inicializar operadores
      const operators = localStorage.getItem('operators')
      if (!operators) {
        const defaultOperators = [
          { username: 'operador1', password: 'admin123', name: 'Juan Pérez' },
          { username: 'operador2', password: 'admin456', name: 'María González' }
        ]
        localStorage.setItem('operators', JSON.stringify(defaultOperators))
      }

      // Inicializar administradores
      const admins = localStorage.getItem('administrators')
      if (!admins) {
        const defaultAdmins = [
          { 
            username: 'admin1', 
            password: 'admin123', 
            name: 'Carlos Admin',
            adminLevel: 'super',
            permissions: ['full_access']
          },
          { 
            username: 'admin2', 
            password: 'admin456', 
            name: 'Ana Administradora',
            adminLevel: 'moderador',
            permissions: ['manage_events', 'view_reports', 'manage_tickets']
          }
        ]
        localStorage.setItem('administrators', JSON.stringify(defaultAdmins))
      }
    },

    // Login unificado para operadores y administradores
    login(username, password, userType = 'operador') {
      this.initializeUsers()
      
      let users = []
      let storageKey = ''
      
      if (userType === 'administrador') {
        users = JSON.parse(localStorage.getItem('administrators') || '[]')
        storageKey = 'adminSession'
      } else {
        users = JSON.parse(localStorage.getItem('operators') || '[]')
        storageKey = 'operatorSession'
      }

      const user = users.find(
        u => u.username === username && u.password === password
      )

      if (user) {
        this.user = {
          username: user.username,
          name: user.name,
          adminLevel: user.adminLevel,
          permissions: user.permissions
        }
        this.userType = userType
        this.isAuthenticated = true
        
        // Guardar sesión en localStorage
        localStorage.setItem(storageKey, JSON.stringify({
          username: user.username,
          name: user.name,
          userType: userType,
          adminLevel: user.adminLevel,
          permissions: user.permissions,
          timestamp: Date.now()
        }))
        
        return true
      }
      
      return false
    },

    // Login con API del backend - Detecta automáticamente el tipo de usuario
    async loginWithAPI(email, password) {
      try {
        // Primero intentar con Operador
        let response = await fetch('/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            password: password,
            user_type: 'Operador'
          })
        })

        let data = await response.json()

        // Si no fue exitoso con Operador, intentar con Administrador
        if (!data.success) {
          response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: email,
              password: password,
              user_type: 'Administrador'
            })
          })

          data = await response.json()
        }

        if (data.success && data.data) {
          const userData = data.data
          
          // Guardar datos del usuario en el store
          this.user = {
            id: userData.id,
            email: userData.email,
            name: `${userData.firstName} ${userData.lastName}`,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            employeeId: userData.employeeId,
            adminLevel: userData.adminLevel,
            permissions: userData.permissions,
            shift: userData.shift
          }
          this.userType = userData.userType.toLowerCase() === 'administrador' ? 'administrador' : 'operador'
          this.isAuthenticated = true

          // Guardar sesión en localStorage
          const storageKey = this.userType === 'administrador' ? 'adminSession' : 'operatorSession'
          localStorage.setItem(storageKey, JSON.stringify({
            userId: userData.id,
            email: userData.email,
            name: this.user.name,
            userType: this.userType,
            adminLevel: userData.adminLevel,
            permissions: userData.permissions,
            timestamp: Date.now()
          }))

          return {
            success: true,
            userType: userData.userType,
            user: this.user
          }
        } else {
          return {
            success: false,
            message: data.message || 'Credenciales inválidas'
          }
        }
      } catch (error) {
        console.error('Error en loginWithAPI:', error)
        return {
          success: false,
          message: 'Error al conectar con el servidor'
        }
      }
    },

    // Logout
    logout() {
      this.user = null
      this.userType = null
      this.isAuthenticated = false
      localStorage.removeItem('operatorSession')
      localStorage.removeItem('adminSession')
    },

    // Verificar sesión existente
    checkSession() {
      // Intentar recuperar sesión de operador
      let session = localStorage.getItem('operatorSession')
      let type = 'operador'
      
      // Si no hay sesión de operador, intentar con admin
      if (!session) {
        session = localStorage.getItem('adminSession')
        type = 'administrador'
      }
      
      if (session) {
        const sessionData = JSON.parse(session)
        
        // Verificar que la sesión no tenga más de 24 horas
        const hoursSinceLogin = (Date.now() - sessionData.timestamp) / (1000 * 60 * 60)
        
        if (hoursSinceLogin < 24) {
          this.user = {
            username: sessionData.username,
            name: sessionData.name,
            adminLevel: sessionData.adminLevel,
            permissions: sessionData.permissions
          }
          this.userType = sessionData.userType || type
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
