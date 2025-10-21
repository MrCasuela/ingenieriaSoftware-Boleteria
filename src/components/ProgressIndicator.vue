<template>
  <div class="container mt-4 mb-4" v-if="currentStep > 1">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <div class="progress-container">
          <!-- Paso 1 -->
          <div class="progress-item">
            <div class="progress-step" :class="getStepClass(1)">
              <i class="fas fa-calendar"></i>
            </div>
            <small class="step-label">Seleccionar Evento</small>
          </div>

          <!-- Línea 1 -->
          <div class="progress-line">
            <div class="progress-line-fill" :class="{filled: currentStep > 1}"></div>
          </div>

          <!-- Paso 2 -->
          <div class="progress-item">
            <div class="progress-step" :class="getStepClass(2)">
              <i class="fas fa-ticket-alt"></i>
            </div>
            <small class="step-label">Seleccionar Entrada</small>
          </div>

          <!-- Línea 2 -->
          <div class="progress-line">
            <div class="progress-line-fill" :class="{filled: currentStep > 2}"></div>
          </div>

          <!-- Paso 3 -->
          <div class="progress-item">
            <div class="progress-step" :class="getStepClass(3)">
              <i class="fas fa-user"></i>
            </div>
            <small class="step-label">Datos Personales</small>
          </div>

          <!-- Línea 3 -->
          <div class="progress-line">
            <div class="progress-line-fill" :class="{filled: currentStep > 3}"></div>
          </div>

          <!-- Paso 4 -->
          <div class="progress-item">
            <div class="progress-step" :class="getStepClass(4)">
              <i class="fas fa-qrcode"></i>
            </div>
            <small class="step-label">Confirmación</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useTicketStore } from '../stores/ticketStore.js'
import { storeToRefs } from 'pinia'

export default {
  name: 'ProgressIndicator',
  setup() {
    const store = useTicketStore()
    const { currentStep, progressWidth } = storeToRefs(store)
    const { getStepClass } = store

    return {
      currentStep,
      progressWidth,
      getStepClass
    }
  }
}
</script>