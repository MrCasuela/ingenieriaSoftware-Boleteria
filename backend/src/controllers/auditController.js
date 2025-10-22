import AuditLog from '../models/AuditLog.js';
import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import { Op } from 'sequelize';
import PDFDocument from 'pdfkit';

/**
 * Obtener todos los logs de auditoría con filtros
 */
export const getAuditLogs = async (req, res) => {
  try {
    const {
      eventId,
      startDate,
      endDate,
      validationType,
      validationResult,
      operatorEmail,
      limit = 100,
      offset = 0
    } = req.query;

    const whereClause = {};

    // Filtros
    if (eventId) whereClause.event_id = eventId;
    if (validationType) whereClause.validation_type = validationType;
    if (validationResult) whereClause.validation_result = validationResult;
    if (operatorEmail) whereClause.operator_email = operatorEmail;

    // Filtro de fechas
    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) whereClause.timestamp[Op.gte] = new Date(startDate);
      if (endDate) whereClause.timestamp[Op.lte] = new Date(endDate);
    }

    const logs = await AuditLog.findAndCountAll({
      where: whereClause,
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: logs.rows,
      total: logs.count,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(logs.count / limit)
    });
  } catch (error) {
    console.error('❌ Error al obtener logs de auditoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener logs de auditoría',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener estadísticas generales de auditoría
 */
export const getAuditStats = async (req, res) => {
  try {
    const { eventId, startDate, endDate } = req.query;

    const whereClause = {};
    if (eventId) whereClause.event_id = eventId;
    
    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) whereClause.timestamp[Op.gte] = new Date(startDate);
      if (endDate) whereClause.timestamp[Op.lte] = new Date(endDate);
    }

    // Estadísticas por resultado
    const byResult = await AuditLog.findAll({
      where: whereClause,
      attributes: [
        'validation_result',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'count']
      ],
      group: ['validation_result']
    });

    // Estadísticas por tipo de validación
    const byType = await AuditLog.findAll({
      where: whereClause,
      attributes: [
        'validation_type',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'count']
      ],
      group: ['validation_type']
    });

    // Estadísticas por categoría de ticket
    const byCategory = await AuditLog.findAll({
      where: whereClause,
      attributes: [
        'ticket_category',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'count']
      ],
      group: ['ticket_category']
    });

    // Total de validaciones
    const total = await AuditLog.count({ where: whereClause });

    // Detección de fraudes
    const frauds = await AuditLog.count({
      where: { ...whereClause, fraud_detected: true }
    });

    // Top operadores
    const topOperators = await AuditLog.findAll({
      where: whereClause,
      attributes: [
        'operator_name',
        'operator_email',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'count']
      ],
      group: ['operator_name', 'operator_email'],
      order: [[AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      stats: {
        total,
        frauds,
        byResult: byResult.map(r => ({
          result: r.validation_result,
          count: parseInt(r.get('count'))
        })),
        byType: byType.map(t => ({
          type: t.validation_type,
          count: parseInt(t.get('count'))
        })),
        byCategory: byCategory.map(c => ({
          category: c.ticket_category,
          count: parseInt(c.get('count'))
        })),
        topOperators: topOperators.map(o => ({
          name: o.operator_name,
          email: o.operator_email,
          count: parseInt(o.get('count'))
        }))
      }
    });
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener reporte detallado de un evento específico
 */
export const getEventReport = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Obtener información del evento
    const event = await Event.findByPk(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Logs del evento
    const logs = await AuditLog.findAll({
      where: { event_id: eventId },
      order: [['timestamp', 'DESC']]
    });

    // Estadísticas específicas del evento
    const stats = await getEventStats(eventId);

    res.json({
      success: true,
      event: {
        id: event.id,
        name: event.name,
        date: event.date,
        location: event.location,
        totalCapacity: event.total_capacity,
        availableCapacity: event.available_capacity
      },
      logs,
      stats
    });
  } catch (error) {
    console.error('❌ Error al obtener reporte del evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reporte del evento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Generar PDF con reporte de auditoría
 */
export const generatePDFReport = async (req, res) => {
  try {
    const { eventId, startDate, endDate } = req.body;

    let event = null;
    let whereClause = {};

    if (eventId) {
      event = await Event.findByPk(eventId);
      whereClause.event_id = eventId;
    }

    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) whereClause.timestamp[Op.gte] = new Date(startDate);
      if (endDate) whereClause.timestamp[Op.lte] = new Date(endDate);
    }

    // Obtener datos
    const logs = await AuditLog.findAll({
      where: whereClause,
      order: [['timestamp', 'DESC']]
    });

    const stats = await getEventStats(eventId, startDate, endDate);

    // Crear PDF
    const doc = new PDFDocument({ margin: 50 });

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=reporte-auditoria-${event ? event.name.replace(/\s/g, '-') : 'general'}-${Date.now()}.pdf`
    );

    doc.pipe(res);

    // Título
    doc.fontSize(20).text('REPORTE DE AUDITORÍA Y VALIDACIONES', { align: 'center' });
    doc.moveDown();

    if (event) {
      doc.fontSize(16).text(`Evento: ${event.name}`, { align: 'center' });
      doc.fontSize(12).text(`Fecha: ${new Date(event.date).toLocaleDateString()}`, { align: 'center' });
      doc.text(`Ubicación: ${event.location}`, { align: 'center' });
      doc.moveDown();
    }

    doc.fontSize(12).text(`Generado: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Sección: Resumen Ejecutivo
    doc.fontSize(14).fillColor('blue').text('📊 RESUMEN EJECUTIVO', { underline: true });
    doc.fillColor('black').fontSize(11);
    doc.moveDown();
    
    doc.text(`Total de validaciones: ${stats.total}`);
    doc.text(`Aprobadas: ${stats.approved} (${((stats.approved/stats.total)*100).toFixed(1)}%)`);
    doc.text(`Rechazadas: ${stats.rejected} (${((stats.rejected/stats.total)*100).toFixed(1)}%)`);
    doc.text(`Errores: ${stats.errors}`);
    doc.text(`Intentos de fraude detectados: ${stats.frauds}`);
    doc.moveDown(2);

    // Sección: Por Tipo de Validación
    doc.fontSize(14).fillColor('blue').text('🔍 VALIDACIONES POR TIPO', { underline: true });
    doc.fillColor('black').fontSize(11);
    doc.moveDown();
    
    doc.text(`Escáner QR: ${stats.byType.qr || 0}`);
    doc.text(`Manual (código): ${stats.byType.manual || 0}`);
    doc.text(`Por RUT: ${stats.byType.rut || 0}`);
    doc.moveDown(2);

    // Sección: Por Categoría de Ticket
    doc.fontSize(14).fillColor('blue').text('🎫 ENTRADAS POR CATEGORÍA', { underline: true });
    doc.fillColor('black').fontSize(11);
    doc.moveDown();
    
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      doc.text(`${category.toUpperCase()}: ${count} tickets`);
    });
    doc.moveDown(2);

    // Sección: Timeline de Validaciones
    doc.addPage();
    doc.fontSize(14).fillColor('blue').text('📅 HISTORIAL DE VALIDACIONES', { underline: true });
    doc.fillColor('black').fontSize(10);
    doc.moveDown();

    // Tabla de validaciones (últimas 50)
    const recentLogs = logs.slice(0, 50);
    
    recentLogs.forEach((log, index) => {
      const color = log.validation_result === 'approved' ? 'green' : 'red';
      const icon = log.validation_result === 'approved' ? '✓' : '✗';
      
      doc.fillColor(color).text(
        `${icon} ${new Date(log.timestamp).toLocaleString()} - ${log.ticket_code} - ${log.validation_type.toUpperCase()} - ${log.operator_name}`,
        { width: 500 }
      );
      
      if (index < recentLogs.length - 1) {
        doc.fillColor('black').moveDown(0.3);
      }

      // Nueva página cada 30 logs
      if ((index + 1) % 30 === 0 && index < recentLogs.length - 1) {
        doc.addPage();
        doc.fontSize(10).fillColor('black');
      }
    });

    // Finalizar PDF
    doc.end();

  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Registrar un nuevo log de auditoría
 */
export const createAuditLog = async (req, res) => {
  try {
    const logData = req.body;

    const auditLog = await AuditLog.create({
      ...logData,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: auditLog
    });
  } catch (error) {
    console.error('❌ Error al crear log de auditoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear log de auditoría',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Función auxiliar para obtener estadísticas de un evento
 */
async function getEventStats(eventId, startDate = null, endDate = null) {
  const whereClause = {};
  
  if (eventId) whereClause.event_id = eventId;
  
  if (startDate || endDate) {
    whereClause.timestamp = {};
    if (startDate) whereClause.timestamp[Op.gte] = new Date(startDate);
    if (endDate) whereClause.timestamp[Op.lte] = new Date(endDate);
  }

  const total = await AuditLog.count({ where: whereClause });
  
  const approved = await AuditLog.count({
    where: { ...whereClause, validation_result: 'approved' }
  });
  
  const rejected = await AuditLog.count({
    where: { ...whereClause, validation_result: 'rejected' }
  });
  
  const errors = await AuditLog.count({
    where: { ...whereClause, validation_result: 'error' }
  });
  
  const frauds = await AuditLog.count({
    where: { ...whereClause, fraud_detected: true }
  });

  // Por tipo
  const byTypeRaw = await AuditLog.findAll({
    where: whereClause,
    attributes: [
      'validation_type',
      [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'count']
    ],
    group: ['validation_type']
  });

  const byType = {};
  byTypeRaw.forEach(item => {
    byType[item.validation_type] = parseInt(item.get('count'));
  });

  // Por categoría
  const byCategoryRaw = await AuditLog.findAll({
    where: whereClause,
    attributes: [
      'ticket_category',
      [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'count']
    ],
    group: ['ticket_category']
  });

  const byCategory = {};
  byCategoryRaw.forEach(item => {
    byCategory[item.ticket_category || 'other'] = parseInt(item.get('count'));
  });

  return {
    total,
    approved,
    rejected,
    errors,
    frauds,
    byType,
    byCategory
  };
}

export default {
  getAuditLogs,
  getAuditStats,
  getEventReport,
  generatePDFReport,
  createAuditLog
};
