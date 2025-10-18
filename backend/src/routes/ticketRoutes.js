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
import { authenticate, authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Rutas públicas/protegidas según sea necesario
router.get('/', authenticate, authorizeRoles('Administrador'), getAllTickets);
router.get('/user/:userId', authenticate, authorizeRoles('Administrador'), getTicketsByUser);
router.get('/code/:ticketCode', authenticate, authorizeRoles('Administrador','Operador'), getTicketByCode);
router.get('/by-rut/:rut', authenticate, authorizeRoles('Administrador','Operador'), getTicketsByRut);
router.post('/', authenticate, authorizeRoles('Administrador'), createTicket);

// Validación de tickets: solo Operador
router.post('/validate/:ticketCode', authenticate, authorizeRoles('Operador'), validateTicket);

// Cancelación: solo Admin
router.put('/cancel/:id', authenticate, authorizeRoles('Administrador'), cancelTicket);

export default router;
