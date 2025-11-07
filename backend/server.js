import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/config/database.js';
import logger from './src/utils/logger.js';
import seedDatabase from './src/config/seed.js';

// Importar modelos para inicializar asociaciones
import './src/models/index.js';

// Importar rutas
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import ticketTypeRoutes from './src/routes/ticketTypeRoutes.js';
import ticketRoutes from './src/routes/ticketRoutes.js';
import auditRoutes from './src/routes/auditRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TicketVue API - Sistema de Boletería',
    version: '1.0.0'
  });
});

// Ruta de health check simple
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Ruta de prueba para verificar configuración de email
// Ruta de health check simple
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Ruta de health check detallada
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      api: 'running',
      database: 'optional'
    }
  });
});

// Rutas de la API

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ticket-types', ticketTypeRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/admin', adminRoutes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor
const startServer = async () => {
  try {
    logger.info('SERVER', 'Iniciando servidor...');
    
    // Ejecutar seed para crear datos predeterminados
    // El seed maneja su propia conexión con reintentos
    try {
      logger.info('DATABASE', 'Ejecutando seed de datos predeterminados...');
      await seedDatabase();
      logger.success('DATABASE', 'Seed completado exitosamente');
    } catch (dbError) {
      logger.error('DATABASE', 'Error en base de datos o seed:', dbError);
      console.error('❌ Error detallado de BD/Seed:', dbError.message);
      logger.warn('DATABASE', 'El servidor continuará sin datos iniciales');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      logger.success('SERVER', `Servidor corriendo en puerto ${PORT}`);
      logger.info('SERVER', `Modo: ${process.env.NODE_ENV || 'development'}`);
      
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📍 Modo: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('SERVER', 'Error fatal al iniciar servidor', error);
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;