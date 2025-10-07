# Configuración de Email para Envío de Entradas

## Descripción
El sistema permite enviar las entradas digitales por email a los clientes después de completar su compra.

## Configuración

### Opción 1: Gmail (Recomendado para producción)

1. **Habilitar la autenticación de dos factores en tu cuenta de Gmail**

2. **Generar una contraseña de aplicación:**
   - Ve a https://myaccount.google.com/security
   - En "Acceder a Google", selecciona "Contraseñas de aplicaciones"
   - Genera una nueva contraseña para "Correo"
   - Copia la contraseña generada

3. **Configurar en el archivo `.env`:**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASSWORD=tu-contraseña-de-aplicacion
   EMAIL_FROM="Sistema de Boletería <tu-email@gmail.com>"
   ```

### Opción 2: Ethereal (Para desarrollo y testing)

1. **Crear una cuenta de prueba en Ethereal:**
   - Ve a https://ethereal.email/
   - Crea una cuenta gratuita
   - Copia las credenciales SMTP

2. **Configurar en el archivo `.env`:**
   ```env
   # Comenta o elimina EMAIL_SERVICE
   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_USER=tu-usuario-ethereal
   SMTP_PASSWORD=tu-contraseña-ethereal
   EMAIL_FROM="Sistema de Boletería <noreply@ticketvue.com>"
   ```

### Opción 3: Otro proveedor SMTP

Puedes usar cualquier servicio SMTP como SendGrid, Mailgun, etc.

```env
SMTP_HOST=smtp.tu-proveedor.com
SMTP_PORT=587
SMTP_USER=tu-usuario
SMTP_PASSWORD=tu-contraseña
EMAIL_FROM="Sistema de Boletería <noreply@ticketvue.com>"
```

## Uso

Una vez configurado el backend, el botón "Enviar por Email" en la página de confirmación:

1. Genera el PDF de la entrada
2. Envía una petición POST a `/api/send-ticket-email` con:
   - El PDF como archivo adjunto
   - Los datos del cliente y del evento
3. El backend envía un email con:
   - Un mensaje personalizado de bienvenida
   - El PDF adjunto con la entrada
   - Instrucciones para el evento

## Testeo

Si usas Ethereal para desarrollo, puedes ver los emails enviados en:
- La consola del servidor mostrará una URL de preview
- También puedes acceder a https://ethereal.email/messages para ver todos los emails

## Troubleshooting

### Error: "Invalid login"
- Verifica que las credenciales en `.env` sean correctas
- Si usas Gmail, asegúrate de usar una contraseña de aplicación, no tu contraseña normal

### Error: "Connection timeout"
- Verifica que el puerto SMTP sea correcto (587 o 465)
- Verifica tu firewall o antivirus

### El email no llega
- Revisa la carpeta de spam
- Verifica que el email destino sea correcto
- Si usas Gmail, verifica que no hayas excedido el límite de envíos

## Límites de envío

### Gmail
- Aproximadamente 500 emails por día
- Para más volumen, considera usar un servicio profesional

### Ethereal
- Solo para desarrollo/testing
- Los emails no se entregan realmente

### Servicios profesionales recomendados
- **SendGrid**: 100 emails/día gratis
- **Mailgun**: 5,000 emails/mes gratis
- **Amazon SES**: Muy económico para alto volumen
