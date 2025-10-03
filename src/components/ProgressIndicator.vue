<template>
  <div class="container mt-4" v-if="currentStep > 1">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="d-flex justify-content-between align-items-center">
          <div class="text-center">
            <div class="progress-step" :class="getStepClass(1)">
              <i class="fas fa-calendar"></i>
            </div>
            <small>Seleccionar Evento</small>
          </div>
          <div class="flex-grow-1 mx-3">
            <div class="progress" style="height: 3px;">
              <div class="progress-bar" :style="{width: progressWidth + '%'}"></div>
            </div>
          </div>
          <div class="text-center">
            <div class="progress-step" :class="getStepClass(2)">
              <i class="fas fa-ticket-alt"></i>
            </div>
            <small>Seleccionar Entrada</small>
          </div>
          <div class="flex-grow-1 mx-3">
            <div class="progress" style="height: 3px;">
              <div class="progress-bar" :style="{width: progressWidth >= 66 ? '100%' : '0%'}"></div>
            </div>
          </div>
          <div class="text-center">
            <div class="progress-step" :class="getStepClass(3)">
              <i class="fas fa-user"></i>
            </div>
            <small>Datos Personales</small>
          </div>
          <div class="flex-grow-1 mx-3">
            <div class="progress" style="height: 3px;">
              <div class="progress-bar" :style="{width: progressWidth >= 100 ? '100%' : '0%'}"></div>
            </div>
          </div>
          <div class="text-center">
            <div class="progress-step" :class="getStepClass(4)">
              <i class="fas fa-qrcode"></i>
            </div>
            <small>Confirmación</small>
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