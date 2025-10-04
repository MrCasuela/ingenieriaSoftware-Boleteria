// Script para inicializar datos de ejemplo en localStorage
// Ejecutar en la consola del navegador o incluir en el proyecto

export function initializeSampleData() {
  console.log('🔧 Inicializando datos de ejemplo...')

  // 1. Inicializar operadores
  const operators = [
    { username: 'operador1', password: 'admin123', name: 'Juan Pérez' },
    { username: 'operador2', password: 'admin456', name: 'María González' },
    { username: 'operador3', password: 'admin789', name: 'Carlos Rodríguez' }
  ]
  localStorage.setItem('operators', JSON.stringify(operators))
  console.log('✅ Operadores inicializados:', operators.length)

  // 2. Crear tickets de ejemplo
  const sampleTickets = [
    {
      codigo: 'TKT-10001234',
      rut: '12.345.678-9',
      nombre: 'Juan Pérez González',
      email: 'juan.perez@example.com',
      telefono: '+56912345678',
      evento: 'Concierto Rock en Vivo',
      tipo: 'Entrada VIP',
      precio: 120,
      fecha: '15 de Noviembre, 2025',
      ubicacion: 'Estadio Nacional',
      usado: false,
      fechaCompra: new Date('2025-10-01T10:30:00').toISOString()
    },
    {
      codigo: 'TKT-10001235',
      rut: '98.765.432-1',
      nombre: 'María López Silva',
      email: 'maria.lopez@example.com',
      telefono: '+56987654321',
      evento: 'Concierto Rock en Vivo',
      tipo: 'Entrada General',
      precio: 50,
      fecha: '15 de Noviembre, 2025',
      ubicacion: 'Estadio Nacional',
      usado: true,
      fechaCompra: new Date('2025-10-01T11:00:00').toISOString(),
      fechaUso: new Date('2025-10-04T18:30:00').toISOString()
    },
    {
      codigo: 'TKT-10001236',
      rut: '11.222.333-4',
      nombre: 'Pedro Martínez Soto',
      email: 'pedro.martinez@example.com',
      telefono: '+56911222333',
      evento: 'Festival de Comida Gourmet',
      tipo: 'Entrada Premium',
      precio: 75,
      fecha: '22 de Noviembre, 2025',
      ubicacion: 'Centro de Convenciones',
      usado: false,
      fechaCompra: new Date('2025-10-02T14:20:00').toISOString()
    },
    {
      codigo: 'TKT-10001237',
      rut: '22.333.444-5',
      nombre: 'Ana García Flores',
      email: 'ana.garcia@example.com',
      telefono: '+56922333444',
      evento: 'Conferencia de Tecnología',
      tipo: 'Entrada Estudiante',
      precio: 25,
      fecha: '5 de Diciembre, 2025',
      ubicacion: 'Auditorio Universitario',
      usado: false,
      fechaCompra: new Date('2025-10-03T09:15:00').toISOString()
    },
    {
      codigo: 'TKT-10001238',
      rut: '33.444.555-6',
      nombre: 'Luis Rodríguez Castro',
      email: 'luis.rodriguez@example.com',
      telefono: '+56933444555',
      evento: 'Concierto Rock en Vivo',
      tipo: 'Entrada VIP',
      precio: 120,
      fecha: '15 de Noviembre, 2025',
      ubicacion: 'Estadio Nacional',
      usado: false,
      fechaCompra: new Date('2025-10-03T16:45:00').toISOString()
    }
  ]

  localStorage.setItem('purchasedTickets', JSON.stringify(sampleTickets))
  console.log('✅ Tickets de ejemplo creados:', sampleTickets.length)

  // 3. Mostrar resumen
  const stats = {
    totalTickets: sampleTickets.length,
    usados: sampleTickets.filter(t => t.usado).length,
    disponibles: sampleTickets.filter(t => !t.usado).length,
    eventos: [...new Set(sampleTickets.map(t => t.evento))]
  }

  console.log('📊 Resumen:')
  console.log('  - Total tickets:', stats.totalTickets)
  console.log('  - Usados:', stats.usados)
  console.log('  - Disponibles:', stats.disponibles)
  console.log('  - Eventos:', stats.eventos.length)
  
  console.log('\n🎫 Tickets para probar:')
  sampleTickets.forEach(ticket => {
    console.log(`  ${ticket.codigo} - ${ticket.nombre} - ${ticket.usado ? '✓ USADO' : '○ Disponible'}`)
  })

  console.log('\n👤 Operadores disponibles:')
  operators.forEach(op => {
    console.log(`  Usuario: ${op.username} | Contraseña: ${op.password} | Nombre: ${op.name}`)
  })

  console.log('\n✨ ¡Datos de ejemplo inicializados correctamente!')
  console.log('💡 Tip: Ve a /operator/login para validar tickets')
  
  return {
    operators,
    tickets: sampleTickets,
    stats
  }
}

// Función para limpiar todos los datos
export function clearAllData() {
  if (confirm('⚠️ ¿Estás seguro de que quieres eliminar todos los datos?')) {
    localStorage.removeItem('purchasedTickets')
    localStorage.removeItem('operators')
    localStorage.removeItem('operatorSession')
    console.log('🗑️ Todos los datos han sido eliminados')
    return true
  }
  return false
}

// Función para resetear tickets (marcar todos como no usados)
export function resetTickets() {
  const tickets = JSON.parse(localStorage.getItem('purchasedTickets') || '[]')
  tickets.forEach(ticket => {
    ticket.usado = false
    delete ticket.fechaUso
  })
  localStorage.setItem('purchasedTickets', JSON.stringify(tickets))
  console.log(`♻️ ${tickets.length} tickets han sido reseteados (marcados como no usados)`)
  return tickets.length
}

// Función para generar un ticket aleatorio
export function generateRandomTicket() {
  const nombres = ['Juan', 'María', 'Pedro', 'Ana', 'Luis', 'Carmen', 'Diego', 'Laura']
  const apellidos = ['Pérez', 'González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'Sánchez', 'García']
  const eventos = [
    { name: 'Concierto Rock en Vivo', location: 'Estadio Nacional', date: '15 de Noviembre, 2025' },
    { name: 'Festival de Comida Gourmet', location: 'Centro de Convenciones', date: '22 de Noviembre, 2025' },
    { name: 'Conferencia de Tecnología', location: 'Auditorio Universitario', date: '5 de Diciembre, 2025' }
  ]
  const tipos = [
    { name: 'Entrada General', price: 50 },
    { name: 'Entrada VIP', price: 120 },
    { name: 'Entrada Premium', price: 75 }
  ]

  const nombre = nombres[Math.floor(Math.random() * nombres.length)]
  const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)]
  const apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)]
  const evento = eventos[Math.floor(Math.random() * eventos.length)]
  const tipo = tipos[Math.floor(Math.random() * tipos.length)]

  // Generar RUT aleatorio (simplificado)
  const rut = `${Math.floor(10000000 + Math.random() * 90000000)}-${Math.floor(Math.random() * 10)}`
  const codigo = `TKT-${Date.now().toString().slice(-8)}`

  const ticket = {
    codigo,
    rut,
    nombre: `${nombre} ${apellido1} ${apellido2}`,
    email: `${nombre.toLowerCase()}.${apellido1.toLowerCase()}@example.com`,
    telefono: `+569${Math.floor(10000000 + Math.random() * 90000000)}`,
    evento: evento.name,
    tipo: tipo.name,
    precio: tipo.price,
    fecha: evento.date,
    ubicacion: evento.location,
    usado: false,
    fechaCompra: new Date().toISOString()
  }

  const tickets = JSON.parse(localStorage.getItem('purchasedTickets') || '[]')
  tickets.push(ticket)
  localStorage.setItem('purchasedTickets', JSON.stringify(tickets))

  console.log('🎫 Nuevo ticket generado:')
  console.log(`  Código: ${ticket.codigo}`)
  console.log(`  RUT: ${ticket.rut}`)
  console.log(`  Nombre: ${ticket.nombre}`)
  console.log(`  Evento: ${ticket.evento}`)
  
  return ticket
}

// Auto-ejecutar en desarrollo
if (typeof window !== 'undefined') {
  window.initializeSampleData = initializeSampleData
  window.clearAllData = clearAllData
  window.resetTickets = resetTickets
  window.generateRandomTicket = generateRandomTicket
  
  console.log('🎮 Funciones disponibles en la consola:')
  console.log('  - initializeSampleData() → Crear datos de ejemplo')
  console.log('  - clearAllData() → Limpiar todos los datos')
  console.log('  - resetTickets() → Resetear tickets a "no usados"')
  console.log('  - generateRandomTicket() → Generar ticket aleatorio')
}
