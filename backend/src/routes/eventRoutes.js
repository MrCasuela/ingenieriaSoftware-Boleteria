import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getActiveEvents
} from '../controllers/eventController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/active', getActiveEvents);
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Rutas protegidas - Solo administradores pueden gestionar eventos
router.post('/', protect, adminOnly, createEvent);
router.put('/:id', protect, adminOnly, updateEvent);
router.delete('/:id', protect, adminOnly, deleteEvent);

export default router;
