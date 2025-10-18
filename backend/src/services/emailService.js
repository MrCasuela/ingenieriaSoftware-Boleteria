import nodemailer from 'nodemailer';

// Configurar el transportador de email
const createTransporter = () => {
  // Para desarrollo, usar un servicio de prueba como Ethereal
  // Para producción, configura con tu servicio real (Gmail, SendGrid, etc.)
  
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  
  // Configuración genérica SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

export const sendTicketEmail = async (emailData, pdfBuffer) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Sistema de Boletería" <noreply@ticketvue.com>',
      to: emailData.email,
      subject: `Tu Entrada - ${emailData.eventName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0d6efd; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f8f9fa; padding: 20px; margin-top: 20px; }
            .ticket-code { background-color: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #0d6efd; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #0d6efd; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Tu Entrada está Lista! 🎉</h1>
            </div>
            
            <div class="content">
              <h2>Hola ${emailData.firstName} ${emailData.lastName},</h2>
              
              <p>Gracias por tu compra. Tu entrada para <strong>${emailData.eventName}</strong> está confirmada.</p>
              
              <div class="ticket-code">
                <h3>Código de Entrada:</h3>
                <p style="font-size: 18px; font-weight: bold; color: #0d6efd;">${emailData.ticketCode}</p>
              </div>
              
              <p><strong>Instrucciones importantes:</strong></p>
              <ul>
                <li>Descarga el archivo PDF adjunto con tu entrada digital</li>
                <li>Presenta el código QR en la entrada del evento</li>
                <li>También puedes usar tu código de entrada o documento para validar tu acceso</li>
                <li>Llega con tiempo suficiente antes del evento</li>
              </ul>
              
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            </div>
            
            <div class="footer">
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
              <p>&copy; 2025 Sistema de Boletería TicketVue</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `Entrada-${emailData.ticketCode}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email enviado:', info.messageId);
    
    // Si usas Ethereal para testing, muestra la URL de preview
    if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw new Error('Error al enviar el email: ' + error.message);
  }
};
