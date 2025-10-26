import mysql from 'mysql2/promise';

const nombresReales = [
  { firstName: 'Martín', lastName: 'González' },
  { firstName: 'Sofía', lastName: 'Rodríguez' },
  { firstName: 'Lucas', lastName: 'Fernández' },
  { firstName: 'Valentina', lastName: 'López' },
  { firstName: 'Benjamín', lastName: 'Martínez' },
  { firstName: 'Emma', lastName: 'García' },
  { firstName: 'Mateo', lastName: 'Pérez' },
  { firstName: 'Isabella', lastName: 'Sánchez' },
  { firstName: 'Santiago', lastName: 'Ramírez' },
  { firstName: 'Mía', lastName: 'Torres' },
  { firstName: 'Sebastián', lastName: 'Flores' },
  { firstName: 'Camila', lastName: 'Benítez' },
  { firstName: 'Thiago', lastName: 'Acosta' },
  { firstName: 'Catalina', lastName: 'Morales' },
  { firstName: 'Leonardo', lastName: 'Castro' },
  { firstName: 'Renata', lastName: 'Ríos' },
  { firstName: 'Felipe', lastName: 'Vargas' },
  { firstName: 'Julieta', lastName: 'Méndez' },
  { firstName: 'Nicolás', lastName: 'Silva' },
  { firstName: 'Olivia', lastName: 'Ruiz' }
];

async function actualizarDatosPrueba() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'rootpassword',
    database: 'ticketvue'
  });

  try {
    console.log('🔄 Actualizando datos de tickets con información realista...\n');
    
    // Obtener todos los tickets
    const [tickets] = await connection.execute(
      'SELECT id, buyer_name FROM tickets ORDER BY id'
    );
    
    console.log(`📊 Total de tickets a actualizar: ${tickets.length}\n`);
    
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const persona = nombresReales[i % nombresReales.length];
      
      const nuevoNombre = `${persona.firstName} ${persona.lastName}`;
      const nuevoEmail = `${persona.firstName.toLowerCase()}.${persona.lastName.toLowerCase()}@email.com`;
      const nuevoTelefono = `+54 11 ${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const nuevoDocumento = `${Math.floor(20000000 + Math.random() * 25000000)}`;
      
      await connection.execute(
        'UPDATE tickets SET buyer_name = ?, buyer_email = ?, buyer_phone = ?, buyer_document = ? WHERE id = ?',
        [nuevoNombre, nuevoEmail, nuevoTelefono, nuevoDocumento, ticket.id]
      );
      
      console.log(`✅ Ticket #${ticket.id}: ${nuevoNombre} (${nuevoEmail})`);
    }
    
    console.log('\n✨ ¡Actualización completada exitosamente!');
    console.log('\n📋 Resumen:');
    console.log(`   - ${tickets.length} tickets actualizados`);
    console.log(`   - Nombres realistas aplicados`);
    console.log(`   - Emails, teléfonos y documentos generados`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

actualizarDatosPrueba();
