import bcrypt from 'bcryptjs';

/**
 * Usuarios de prueba para desarrollo sin base de datos
 * Estos usuarios solo se usan cuando no hay conexión a MySQL
 */

// Hash de contraseñas (pre-calculadas para desarrollo)
const hashPassword = (password) => bcrypt.hashSync(password, 10);

export const mockUsers = [
  // Administradores
  {
    id: 1,
    email: 'admin@ticketvue.com',
    password: hashPassword('admin123'),
    firstName: 'Super',
    lastName: 'Administrador',
    phone: '+56912345678',
    userType: 'Administrador',
    adminLevel: 'super',
    permissions: ['full_access'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    email: 'admin2@ticketvue.com',
    password: hashPassword('admin456'),
    firstName: 'María',
    lastName: 'Admin',
    phone: '+56987654321',
    userType: 'Administrador',
    adminLevel: 'moderador',
    permissions: ['manage_events', 'view_reports', 'manage_tickets'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Operadores
  {
    id: 3,
    email: 'operador@ticketvue.com',
    password: hashPassword('operador123'),
    firstName: 'Juan',
    lastName: 'Operador',
    phone: '+56911111111',
    userType: 'Operador',
    employeeId: 'OP-001',
    shift: 'mañana',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 4,
    email: 'operador2@ticketvue.com',
    password: hashPassword('operador456'),
    firstName: 'Ana',
    lastName: 'Validadora',
    phone: '+56922222222',
    userType: 'Operador',
    employeeId: 'OP-002',
    shift: 'tarde',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Clientes
  {
    id: 5,
    email: 'cliente@test.com',
    password: hashPassword('cliente123'),
    firstName: 'Pedro',
    lastName: 'Cliente',
    phone: '+56933333333',
    document: '12345678-9',
    userType: 'Cliente',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * Buscar usuario por email
 */
export const findUserByEmail = (email, userType = null) => {
  if (userType) {
    return mockUsers.find(u => u.email === email && u.userType === userType);
  }
  return mockUsers.find(u => u.email === email);
};

/**
 * Buscar usuario por ID
 */
export const findUserById = (id) => {
  return mockUsers.find(u => u.id === parseInt(id));
};

/**
 * Verificar contraseña
 */
export const comparePassword = (plainPassword, hashedPassword) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
};

/**
 * Datos públicos del usuario (sin password)
 */
export const toPublicJSON = (user) => {
  const { password, ...publicData } = user;
  return publicData;
};
