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

async function testLogin() {
  try {
    // Probar con admin1
    const [adminResults] = await sequelize.query(
      "SELECT id, email, password, user_type FROM users WHERE email = 'admin1@ticketvue.com'"
    );
    
    console.log('=== ADMIN1 ===');
    if (adminResults.length > 0) {
      const admin = adminResults[0];
      console.log('Email:', admin.email);
      console.log('User Type:', admin.user_type);
      console.log('Password Hash:', admin.password.substring(0, 30) + '...');
      
      const isValid = await bcrypt.compare('admin123', admin.password);
      console.log('Password "admin123" is valid:', isValid);
    } else {
      console.log('Usuario no encontrado');
    }
    
    console.log('\n=== OPERADOR1 ===');
    const [operResults] = await sequelize.query(
      "SELECT id, email, password, user_type FROM users WHERE email = 'operador1@ticketvue.com'"
    );
    
    if (operResults.length > 0) {
      const oper = operResults[0];
      console.log('Email:', oper.email);
      console.log('User Type:', oper.user_type);
      console.log('Password Hash:', oper.password.substring(0, 30) + '...');
      
      const isValid = await bcrypt.compare('oper123', oper.password);
      console.log('Password "oper123" is valid:', isValid);
    } else {
      console.log('Usuario no encontrado');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testLogin();
