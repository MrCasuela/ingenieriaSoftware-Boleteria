import express from 'express';
import {
  getAuditLogs,
  getAuditStats,
  getEventReport,
  generatePDFReport,
  createAuditLog
} from '../controllers/auditController.js';

const router = express.Router();

// Obtener logs de auditoría con filtros
router.get('/logs', getAuditLogs);

// Obtener estadísticas generales
router.get('/stats', getAuditStats);

// Obtener reporte de un evento específico
router.get('/report/:eventId', getEventReport);

// Generar PDF con reporte
router.post('/generate-pdf', generatePDFReport);

// Crear nuevo log de auditoría (usado por el frontend)
router.post('/log', createAuditLog);

export default router;
