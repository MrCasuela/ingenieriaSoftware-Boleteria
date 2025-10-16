import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser
} from '../controllers/userController.js';
import { protect, adminOnly, operadorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/login', loginUser);
router.post('/register', createUser);

// Rutas protegidas - Solo administradores pueden gestionar usuarios
router.get('/', protect, adminOnly, getAllUsers);
router.get('/:id', protect, operadorOrAdmin, getUserById);
router.put('/:id', protect, adminOnly, updateUser);
router.delete('/:id', protect, adminOnly, deleteUser);

export default router;
