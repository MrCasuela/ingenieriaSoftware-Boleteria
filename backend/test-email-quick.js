/**
 * 🧪 Script de Prueba Simple - Envío de Email (Versión Simplificada)
 */

import { createTestAccount, createTransport, getTestMessageUrl } from 'nodemailer';

async function testEmailSimple() {
  console.log('🧪 Creando cuenta de prueba en Ethereal...\n');

  try {
    // Crear cuenta de prueba
    const testAccount = await createTestAccount();
    console.log('✅ Cuenta creada:', testAccount.user);

    // Crear transporter
    const transporter = createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    // Enviar email de prueba
    console.log('\n📧 Enviando email de prueba...');
    
    const info = await transporter.sendMail({
      from: '"Sistema de Boletería" <noreply@ticketvue.com>',
      to: 'test@ejemplo.com',
      subject: 'Prueba - Tu Entrada está Lista 🎫',
      html: `
        <h1>¡Prueba de Email!</h1>
        <p>Este es un email de prueba del sistema de boletería.</p>
        <p><strong>Si ves este mensaje, el sistema de email funciona correctamente.</strong></p>
      `,
      text: 'Prueba de email - Sistema funcionando correctamente'
    });

    console.log('✅ Email enviado exitosamente!\n');
    console.log('📬 Message ID:', info.messageId);
    console.log('\n🌐 Preview URL:');
    console.log('   👉', getTestMessageUrl(info));
    console.log('\n   Abre esta URL en tu navegador para ver el email\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

console.log('╔══════════════════════════════════════════╗');
console.log('║  🎫 PRUEBA SIMPLE DE EMAIL              ║');
console.log('╚══════════════════════════════════════════╝\n');

testEmailSimple();
