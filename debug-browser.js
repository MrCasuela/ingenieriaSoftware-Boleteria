// Script de depuración para ejecutar en la consola del navegador (F12)
// Este script limpia el caché y fuerza una recarga de datos

console.log('🔧 Iniciando depuración del navegador...')

// 1. Limpiar localStorage
console.log('🗑️ Limpiando localStorage...')
localStorage.clear()
console.log('✅ localStorage limpiado')

// 2. Verificar conexión con el backend
console.log('🔌 Verificando conexión con el backend...')
fetch('http://localhost:3000/api/events')
  .then(response => {
    console.log('📡 Respuesta del servidor:', response.status, response.statusText)
    return response.json()
  })
  .then(data => {
    console.log('✅ Eventos recibidos:', data)
    if (data.success && data.data) {
      console.log(`📊 Total de eventos: ${data.data.length}`)
      data.data.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.name} - ${event.location}`)
      })
    }
  })
  .catch(error => {
    console.error('❌ Error al conectar con el backend:', error)
    console.log('💡 Posibles soluciones:')
    console.log('  1. Verifica que el backend esté corriendo: docker ps')
    console.log('  2. Verifica que el puerto 3000 esté expuesto')
    console.log('  3. Reinicia los contenedores: docker-compose restart')
  })

// 3. Forzar recarga después de 2 segundos
setTimeout(() => {
  console.log('🔄 Forzando recarga de la página...')
  location.reload(true)
}, 2000)
