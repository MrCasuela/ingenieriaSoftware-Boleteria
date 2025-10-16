import express from 'express';
import {
  getAllTickets,
  getTicketsByUser,
  getTicketByCode,
  getTicketsByRut,
  createTicket,
  validateTicket,
  cancelTicket
} from '../controllers/ticketController.js';
import { protect, adminOnly, operadorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas protegidas
router.get('/', protect, adminOnly, getAllTickets); // Solo admin puede ver todos los tickets
router.get('/user/:userId', protect, getTicketsByUser); // Usuario autenticado puede ver sus tickets
router.get('/code/:ticketCode', protect, operadorOrAdmin, getTicketByCode); // Operador/Admin pueden buscar por código
router.get('/by-rut/:rut', protect, operadorOrAdmin, getTicketsByRut); // Operador/Admin pueden buscar por RUT
router.post('/', createTicket); // Público - crear ticket (compra)
router.post('/validate/:ticketCode', protect, operadorOrAdmin, validateTicket); // Operador/Admin pueden validar
router.put('/cancel/:id', protect, adminOnly, cancelTicket); // Solo admin puede cancelar

export default router;
