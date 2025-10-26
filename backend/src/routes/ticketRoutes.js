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

// Ruta pública para crear tickets (compra de clientes)
router.post('/', createTicket);

// Rutas protegidas según sea necesario
router.get('/', authenticate, authorizeRoles('Administrador'), getAllTickets);
router.get('/user/:userId', authenticate, authorizeRoles('Administrador'), getTicketsByUser);
router.get('/code/:ticketCode', authenticate, authorizeRoles('Administrador','Operador'), getTicketByCode);
router.get('/by-rut/:rut', authenticate, authorizeRoles('Administrador','Operador'), getTicketsByRut);

// Validación de tickets: solo Operador
router.post('/validate/:ticketCode', authenticate, authorizeRoles('Operador'), validateTicket);

// Cancelación: solo Admin
router.put('/cancel/:id', authenticate, authorizeRoles('Administrador'), cancelTicket);

export default router;
