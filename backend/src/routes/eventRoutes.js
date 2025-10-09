import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getActiveEvents
} from '../controllers/eventController.js';

const router = express.Router();

// Rutas públicas
router.get('/active', getActiveEvents);
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Rutas protegidas (requieren autenticación de admin)
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
