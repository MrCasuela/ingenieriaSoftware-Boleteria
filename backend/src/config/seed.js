import User from '../models/User.js';
import Event from '../models/Event.js';
import TicketType from '../models/TicketType.js';
import sequelize from '../config/database.js';

const seedDatabase = async () => {
  try {
    // Conectar a la base de datos con reintentos
    console.log('⏳ Conectando a la base de datos...');
    let connected = false;
    let retries = 10;
    
    while (!connected && retries > 0) {
      try {
        await sequelize.authenticate();
        connected = true;
        console.log('✅ MySQL Conectado exitosamente');
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.error('❌ No se pudo conectar a MySQL después de 10 intentos');
          throw error;
        }
        console.log(`⏳ Reintentando conexión a BD en 3 segundos... (${retries} intentos restantes)`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    console.log('🌱 Iniciando seed de la base de datos...\n');
    
    // ===================================
    // USUARIOS
    // ===================================
    console.log('👥 Creando usuarios...');
    
    // Verificar si ya existen usuarios
    const existingUsersCount = await User.count();
    
    if (existingUsersCount === 0) {
      // Administradores
      const admin1 = await User.create({
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
      
      const admin2 = await User.create({
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
    const operator1 = await User.create({
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
    
    const operator2 = await User.create({
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
    const client1 = await User.create({
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
    
    const client2 = await User.create({
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
    
      console.log(`  ✅ Creados 6 usuarios nuevos`);
      console.log(`     - 2 Administradores`);
      console.log(`     - 2 Operadores`);
      console.log(`     - 2 Clientes`);
    } else {
      console.log(`  ℹ️  Ya existen ${existingUsersCount} usuarios en la base de datos`);
    }
    
    console.log(`  📊 Total de usuarios en BD: ${await User.count()}\n`);
    
    // ===================================
    // EVENTOS
    // ===================================
    console.log('🎭 Creando eventos...');
    
    // Verificar si existen eventos y solo crearlos si no existen
    const existingEventsCount = await Event.count();
    
    let event1, event2, event3;
    
    if (existingEventsCount === 0) {
      event1 = await Event.create({
        name: 'Concierto de Rock 2025',
        description: 'El mejor festival de rock del año con bandas internacionales',
        date: new Date('2025-12-15T20:00:00'),
        location: 'Estadio Luna Park, Buenos Aires',
        image: 'https://via.placeholder.com/400x250',
        category: 'concierto',
        totalCapacity: 5000,
        status: 'published'
      });
      
      event2 = await Event.create({
        name: 'Obra de Teatro: Hamlet',
        description: 'La clásica obra de Shakespeare interpretada por el Teatro Colón',
        date: new Date('2025-11-20T19:30:00'),
        location: 'Teatro Colón, Buenos Aires',
        image: 'https://via.placeholder.com/400x250',
        category: 'teatro',
        totalCapacity: 800,
        status: 'published'
      });
      
      event3 = await Event.create({
        name: 'Festival de Música Electrónica',
        description: 'Los mejores DJs de la escena internacional',
        date: new Date('2026-01-10T22:00:00'),
        location: 'Costa Salguero, Buenos Aires',
        image: 'https://via.placeholder.com/400x250',
        category: 'festival',
        totalCapacity: 10000,
        status: 'published'
      });
      
      console.log(`  ✅ Creados 3 eventos nuevos`);
    } else {
      // Si ya existen eventos, obtenerlos para crear los tipos de tickets
      event1 = await Event.findOne({ where: { name: 'Concierto de Rock 2025' } });
      event2 = await Event.findOne({ where: { name: 'Obra de Teatro: Hamlet' } });
      event3 = await Event.findOne({ where: { name: 'Festival de Música Electrónica' } });
      
      console.log(`  ℹ️  Ya existen ${existingEventsCount} eventos en la base de datos`);
    }
    
    console.log(`  📊 Total de eventos en BD: ${await Event.count()}\n`);
    
    // ===================================
    // TIPOS DE TICKETS
    // ===================================
    console.log('🎫 Creando tipos de tickets...');
    
    // Verificar si ya existen tipos de tickets
    const existingTicketTypesCount = await TicketType.count();
    
    if (existingTicketTypesCount === 0 && event1 && event2 && event3) {
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
      
      console.log(`  ✅ Creados 8 tipos de tickets nuevos`);
    } else {
      console.log(`  ℹ️  Ya existen ${existingTicketTypesCount} tipos de tickets en la base de datos`);
    }
    
    console.log(`  📊 Total de tipos de tickets en BD: ${await TicketType.count()}\n`);
    
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
    console.error('Detalles del error:', error.message);
    // No hacer process.exit para que el servidor pueda continuar
    throw error;
  }
};

// Exportar la función sin ejecutarla automáticamente
export default seedDatabase;
