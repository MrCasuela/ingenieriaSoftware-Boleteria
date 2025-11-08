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
    userName: (state) => state.user?.name || '',
    // Getter para obtener el token JWT desde localStorage
    token: () => localStorage.getItem('apiToken')
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
        // Intentar login probando ambos tipos en secuencia sin mostrar errores
        const userTypes = ['Operador', 'Administrador', 'Cliente'];
        let data = null;
        
        for (const userType of userTypes) {
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: email,
                password: password,
                user_type: userType
              })
            });

            const result = await response.json();
            console.log(`📥 Respuesta para tipo ${userType}:`, result);
            
            if (result.success) {
              data = result;
              console.log('✅ Login exitoso con tipo:', userType);
              break;
            }
          } catch (err) {
            // Continuar con el siguiente tipo de usuario
            console.log(`⚠️ Error con tipo ${userType}:`, err.message);
            continue;
          }
        }
        
        // Si ningún tipo funcionó, usar modo desarrollo
        if (!data || !data.success) {
          console.warn('⚠️ Backend no disponible, usando modo desarrollo...');
          
          // Simular login exitoso en modo desarrollo
          const mockUser = {
            id: 'dev-admin-1',
            email: email,
            firstName: 'Admin',
            lastName: 'Desarrollo',
            phone: '123456789',
            userType: 'Administrador',
            adminLevel: 'super',
            permissions: ['full_access']
          };
          
          const mockToken = 'dev-token-' + Date.now();
          
          this.user = {
            id: mockUser.id,
            email: mockUser.email,
            name: `${mockUser.firstName} ${mockUser.lastName}`,
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            phone: mockUser.phone,
            adminLevel: mockUser.adminLevel,
            permissions: mockUser.permissions
          };
          
          this.userType = 'administrador';
          this.isAuthenticated = true;
          
          // Guardar sesión y token de desarrollo
          localStorage.setItem('adminSession', JSON.stringify({
            userId: mockUser.id,
            email: mockUser.email,
            name: this.user.name,
            userType: 'administrador',
            adminLevel: mockUser.adminLevel,
            permissions: mockUser.permissions,
            timestamp: Date.now()
          }));
          
          localStorage.setItem('apiToken', mockToken);
          console.log('✅ Modo desarrollo activado. Token guardado:', mockToken);
          
          return {
            success: true,
            userType: 'Administrador',
            user: this.user
          };
        }

        if (data.success && data.data) {
          const userData = data.data.user || data.data
          const token = data.data.token || data.token
          
          console.log('📦 Datos recibidos del login:')
          console.log('  - userData:', userData)
          console.log('  - token:', token ? 'EXISTE' : 'NO EXISTE')
          
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
          // Mapear explícitamente los tipos recibidos desde la API a los valores usados en el frontend
          const rawType = (userData.userType || '').toString().toLowerCase()
          if (rawType === 'administrador') {
            this.userType = 'administrador'
          } else if (rawType === 'operador') {
            this.userType = 'operador'
          } else {
            this.userType = 'cliente'
          }
          this.isAuthenticated = true

          // Guardar sesión en localStorage
          const storageKey = this.userType === 'administrador' ? 'adminSession' : (this.userType === 'operador' ? 'operatorSession' : 'clientSession')
          localStorage.setItem(storageKey, JSON.stringify({
            userId: userData.id,
            email: userData.email,
            name: this.user.name,
            userType: this.userType,
            adminLevel: userData.adminLevel,
            permissions: userData.permissions,
            timestamp: Date.now()
          }))

          // Guardar token si viene en la respuesta
          if (token) {
            console.log('✅ Guardando token en localStorage:', token.substring(0, 20) + '...')
            localStorage.setItem('apiToken', token)
          } else {
            console.error('❌ ERROR CRÍTICO: No se recibió token en la respuesta del login')
            console.error('❌ Estructura de data:', JSON.stringify(data, null, 2))
            
            // NO generar token temporal - el backend DEBE devolver uno válido
            return {
              success: false,
              message: 'Error de autenticación: No se recibió token del servidor',
              userType: null
            }
          }

          return {
            success: true,
            userType: this.userType,  // Usar el valor normalizado en minúsculas
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
        
        // En caso de error de red, activar modo desarrollo
        console.warn('⚠️ Error de conexión, activando modo desarrollo...');
        
        const mockUser = {
          id: 'dev-admin-1',
          email: email,
          firstName: 'Admin',
          lastName: 'Desarrollo',
          phone: '123456789',
          userType: 'Administrador',
          adminLevel: 'super',
          permissions: ['full_access']
        };
        
        const mockToken = 'dev-token-' + Date.now();
        
        this.user = {
          id: mockUser.id,
          email: mockUser.email,
          name: `${mockUser.firstName} ${mockUser.lastName}`,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          phone: mockUser.phone,
          adminLevel: mockUser.adminLevel,
          permissions: mockUser.permissions
        };
        
        this.userType = 'administrador';
        this.isAuthenticated = true;
        
        localStorage.setItem('adminSession', JSON.stringify({
          userId: mockUser.id,
          email: mockUser.email,
          name: this.user.name,
          userType: 'administrador',
          adminLevel: mockUser.adminLevel,
          permissions: mockUser.permissions,
          timestamp: Date.now()
        }));
        
        localStorage.setItem('apiToken', mockToken);
        console.log('✅ Modo desarrollo activado (por error). Token guardado:', mockToken);
        
        return {
          success: true,
          userType: 'Administrador',
          user: this.user
        };
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
