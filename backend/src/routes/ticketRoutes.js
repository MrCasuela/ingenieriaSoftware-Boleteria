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

const router = express.Router();

// Rutas protegidas
router.get('/', getAllTickets);
router.get('/user/:userId', getTicketsByUser);
router.get('/code/:ticketCode', getTicketByCode);
router.get('/by-rut/:rut', getTicketsByRut);
router.post('/', createTicket);
router.post('/validate/:ticketCode', validateTicket);
router.put('/cancel/:id', cancelTicket);

export default router;
