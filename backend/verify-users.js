import User from './src/models/User.js';
import { connectDB } from './src/config/database.js';
import bcrypt from 'bcryptjs';

const verifyUsers = async () => {
  try {
    await connectDB();
    console.log('✅ Conectado a la base de datos\n');
    
    // Obtener todos los usuarios
    const users = await User.findAll({
      attributes: ['id', 'email', 'password', 'firstName', 'lastName', 'userType'],
      order: [['userType', 'ASC'], ['id', 'ASC']]
    });
    
    console.log(`📊 Total de usuarios: ${users.length}\n`);
    
    for (const user of users) {
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Nombre: ${user.firstName} ${user.lastName}`);
      console.log(`Tipo: ${user.userType}`);
      // Password hash not logged to avoid exposing sensitive information
      
      // Verificar si la contraseña coincide
      const testPassword = user.userType === 'Operador' 
        ? (user.email === 'operador1@ticketvue.com' ? 'oper123' : 'oper456')
        : user.userType === 'Administrador'
        ? (user.email === 'admin1@ticketvue.com' ? 'admin123' : 'admin456')
        : (user.email === 'cliente1@email.com' ? 'cliente123' : 'cliente456');
      
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`Contraseña "${testPassword}": ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
      console.log('---\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verifyUsers();
