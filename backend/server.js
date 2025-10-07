import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { connectDB } from './src/config/database.js';
import { sendTicketEmail } from './src/services/emailService.js';

// Cargar variables de entorno
dotenv.config();

// Configurar multer para manejar archivos en memoria
const upload = multer({ storage: multer.memoryStorage() });

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

// Ruta de prueba para verificar configuración de email
app.get('/api/health', (req, res) => {
  const emailConfigured = !!(
    process.env.EMAIL_SERVICE === 'gmail' 
      ? (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)
      : (process.env.SMTP_USER && process.env.SMTP_PASSWORD)
  );
  
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      api: 'running',
      email: emailConfigured ? 'configured' : 'not configured',
      database: 'optional'
    },
    endpoints: {
      health: '/api/health',
      sendEmail: '/api/send-ticket-email'
    }
  });
});

// Rutas de la API (TODO: Implementar rutas)
// app.use('/api/auth', authRoutes);
// app.use('/api/events', eventRoutes);
// app.use('/api/tickets', ticketRoutes);
// app.use('/api/operators', operatorRoutes);
// app.use('/api/admin', adminRoutes);

// Ruta para enviar entrada por email
app.post('/api/send-ticket-email', upload.single('pdf'), async (req, res) => {
  try {
    const { email, firstName, lastName, eventName, ticketCode } = req.body;
    const pdfBuffer = req.file.buffer;
    
    // Validar datos requeridos
    if (!email || !firstName || !lastName || !eventName || !ticketCode || !pdfBuffer) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos'
      });
    }
    
    // Enviar email
    const result = await sendTicketEmail(
      { email, firstName, lastName, eventName, ticketCode },
      pdfBuffer
    );
    
    res.json({
      success: true,
      message: 'Email enviado exitosamente',
      messageId: result.messageId,
      previewUrl: result.previewUrl // Solo para desarrollo/testing
    });
  } catch (error) {
    console.error('Error en endpoint de email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar el email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

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
    // Intentar conectar a la base de datos (opcional para email)
    try {
      await connectDB();
    } catch (dbError) {
      console.warn('⚠️  Base de datos no disponible, pero el servidor continuará');
      console.warn('   La funcionalidad de email seguirá funcionando');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📍 Modo: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📧 Endpoint de email disponible en: http://localhost:${PORT}/api/send-ticket-email`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
