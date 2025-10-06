<template>
  <div class="home-button-container" :class="positionClass">
    <button @click="goHome" class="home-button" :title="title">
      <span class="home-icon">🏠</span>
      <span class="home-text">{{ text }}</span>
    </button>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { computed } from 'vue'

export default {
  name: 'HomeButton',
  props: {
    text: {
      type: String,
      default: 'Inicio'
    },
    title: {
      type: String,
      default: 'Volver a la página principal'
    },
    position: {
      type: String,
      default: 'top-right',
      validator: (value) => ['top-right', 'top-left', 'top-center'].includes(value)
    }
  },
  setup(props) {
    const router = useRouter()
    
    const goHome = () => {
      router.push('/')
    }
    
    const positionClass = computed(() => {
      return `position-${props.position}`
    })
    
    return {
      goHome,
      positionClass
    }
  }
}
</script>

<style scoped>
.home-button-container {
  position: fixed;
  z-index: 9999;
}

/* Posiciones disponibles */
.position-top-right {
  top: 20px;
  right: 20px;
}

.position-top-left {
  top: 20px;
  left: 20px;
}

.position-top-center {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.home-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.home-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.home-button:hover::before {
  opacity: 1;
}

.home-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.home-button:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.home-icon {
  font-size: 18px;
  display: flex;
  align-items: center;
  animation: pulse 2s ease-in-out infinite;
}

.home-text {
  font-size: 14px;
  letter-spacing: 0.5px;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .home-button-container {
    top: 15px;
    right: 15px;
  }
  
  .home-button {
    padding: 10px 16px;
  }
  
  .home-icon {
    font-size: 16px;
  }
  
  .home-text {
    font-size: 13px;
  }
}

/* Modo pantalla pequeña: solo ícono */
@media (max-width: 480px) {
  .home-text {
    display: none;
  }
  
  .home-button {
    padding: 12px;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    justify-content: center;
  }
}
</style>
