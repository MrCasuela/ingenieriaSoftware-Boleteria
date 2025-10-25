import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

/**
 * Servicio para generar reportes en diferentes formatos
 */

/**
 * Exportar datos a CSV
 * @param {Array} data - Datos a exportar
 * @param {Array} fields - Campos a incluir en el CSV
 * @returns {String} - CSV generado
 */
export const exportToCSV = (data, fields = null) => {
  try {
    // Si no se especifican campos, usar todos los campos del primer objeto
    const csvFields = fields || (data.length > 0 ? Object.keys(data[0]) : []);
    
    const parser = new Parser({ 
      fields: csvFields,
      delimiter: ',',
      withBOM: true // Para compatibilidad con Excel
    });
    
    const csv = parser.parse(data);
    return csv;
  } catch (error) {
    console.error('Error al generar CSV:', error);
    throw new Error('Error al generar archivo CSV');
  }
};

/**
 * Exportar reporte de asistencia a CSV
 * @param {Object} reportData - Datos del reporte
 * @returns {String} - CSV generado
 */
export const exportAttendanceToCSV = (reportData) => {
  const { tickets, stats, byEvent, bySector, byOperator, filters } = reportData;

  // Preparar datos de tickets para CSV
  const ticketsData = tickets.map(ticket => ({
    'Código Ticket': ticket.ticketCode,
    'Evento': ticket.eventName,
    'Fecha Evento': ticket.eventDate ? new Date(ticket.eventDate).toLocaleDateString('es-ES') : '',
    'Sector': ticket.sector || 'N/A',
    'Tipo Ticket': ticket.ticketType,
    'Precio': `$${ticket.price}`,
    'Total': `$${ticket.totalAmount}`,
    'Estado': ticket.status,
    'Comprador': ticket.buyerName || 'N/A',
    'Email': ticket.buyerEmail || 'N/A',
    'Documento': ticket.buyerDocument || 'N/A',
    'Validado por': ticket.validatedBy || 'N/A',
    'Fecha Validación': ticket.validatedAt 
      ? new Date(ticket.validatedAt).toLocaleString('es-ES') 
      : 'No validado',
    'Fecha Compra': new Date(ticket.purchaseDate).toLocaleString('es-ES')
  }));

  return exportToCSV(ticketsData);
};

/**
 * Exportar estadísticas a CSV
 * @param {Object} reportData - Datos del reporte
 * @returns {String} - CSV generado
 */
export const exportStatsToCSV = (reportData) => {
  const { byEvent, bySector, byOperator } = reportData;

  let csv = 'REPORTE DE ESTADÍSTICAS\n\n';
  
  // Estadísticas por evento
  csv += 'ESTADÍSTICAS POR EVENTO\n';
  csv += 'Evento,Fecha,Lugar,Total Check-ins,Validados,Ingresos\n';
  byEvent.forEach(event => {
    csv += `"${event.eventName}",`;
    csv += `"${event.eventDate ? new Date(event.eventDate).toLocaleDateString('es-ES') : 'N/A'}",`;
    csv += `"${event.venue || 'N/A'}",`;
    csv += `${event.totalCheckins},`;
    csv += `${event.validated},`;
    csv += `"$${event.revenue.toFixed(2)}"\n`;
  });

  csv += '\n\nESTADÍSTICAS POR SECTOR\n';
  csv += 'Sector,Total Check-ins,Validados,Ingresos\n';
  bySector.forEach(sector => {
    csv += `"${sector.sector}",`;
    csv += `${sector.totalCheckins},`;
    csv += `${sector.validated},`;
    csv += `"$${sector.revenue.toFixed(2)}"\n`;
  });

  csv += '\n\nESTADÍSTICAS POR OPERADOR\n';
  csv += 'Operador,Total Validaciones,Última Validación\n';
  byOperator.forEach(op => {
    csv += `"${op.operatorName}",`;
    csv += `${op.totalValidations},`;
    csv += `"${op.lastValidation ? new Date(op.lastValidation).toLocaleString('es-ES') : 'N/A'}"\n`;
  });

  return csv;
};

/**
 * Generar reporte en PDF
 * @param {Object} reportData - Datos del reporte
 * @param {Object} res - Response object para streaming
 */
export const exportToPDF = (reportData, res) => {
  const { tickets, stats, byEvent, bySector, byOperator, filters, generatedAt } = reportData;
  
  // Crear documento PDF
  const doc = new PDFDocument({ 
    size: 'A4', 
    margin: 50,
    bufferPages: true 
  });

  // Configurar headers para descarga
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=reporte-asistencia-${Date.now()}.pdf`);
  
  // Pipe del PDF al response
  doc.pipe(res);

  // --- PORTADA ---
  doc.fontSize(24).font('Helvetica-Bold').text('Reporte de Asistencia', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).font('Helvetica').text(`Generado: ${new Date(generatedAt).toLocaleString('es-ES')}`, { align: 'center' });
  doc.moveDown(2);

  // --- FILTROS APLICADOS ---
  doc.fontSize(14).font('Helvetica-Bold').text('Filtros Aplicados:', { underline: true });
  doc.fontSize(10).font('Helvetica');
  doc.moveDown(0.5);
  
  if (filters.eventId) doc.text(`• Evento ID: ${filters.eventId}`);
  if (filters.startDate) doc.text(`• Fecha desde: ${new Date(filters.startDate).toLocaleDateString('es-ES')}`);
  if (filters.endDate) doc.text(`• Fecha hasta: ${new Date(filters.endDate).toLocaleDateString('es-ES')}`);
  if (filters.status) doc.text(`• Estado: ${filters.status}`);
  if (filters.sector) doc.text(`• Sector: ${filters.sector}`);
  
  doc.moveDown(2);

  // --- ESTADÍSTICAS GENERALES ---
  doc.fontSize(14).font('Helvetica-Bold').text('Estadísticas Generales', { underline: true });
  doc.fontSize(10).font('Helvetica');
  doc.moveDown(0.5);
  
  doc.text(`Total de tickets: ${stats.totalTickets}`);
  doc.text(`Validados: ${stats.validated}`);
  doc.text(`Pendientes: ${stats.pending}`);
  doc.text(`Cancelados: ${stats.cancelled}`);
  doc.text(`Ingresos totales: $${stats.totalRevenue.toFixed(2)}`);
  
  doc.moveDown(2);

  // --- ESTADÍSTICAS POR EVENTO ---
  if (byEvent.length > 0) {
    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('Estadísticas por Evento', { underline: true });
    doc.fontSize(9).font('Helvetica');
    doc.moveDown(0.5);

    byEvent.forEach((event, index) => {
      if (index > 0 && index % 8 === 0) {
        doc.addPage();
      }
      
      doc.font('Helvetica-Bold').text(`${event.eventName}`, { continued: false });
      doc.font('Helvetica');
      doc.text(`  Fecha: ${event.eventDate ? new Date(event.eventDate).toLocaleDateString('es-ES') : 'N/A'}`);
      doc.text(`  Lugar: ${event.venue || 'N/A'}`);
      doc.text(`  Total check-ins: ${event.totalCheckins}`);
      doc.text(`  Validados: ${event.validated}`);
      doc.text(`  Ingresos: $${event.revenue.toFixed(2)}`);
      doc.moveDown(0.5);
    });
  }

  // --- ESTADÍSTICAS POR SECTOR ---
  if (bySector.length > 0) {
    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('Estadísticas por Sector', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.moveDown(0.5);

    bySector.forEach(sector => {
      doc.text(`${sector.sector}:`);
      doc.text(`  Total check-ins: ${sector.totalCheckins}`);
      doc.text(`  Validados: ${sector.validated}`);
      doc.text(`  Ingresos: $${sector.revenue.toFixed(2)}`);
      doc.moveDown(0.5);
    });
  }

  // --- ESTADÍSTICAS POR OPERADOR ---
  if (byOperator.length > 0) {
    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('Estadísticas por Operador', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.moveDown(0.5);

    byOperator.forEach(op => {
      doc.text(`${op.operatorName}:`);
      doc.text(`  Total validaciones: ${op.totalValidations}`);
      doc.text(`  Última validación: ${op.lastValidation ? new Date(op.lastValidation).toLocaleString('es-ES') : 'N/A'}`);
      doc.moveDown(0.5);
    });
  }

  // --- DETALLE DE TICKETS (primeros 50) ---
  if (tickets.length > 0) {
    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('Detalle de Tickets', { underline: true });
    doc.fontSize(8).font('Helvetica');
    doc.moveDown(0.5);

    const maxTickets = Math.min(tickets.length, 50);
    doc.text(`(Mostrando los primeros ${maxTickets} de ${tickets.length} tickets)`, { italics: true });
    doc.moveDown(0.5);

    for (let i = 0; i < maxTickets; i++) {
      const ticket = tickets[i];
      
      if (i > 0 && i % 10 === 0) {
        doc.addPage();
      }

      doc.font('Helvetica-Bold').text(`${ticket.ticketCode}`, { continued: false });
      doc.font('Helvetica').fontSize(7);
      doc.text(`  Evento: ${ticket.eventName || 'N/A'}`);
      doc.text(`  Sector: ${ticket.sector || 'N/A'} | Tipo: ${ticket.ticketType || 'N/A'}`);
      doc.text(`  Comprador: ${ticket.buyerName || 'N/A'} (${ticket.buyerEmail || 'N/A'})`);
      doc.text(`  Estado: ${ticket.status} | Total: $${ticket.totalAmount}`);
      if (ticket.validatedBy) {
        doc.text(`  Validado por: ${ticket.validatedBy} el ${new Date(ticket.validatedAt).toLocaleString('es-ES')}`);
      }
      doc.fontSize(8);
      doc.moveDown(0.3);
    }
  }

  // --- FOOTER EN TODAS LAS PÁGINAS ---
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).font('Helvetica').text(
      `Página ${i + 1} de ${pages.count}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );
  }

  // Finalizar PDF
  doc.end();
};

export default {
  exportToCSV,
  exportAttendanceToCSV,
  exportStatsToCSV,
  exportToPDF
};
