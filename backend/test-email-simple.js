/**
 * 🧪 Script de Prueba Simple - Envío de Email
 * 
 * Este script prueba SOLO el servicio de email sin necesidad de 
 * hacer una compra completa en el sistema.
 */

import { sendTicketEmail } from './src/services/emailService.js';
import { generateTicketPDF } from './src/services/pdfService.js';

async function testEmail() {
  console.log('🧪 Iniciando prueba de envío de email...\n');

  // Datos de prueba
  const testData = {
    ticketCode: 'TEST-' + Date.now(),
    eventName: 'Evento de Prueba - Concierto Rock',
    eventDate: new Date('2025-12-31T20:00:00'),
    eventLocation: 'Estadio Nacional, Santiago',
    ticketTypeName: 'Entrada General',
    quantity: 2,
    price: 25000,
    totalAmount: 50000,
    buyerName: 'Juan Pérez González',
    buyerEmail: 'tu-email@ejemplo.com', // ⚠️ CAMBIA ESTO POR TU EMAIL REAL
    buyerPhone: '+56912345678',
    buyerDocument: '12.345.678-9'
  };

  try {
    console.log('📄 Generando PDF del ticket de prueba...');
    const pdfBuffer = await generateTicketPDF(testData);
    console.log('✅ PDF generado correctamente\n');

    console.log('📧 Enviando email a:', testData.buyerEmail);
    const result = await sendTicketEmail({
      email: testData.buyerEmail,
      firstName: 'Juan',
      lastName: 'Pérez',
      eventName: testData.eventName,
      ticketCode: testData.ticketCode
    }, pdfBuffer);

    console.log('\n✅ ¡Email enviado exitosamente!');
    console.log('📬 Message ID:', result.messageId);
    
    if (result.previewUrl) {
      console.log('\n🌐 Preview URL (Ethereal):');
      console.log('   👉', result.previewUrl);
      console.log('\n   Abre esta URL en tu navegador para ver el email');
    } else {
      console.log('\n📧 Revisa tu bandeja de entrada en:', testData.buyerEmail);
    }

    console.log('\n✨ Prueba completada con éxito');
  } catch (error) {
    console.error('\n❌ Error durante la prueba:');
    console.error('   Mensaje:', error.message);
    console.error('\n💡 Soluciones posibles:');
    console.error('   1. Verifica la configuración en backend/.env');
    console.error('   2. Asegúrate de tener EMAIL_SERVICE o SMTP_HOST configurado');
    console.error('   3. Si usas Gmail, verifica tu contraseña de aplicación');
    console.error('   4. Reinicia el servidor después de cambiar .env');
    console.error('\n📖 Lee PRUEBA_EMAIL_HU2.md para más detalles');
    process.exit(1);
  }
}

// Ejecutar prueba
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║  🎫 PRUEBA DE ENVÍO DE EMAIL - Sistema de Boletería ║');
console.log('╚══════════════════════════════════════════════════════╝\n');

testEmail();
