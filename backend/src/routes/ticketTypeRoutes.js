import express from 'express';
import {
  getAllTicketTypes,
  getTicketTypesByEvent,
  getTicketTypeById,
  createTicketType,
  updateTicketType,
  deleteTicketType
} from '../controllers/ticketTypeController.js';

const router = express.Router();

// Rutas públicas
router.get('/', getAllTicketTypes);
router.get('/event/:eventId', getTicketTypesByEvent);
router.get('/:id', getTicketTypeById);

// Rutas protegidas (requieren autenticación de admin)
router.post('/', createTicketType);
router.put('/:id', updateTicketType);
router.delete('/:id', deleteTicketType);

export default router;
