import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getActiveEvents
} from '../controllers/eventController.js';
import { authenticate, authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Rutas públicas
router.get('/active', getActiveEvents);
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Rutas protegidas (requieren autenticación de admin)
router.post('/', authenticate, authorizeRoles('Administrador'), createEvent);
router.put('/:id', authenticate, authorizeRoles('Administrador'), updateEvent);
router.delete('/:id', authenticate, authorizeRoles('Administrador'), deleteEvent);

export default router;
