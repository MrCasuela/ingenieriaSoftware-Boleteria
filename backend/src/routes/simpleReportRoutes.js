import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import TicketType from '../models/TicketType.js';
import User from '../models/User.js';
import PDFDocument from 'pdfkit';

const router = express.Router();

/**
 * Exportar reporte de tickets en CSV simplificado
 */
router.get('/tickets/csv', protect, authorize('Administrador'), async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      include: [
        { model: Event, as: 'event', attributes: ['id', 'name', 'date'] },
        { model: TicketType, as: 'ticketType', attributes: ['id', 'name', 'price'] },
        { model: User, as: 'validator', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Crear CSV
    let csv = 'ID,Código,Evento,Tipo Ticket,Precio,Comprador,Email,Estado,Fecha Compra,Validado Por,Fecha Validación\n';
    
    tickets.forEach(ticket => {
      const evento = ticket.event ? ticket.event.name : 'N/A';
      const tipoTicket = ticket.ticketType ? ticket.ticketType.name : 'N/A';
      const validador = ticket.validator ? `${ticket.validator.firstName} ${ticket.validator.lastName}` : 'N/A';
      const fechaValidacion = ticket.validatedAt ? new Date(ticket.validatedAt).toLocaleString('es-AR') : 'N/A';
      
      csv += `${ticket.id},"${ticket.ticketCode}","${evento}","${tipoTicket}",${ticket.price},"${ticket.buyerName || 'N/A'}","${ticket.buyerEmail || 'N/A'}","${ticket.status}","${new Date(ticket.createdAt).toLocaleString('es-AR')}","${validador}","${fechaValidacion}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-tickets-${Date.now()}.csv`);
    res.send('\uFEFF' + csv); // BOM para Excel
    
  } catch (error) {
    console.error('Error al exportar CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte CSV',
      error: error.message
    });
  }
});

/**
 * Exportar reporte de tickets en PDF simplificado
 */
router.get('/tickets/pdf', protect, authorize('Administrador'), async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      include: [
        { model: Event, as: 'event', attributes: ['id', 'name', 'date'] },
        { model: TicketType, as: 'ticketType', attributes: ['id', 'name', 'price'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 100 // Limitar para no sobrecargar el PDF
    });

    // Crear PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-tickets-${Date.now()}.pdf`);
    
    doc.pipe(res);

    // Título
    doc.fontSize(20).text('Reporte de Tickets', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generado: ${new Date().toLocaleString('es-AR')}`, { align: 'center' });
    doc.moveDown(2);

    // Estadísticas
    const totalTickets = tickets.length;
    const ticketsValidados = tickets.filter(t => t.status === 'validated').length;
    const totalRecaudado = tickets.reduce((sum, t) => sum + parseFloat(t.totalAmount || 0), 0);

    doc.fontSize(12).text(`Total de Tickets: ${totalTickets}`);
    doc.text(`Tickets Validados: ${ticketsValidados}`);
    doc.text(`Total Recaudado: $${totalRecaudado.toFixed(2)}`);
    doc.moveDown(2);

    // Tabla de tickets
    doc.fontSize(10).text('Detalle de Tickets:', { underline: true });
    doc.moveDown();

    tickets.slice(0, 50).forEach((ticket, index) => {
      if (index > 0 && index % 15 === 0) {
        doc.addPage();
      }
      
      const evento = ticket.event ? ticket.event.name : 'N/A';
      const tipoTicket = ticket.ticketType ? ticket.ticketType.name : 'N/A';
      
      doc.fontSize(9);
      doc.text(`#${ticket.id} - ${ticket.ticketCode}`);
      doc.fontSize(8);
      doc.text(`  Evento: ${evento} | Tipo: ${tipoTicket}`, { indent: 10 });
      doc.text(`  Comprador: ${ticket.buyerName || 'N/A'} (${ticket.buyerEmail || 'N/A'})`, { indent: 10 });
      doc.text(`  Estado: ${ticket.status} | Precio: $${ticket.price}`, { indent: 10 });
      doc.moveDown(0.5);
    });

    doc.end();
    
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte PDF',
      error: error.message
    });
  }
});

export default router;
