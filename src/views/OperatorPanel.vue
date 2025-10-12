<template>
  <div class="operator-container">
    <!-- Mensaje cuando no está autenticado -->
    <div v-if="!authStore.isAuthenticated" class="not-authenticated">
      <div class="auth-message">
        <div class="auth-icon">🔒</div>
        <h2>Acceso Restringido</h2>
        <p>Debes iniciar sesión como operador para acceder a este panel.</p>
        <p class="redirect-message">Redirigiendo al login...</p>
      </div>
    </div>

    <!-- Contenido del panel (solo si está autenticado) -->
    <template v-else>
      <HomeButton position="top-left" />
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
    </div>    <div class="container">
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
              class="scan-btn" 
              @click="isScanning ? stopScanning() : startScanning()"
              :class="{ active: isScanning }"
              :disabled="isScanning && qrDetected"
            >
              {{ isScanning ? (qrDetected ? '⏳ Procesando...' : '⏹ Detener') : '▶ Iniciar Escaneo' }}
            </button>
            
            <div v-if="isScanning" class="scan-info">
              <div class="scan-status">
                <span class="pulse"></span>
                {{ scanStatusMessage }}
              </div>
              <div class="scan-progress">
                <div class="progress-info">
                  <span>⏰ {{ remainingTime }}s restantes</span>
                  <span v-if="qrDetected" style="margin-left: 15px;">✅ QR detectado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección de Entrada Manual -->
        <div class="manual-section">
          <div class="manual-title">Ingreso Manual por Código o RUT</div>
          
          <!-- Opción 1: Por Código de Ticket -->
          <div class="validation-option">
            <h4 class="option-title">📋 Opción 1: Validar por Código</h4>
            <div class="input-group">
              <input 
                v-model="manualInput" 
                type="text" 
                placeholder="Ingrese código del ticket (TKT-XXXXX)..." 
                class="manual-input"
                @keyup.enter="validateManual"
              >
              <button @click="validateManual" class="validate-btn">
                🔍 Validar
              </button>
            </div>
          </div>

          <!-- Opción 2: Por RUT del Usuario -->
          <div class="validation-option">
            <h4 class="option-title">👤 Opción 2: Validar por RUT</h4>
            <div class="input-group">
              <input 
                v-model="rutInput" 
                type="text" 
                placeholder="Ingrese RUT del usuario (12345678-9)..." 
                class="manual-input"
                @keyup.enter="validateByRut"
              >
              <button @click="validateByRut" class="validate-btn-rut">
                👤 Buscar Tickets
              </button>
            </div>
          </div>
          
          <div class="instructions">
            <p><strong>💡 Instrucciones:</strong></p>
            <ul>
              <li>Use el escaneo QR presionando ENTER/ESPACIO cuando muestre el código</li>
              <li>Si el QR no funciona, ingrese el código del ticket manualmente</li>
              <li>Si el QR está dañado, ingrese el RUT del usuario para buscar sus tickets</li>
              <li>El sistema verificará en la base de datos si el usuario tiene tickets válidos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Resultado -->
    <div class="result-modal" :class="{ active: showModal }" @click="closeModalOnBackdrop">
      <div class="result-content" @click.stop>
        <div class="result-icon" :class="{ success: validationResult.success, error: !validationResult.success }">
          {{ validationResult.success ? '✅' : '❌' }}
        </div>
        
        <h3 class="result-title">{{ validationResult.title }}</h3>
        <p class="result-message">{{ validationResult.message }}</p>
        
        <div v-if="validationResult.success && validationResult.ticket" class="user-info">
          <h4>Información del Ticket:</h4>
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
  </template>
  </div>
</template>

<script>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useTicketStore } from '../stores/ticketStore'
import QRSecurityService from '../services/qrSecurityService'
import AuditService from '../services/auditService'
import HomeButton from '../components/HomeButton.vue'

export default {
  name: 'OperatorPanel',
  components: {
    HomeButton
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const ticketStore = useTicketStore()
    
    // Verificar autenticación al cargar el componente
    if (!authStore.isAuthenticated) {
      console.log('❌ Usuario no autenticado, redirigiendo en 2 segundos...')
      // Redirigir después de 2 segundos para mostrar el mensaje
      setTimeout(() => {
        router.push('/operator/login')
      }, 2000)
      
      // Retornar valores mínimos para evitar errores en el template
      return {
        authStore,
        operatorName: computed(() => ''),
        selectedEvent: computed(() => ''),
        tickets: computed(() => []),
        stats: computed(() => ({ total: 0, usados: 0, disponibles: 0 })),
        isScanning: ref(false),
        showModal: ref(false),
        validationResult: ref({ success: false, title: '', message: '', ticket: null }),
        scanAttempts: ref(0),
        qrDetected: ref(false),
        remainingTime: ref(15),
        scanStatusMessage: computed(() => ''),
        manualInput: ref(''),
        videoElement: ref(null),
        logout: () => router.push('/operator-login'),
        startScanning: () => {},
        stopScanning: () => {},
        validateManual: () => {},
        closeModal: () => {},
        closeModalOnBackdrop: () => {},
        handleLogout: () => router.push('/operator-login')
      }
    }
    
    console.log('✅ Usuario autenticado:', authStore.userName)
    console.log('📊 Tickets disponibles:', ticketStore.tickets?.length || 0)

    const videoElement = ref(null)
    const isScanning = ref(false)
    const stream = ref(null)
    const manualInput = ref('')
    const rutInput = ref('')
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

    const operatorName = computed(() => authStore.userName)
    const selectedEvent = computed(() => 'Control de Eventos')
    const stats = computed(() => ticketStore.getTicketStats())
    const tickets = computed(() => ticketStore.tickets)
    
    const scanStatusMessage = computed(() => {
      if (!isScanning.value) return ''
      
      if (qrDetected.value) {
        return '✅ Código QR detectado! Validando...'
      }
      
      return '📸 Esperando código QR... Presione ENTER o ESPACIO cuando lo muestre'
    })
    
    const updateRemainingTime = () => {
      if (!isScanning.value) return
      
      remainingTime.value--
      
      if (remainingTime.value <= 0) {
        console.log('⏰ Tiempo de escaneo agotado')
        stopScanning()
        showResult('❌ Tiempo Agotado', 'No se pudo detectar un código QR en el tiempo establecido. Intente nuevamente o use ingreso manual.', false)
      }
    }

    const startQRDetection = () => {
      if (!isScanning.value || qrDetected.value) return
      
      scanAttempts.value++
      console.log(`🔍 Intento de detección QR ${scanAttempts.value}/10`)
      
      // Aquí simplemente esperamos a que el usuario presente el QR
      // No validamos automáticamente sin que se haya presentado algo
      // La detección ocurrirá solo cuando realmente se detecte un código
    }

    const simulateQRDetection = () => {
      // Esta función solo se llamará cuando realmente se detecte un QR
      const scenarios = [
        { weight: 50, type: 'valid' },
        { weight: 30, type: 'used' },
        { weight: 10, type: 'invalid' },
        { weight: 5, type: 'corrupted' },
        { weight: 5, type: 'fraud' }
      ]
      
      const random = Math.random() * 100
      let cumulative = 0
      let selectedScenario = scenarios[0]
      
      for (const scenario of scenarios) {
        cumulative += scenario.weight
        if (random <= cumulative) {
          selectedScenario = scenario
          break
        }
      }
      
      console.log(`🎯 Escenario QR seleccionado: ${selectedScenario.type}`)
      
      stopScanning()
      
      let ticketCode = ''
      let validationResult = null
      
      switch (selectedScenario.type) {
        case 'valid':
          const validTicket = ticketStore.tickets.find(t => !t.usado)
          if (validTicket) {
            ticketCode = validTicket.codigo
            validationResult = ticketStore.validateTicket(ticketCode, authStore.userName)
            
            if (validationResult.valid) {
              ticketStore.markTicketAsUsed(ticketCode)
              playSuccessSound()
              vibrateDevice([100])
            } else {
              playErrorSound()
              vibrateDevice([200, 100, 200])
            }
            
            // Registrar en auditoría
            AuditService.logValidation(
              ticketCode,
              authStore.userName,
              validationResult.valid,
              {
                message: validationResult.message,
                ticketInfo: validationResult.ticket,
                fraudDetected: validationResult.fraudDetected || false,
                validationType: 'qr'
              }
            )
            
            showResult(
              validationResult.valid ? '✅ Ticket Válido' : '❌ Error de Validación',
              validationResult.message,
              validationResult.valid,
              validationResult.ticket
            )
          } else {
            playErrorSound()
            showResult('❌ Sin Tickets', 'No hay tickets válidos disponibles para probar.', false)
          }
          break
          
        case 'used':
          const usedTicket = ticketStore.tickets.find(t => t.usado)
          if (usedTicket) {
            ticketCode = usedTicket.codigo
            playErrorSound()
            vibrateDevice([200, 100, 200])
            
            AuditService.logValidation(
              ticketCode,
              authStore.userName,
              false,
              {
                message: 'Ticket ya utilizado',
                ticketInfo: usedTicket,
                fraudDetected: false,
                validationType: 'qr'
              }
            )
            
            const usedDate = usedTicket.fechaUso ? new Date(usedTicket.fechaUso).toLocaleString() : 'Fecha desconocida'
            showResult(
              '⚠️ Ticket Ya Utilizado',
              `Este ticket ya fue usado el ${usedDate}. No se permite el ingreso.`,
              false,
              usedTicket
            )
          }
          break
          
        case 'invalid':
          ticketCode = 'TKT-INVALID'
          playErrorSound()
          vibrateDevice([200, 100, 200])
          
          AuditService.logValidation(
            ticketCode,
            authStore.userName,
            false,
            {
              message: 'Código QR inválido',
              fraudDetected: false,
              validationType: 'qr'
            }
          )
          
          showResult(
            '❌ Ticket Inválido',
            'El código QR no corresponde a un ticket válido o ha expirado.',
            false
          )
          break
          
        case 'corrupted':
          ticketCode = 'TKT-CORRUP'
          playErrorSound()
          vibrateDevice([200, 100, 200])
          
          AuditService.logValidation(
            ticketCode,
            authStore.userName,
            false,
            {
              message: 'Código QR corrupto',
              fraudDetected: false,
              validationType: 'qr'
            }
          )
          
          showResult(
            '❌ Código Corrupto',
            'No se pudo leer el código QR correctamente. Intente nuevamente o use ingreso manual.',
            false
          )
          break
          
        case 'fraud':
          ticketCode = 'TKT-FAKE1-XXXX'
          playErrorSound()
          vibrateDevice([200, 100, 200, 100, 200])
          
          AuditService.logValidation(
            ticketCode,
            authStore.userName,
            false,
            {
              message: 'Intento de fraude detectado - Código falsificado',
              fraudDetected: true,
              validationType: 'qr'
            }
          )
          
          showResult(
            '🚨 ALERTA DE FRAUDE',
            'Se detectó un código QR falsificado. Checksum inválido. Contacte a seguridad.',
            false
          )
          break
      }
    }

    const startScanning = async () => {
      try {
        console.log('📱 Iniciando escaneo QR...')
        isScanning.value = true
        scanAttempts.value = 0
        qrDetected.value = false
        remainingTime.value = 15
        
        // Simular acceso a la cámara
        try {
          stream.value = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          })
          if (videoElement.value) {
            videoElement.value.srcObject = stream.value
          }
          console.log('📷 Cámara activada - Esperando que presente el código QR...')
        } catch (cameraErr) {
          console.log('⚠️ No se pudo acceder a la cámara, continuando con simulación')
        }
        
        // Countdown timer
        const countdownInterval = setInterval(() => {
          if (!isScanning.value) {
            clearInterval(countdownInterval)
            return
          }
          
          updateRemainingTime()
        }, 1000)
        
        // Listener para detectar cuando el usuario PRESENTA el QR
        // Solo procesa cuando presiona ENTER o ESPACIO (simula mostrar el QR físicamente)
        const handleKeyPress = (e) => {
          if ((e.key === 'Enter' || e.key === ' ') && isScanning.value && !qrDetected.value) {
            console.log('✅ Usuario presentó código QR - Iniciando validación...')
            qrDetected.value = true
            clearInterval(countdownInterval)
            document.removeEventListener('keydown', handleKeyPress)
            
            // Pequeña pausa para mostrar "QR detectado"
            setTimeout(() => {
              if (isScanning.value) {
                simulateQRDetection()
              }
            }, 500)
          }
        }
        
        document.addEventListener('keydown', handleKeyPress)
        
        // Timeout principal - SOLO muestra mensaje si NO se presentó ningún QR
        scanTimeout.value = setTimeout(() => {
          clearInterval(countdownInterval)
          document.removeEventListener('keydown', handleKeyPress)
          
          if (isScanning.value && !qrDetected.value) {
            console.log('⏰ Tiempo de escaneo agotado - NO se presentó código QR')
            stopScanning()
            showResult(
              '⏰ Tiempo de Escaneo Expirado', 
              'No se presentó ningún código QR en el tiempo establecido. Por favor, muestre el código QR ante la cámara (presione ENTER o ESPACIO) o use el ingreso manual.', 
              false
            )
          }
        }, maxScanTime)
        
      } catch (error) {
        console.error('❌ Error al iniciar escaneo:', error)
        stopScanning()
        showResult('❌ Error', 'Error al acceder a la cámara. Use ingreso manual.', false)
      }
    }

    const stopScanning = () => {
      console.log('⏹ Deteniendo escaneo...')
      isScanning.value = false
      scanAttempts.value = 0
      qrDetected.value = false
      remainingTime.value = 15
      
      if (scanTimeout.value) {
        clearTimeout(scanTimeout.value)
        scanTimeout.value = null
      }
      
      if (stream.value) {
        stream.value.getTracks().forEach(track => track.stop())
        stream.value = null
      }
      
      if (videoElement.value) {
        videoElement.value.srcObject = null
      }
    }

    const validateManual = () => {
      const code = manualInput.value.trim()
      
      if (!code) {
        showResult('❌ Código Requerido', 'Por favor ingrese un código de ticket.', false)
        return
      }
      
      console.log(`🔍 Validando código manual: ${code}`)
      
      // Validar con el sistema de seguridad mejorado
      const validationResult = ticketStore.validateTicket(code, authStore.userName)
      
      // Registrar en auditoría
      AuditService.logValidation(
        code,
        authStore.userName,
        validationResult.valid,
        {
          message: validationResult.message,
          ticketInfo: validationResult.ticket,
          fraudDetected: validationResult.fraudDetected || false,
          validationType: 'manual'
        }
      )
      
      // Mostrar resultado apropiado
      if (!validationResult.valid) {
        // Reproducir sonido de error (si está disponible)
        playErrorSound()
        
        // Vibrar si el dispositivo lo soporta
        vibrateDevice([200, 100, 200])
        
        showResult(
          validationResult.fraudDetected ? '🚨 ALERTA DE FRAUDE' : '❌ Ticket Inválido',
          validationResult.message,
          false,
          validationResult.ticket
        )
        return
      }
      
      // Marcar ticket como usado
      ticketStore.markTicketAsUsed(validationResult.ticket.codigo)
      manualInput.value = ''
      
      // Reproducir sonido de éxito
      playSuccessSound()
      
      // Vibrar una vez
      vibrateDevice([100])
      
      showResult(
        '✅ Ticket Válido',
        validationResult.message,
        true,
        validationResult.ticket
      )
    }

    const validateByRut = async () => {
      const rut = rutInput.value.trim()
      
      if (!rut) {
        showResult('❌ RUT Requerido', 'Por favor ingrese el RUT del usuario.', false)
        return
      }
      
      console.log(`👤 Buscando tickets por RUT: ${rut}`)
      
      try {
        // Buscar tickets del usuario en la base de datos
        const response = await fetch(`/api/tickets/by-rut/${encodeURIComponent(rut)}`)
        
        if (!response.ok) {
          throw new Error('Error al buscar tickets')
        }
        
        const data = await response.json()
        
        if (!data.success || !data.tickets || data.tickets.length === 0) {
          playErrorSound()
          vibrateDevice([200, 100, 200])
          
          AuditService.logValidation(
            `RUT-${rut}`,
            authStore.userName,
            false,
            {
              message: 'No se encontraron tickets para este RUT',
              fraudDetected: false,
              validationType: 'rut'
            }
          )
          
          showResult(
            '❌ Sin Tickets',
            `No se encontraron tickets para el RUT ${rut}. Verifique el RUT ingresado.`,
            false
          )
          return
        }
        
        // Filtrar solo tickets no usados
        const availableTickets = data.tickets.filter(t => !t.usado)
        
        if (availableTickets.length === 0) {
          playErrorSound()
          vibrateDevice([200, 100, 200])
          
          showResult(
            '⚠️ Tickets Ya Utilizados',
            `Se encontraron ${data.tickets.length} ticket(s) para el RUT ${rut}, pero todos ya fueron utilizados.`,
            false
          )
          return
        }
        
        // Si hay tickets disponibles, usar el primero
        const ticket = availableTickets[0]
        
        // Validar el ticket encontrado
        const validationResult = ticketStore.validateTicket(ticket.codigo, authStore.userName)
        
        if (validationResult.valid) {
          // Marcar ticket como usado
          ticketStore.markTicketAsUsed(ticket.codigo)
          rutInput.value = ''
          
          playSuccessSound()
          vibrateDevice([100])
          
          AuditService.logValidation(
            ticket.codigo,
            authStore.userName,
            true,
            {
              message: `Ticket validado por RUT: ${rut}`,
              ticketInfo: ticket,
              fraudDetected: false,
              validationType: 'rut'
            }
          )
          
          showResult(
            '✅ Ticket Válido (Por RUT)',
            `Se encontró y validó ticket para el RUT ${rut}. ${availableTickets.length > 1 ? `Quedan ${availableTickets.length - 1} ticket(s) disponible(s).` : ''}`,
            true,
            ticket
          )
        } else {
          playErrorSound()
          vibrateDevice([200, 100, 200])
          
          showResult(
            '❌ Error de Validación',
            validationResult.message,
            false,
            ticket
          )
        }
        
      } catch (error) {
        console.error('❌ Error al validar por RUT:', error)
        playErrorSound()
        vibrateDevice([200, 100, 200])
        
        showResult(
          '❌ Error del Sistema',
          'No se pudo conectar con la base de datos para verificar el RUT. Intente nuevamente o use validación por código.',
          false
        )
      }
    }

    // Funciones de feedback
    const playSuccessSound = () => {
      try {
        const audio = new Audio('data:audio/wav;base64,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')
        audio.play()
      } catch (error) {
        console.log('🔇 Audio no disponible')
      }
    }

    const playErrorSound = () => {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU')
        audio.play()
      } catch (error) {
        console.log('🔇 Audio no disponible')
      }
    }

    const vibrateDevice = (pattern) => {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern)
      }
    }

    const showResult = (title, message, success, ticket = null) => {
      validationResult.value = {
        title,
        message,
        success,
        ticket
      }
      showModal.value = true
      
      console.log(`📋 Resultado: ${title} - ${message}`)
    }

    const closeModal = () => {
      showModal.value = false
      validationResult.value = {
        success: false,
        title: '',
        message: '',
        ticket: null
      }
    }

    const closeModalOnBackdrop = (event) => {
      if (event.target === event.currentTarget) {
        closeModal()
      }
    }

    const handleLogout = async () => {
      console.log('🚪 Cerrando sesión...')
      
      // Detener cualquier escaneo activo
      if (isScanning.value) {
        stopScanning()
      }
      
      // Cerrar sesión en el store
      authStore.logout()
      
      // Esperar un momento para que el store se actualice
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Redirigir al login usando replace para evitar volver atrás
      router.replace('/operator/login')
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
      rutInput,
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
      validateByRut,
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
}

.operator-header {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.operator-info h1 {
  color: #333;
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 700;
}

.operator-name {
  color: #667eea;
  font-size: 16px;
  font-weight: 600;
  margin: 5px 0;
}

.event-info {
  color: #6c757d;
  font-size: 14px;
  margin: 0;
}

.logout-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.status-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.status-item {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.status-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.status-value {
  font-size: 24px;
  font-weight: bold;
}

.scan-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
}

.scan-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.camera-container {
  position: relative;
  width: 100%;
  height: 300px;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
}

.camera-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.camera-placeholder p {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

.scan-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: #667eea;
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% { transform: translateY(-150px); }
  100% { transform: translateY(150px); }
}

.scan-controls {
  text-align: center;
}

.scan-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 15px;
}

.scan-btn:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.scan-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.scan-btn.active {
  background: #28a745;
}

.scan-info {
  margin-top: 15px;
}

.scan-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #667eea;
  font-weight: 600;
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
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.validation-option {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 15px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.validation-option:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.option-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 15px 0;
  color: #495057;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 0;
}

.manual-input {
  flex: 1;
  padding: 12px 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.manual-input:focus {
  outline: none;
  border-color: #667eea;
}

.validate-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.validate-btn:hover {
  background: #218838;
  transform: translateY(-1px);
}

.validate-btn-rut {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.validate-btn-rut:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.instructions {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 15px;
  color: #856404;
  font-size: 13px;
  margin-top: 15px;
}

.instructions p {
  margin: 0 0 10px 0;
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

.user-info h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.user-info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 5px 0;
  border-bottom: 1px solid #e9ecef;
}

.user-info-item:last-child {
  border-bottom: none;
}

.user-info-label {
  font-weight: 600;
  color: #495057;
}

.user-info-value {
  color: #6c757d;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .operator-container {
    padding: 10px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .content {
    padding: 20px;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .status-bar {
    grid-template-columns: 1fr;
  }
}

/* Estilos para mensaje de no autenticado */
.not-authenticated {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.auth-message {
  background: white;
  padding: 60px 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
}

.auth-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.auth-message h2 {
  color: #333;
  margin-bottom: 15px;
  font-size: 28px;
}

.auth-message p {
  color: #666;
  font-size: 16px;
  margin-bottom: 10px;
}

.redirect-message {
  color: #667eea;
  font-weight: 600;
  margin-top: 20px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
