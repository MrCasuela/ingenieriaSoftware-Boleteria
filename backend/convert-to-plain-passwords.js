import sequelize from './src/config/database.js';
import User from './src/models/User.js';

const convertToPlainTextPasswords = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');
    console.log('🔧 Convirtiendo contraseñas a texto plano...\n');

    const usersToUpdate = [
      { email: 'admin1@ticketvue.com', password: 'admin123' },
      { email: 'admin2@ticketvue.com', password: 'admin456' },
      { email: 'operador1@ticketvue.com', password: 'oper123' },
      { email: 'operador2@ticketvue.com', password: 'oper456' },
      { email: 'cliente1@email.com', password: 'cliente123' },
      { email: 'cliente2@email.com', password: 'cliente456' }
    ];

    for (const userData of usersToUpdate) {
      try {
        const user = await User.findOne({ 
          where: { email: userData.email }
        });

        if (user) {
          // Actualizar directamente en la BD sin pasar por hooks
          await sequelize.query(
            'UPDATE users SET password = ? WHERE email = ?',
            {
              replacements: [userData.password, userData.email]
            }
          );
          console.log(`✅ ${userData.email} - contraseña actualizada a texto plano`);
        } else {
          console.log(`⚠️  ${userData.email} - no encontrado`);
        }
      } catch (error) {
        console.log(`❌ Error con ${userData.email}:`, error.message);
      }
    }

    console.log('\n✅ Conversión completada');
    console.log('\n🔐 Credenciales en texto plano:');
    console.log('   Administradores:');
    console.log('     - admin1@ticketvue.com / admin123');
    console.log('     - admin2@ticketvue.com / admin456');
    console.log('   Operadores:');
    console.log('     - operador1@ticketvue.com / oper123');
    console.log('     - operador2@ticketvue.com / oper456');
    console.log('   Clientes:');
    console.log('     - cliente1@email.com / cliente123');
    console.log('     - cliente2@email.com / cliente456');
    console.log('\n⚠️  NOTA: Las contraseñas ahora están en texto plano (sin hash)');

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

convertToPlainTextPasswords();
