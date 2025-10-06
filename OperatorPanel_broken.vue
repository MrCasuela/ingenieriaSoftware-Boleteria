<template>
  <div class="operator-container">
    <!-- Header -->
    <div class="operator-header">
      <div class="header-content">
        <div class="operator-info">
          <h1>Panel de Operador</h1>
          <p class="operator-name">Bienvenido, {{ operatorName }}</p>
          <p class="event-info">{{ selectedEvent }}</p>
        </div>
        <button @click="logout" class="logout-btn">
          🚪 Cerrar Sesión
        </button>
      </div>
    </div>

    <div class="container">

      <div class="content">
        <!-- Barra de Estado -->
        <div class="status-bar">
          <div class="status-item">
            <div class="status-label">Total Tickets</div>
            <div class="status-value">{{ stats.total }}</div>
          </div>
          <div class="status-item">
            <div class="status-label">Ingresos</div>
            <div class="status-value">{{ stats.usados }}</div>
          </div>
          <div class="status-item">
            <div class="status-label">Disponibles</div>
            <div class="status-value">{{ stats.disponibles }}</div>
          </div>
        </div>

        <!-- Sección de Escaneo -->
        <div class="scan-section">
          <div class="scan-title">Escanear QR</div>
          <div class="camera-container" id="cameraContainer">
            <video ref="videoElement" autoplay playsinline></video>
            <div class="camera-placeholder" v-show="!isScanning">
              <div class="camera-icon">📷</div>
              <p>Posicione el código QR aquí</p>
            </div>
            <div class="scan-line" v-show="isScanning"></div>
          </div>
          <div class="scan-controls">
            <button 
              class="btn btn-primary" 
              @click="startScanning" 
              v-if="!isScanning"
            >
              📱 Escanear Código QR
            </button>
            <button 
              class="btn btn-secondary" 
              @click="stopScanning" 
              v-if="isScanning"
            >
              ❌ Detener Escaneo
            </button>
          </div>
          <div class="scan-status" v-if="isScanning">
            <div class="scanning-indicator">
              <div class="pulse"></div>
              <span>{{ scanStatusMessage }}</span>
            </div>
            <div class="scan-progress">
              <div class="progress-info">
                <small>Intentos: {{ scanAttempts }} | Tiempo restante: {{ remainingTime }}s</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Validación Manual -->
        <div class="manual-section">
          <div class="manual-title">Validación Manual</div>
          <div class="instructions">
            <h3>Instrucciones de Validación:</h3>
            <ul>
              <li>Escanear código QR o ingresar manualmente el código del ticket</li>
              <li>Verificar identidad con RUT del asistente</li>
              <li>Validar y entregar pulsera de acceso</li>
            </ul>
          </div>
          <div class="input-group">
            <label>Ingrese el código o RUT del asistente:</label>
            <input
              type="text"
              v-model="manualInput"
              placeholder="TKT-12345678 o 12.345.678-9"
              @keyup.enter="validateManual"
            />
          </div>
          <button class="btn btn-primary" @click="validateManual">Validar</button>
        </div>
      </div>
    </div>

    <!-- Modal de Resultado -->
    <div class="result-modal" :class="{ active: showModal }" @click="closeModalOnBackdrop">
      <div class="result-content" @click.stop>
        <div class="result-icon" :class="{ success: validationResult.success, error: !validationResult.success }">
          {{ validationResult.success ? '✅' : '❌' }}
        </div>
        <div class="result-title">{{ validationResult.title }}</div>
        <div class="result-message">{{ validationResult.message }}</div>

        <div class="user-info" v-if="validationResult.ticket">
          <div class="user-info-item">
            <span class="user-info-label">RUT:</span>
            <span class="user-info-value">{{ validationResult.ticket.rut }}</span>
          </div>
          <div class="user-info-item">
            <span class="user-info-label">Nombre:</span>
            <span class="user-info-value">{{ validationResult.ticket.nombre }}</span>
          </div>
          <div class="user-info-item">
            <span class="user-info-label">Evento:</span>
            <span class="user-info-value">{{ validationResult.ticket.evento }}</span>
          </div>
          <div class="user-info-item">
            <span class="user-info-label">Tipo de Ticket:</span>
            <span class="user-info-value">{{ validationResult.ticket.tipo }}</span>
          </div>
          <div class="user-info-item">
            <span class="user-info-label">Código:</span>
            <span class="user-info-value">{{ validationResult.ticket.codigo }}</span>
          </div>
        </div>

        <button class="btn btn-primary" @click="closeModal">Continuar</button>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useTicketStore } from '../stores/ticketStore'

export default {
  name: 'OperatorPanel',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const ticketStore = useTicketStore()
    
    // Verificar autenticación al cargar el componente
    if (!authStore.isAuthenticated) {
      console.log('❌ Usuario no autenticado, redirigiendo...')
      router.push('/operator-login')
      // Retornar valores mínimos para evitar errores en el template
      return {
        authStore,
        operatorName: computed(() => ''),
        tickets: computed(() => []),
        isScanning: ref(false),
        logout: () => router.push('/operator-login')
      }
    }
    
    console.log('✅ Operador autenticado:', authStore.operatorName)
    console.log('📊 Tickets disponibles:', ticketStore.tickets.length)

    const videoElement = ref(null)
    const isScanning = ref(false)
    const stream = ref(null)
    const manualInput = ref('')
    const showModal = ref(false)
    const validationResult = ref({
      success: false,
      title: '',
      message: '',
      ticket: null
    })
    const scanTimeout = ref(null)
    const scanAttempts = ref(0)
    const maxScanTime = 15000
    const qrDetected = ref(false)
    const remainingTime = ref(15)

    const operatorName = computed(() => authStore.operatorName)
    const selectedEvent = computed(() => 'Control de Eventos')
    const stats = computed(() => ticketStore.getTicketStats())
    
    const scanStatusMessage = computed(() => {
      if (!isScanning.value) return ''
      
      if (qrDetected.value) {
        return ' Código QR detectado! Procesando...'
      }
      
      if (scanAttempts.value === 0) {
        return 'Iniciando escaneo... Apunte el código QR hacia la cámara'
      }
      
      return ` Buscando código QR... Mantenga el código visible y estable`
    })
    
    const updateRemainingTime = () => {
      if (!isScanning.value) return
      
      const interval = setInterval(() => {
        if (!isScanning.value || remainingTime.value <= 0) {
          clearInterval(interval)
          return
        }
        remainingTime.value--
      }, 1000)
    }

    const startScanning = async () => {
      try {
        stream.value = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })
        
        if (videoElement.value) {
          videoElement.value.srcObject = stream.value
          isScanning.value = true
          qrDetected.value = false
          scanAttempts.value = 0
          remainingTime.value = 15

          console.log(' Iniciando escaneo...')
          
          updateRemainingTime()
          startQRDetection()
          
          scanTimeout.value = setTimeout(() => {
            if (isScanning.value && !qrDetected.value) {
              console.log(' Tiempo de escaneo agotado')
              showValidationResult(false, 'Tiempo Agotado', 'No se detectó ningún código QR en el tiempo límite. Intente de nuevo o use validación manual.')
              stopScanning()
            }
          }, maxScanTime)
        }
      } catch (err) {
        console.error('Error al acceder a la cámara:', err)
        showValidationResult(false, 'Error de Cámara', 'No se pudo acceder a la cámara. Por favor, use validación manual.')
        isScanning.value = false
      }
    }

    const startQRDetection = () => {
      if (!isScanning.value) return

      const detectionInterval = setInterval(() => {
        if (!isScanning.value || qrDetected.value) {
          clearInterval(detectionInterval)
          return
        }

        scanAttempts.value++
        console.log(` Intento de detección ${scanAttempts.value}...`)

        const detectionProbability = Math.min(scanAttempts.value * 0.15, 0.7)
        const randomChance = Math.random()

        if (randomChance < detectionProbability) {
          qrDetected.value = true
          clearInterval(detectionInterval)
          
          if (scanTimeout.value) {
            clearTimeout(scanTimeout.value)
          }

          console.log(' ¡Código QR detectado! Procesando...')
          
          setTimeout(() => {
            simulateQRDetection()
            stopScanning()
          }, 800)
        }
      }, 1500)
    }

    const stopScanning = () => {
      if (stream.value) {
        stream.value.getTracks().forEach(track => track.stop())
        stream.value = null
      }
      
      if (scanTimeout.value) {
        clearTimeout(scanTimeout.value)
        scanTimeout.value = null
      }
      
      isScanning.value = false
      qrDetected.value = false
      scanAttempts.value = 0
      
      console.log(' Escaneo detenido')
    }

    const validateManual = () => {
      const input = manualInput.value.trim()
      if (!input) {
        alert('Por favor, ingrese un RUT o código de ticket')
        return
      }

      validateTicket(input)
      manualInput.value = ''
    }

    const validateTicket = (identifier) => {
      const result = ticketStore.validateTicket(identifier)

      if (!result.valid) {
        showValidationResult(false, 'Acceso Denegado', result.message, result.ticket)
      } else {
        ticketStore.markTicketAsUsed(result.ticket.codigo)
        showValidationResult(
          true,
          'Acceso Autorizado',
          'El ticket es válido. Bienvenido al evento.',
          result.ticket
        )
      }
    }

    const simulateQRDetection = () => {
      console.log(' Decodificando código QR...')
      
      const tickets = JSON.parse(localStorage.getItem('purchasedTickets') || '[]')
      
      if (tickets.length === 0) {
        showValidationResult(false, 'Sin Datos', 'No hay tickets registrados en el sistema para validar')
        return
      }
      
      const scenarios = [
        { type: 'valid', weight: 50 },
        { type: 'used', weight: 30 },
        { type: 'invalid', weight: 15 },
        { type: 'corrupted', weight: 5 }
      ]
      
      const totalWeight = scenarios.reduce((sum, s) => sum + s.weight, 0)
      let random = Math.random() * totalWeight
      let selectedScenario = scenarios[0]
      
      for (const scenario of scenarios) {
        random -= scenario.weight
        if (random <= 0) {
          selectedScenario = scenario
          break
        }
      }
      
      console.log(` Escenario de simulación: ${selectedScenario.type}`)
      
      switch (selectedScenario.type) {
        case 'valid':
          const availableTickets = tickets.filter(t => !t.usado)
          if (availableTickets.length > 0) {
            const ticket = availableTickets[Math.floor(Math.random() * availableTickets.length)]
            console.log(` QR decodificado - Ticket válido: ${ticket.codigo}`)
            validateTicket(ticket.codigo)
          } else {
            const ticket = tickets[Math.floor(Math.random() * tickets.length)]
            console.log(` QR decodificado - Ticket ya usado: ${ticket.codigo}`)
            validateTicket(ticket.codigo)
          }
          break
          
        case 'used':
          const usedTickets = tickets.filter(t => t.usado)
          if (usedTickets.length > 0) {
            const ticket = usedTickets[Math.floor(Math.random() * usedTickets.length)]
            console.log(` QR decodificado - Ticket ya usado: ${ticket.codigo}`)
            validateTicket(ticket.codigo)
          } else {
            const ticket = tickets[Math.floor(Math.random() * tickets.length)]
            console.log(` QR decodificado - Ticket válido: ${ticket.codigo}`)
            validateTicket(ticket.codigo)
          }
          break
          
        case 'invalid':
          const fakeCode = `TKT-${Math.floor(Math.random() * 90000000) + 10000000}`
          console.log(` QR decodificado - Código inexistente: ${fakeCode}`)
          validateTicket(fakeCode)
          break
          
        case 'corrupted':
          console.log(' QR corrupto o ilegible')
          showValidationResult(false, 'QR Ilegible', 'El código QR está dañado o no se puede leer correctamente. Intente de nuevo o use validación manual.')
          break
      }
    }

    const showValidationResult = (success, title, message, ticket = null) => {
      validationResult.value = {
        success,
        title,
        message,
        ticket
      }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
    }

    const closeModalOnBackdrop = (e) => {
      if (e.target.classList.contains('result-modal')) {
        closeModal()
      }
    }

    const handleLogout = () => {
      if (confirm('¿Está seguro que desea cerrar sesión?')) {
        stopScanning()
        authStore.logout()
        router.push('/operator/login')
      }
    }

    onUnmounted(() => {
      stopScanning()
    })

    return {
      authStore,
      tickets,
      videoElement,
      isScanning,
      manualInput,
      showModal,
      validationResult,
      operatorName,
      selectedEvent,
      stats,
      scanAttempts,
      qrDetected,
      remainingTime,
      scanStatusMessage,
      startScanning,
      stopScanning,
      validateManual,
      closeModal,
      closeModalOnBackdrop,
      handleLogout,
      logout: handleLogout
    }
  }
}
</script>

<style scoped>
.operator-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  text-align: center;
  position: relative;
}

.header h1 {
  font-size: 28px;
  margin-bottom: 5px;
}

.header p {
  opacity: 0.9;
  font-size: 14px;
}

.btn-logout {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.btn-logout:hover {
  background: white;
  color: #667eea;
}

.content {
  padding: 30px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  gap: 10px;
}

.status-item {
  text-align: center;
  flex: 1;
}

.status-label {
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 5px;
}

.status-value {
  font-size: 28px;
  font-weight: bold;
  color: #667eea;
}

.scan-section {
  background: #1a1d2e;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  position: relative;
  overflow: hidden;
}

.scan-title {
  color: white;
  font-size: 14px;
  margin-bottom: 15px;
  text-align: center;
}

.camera-container {
  position: relative;
  width: 100%;
  height: 400px;
  background: #0f111a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-placeholder {
  text-align: center;
  color: #6c757d;
}

.camera-icon {
  font-size: 64px;
  margin-bottom: 15px;
  opacity: 0.5;
}

.scan-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #667eea, transparent);
  animation: scan 2s ease-in-out infinite;
  box-shadow: 0 0 10px #667eea;
}

@keyframes scan {
  0%, 100% { top: 0; }
  50% { top: calc(100% - 2px); }
}

.scan-controls {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.scan-status {
  margin-top: 15px;
  text-align: center;
}

.scanning-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #667eea;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 10px;
}

.scan-progress {
  color: #6c757d;
  font-size: 12px;
}

.progress-info {
  background: rgba(102, 126, 234, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  display: inline-block;
}

.pulse {
  width: 12px;
  height: 12px;
  background: #667eea;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.manual-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
}

.manual-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-group input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
}

.instructions {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.instructions h3 {
  font-size: 14px;
  color: #856404;
  margin-bottom: 10px;
}

.instructions ul {
  margin-left: 20px;
  color: #856404;
  font-size: 13px;
}

.instructions li {
  margin-bottom: 5px;
}

.result-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  align-items: center;
  justify-content: center;
}

.result-modal.active {
  display: flex;
}

.result-content {
  background: white;
  padding: 40px;
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.result-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.result-icon.success {
  color: #28a745;
}

.result-icon.error {
  color: #dc3545;
}

.result-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.result-message {
  color: #6c757d;
  margin-bottom: 20px;
}

.user-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: left;
}

.user-info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
}

.user-info-item:last-child {
  border-bottom: none;
}

.user-info-label {
  font-weight: 600;
  color: #333;
}

.user-info-value {
  color: #6c757d;
}
</style>
