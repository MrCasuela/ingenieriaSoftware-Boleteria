import User from './src/models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from './src/config/database.js';

dotenv.config();

async function testLogin() {
  try {
    await connectDB();
    
    console.log('🔍 Probando login con admin1...\n');
    
    const email = 'admin1@ticketvue.com';
    const password = 'admin123';
    const user_type = 'Administrador';
    
    // Buscar usuario
    console.log('1. Buscando usuario...');
    const user = await User.findOne({
      where: {
        email,
        user_type
      }
    });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      process.exit(1);
    }
    
    console.log('✅ Usuario encontrado:', user.email);
    console.log('   User Type:', user.userType);
    console.log('   Is Active (campo):', user.isActive);
    console.log('   Is Active (dataValues):', user.dataValues.is_active);
    
    // Verificar contraseña
    console.log('\n2. Verificando contraseña...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('✅ Contraseña válida:', isValidPassword);
    
    // Verificar estado activo
    console.log('\n3. Verificando estado...');
    console.log('   user.isActive:', user.isActive);
    console.log('   Tipo:', typeof user.isActive);
    console.log('   Truthy:', !!user.isActive);
    
    if (!user.isActive) {
      console.log('❌ Usuario INACTIVO');
    } else {
      console.log('✅ Usuario ACTIVO');
    }
    
    console.log('\n✅ Login exitoso');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testLogin();
