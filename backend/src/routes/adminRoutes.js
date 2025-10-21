import express from 'express';
import {
  getAllUsersAdmin,
  createOperator,
  createAdministrator,
  updateUserRole,
  toggleUserStatus,
  updateAdminPermissions,
  getUserStats
} from '../controllers/adminController.js';
import { protect, adminOnly, checkAdminPermission } from '../middleware/auth.js';

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

export default router;
