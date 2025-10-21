/**
 * Tipos de tickets mock para pruebas sin base de datos
 */

export const mockTicketTypes = [
  // Concierto Rock Latino 2025 (eventId: 1)
  {
    id: 1,
    eventId: 1,
    name: 'VIP',
    description: 'Acceso preferencial, backstage pass y meet & greet',
    price: 150000,
    quantity: 200,
    available: 120,
    isActive: true,
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-01')
  },
  {
    id: 2,
    eventId: 1,
    name: 'Platea',
    description: 'Asientos numerados con vista privilegiada',
    price: 80000,
    quantity: 1000,
    available: 750,
    isActive: true,
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-01')
  },
  {
    id: 3,
    eventId: 1,
    name: 'General',
    description: 'Acceso general de pie',
    price: 40000,
    quantity: 3800,
    available: 2630,
    isActive: true,
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-01')
  },
  
  // Festival de Jazz en el Parque (eventId: 2)
  {
    id: 4,
    eventId: 2,
    name: 'Premium',
    description: 'Silla reservada cerca del escenario + consumición',
    price: 35000,
    quantity: 500,
    available: 420,
    isActive: true,
    createdAt: new Date('2025-10-05'),
    updatedAt: new Date('2025-10-05')
  },
  {
    id: 5,
    eventId: 2,
    name: 'General',
    description: 'Acceso al parque, trae tu manta',
    price: 15000,
    quantity: 1500,
    available: 1380,
    isActive: true,
    createdAt: new Date('2025-10-05'),
    updatedAt: new Date('2025-10-05')
  },
  
  // Concierto Sinfónico de Año Nuevo (eventId: 3)
  {
    id: 6,
    eventId: 3,
    name: 'Palco',
    description: 'Palco privado para 4 personas',
    price: 500000,
    quantity: 50,
    available: 15,
    isActive: true,
    createdAt: new Date('2025-10-10'),
    updatedAt: new Date('2025-10-10')
  },
  {
    id: 7,
    eventId: 3,
    name: 'Platea Alta',
    description: 'Segundo piso, asientos numerados',
    price: 120000,
    quantity: 600,
    available: 185,
    isActive: true,
    createdAt: new Date('2025-10-10'),
    updatedAt: new Date('2025-10-10')
  },
  {
    id: 8,
    eventId: 3,
    name: 'Platea Baja',
    description: 'Primer piso, asientos numerados',
    price: 180000,
    quantity: 850,
    available: 300,
    isActive: true,
    createdAt: new Date('2025-10-10'),
    updatedAt: new Date('2025-10-10')
  },
  
  // Festival Electrónico Pulse (eventId: 4)
  {
    id: 9,
    eventId: 4,
    name: 'Early Bird',
    description: 'Entrada anticipada, precio especial',
    price: 25000,
    quantity: 2000,
    available: 0,
    isActive: false,
    createdAt: new Date('2025-10-12'),
    updatedAt: new Date('2025-10-12')
  },
  {
    id: 10,
    eventId: 4,
    name: 'General',
    description: 'Acceso general al festival',
    price: 45000,
    quantity: 6000,
    available: 5200,
    isActive: true,
    createdAt: new Date('2025-10-12'),
    updatedAt: new Date('2025-10-12')
  },
  
  // Teatro: El Gran Gatsby (eventId: 5)
  {
    id: 11,
    eventId: 5,
    name: 'Platino',
    description: 'Primeras 3 filas centrales',
    price: 45000,
    quantity: 50,
    available: 12,
    isActive: true,
    createdAt: new Date('2025-10-08'),
    updatedAt: new Date('2025-10-08')
  },
  {
    id: 12,
    eventId: 5,
    name: 'Oro',
    description: 'Filas 4-10 centrales',
    price: 30000,
    quantity: 250,
    available: 138,
    isActive: true,
    createdAt: new Date('2025-10-08'),
    updatedAt: new Date('2025-10-08')
  },
  {
    id: 13,
    eventId: 5,
    name: 'Plata',
    description: 'Resto de butacas',
    price: 18000,
    quantity: 500,
    available: 500,
    isActive: true,
    createdAt: new Date('2025-10-08'),
    updatedAt: new Date('2025-10-08')
  }
];

/**
 * Obtener todos los tipos de tickets activos
 */
export const getAllMockTicketTypes = () => {
  return mockTicketTypes.map(tt => ({
    id: tt.id,
    event_id: tt.eventId,
    name: tt.name,
    description: tt.description,
    price: tt.price,
    total_capacity: tt.quantity,
    available_capacity: tt.available,
    sold_tickets: tt.quantity - tt.available,
    created_at: tt.createdAt,
    updated_at: tt.updatedAt
  }));
};

/**
 * Obtener tipos de tickets por evento
 */
export const getTicketTypesByEventMock = (eventId) => {
  const types = mockTicketTypes.filter(tt => tt.eventId === parseInt(eventId) && tt.isActive);
  return types.map(tt => ({
    id: tt.id,
    event_id: tt.eventId,
    name: tt.name,
    description: tt.description,
    price: tt.price,
    total_capacity: tt.quantity,
    available_capacity: tt.available,
    sold_tickets: tt.quantity - tt.available,
    created_at: tt.createdAt,
    updated_at: tt.updatedAt
  }));
};

/**
 * Buscar tipo de ticket por ID
 */
export const findTicketTypeById = (id) => {
  const tt = mockTicketTypes.find(t => t.id === parseInt(id));
  if (!tt) return null;
  
  return {
    id: tt.id,
    event_id: tt.eventId,
    name: tt.name,
    description: tt.description,
    price: tt.price,
    total_capacity: tt.quantity,
    available_capacity: tt.available,
    sold_tickets: tt.quantity - tt.available,
    created_at: tt.createdAt,
    updated_at: tt.updatedAt
  };
};
