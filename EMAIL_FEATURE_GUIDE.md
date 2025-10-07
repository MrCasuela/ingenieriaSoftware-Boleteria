# Funcionalidad de Envío de Entradas por Email

## Descripción General

La aplicación ahora incluye un botón **"Enviar por Email"** en la página de confirmación que permite enviar la entrada digital en formato PDF directamente al correo electrónico del cliente.

## Características

### Botón de Descarga
- **Ubicación:** Página de confirmación
- **Función:** Descarga el PDF de la entrada directamente al dispositivo del usuario
- **Formato:** PDF con código QR, detalles del evento y datos del comprador
- **Nombre del archivo:** `Entrada-[CÓDIGO].pdf`

### Botón de Envío por Email
- **Ubicación:** Página de confirmación (al lado del botón de descarga)
- **Función:** Envía el PDF de la entrada al email registrado del cliente
- **Incluye:** 
  - Email personalizado con el nombre del cliente
  - PDF adjunto con la entrada
  - Instrucciones para el evento
  - Código de entrada destacado

## Configuración Requerida

### 1. Frontend

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000
```

### 2. Backend

#### Instalación de dependencias
Las dependencias ya están instaladas:
- `nodemailer`: Para enviar emails
- `multer`: Para manejar archivos adjuntos

#### Configuración de Email

Crear un archivo `.env` en la carpeta `backend/`:

**Para desarrollo (usando Ethereal):**
```env
PORT=3000
NODE_ENV=development

SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=tu-usuario-ethereal
SMTP_PASSWORD=tu-password-ethereal
EMAIL_FROM="Sistema de Boletería <noreply@ticketvue.com>"
```

**Para producción (usando Gmail):**
```env
PORT=3000
NODE_ENV=production

EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
EMAIL_FROM="Sistema de Boletería <tu-email@gmail.com>"
```

Ver `backend/EMAIL_SETUP.md` para instrucciones detalladas.

## Uso

### Para el Usuario Final

1. **Completar la compra** de una entrada
2. En la página de confirmación:
   - **Descargar Entrada:** Descarga el PDF inmediatamente
   - **Enviar por Email:** Envía el PDF al email registrado
   - **Volver al Inicio:** Regresa a la página principal

### Flujo del Envío de Email

1. Usuario hace clic en **"Enviar por Email"**
2. El sistema genera el PDF con:
   - Código QR de la entrada
   - Código de entrada
   - Detalles del evento
   - Datos del comprador
3. Se envía una petición al backend con el PDF
4. El backend envía un email que incluye:
   - Saludo personalizado
   - Código de entrada destacado
   - PDF adjunto
   - Instrucciones para el evento
5. Usuario recibe confirmación de envío

## Manejo de Errores

### Si el backend no está disponible:
- Se muestra un mensaje de error
- Se ofrece abrir el cliente de email del usuario
- El usuario puede copiar manualmente la información

### Fallback con `mailto:`
Si falla el envío automático, el sistema:
1. Pregunta al usuario si desea abrir su cliente de email
2. Pre-rellena el asunto y cuerpo del mensaje
3. El usuario puede enviar el email manualmente

## Iniciar el Sistema Completo

### 1. Iniciar el Backend

```bash
cd backend
npm install
# Configurar el archivo .env con las credenciales de email
npm start
```

El backend estará corriendo en `http://localhost:3000`

### 2. Iniciar el Frontend

```bash
# En la raíz del proyecto
npm install
# Crear archivo .env con VITE_API_URL=http://localhost:3000
npm run dev
```

El frontend estará corriendo en `http://localhost:5173` (o el puerto que Vite asigne)

## Testing

### Probar con Ethereal (Desarrollo)

1. Crear cuenta en https://ethereal.email/
2. Configurar las credenciales en `backend/.env`
3. Iniciar el backend
4. Completar una compra en el frontend
5. Hacer clic en "Enviar por Email"
6. Revisar la consola del backend para la URL de preview
7. Abrir la URL en el navegador para ver el email

### Probar con Gmail (Producción)

1. Configurar una contraseña de aplicación en Gmail
2. Actualizar `backend/.env` con las credenciales
3. Iniciar el backend
4. Completar una compra
5. Hacer clic en "Enviar por Email"
6. Revisar la bandeja de entrada del email registrado

## Estructura del Email Enviado

```
Asunto: Tu Entrada - [Nombre del Evento]

Contenido:
- Encabezado con título "¡Tu Entrada está Lista! 🎉"
- Saludo personalizado
- Código de entrada destacado
- Instrucciones importantes
- PDF adjunto: Entrada-[CÓDIGO].pdf
- Footer con información del sistema
```

## Seguridad

- El PDF solo se genera en el momento del envío
- Los datos personales solo se envían al email registrado
- El backend valida todos los datos antes de enviar
- Las credenciales de email están protegidas en variables de entorno

## Limitaciones

### Gmail
- Límite de ~500 emails por día
- Requiere contraseña de aplicación (no la contraseña normal)

### Ethereal
- Solo para desarrollo/testing
- Los emails no se entregan realmente
- Útil para ver la visualización del email

## Solución de Problemas

### "Error al enviar el email"
- Verificar que el backend esté corriendo
- Revisar las credenciales en `backend/.env`
- Comprobar la conexión a internet

### "Invalid login"
- Verificar usuario y contraseña en `.env`
- Si usas Gmail, usar contraseña de aplicación

### El PDF no se adjunta
- Verificar que `multer` esté instalado
- Revisar los logs del servidor

## Mejoras Futuras

- [ ] Cola de emails con sistema de reintentos
- [ ] Plantillas de email más personalizables
- [ ] Soporte para múltiples idiomas
- [ ] Estadísticas de emails enviados/abiertos
- [ ] Integración con servicios profesionales (SendGrid, Mailgun)
