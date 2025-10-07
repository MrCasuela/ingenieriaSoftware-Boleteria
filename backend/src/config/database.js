import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración de Sequelize para MySQL
 */
const sequelize = new Sequelize(
  process.env.DB_NAME || 'ticketvue',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

/**
 * Testear conexión a la base de datos
 */
export const connectDB = async () => {
  // Si no hay configuración de base de datos, saltar conexión
  if (!process.env.DB_NAME || !process.env.DB_HOST) {
    console.log('⚠️  Base de datos no configurada - Saltando conexión');
    console.log('   (La funcionalidad de email funcionará sin base de datos)');
    return;
  }
  
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Conectado exitosamente');
    
    // Sincronizar modelos en desarrollo (cuidado en producción)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados con la base de datos');
    }
    
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:', error.message);
    console.log('⚠️  Continuando sin base de datos...');
    console.log('   (La funcionalidad de email funcionará sin base de datos)');
  }
};

/**
 * Cerrar conexión graciosamente
 */
process.on('SIGINT', async () => {
  await sequelize.close();
  console.log('MySQL desconectado por cierre de aplicación');
  process.exit(0);
});

export default sequelize;
