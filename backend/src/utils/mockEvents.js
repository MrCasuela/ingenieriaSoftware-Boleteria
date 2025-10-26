/**
 * Eventos mock para pruebas sin base de datos
 */

export const mockEvents = [
  {
    id: 1,
    name: 'Concierto Rock Latino 2025',
    description: 'El mejor festival de rock latino del año con bandas internacionales',
    date: new Date('2025-11-15T20:00:00'),
    location: 'Estadio Nacional',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    totalCapacity: 5000,
    availableTickets: 3500,
    isActive: true,
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-01')
  },
  {
    id: 2,
    name: 'Festival de Jazz en el Parque',
    description: 'Tres días de música jazz con artistas nacionales e internacionales',
    date: new Date('2025-12-05T18:00:00'),
    location: 'Parque Bicentenario',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    totalCapacity: 2000,
    availableTickets: 1800,
    isActive: true,
    createdAt: new Date('2025-10-05'),
    updatedAt: new Date('2025-10-05')
  },
  {
    id: 3,
    name: 'Concierto Sinfónico de Año Nuevo',
    description: 'Celebra el año nuevo con la Orquesta Sinfónica Nacional',
    date: new Date('2025-12-31T21:00:00'),
    location: 'Teatro Municipal',
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
    totalCapacity: 1500,
    availableTickets: 500,
    isActive: true,
    createdAt: new Date('2025-10-10'),
    updatedAt: new Date('2025-10-10')
  },
  {
    id: 4,
    name: 'Festival Electrónico Pulse',
    description: 'La mejor música electrónica con DJs internacionales',
    date: new Date('2026-01-20T22:00:00'),
    location: 'Centro de Convenciones',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    totalCapacity: 8000,
    availableTickets: 7200,
    isActive: true,
    createdAt: new Date('2025-10-12'),
    updatedAt: new Date('2025-10-12')
  },
  {
    id: 5,
    name: 'Teatro: El Gran Gatsby',
    description: 'Obra teatral basada en el clásico de F. Scott Fitzgerald',
    date: new Date('2025-11-25T19:00:00'),
    location: 'Teatro Nacional',
    imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
    totalCapacity: 800,
    availableTickets: 650,
    isActive: true,
    createdAt: new Date('2025-10-08'),
    updatedAt: new Date('2025-10-08')
  }
];

/**
 * Buscar evento por ID
 */
export const findEventById = (id) => {
  return mockEvents.find(event => event.id === parseInt(id));
};

/**
 * Obtener todos los eventos activos
 */
export const getAllActiveEvents = () => {
  return mockEvents.filter(event => event.isActive);
};

/**
 * Crear nuevo evento mock (simular creación)
 */
export const createMockEvent = (eventData) => {
  const newEvent = {
    id: mockEvents.length + 1,
    ...eventData,
    availableTickets: eventData.totalCapacity || 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  mockEvents.push(newEvent);
  return newEvent;
};

/**
 * Actualizar evento mock
 */
export const updateMockEvent = (id, updates) => {
  const index = mockEvents.findIndex(event => event.id === parseInt(id));
  if (index === -1) return null;
  
  mockEvents[index] = {
    ...mockEvents[index],
    ...updates,
    updatedAt: new Date()
  };
  
  return mockEvents[index];
};

/**
 * Eliminar evento mock
 */
export const deleteMockEvent = (id) => {
  const index = mockEvents.findIndex(event => event.id === parseInt(id));
  if (index === -1) return false;
  
  mockEvents.splice(index, 1);
  return true;
};
