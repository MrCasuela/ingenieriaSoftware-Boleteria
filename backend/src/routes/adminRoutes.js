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

const router = express.Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(protect);
router.use(adminOnly);

// Estadísticas de usuarios
router.get('/stats', getUserStats);

// Gestión de usuarios
router.get('/users', getAllUsersAdmin);

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
