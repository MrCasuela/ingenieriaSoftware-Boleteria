import mysql from 'mysql2/promise';

async function activateUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'rootpassword',
    database: 'ticketvue'
  });

  try {
    console.log('🔄 Activando todos los usuarios...');
    
    const [result] = await connection.execute(
      'UPDATE users SET is_active = 1 WHERE is_active = 0'
    );
    
    console.log(`✅ ${result.affectedRows} usuarios activados`);
    
    const [users] = await connection.execute(
      'SELECT id, first_name, last_name, email, user_type, is_active FROM users'
    );
    
    console.log('\n📋 Estado de usuarios:');
    console.table(users);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

activateUsers();
