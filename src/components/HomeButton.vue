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
      default: 'bottom-right',
      validator: (value) => ['top-right', 'top-left', 'top-center', 'bottom-right', 'bottom-left'].includes(value)
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
  z-index: 999;
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

.position-bottom-right {
  bottom: 30px;
  right: 30px;
}

.position-bottom-left {
  bottom: 30px;
  left: 30px;
}

.home-button {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(102, 126, 234, 0.9);
  backdrop-filter: blur(10px);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
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
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.home-button:hover::before {
  opacity: 1;
}

.home-button:hover {
  background: rgba(102, 126, 234, 1);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
  border-color: rgba(255, 255, 255, 0.3);
}

.home-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.home-icon {
  font-size: 16px;
  display: flex;
  align-items: center;
  line-height: 1;
}

.home-text {
  font-size: 13px;
  letter-spacing: 0.3px;
  line-height: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .position-bottom-right {
    bottom: 20px;
    right: 20px;
  }
  
  .position-bottom-left {
    bottom: 20px;
    left: 20px;
  }
  
  .position-top-right {
    top: 15px;
    right: 15px;
  }
  
  .position-top-left {
    top: 15px;
    left: 15px;
  }
  
  .home-button {
    padding: 8px 14px;
    font-size: 12px;
  }
  
  .home-icon {
    font-size: 14px;
  }
  
  .home-text {
    font-size: 12px;
  }
}

/* Modo pantalla pequeña: solo ícono */
@media (max-width: 480px) {
  .home-text {
    display: none;
  }
  
  .home-button {
    padding: 10px;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    justify-content: center;
  }
  
  .position-bottom-right {
    bottom: 15px;
    right: 15px;
  }
  
  .position-bottom-left {
    bottom: 15px;
    left: 15px;
  }
}
</style>
