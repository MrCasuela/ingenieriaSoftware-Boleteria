import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser
} from '../controllers/userController.js';

const router = express.Router();

// Rutas públicas
router.post('/login', loginUser);
router.post('/register', createUser);

// Rutas protegidas (requieren autenticación)
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
