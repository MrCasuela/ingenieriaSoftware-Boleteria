import bcrypt from 'bcryptjs';
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

async function updatePasswords() {
  try {
    console.log('🔐 Actualizando contraseñas...\n');
    
    // Usuarios y contraseñas
    const users = [
      { email: 'admin1@ticketvue.com', password: 'admin123' },
      { email: 'admin2@ticketvue.com', password: 'admin456' },
      { email: 'operador1@ticketvue.com', password: 'oper123' },
      { email: 'operador2@ticketvue.com', password: 'oper456' },
      { email: 'cliente1@email.com', password: 'cliente123' },
      { email: 'cliente2@email.com', password: 'cliente456' }
    ];
    
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      await sequelize.query(
        'UPDATE users SET password = ? WHERE email = ?',
        {
          replacements: [hashedPassword, user.email]
        }
      );
      
      // Verificar
      const [[checkUser]] = await sequelize.query(
        'SELECT email, password FROM users WHERE email = ?',
        { replacements: [user.email] }
      );
      
      if (checkUser) {
        const isValid = await bcrypt.compare(user.password, checkUser.password);
        console.log(`✅ ${user.email}: ${isValid ? 'OK' : 'FALLÓ'}`);
      }
    }
    
    console.log('\n✅ Contraseñas actualizadas correctamente\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updatePasswords();
