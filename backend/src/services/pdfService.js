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
