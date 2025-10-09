import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
  }
);

async function activateUsers() {
  try {
    console.log('🔍 Verificando estado de usuarios...\n');
    
    // Ver estado actual
    const [users] = await sequelize.query(
      'SELECT email, is_active FROM users'
    );
    
    console.log('Estado actual:');
    users.forEach(u => {
      console.log(`  ${u.email}: is_active = ${u.is_active}`);
    });
    
    console.log('\n✨ Activando todos los usuarios...\n');
    
    // Activar todos los usuarios
    await sequelize.query(
      'UPDATE users SET is_active = 1'
    );
    
    // Verificar
    const [updatedUsers] = await sequelize.query(
      'SELECT email, is_active FROM users'
    );
    
    console.log('Estado actualizado:');
    updatedUsers.forEach(u => {
      console.log(`  ✅ ${u.email}: is_active = ${u.is_active}`);
    });
    
    console.log('\n✅ Todos los usuarios están activos\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

activateUsers();
