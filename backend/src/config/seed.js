import User from '../models/User.js';
import Event from '../models/Event.js';
import TicketType from '../models/TicketType.js';
import { connectDB } from '../config/database.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    console.log('🌱 Iniciando seed de la base de datos...\n');
    
    // ===================================
    // USUARIOS
    // ===================================
    console.log('👥 Configurando usuarios predeterminados...');
    
    // Eliminar usuarios existentes para recrearlos
    await User.destroy({ where: {} });
    console.log('  🗑️  Usuarios anteriores eliminados');
    console.log('  📝 Creando usuarios predeterminados...\n');
      
      // Administradores
      await User.create({
        email: 'admin1@ticketvue.com',
        password: 'admin123',
        firstName: 'Carlos',
        lastName: 'Administrador',
        phone: '+54 11 1234-5678',
        userType: 'Administrador',
        employeeId: 'ADM001',
        adminLevel: 'super',
        permissions: JSON.stringify({
          manage_events: true,
          manage_users: true,
          view_reports: true,
          manage_tickets: true
        }),
        isActive: true
      });
      
      await User.create({
        email: 'admin2@ticketvue.com',
        password: 'admin456',
        firstName: 'María',
        lastName: 'González',
        phone: '+54 11 2345-6789',
        userType: 'Administrador',
        employeeId: 'ADM002',
        adminLevel: 'moderador',
        permissions: JSON.stringify({
          manage_events: true,
          manage_users: false,
          view_reports: true,
          manage_tickets: true
        }),
        isActive: true
      });
      
      // Operadores
      await User.create({
        email: 'operador1@ticketvue.com',
        password: 'oper123',
        firstName: 'Juan',
        lastName: 'Operador',
        phone: '+54 11 3456-7890',
        userType: 'Operador',
        employeeId: 'OPR001',
        shift: 'mañana',
        totalValidations: 0,
        isActive: true
      });
      
      await User.create({
        email: 'operador2@ticketvue.com',
        password: 'oper456',
        firstName: 'Ana',
        lastName: 'Pérez',
        phone: '+54 11 4567-8901',
        userType: 'Operador',
        employeeId: 'OPR002',
        shift: 'tarde',
        totalValidations: 0,
        isActive: true
      });
      
      // Clientes
      await User.create({
        email: 'cliente1@email.com',
        password: 'cliente123',
        firstName: 'Roberto',
        lastName: 'Martínez',
        phone: '+54 11 5678-9012',
        document: '12345678',
        userType: 'Cliente',
        totalPurchases: 0,
        totalSpent: 0.00,
        preferences: JSON.stringify({
          notifications: true,
          newsletter: true,
          favorite_genres: ['Rock', 'Pop']
        }),
        isActive: true
      });
      
      await User.create({
        email: 'cliente2@email.com',
        password: 'cliente456',
        firstName: 'Laura',
        lastName: 'Rodríguez',
        phone: '+54 11 6789-0123',
        document: '87654321',
        userType: 'Cliente',
        totalPurchases: 0,
        totalSpent: 0.00,
        preferences: JSON.stringify({
          notifications: true,
          newsletter: false,
          favorite_genres: ['Teatro', 'Musical']
        }),
        isActive: true
      });
      
      console.log(`  ✅ Creados 6 usuarios (2 admins, 2 operadores, 2 clientes)`);
    
    console.log(`     - 2 Administradores`);
    console.log(`     - 2 Operadores`);
    console.log(`     - 2 Clientes\n`);
    
    // ===================================
    // EVENTOS
    // ===================================
    console.log('🎭 Creando eventos...');
    
    const event1 = await Event.create({
      name: 'Concierto de Rock 2025',
      description: 'El mejor festival de rock del año con bandas internacionales',
      date: new Date('2025-12-15T20:00:00'),
      location: 'Estadio Luna Park, Buenos Aires',
      imageUrl: 'https://via.placeholder.com/400x250',
      totalCapacity: 5000,
      availableCapacity: 5000,
      isActive: true
    });
    
    const event2 = await Event.create({
      name: 'Obra de Teatro: Hamlet',
      description: 'La clásica obra de Shakespeare interpretada por el Teatro Colón',
      date: new Date('2025-11-20T19:30:00'),
      location: 'Teatro Colón, Buenos Aires',
      imageUrl: 'https://via.placeholder.com/400x250',
      totalCapacity: 800,
      availableCapacity: 800,
      isActive: true
    });
    
    const event3 = await Event.create({
      name: 'Festival de Música Electrónica',
      description: 'Los mejores DJs de la escena internacional',
      date: new Date('2026-01-10T22:00:00'),
      location: 'Costa Salguero, Buenos Aires',
      imageUrl: 'https://via.placeholder.com/400x250',
      totalCapacity: 10000,
      availableCapacity: 10000,
      isActive: true
    });
    
    console.log(`  ✅ Creados ${await Event.count()} eventos\n`);
    
    // ===================================
    // TIPOS DE TICKETS
    // ===================================
    console.log('🎫 Creando tipos de tickets...');
    
    // Tickets para Concierto de Rock
    await TicketType.create({
      eventId: event1.id,
      name: 'General',
      description: 'Entrada general al evento',
      price: 15000.00,
      quantity: 3000,
      available: 3000,
      isActive: true
    });
    
    await TicketType.create({
      eventId: event1.id,
      name: 'VIP',
      description: 'Acceso VIP con bar exclusivo',
      price: 35000.00,
      quantity: 500,
      available: 500,
      isActive: true
    });
    
    await TicketType.create({
      eventId: event1.id,
      name: 'Platinum',
      description: 'Acceso completo + meet & greet con artistas',
      price: 75000.00,
      quantity: 100,
      available: 100,
      isActive: true
    });
    
    // Tickets para Obra de Teatro
    await TicketType.create({
      eventId: event2.id,
      name: 'Platea',
      description: 'Asientos en platea',
      price: 12000.00,
      quantity: 500,
      available: 500,
      isActive: true
    });
    
    await TicketType.create({
      eventId: event2.id,
      name: 'Palco',
      description: 'Palcos privados (4 personas)',
      price: 25000.00,
      quantity: 300,
      available: 300,
      isActive: true
    });
    
    // Tickets para Festival Electrónica
    await TicketType.create({
      eventId: event3.id,
      name: 'Early Bird',
      description: 'Precio especial por compra anticipada',
      price: 18000.00,
      quantity: 5000,
      available: 5000,
      isActive: true
    });
    
    await TicketType.create({
      eventId: event3.id,
      name: 'Regular',
      description: 'Entrada regular',
      price: 25000.00,
      quantity: 4000,
      available: 4000,
      isActive: true
    });
    
    await TicketType.create({
      eventId: event3.id,
      name: 'VIP Lounge',
      description: 'Acceso a zona VIP con barra libre',
      price: 50000.00,
      quantity: 1000,
      available: 1000,
      isActive: true
    });
    
    console.log(`  ✅ Creados ${await TicketType.count()} tipos de tickets\n`);
    
    // ===================================
    // RESUMEN
    // ===================================
    console.log('✅ ¡Seed completado exitosamente!\n');
    console.log('📊 Resumen de datos creados:');
    console.log(`   - ${await User.count()} usuarios totales`);
    console.log(`   - ${await Event.count()} eventos`);
    console.log(`   - ${await TicketType.count()} tipos de tickets\n`);
    
    console.log('🔐 Credenciales de acceso:');
    console.log('   Administradores:');
    console.log('     - admin1@ticketvue.com / admin123');
    console.log('     - admin2@ticketvue.com / admin456');
    console.log('   Operadores:');
    console.log('     - operador1@ticketvue.com / oper123');
    console.log('     - operador2@ticketvue.com / oper456');
    console.log('   Clientes:');
    console.log('     - cliente1@email.com / cliente123');
    console.log('     - cliente2@email.com / cliente456\n');
    
  } catch (error) {
    console.error('❌ Error al hacer seed:', error);
    throw error;
  }
};

// Si se ejecuta directamente desde la terminal
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seedDatabase;