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
         .text('Sistema de Boleteria TicketVue', 50, 70, { align: 'center' });

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
         .text('Codigo de Entrada:', 50, yPosition + 160);
      
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
      doc.font('Helvetica-Bold').text('Ubicacion:', rightColumn, rightY);
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
        doc.font('Helvetica-Bold').text('Telefono:', rightColumn, rightY);
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
         .text('• Presenta este codigo QR en la entrada del evento', 60, yPosition + 25)
         .text('• Tambien puedes usar tu codigo de entrada o documento para validar tu acceso', 60, yPosition + 40)
         .text('• Llega con tiempo suficiente antes del evento', 60, yPosition + 55);

      // Footer
      const footerY = doc.page.height - 50;
      doc.fontSize(8)
         .fillColor('#666666')
         .font('Helvetica')
         .text('Este es tu ticket digital. Guardalo en un lugar seguro.', 50, footerY, { 
           align: 'center',
           width: doc.page.width - 100
         });

      doc.fontSize(7)
         .text(`Generado el ${new Date().toLocaleString('es-ES')}`, 50, footerY + 15, { 
           align: 'center',
           width: doc.page.width - 100
         });

      doc.fontSize(8)
         .text('(c) 2025 Sistema de Boleteria TicketVue', 50, footerY + 25, { 
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
  doc.info.Title = `Reporte de Auditoria - ${event.name}`;
  doc.info.Author = 'TicketVue System';
  doc.info.Subject = 'Reporte de Validaciones y Accesos';
  doc.info.CreationDate = new Date();

  // Calcular estadísticas
  const stats = calculateAuditStatistics(auditLogs);

  // --- ENCABEZADO ---
  doc.fontSize(20)
     .fillColor('#4F46E5')
     .text('REPORTE DE AUDITORIA', { align: 'center' });
  
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
     .text('Informacion del Reporte', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(10)
     .fillColor('#333');
  
  doc.text(`Fecha de generacion: ${new Date().toLocaleString('es-ES')}`);
  doc.text(`Total de registros: ${auditLogs.length}`);
  
  if (filters.startDate && filters.endDate) {
    doc.text(`Periodo: ${new Date(filters.startDate).toLocaleDateString('es-ES')} - ${new Date(filters.endDate).toLocaleDateString('es-ES')}`);
  }
  
  if (filters.action) {
    doc.text(`Tipo de accion: ${filters.action}`);
  }

  // --- ESTADÍSTICAS ---
  doc.moveDown(1);
  doc.fontSize(12)
     .fillColor('#000')
     .text('Estadísticas Generales', { underline: true });
  
  doc.moveDown(0.5);

  const startY = doc.y;
  const boxWidth = 495;
  const boxHeight = 100;
  
  doc.rect(50, startY, boxWidth, boxHeight)
     .fillAndStroke('#F3F4F6', '#E5E7EB');
  
  doc.fillColor('#000');
  
  // Columna 1: Validaciones
  let currentY = startY + 15;
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('VALIDACIONES', 100, currentY);
  
  currentY += 20;
  doc.fontSize(10)
     .font('Helvetica');
  
  doc.fillColor('#10B981')
     .text(`[OK] Aprobadas: ${stats.validations.approved}`, 100, currentY);
  
  currentY += 15;
  doc.fillColor('#EF4444')
     .text(`[X] Rechazadas: ${stats.validations.rejected}`, 100, currentY);
  
  currentY += 15;
  doc.fillColor('#F59E0B')
     .text(`[!] Errores: ${stats.validations.errors}`, 100, currentY);
  
  currentY += 15;
  doc.fillColor('#333')
     .text(`Total: ${stats.validations.total}`, 100, currentY);

  // Columna 2: Tipo de Validación
  currentY = startY + 15;
  doc.fontSize(11)
     .fillColor('#000')
     .font('Helvetica-Bold')
     .text('TIPO DE VALIDACION', 340, currentY);
  
  currentY += 20;
  doc.fontSize(10)
     .font('Helvetica');
  
  doc.fillColor('#6366F1')
     .text(`[QR] Escaneo QR: ${stats.registrationTypes.qr_scan}`, 340, currentY);
  
  currentY += 15;
  doc.fillColor('#8B5CF6')
     .text(`[MANUAL] Ingreso Manual: ${stats.registrationTypes.manual}`, 340, currentY);
  
  currentY += 15;
  doc.fillColor('#EC4899')
     .text(`[RUT] Por RUT: ${stats.registrationTypes.rut}`, 340, currentY);

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
  doc.text('HORA', 130, tableTop + 6);
  doc.text('CÓDIGO', 200, tableTop + 6);
  doc.text('RESULTADO', 315, tableTop + 6);
  doc.text('TIPO', 435, tableTop + 6);

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
    if (log.validation_result === 'approved') {
      resultColor = '#10B981';
    } else if (log.validation_result === 'rejected') {
      resultColor = '#EF4444';
    } else if (log.validation_result === 'error') {
      resultColor = '#F59E0B';
    }

    doc.fillColor('#333');
    
    const logDate = new Date(log.timestamp || log.created_at);
    doc.text(logDate.toLocaleDateString('es-ES'), 55, currentY + 4);
    doc.text(logDate.toLocaleTimeString('es-ES'), 130, currentY + 4);
    doc.text((log.ticket_code || 'N/A').substring(0, 15), 200, currentY + 4);
    
    doc.fillColor(resultColor);
    doc.text(getValidationResultText(log.validation_result), 315, currentY + 4);
    
    doc.fillColor('#333');
    doc.text(getValidationTypeText(log.validation_type), 435, currentY + 4);

    currentY += 18;
  });

  doc.rect(50, tableTop, 495, currentY - tableTop)
     .stroke('#E5E7EB');

  // --- PIE DE PÁGINA ---
  doc.fontSize(8)
     .fillColor('#999')
     .text(
       `Generado por TicketVue (c) ${new Date().getFullYear()}`,
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
      total: logs.length,
      approved: 0,
      rejected: 0,
      errors: 0
    },
    registrationTypes: {
      qr_scan: 0,
      manual: 0,
      rut: 0
    },
    ticketCategories: {
      normal: 0,
      vip: 0,
      general: 0,
      premium: 0,
      other: 0
    }
  };

  logs.forEach(log => {
    // Contar por resultado de validación
    if (log.validation_result === 'approved') {
      stats.validations.approved++;
    } else if (log.validation_result === 'rejected') {
      stats.validations.rejected++;
    } else if (log.validation_result === 'error') {
      stats.validations.errors++;
    }

    // Contar por tipo de validación
    const validationType = log.validation_type?.toLowerCase();
    if (validationType === 'qr') {
      stats.registrationTypes.qr_scan++;
    } else if (validationType === 'manual') {
      stats.registrationTypes.manual++;
    } else if (validationType === 'rut') {
      stats.registrationTypes.rut++;
    }

    // Contar por categoría de ticket
    const category = log.ticket_category?.toLowerCase();
    if (category && stats.ticketCategories[category] !== undefined) {
      stats.ticketCategories[category]++;
    } else if (category) {
      stats.ticketCategories.other++;
    }
  });

  return stats;
};

/**
 * Obtiene el texto del tipo de validación en español
 */
const getValidationTypeText = (type) => {
  const types = {
    'qr': '[QR]',
    'manual': '[MANUAL]',
    'rut': '[RUT]'
  };
  return types[type?.toLowerCase()] || 'N/A';
};

/**
 * Obtiene el texto del resultado de validación
 */
const getValidationResultText = (result) => {
  const results = {
    'approved': 'Aprobado',
    'rejected': 'Rechazado',
    'error': 'Error'
  };
  return results[result] || result || 'N/A';
};

/**
 * Obtiene el texto de la acción en español (legacy)
 */
const getAuditActionText = (action) => {
  const actions = {
    'TICKET_VALIDATED': 'Validacion',
    'TICKET_CREATED': 'Creacion',
    'USER_LOGIN': 'Login',
    'USER_LOGOUT': 'Logout',
    'EVENT_CREATED': 'Evento Creado',
    'EVENT_UPDATED': 'Evento Actualizado'
  };
  return actions[action] || action;
};

/**
 * Obtiene el texto del resultado (legacy)
 */
const getAuditResultText = (log) => {
  if (log.action === 'TICKET_VALIDATED') {
    return log.details?.success ? 'Aprobado' : 'Rechazado';
  }
  return log.details?.success ? 'Exitoso' : 'Fallido';
};

/**
 * Genera un PDF con estadísticas generales del sistema
 * @param {Object} stats - Objeto con estadísticas del sistema
 * @returns {PDFDocument} Documento PDF
 */
export const generateStatisticsPDF = (stats) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Configuración de colores
  const primaryColor = '#0d6efd';
  const textColor = '#333333';
  const lightGray = '#f8f9fa';
  const borderColor = '#dee2e6';

  let yPos = 50;

  // ===== ENCABEZADO =====
  doc.rect(0, 0, doc.page.width, 80).fill(primaryColor);
  
  doc.fontSize(24)
     .fillColor('#FFFFFF')
     .font('Helvetica-Bold')
     .text('REPORTE DE ESTADISTICAS', 50, 25, { align: 'center' });

  doc.fontSize(12)
     .fillColor('#FFFFFF')
     .font('Helvetica')
     .text(`Generado: ${new Date().toLocaleString('es-CL')}`, 50, 55, { align: 'center' });

  yPos = 100;

  // ===== RESUMEN GENERAL =====
  doc.fontSize(16)
     .fillColor(textColor)
     .font('Helvetica-Bold')
     .text('RESUMEN GENERAL', 50, yPos);

  yPos += 30;

  // Cuadro con estadísticas principales
  const boxWidth = doc.page.width - 100;
  const boxHeight = 140;
  
  doc.rect(50, yPos, boxWidth, boxHeight)
     .fillAndStroke(lightGray, borderColor);

  yPos += 20;

  // Grid de estadísticas (2 columnas)
  const col1X = 70;
  const col2X = (doc.page.width / 2) + 20;
  
  doc.fontSize(12).fillColor(textColor).font('Helvetica');
  
  // Columna 1
  doc.font('Helvetica-Bold').text('Total Eventos:', col1X, yPos);
  doc.font('Helvetica').text(stats.totalEvents || 0, col1X + 150, yPos);
  
  yPos += 25;
  doc.font('Helvetica-Bold').text('Tipos de Ticket:', col1X, yPos);
  doc.font('Helvetica').text(stats.totalTicketTypes || 0, col1X + 150, yPos);
  
  yPos += 25;
  doc.font('Helvetica-Bold').text('Aforo Total:', col1X, yPos);
  doc.font('Helvetica').text((stats.totalCapacity || 0).toLocaleString('es-CL'), col1X + 150, yPos);
  
  // Columna 2
  yPos = 140;
  doc.font('Helvetica-Bold').text('Ingresos Potenciales:', col2X, yPos);
  doc.font('Helvetica').text(`$${(stats.totalRevenue || 0).toLocaleString('es-CL')}`, col2X + 150, yPos);
  
  yPos += 25;
  doc.font('Helvetica-Bold').text('Tickets Disponibles:', col2X, yPos);
  doc.font('Helvetica').text((stats.availableTickets || 0).toLocaleString('es-CL'), col2X + 150, yPos);
  
  yPos += 25;
  doc.font('Helvetica-Bold').text('Ocupación Promedio:', col2X, yPos);
  doc.font('Helvetica').text(`${(stats.averageOccupancy || 0).toFixed(1)}%`, col2X + 150, yPos);

  yPos += 50;

  // ===== DETALLE POR EVENTO =====
  doc.fontSize(16)
     .fillColor(textColor)
     .font('Helvetica-Bold')
     .text('DETALLE POR EVENTO', 50, yPos);

  yPos += 25;

  // Verificar si hay eventos
  if (!stats.events || stats.events.length === 0) {
    doc.fontSize(12)
       .fillColor('#6c757d')
       .font('Helvetica-Oblique')
       .text('No hay eventos registrados', 50, yPos);
  } else {
    // Tabla de eventos
    stats.events.forEach((event, index) => {
      // Verificar espacio en la página
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      // Fondo alternado para filas
      const rowHeight = 80;
      if (index % 2 === 0) {
        doc.rect(50, yPos, boxWidth, rowHeight).fill(lightGray);
      }

      yPos += 10;

      // Nombre del evento
      doc.fontSize(14)
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text(event.name || 'Sin nombre', 60, yPos, { width: boxWidth - 20 });

      yPos += 20;

      // Detalles del evento
      doc.fontSize(10).fillColor(textColor).font('Helvetica');
      
      const detailsY = yPos;
      // Columna 1
      doc.text(`Fecha: ${event.date || 'Sin fecha'}`, 60, detailsY);
      doc.text(`Lugar: ${event.venue || 'Sin ubicacion'}`, 60, detailsY + 12);
      
      // Columna 2
      doc.text(`Tipos: ${event.ticketTypes || 0}`, 240, detailsY);
      doc.text(`Aforo: ${(event.capacity || 0).toLocaleString('es-CL')}`, 240, detailsY + 12);
      
      // Columna 3
      doc.text(`Ingresos: $${(event.revenue || 0).toLocaleString('es-CL')}`, 380, detailsY);
      doc.text(`Ocupacion: ${event.occupancy || 0}%`, 380, detailsY + 12);

      yPos += 50;
      
      // Línea separadora
      doc.strokeColor(borderColor)
         .lineWidth(0.5)
         .moveTo(50, yPos)
         .lineTo(doc.page.width - 50, yPos)
         .stroke();

      yPos += 10;
    });
  }

  // ===== PIE DE PÁGINA =====
  const footerY = doc.page.height - 50;
  doc.fontSize(8)
     .fillColor('#6c757d')
     .font('Helvetica')
     .text(
       'Este reporte fue generado automáticamente por el Sistema de Boletería TicketVue',
       50,
       footerY,
       { align: 'center', width: doc.page.width - 100 }
     );

  doc.fontSize(8)
     .text(
       `Página 1 de 1 | ${new Date().toLocaleDateString('es-CL')}`,
       50,
       footerY + 15,
       { align: 'center', width: doc.page.width - 100 }
     );

  return doc;
};
