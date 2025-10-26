import express from 'express';
import { login, registerCliente, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/login', login);
router.post('/register', registerCliente);

// Rutas protegidas
router.get('/me', protect, getMe);

export default router;
