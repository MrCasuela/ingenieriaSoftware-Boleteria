<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="icon">🔐</div>
        <h1>Control de Acceso</h1>
        <p>Ingreso para Operadores</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="errorMessage" class="error-alert">
          {{ errorMessage }}
        </div>

        <div class="form-group">
          <label for="username">Usuario</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="Ingrese su usuario"
            required
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Ingrese su contraseña"
            required
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="!loading">Iniciar Sesión</span>
          <span v-else>Verificando...</span>
        </button>
      </form>

      <div class="login-info">
        <h3>Información de Acceso:</h3>
        <ul>
          <li><strong>Usuario:</strong> operador1 | <strong>Contraseña:</strong> admin123</li>
          <li><strong>Usuario:</strong> operador2 | <strong>Contraseña:</strong> admin456</li>
        </ul>
        <p class="note">Esta información es solo para desarrollo</p>
      </div>

      <div class="back-link">
        <router-link to="/">← Volver a la página principal</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

export default {
  name: 'OperatorLogin',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const username = ref('')
    const password = ref('')
    const errorMessage = ref('')
    const loading = ref(false)

    const handleLogin = async () => {
      errorMessage.value = ''
      loading.value = true

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))

      const success = authStore.login(username.value, password.value)

      if (success) {
        router.push('/operator/panel')
      } else {
        errorMessage.value = 'Usuario o contraseña incorrectos'
        loading.value = false
      }
    }

    return {
      username,
      password,
      errorMessage,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 450px;
  width: 100%;
  overflow: hidden;
}

.login-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 30px;
  text-align: center;
}

.icon {
  font-size: 64px;
  margin-bottom: 15px;
}

.login-header h1 {
  font-size: 28px;
  margin-bottom: 5px;
}

.login-header p {
  opacity: 0.9;
  font-size: 14px;
}

.login-form {
  padding: 30px;
}

.error-alert {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-login {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-info {
  background: #fff3cd;
  border-top: 4px solid #ffc107;
  padding: 20px 30px;
}

.login-info h3 {
  font-size: 14px;
  color: #856404;
  margin-bottom: 10px;
}

.login-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.login-info li {
  color: #856404;
  font-size: 13px;
  margin-bottom: 8px;
}

.note {
  margin-top: 10px;
  font-size: 12px;
  color: #856404;
  font-style: italic;
}

.back-link {
  padding: 20px 30px;
  text-align: center;
}

.back-link a {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.back-link a:hover {
  color: #764ba2;
}
</style>
