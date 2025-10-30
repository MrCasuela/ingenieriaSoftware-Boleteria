import express from 'express';
import {
  getAllUsersAdmin,
  createOperator,
  createAdministrator,
  updateUserRole,
  toggleUserStatus,
  updateAdminPermissions,
  getUserStats,
  getAttendanceReport
} from '../controllers/adminController.js';
import { protect, adminOnly, checkAdminPermission } from '../middleware/auth.js';
import { 
  exportAttendanceToCSV, 
  exportStatsToCSV, 
  exportToPDF 
} from '../services/reportService.js';
import User from '../models/User.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(protect);
router.use(adminOnly);

// Estadísticas de usuarios
router.get('/stats', getUserStats);

// Gestión de usuarios
router.get('/users', getAllUsersAdmin);

// Obtener operadores
router.get('/operators', async (req, res) => {
  try {
    const operators = await User.findAll({
      where: { userType: 'Operador' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: operators
    });
  } catch (error) {
    console.error('Error al obtener operadores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener operadores',
      error: error.message
    });
  }
});

// Crear clientes
router.post('/clients', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, document } = req.body;

    // Validaciones básicas
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, firstName y lastName son requeridos'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Importar bcrypt
    const bcrypt = await import('bcryptjs');
    
    // Hashear la contraseña
    const salt = await bcrypt.default.genSalt(10);
    const hashedPassword = await bcrypt.default.hash(password, salt);

    // Crear nuevo cliente usando el modelo User
    const cliente = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || '',
      document: document || '',
      userType: 'Cliente',
      isActive: true
    });

    // Remover password de la respuesta
    const clienteData = cliente.toJSON();
    delete clienteData.password;

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: clienteData
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cliente',
      error: error.message
    });
  }
});

// Crear operadores (cualquier admin)
router.post('/operators', createOperator);

// Crear administradores (solo super admin)
router.post('/administrators', createAdministrator);

// Actualizar rol de usuario
router.put('/users/:id/role', updateUserRole);

// Activar/Desactivar usuario
router.put('/users/:id/toggle-status', toggleUserStatus);

// Actualizar permisos de administrador (solo super admin)
router.put('/administrators/:id/permissions', updateAdminPermissions);


// === REPORTES DE ASISTENCIA (HU6) ===

// Obtener reporte de asistencia con filtros
router.get('/reports/attendance', getAttendanceReport);

// Exportar reporte de asistencia a CSV (tickets detallados)
// Redirigir a la nueva ruta simplificada
router.get('/reports/attendance/export/csv', async (req, res) => {
  return res.redirect(307, '/api/reports/tickets/csv');
});

// Exportar estadísticas a CSV
// Redirigir a la nueva ruta simplificada
router.get('/reports/attendance/export/csv-stats', async (req, res) => {
  return res.redirect(307, '/api/reports/tickets/csv');
});

// Exportar reporte a PDF
// Redirigir a la nueva ruta simplificada
router.get('/reports/attendance/export/pdf', async (req, res) => {
  return res.redirect(307, '/api/reports/tickets/pdf');
});


export default router;
