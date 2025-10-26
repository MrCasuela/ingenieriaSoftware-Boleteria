import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

/**
 * Genera un PDF del ticket con todos los detalles
 * @param {Object} ticketData - Datos del ticket
 * @returns {Promise<Buffer>} Buffer del PDF generado
 */
export const generateTicketPDF = async (ticketData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      // Acumular chunks del PDF
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Generar QR Code
      let qrCodeDataURL = '';
      try {
        qrCodeDataURL = await QRCode.toDataURL(ticketData.ticketCode, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      } catch (qrError) {
        console.error('Error generando QR:', qrError);
      }

      // Configuración de colores
      const primaryColor = '#0d6efd';
      const textColor = '#333333';
      const lightGray = '#f8f9fa';

      // Header con fondo azul
      doc.rect(0, 0, doc.page.width, 100).fill(primaryColor);

      // Título
      doc.fontSize(28)
         .fillColor('#FFFFFF')
         .font('Helvetica-Bold')
         .text('Tu Entrada Digital', 50, 35, { align: 'center' });

      doc.fontSize(12)
         .fillColor('#FFFFFF')
         .font('Helvetica')
         .text('Sistema de Boletería TicketVue', 50, 70, { align: 'center' });

      // Resetear color y posición
      doc.fillColor(textColor);
      let yPosition = 130;

      // QR Code (izquierda)
      if (qrCodeDataURL) {
        // Convertir data URL a buffer
        const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
        const qrBuffer = Buffer.from(base64Data, 'base64');
        doc.image(qrBuffer, 50, yPosition, { width: 150, height: 150 });
      }

      // Código de entrada debajo del QR
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('Código de Entrada:', 50, yPosition + 160);
      
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor(primaryColor)
         .text(ticketData.ticketCode, 50, yPosition + 175);

      // Resetear color
      doc.fillColor(textColor);

      // Detalles del Evento (derecha)
      const rightColumn = 250;
      let rightY = yPosition;

      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Detalles del Evento', rightColumn, rightY);

      rightY += 25;
      doc.fontSize(10);

      // Evento
      doc.font('Helvetica-Bold').text('Evento:', rightColumn, rightY);
      doc.font('Helvetica').text(ticketData.eventName, rightColumn + 80, rightY, { width: 250 });
      rightY += 20;

      // Fecha
      doc.font('Helvetica-Bold').text('Fecha:', rightColumn, rightY);
      doc.font('Helvetica').text(ticketData.eventDate, rightColumn + 80, rightY);
      rightY += 20;

      // Ubicación
      doc.font('Helvetica-Bold').text('Ubicación:', rightColumn, rightY);
      doc.font('Helvetica').text(ticketData.eventLocation, rightColumn + 80, rightY, { width: 250 });
      rightY += 20;

      // Tipo de entrada
      doc.font('Helvetica-Bold').text('Tipo de Entrada:', rightColumn, rightY);
      doc.font('Helvetica').text(ticketData.ticketTypeName, rightColumn + 80, rightY);
      rightY += 20;

      // Cantidad
      doc.font('Helvetica-Bold').text('Cantidad:', rightColumn, rightY);
      doc.font('Helvetica').text(ticketData.quantity.toString(), rightColumn + 80, rightY);
      rightY += 20;

      // Precio Total
      doc.font('Helvetica-Bold').text('Precio Total:', rightColumn, rightY);
      doc.font('Helvetica').text(`$${ticketData.totalAmount}`, rightColumn + 80, rightY);

      // Línea separadora
      rightY += 30;
      doc.moveTo(rightColumn, rightY)
         .lineTo(doc.page.width - 50, rightY)
         .stroke();

      // Datos del Comprador
      rightY += 20;
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Datos del Comprador', rightColumn, rightY);

      rightY += 25;
      doc.fontSize(10);

      // Nombre
      doc.font('Helvetica-Bold').text('Nombre:', rightColumn, rightY);
      doc.font('Helvetica').text(ticketData.buyerName, rightColumn + 80, rightY);
      rightY += 20;

      // Email
      doc.font('Helvetica-Bold').text('Email:', rightColumn, rightY);
      doc.font('Helvetica').text(ticketData.buyerEmail, rightColumn + 80, rightY, { width: 250 });
      rightY += 20;

      // Teléfono
      if (ticketData.buyerPhone) {
        doc.font('Helvetica-Bold').text('Teléfono:', rightColumn, rightY);
        doc.font('Helvetica').text(ticketData.buyerPhone, rightColumn + 80, rightY);
        rightY += 20;
      }

      // Documento
      doc.font('Helvetica-Bold').text('Documento:', rightColumn, rightY);
      doc.font('Helvetica').text(ticketData.buyerDocument, rightColumn + 80, rightY);

      // Caja de información importante
      yPosition = rightY + 40;
      
      doc.rect(50, yPosition, doc.page.width - 100, 80)
         .fillAndStroke(lightGray, primaryColor);

      doc.fontSize(10)
         .fillColor(textColor)
         .font('Helvetica-Bold')
         .text('📌 Instrucciones Importantes:', 60, yPosition + 10);

      doc.fontSize(9)
         .font('Helvetica')
         .text('• Presenta este código QR en la entrada del evento', 60, yPosition + 25)
         .text('• También puedes usar tu código de entrada o documento para validar tu acceso', 60, yPosition + 40)
         .text('• Llega con tiempo suficiente antes del evento', 60, yPosition + 55);

      // Footer
      const footerY = doc.page.height - 50;
      doc.fontSize(8)
         .fillColor('#666666')
         .font('Helvetica')
         .text('Este es tu ticket digital. Guárdalo en un lugar seguro.', 50, footerY, { 
           align: 'center',
           width: doc.page.width - 100
         });

      doc.fontSize(7)
         .text(`Generado el ${new Date().toLocaleString('es-ES')}`, 50, footerY + 15, { 
           align: 'center',
           width: doc.page.width - 100
         });

      doc.fontSize(8)
         .text('© 2025 Sistema de Boletería TicketVue', 50, footerY + 25, { 
           align: 'center',
           width: doc.page.width - 100
         });

      // Finalizar documento
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Genera un PDF con el reporte de auditoría de un evento
 * @param {Object} event - Datos del evento
 * @param {Array} auditLogs - Logs de auditoría
 * @param {Object} filters - Filtros aplicados
 * @returns {PDFDocument} Stream del PDF
 */
export const generateAuditReportPDF = (event, auditLogs, filters = {}) => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });

  // Configurar metadata
  doc.info.Title = `Reporte de Auditoría - ${event.name}`;
  doc.info.Author = 'TicketVue System';
  doc.info.Subject = 'Reporte de Validaciones y Accesos';
  doc.info.CreationDate = new Date();

  // Calcular estadísticas
  const stats = calculateAuditStatistics(auditLogs);

  // --- ENCABEZADO ---
  doc.fontSize(20)
     .fillColor('#4F46E5')
     .text('REPORTE DE AUDITORÍA', { align: 'center' });
  
  doc.moveDown(0.5);
  
  doc.fontSize(16)
     .fillColor('#000')
     .text(event.name, { align: 'center' });
  
  doc.moveDown(0.3);
  
  doc.fontSize(10)
     .fillColor('#666')
     .text(`${event.venue || event.location} - ${new Date(event.date).toLocaleDateString('es-ES')}`, { align: 'center' });
  
  doc.moveDown(1);
  doc.strokeColor('#4F46E5')
     .lineWidth(2)
     .moveTo(50, doc.y)
     .lineTo(545, doc.y)
     .stroke();

  // --- INFORMACIÓN DEL REPORTE ---
  doc.moveDown(2);
  doc.fontSize(12)
     .fillColor('#000')
     .text('Información del Reporte', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(10)
     .fillColor('#333');
  
  doc.text(`Fecha de generación: ${new Date().toLocaleString('es-ES')}`);
  doc.text(`Total de registros: ${auditLogs.length}`);
  
  if (filters.startDate && filters.endDate) {
    doc.text(`Período: ${new Date(filters.startDate).toLocaleDateString('es-ES')} - ${new Date(filters.endDate).toLocaleDateString('es-ES')}`);
  }
  
  if (filters.action) {
    doc.text(`Tipo de acción: ${filters.action}`);
  }

  // --- ESTADÍSTICAS ---
  doc.moveDown(1);
  doc.fontSize(12)
     .fillColor('#000')
     .text('Estadísticas Generales', { underline: true });
  
  doc.moveDown(0.5);

  const startY = doc.y;
  const boxWidth = 495;
  const boxHeight = 120;
  
  doc.rect(50, startY, boxWidth, boxHeight)
     .fillAndStroke('#F3F4F6', '#E5E7EB');
  
  doc.fillColor('#000');
  
  // Columna 1: Validaciones
  let currentY = startY + 15;
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('VALIDACIONES', 70, currentY);
  
  currentY += 20;
  doc.fontSize(10)
     .font('Helvetica');
  
  doc.fillColor('#10B981')
     .text(`✓ Aprobadas: ${stats.validations.approved}`, 70, currentY);
  
  currentY += 15;
  doc.fillColor('#EF4444')
     .text(`✗ Rechazadas: ${stats.validations.rejected}`, 70, currentY);
  
  currentY += 15;
  doc.fillColor('#333')
     .text(`Total: ${stats.validations.total}`, 70, currentY);

  // Columna 2: Tipo de Registro
  currentY = startY + 15;
  doc.fontSize(11)
     .fillColor('#000')
     .font('Helvetica-Bold')
     .text('TIPO DE REGISTRO', 280, currentY);
  
  currentY += 20;
  doc.fontSize(10)
     .font('Helvetica');
  
  doc.fillColor('#3B82F6')
     .text(`QR Scanner: ${stats.registrationTypes.qr_scan}`, 280, currentY);
  
  currentY += 15;
  doc.fillColor('#8B5CF6')
     .text(`Manual: ${stats.registrationTypes.manual}`, 280, currentY);

  // Columna 3: Categorías
  currentY = startY + 15;
  doc.fontSize(11)
     .fillColor('#000')
     .font('Helvetica-Bold')
     .text('CATEGORÍAS', 420, currentY);
  
  currentY += 20;
  doc.fontSize(10)
     .font('Helvetica');
  
  doc.fillColor('#F59E0B')
     .text(`Normal: ${stats.ticketCategories.normal}`, 420, currentY);
  
  currentY += 15;
  doc.fillColor('#EC4899')
     .text(`VIP: ${stats.ticketCategories.vip}`, 420, currentY);

  // --- DETALLE DE REGISTROS ---
  doc.addPage();
  doc.fontSize(12)
     .fillColor('#000')
     .font('Helvetica-Bold')
     .text('Detalle de Registros', { underline: true });
  
  doc.moveDown(1);

  // Encabezados de la tabla
  const tableTop = doc.y;
  
  doc.fontSize(9)
     .font('Helvetica-Bold')
     .fillColor('#fff');

  doc.rect(50, tableTop, 495, 20)
     .fill('#4F46E5');

  doc.fillColor('#fff');
  doc.text('FECHA', 55, tableTop + 6);
  doc.text('HORA', 145, tableTop + 6);
  doc.text('ACCIÓN', 200, tableTop + 6);
  doc.text('RESULTADO', 305, tableTop + 6);
  doc.text('MÉTODO', 380, tableTop + 6);
  doc.text('CATEGORÍA', 455, tableTop + 6);

  // Filas de datos
  currentY = tableTop + 25;
  doc.font('Helvetica')
     .fontSize(8);

  auditLogs.forEach((log, index) => {
    if (currentY > 720) {
      doc.addPage();
      currentY = 50;
    }

    const bgColor = index % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
    doc.rect(50, currentY, 495, 18)
       .fill(bgColor);

    let resultColor = '#333';
    if (log.action === 'TICKET_VALIDATED') {
      resultColor = log.details?.success ? '#10B981' : '#EF4444';
    }

    doc.fillColor('#333');
    
    const logDate = new Date(log.createdAt);
    doc.text(logDate.toLocaleDateString('es-ES'), 55, currentY + 4);
    doc.text(logDate.toLocaleTimeString('es-ES'), 145, currentY + 4);
    doc.text(getAuditActionText(log.action), 200, currentY + 4);
    
    doc.fillColor(resultColor);
    doc.text(getAuditResultText(log), 305, currentY + 4);
    
    doc.fillColor('#333');
    doc.text(log.details?.method || 'N/A', 380, currentY + 4);
    doc.text(log.details?.ticketType || 'N/A', 455, currentY + 4);

    currentY += 18;
  });

  doc.rect(50, tableTop, 495, currentY - tableTop)
     .stroke('#E5E7EB');

  // --- PIE DE PÁGINA ---
  doc.fontSize(8)
     .fillColor('#999')
     .text(
       `Generado por TicketVue © ${new Date().getFullYear()}`,
       50,
       750,
       { align: 'center', width: 495 }
     );

  return doc;
};

/**
 * Calcula estadísticas de los logs de auditoría
 */
const calculateAuditStatistics = (logs) => {
  const stats = {
    validations: {
      total: 0,
      approved: 0,
      rejected: 0
    },
    registrationTypes: {
      qr_scan: 0,
      manual: 0
    },
    ticketCategories: {
      normal: 0,
      vip: 0
    }
  };

  logs.forEach(log => {
    if (log.action === 'TICKET_VALIDATED') {
      stats.validations.total++;
      
      if (log.details?.success) {
        stats.validations.approved++;
      } else {
        stats.validations.rejected++;
      }

      const method = log.details?.method?.toLowerCase();
      if (method === 'qr_scan' || method === 'qr') {
        stats.registrationTypes.qr_scan++;
      } else if (method === 'manual') {
        stats.registrationTypes.manual++;
      }

      const ticketType = log.details?.ticketType?.toLowerCase();
      if (ticketType?.includes('vip')) {
        stats.ticketCategories.vip++;
      } else {
        stats.ticketCategories.normal++;
      }
    }
  });

  return stats;
};

/**
 * Obtiene el texto de la acción en español
 */
const getAuditActionText = (action) => {
  const actions = {
    'TICKET_VALIDATED': 'Validación',
    'TICKET_CREATED': 'Creación',
    'USER_LOGIN': 'Login',
    'USER_LOGOUT': 'Logout',
    'EVENT_CREATED': 'Evento Creado',
    'EVENT_UPDATED': 'Evento Actualizado'
  };
  return actions[action] || action;
};

/**
 * Obtiene el texto del resultado
 */
const getAuditResultText = (log) => {
  if (log.action === 'TICKET_VALIDATED') {
    return log.details?.success ? 'Aprobado' : 'Rechazado';
  }
  return log.details?.success ? 'Exitoso' : 'Fallido';
};
