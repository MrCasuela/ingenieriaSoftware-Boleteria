# 🧪 Guía de Prueba - Envío de Email (HU2)

## 📋 Objetivo
Probar que el sistema puede enviar emails con el ticket en PDF cuando el usuario presiona el botón "Enviar por Email" en la página de confirmación.

---

## ⚙️ OPCIÓN 1: Prueba con Ethereal Email (RECOMENDADO - SIN CONFIGURACIÓN)

Ethereal es un servicio de testing de emails que NO requiere configuración previa.

### Paso 1: Configurar Backend

Edita `backend/.env` y cambia la sección de email a:

```env
# Email Configuration - Ethereal (Testing)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM="Sistema de Boletería <noreply@ticketvue.com>"
```

**Nota:** Deja `SMTP_USER` y `SMTP_PASSWORD` vacíos. El sistema generará credenciales automáticamente.

### Paso 2: Reiniciar Backend

```powershell
cd backend
npm start
```

### Paso 3: Realizar una Compra

1. Ve a `http://localhost:5173`
2. Selecciona un evento
3. Elige un tipo de ticket
4. Completa tus datos personales (usa tu email real o uno de prueba)
5. Presiona "Procesar Pago"

### Paso 4: Enviar Email desde Confirmación

En la página de confirmación:
1. Presiona el botón **"Enviar por Email"** ✉️
2. Revisa la consola del **backend**
3. Busca un mensaje como:
   ```
   Preview URL: https://ethereal.email/message/xxxxx
   ```
4. Copia y abre esa URL en tu navegador
5. ✅ **Verás el email con el PDF adjunto**

---

## ⚙️ OPCIÓN 2: Prueba con Gmail (REQUIERE CONFIGURACIÓN)

Si quieres recibir el email en tu bandeja de Gmail real.

### Paso 1: Configurar Gmail App Password

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Seguridad > Verificación en 2 pasos (actívala si no está activa)
3. Busca "Contraseñas de aplicaciones"
4. Genera una nueva contraseña para "Correo"
5. **Copia la contraseña de 16 caracteres**

### Paso 2: Configurar Backend

Edita `backend/.env`:

```env
# Email Configuration - Gmail
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Tu contraseña de aplicación
EMAIL_FROM="Sistema de Boletería <tu-email@gmail.com>"
```

### Paso 3: Reiniciar Backend

```powershell
cd backend
npm start
```

### Paso 4: Realizar una Compra

1. Ve a `http://localhost:5173`
2. Selecciona un evento
3. Elige un tipo de ticket
4. Completa tus datos personales (**USA TU EMAIL REAL**)
5. Presiona "Procesar Pago"

### Paso 5: Enviar Email desde Confirmación

En la página de confirmación:
1. Presiona el botón **"Enviar por Email"** ✉️
2. Espera unos segundos
3. ✅ **Revisa tu bandeja de entrada**
4. Deberías recibir un email con:
   - Asunto: "Tu Entrada - [Nombre del Evento]"
   - Contenido HTML profesional
   - **PDF adjunto** con tu ticket

---

## ⚙️ OPCIÓN 3: Prueba con SMTP Genérico

Si tienes un servidor SMTP propio o de tu empresa.

### Configurar Backend

Edita `backend/.env`:

```env
# Email Configuration - SMTP Genérico
SMTP_HOST=smtp.tu-servidor.com
SMTP_PORT=587
SMTP_USER=tu-usuario@dominio.com
SMTP_PASSWORD=tu-password
EMAIL_FROM="Sistema de Boletería <noreply@tudominio.com>"
```

Luego sigue los pasos de la Opción 2.

---

## 🐛 Solución de Problemas

### ❌ Error: "Error al enviar email"

**Posibles causas:**

1. **Gmail - Contraseña incorrecta:**
   - Asegúrate de usar la "Contraseña de aplicación", NO tu contraseña de Gmail
   - Verifica que la verificación en 2 pasos esté activa

2. **Gmail - "Acceso bloqueado":**
   - Ve a https://myaccount.google.com/lesssecureapps
   - Activa "Acceso de aplicaciones menos seguras" (si está disponible)
   - O usa "Contraseña de aplicación" (recomendado)

3. **SMTP - Puerto bloqueado:**
   - Verifica tu firewall
   - Intenta con puerto 465 (SSL) o 587 (TLS)

4. **Variables de entorno mal cargadas:**
   - Reinicia el backend después de editar `.env`
   - Verifica que no haya espacios extra en las variables

### ❌ No veo la "Preview URL" con Ethereal

Si usas Ethereal y no ves la URL en consola:

```powershell
# En el backend, busca en la consola:
Email enviado: <mensaje-id>
Preview URL: https://ethereal.email/message/xxxxx
```

Si no aparece, revisa que `SMTP_HOST=smtp.ethereal.email` esté configurado.

### ❌ El PDF no se adjunta

Verifica en consola del backend que no haya errores como:
```
Error al generar PDF: ...
```

Si aparece, puede ser problema con la librería `pdfkit`. Reinstala dependencias:

```powershell
cd backend
npm install pdfkit qrcode
```

---

## 📊 Verificación de Éxito

### ✅ El email debería contener:

**Asunto:**
```
Tu Entrada - [Nombre del Evento]
```

**Contenido HTML:**
- 🎉 Encabezado: "¡Tu Entrada está Lista!"
- Nombre del cliente
- Nombre del evento
- Código de entrada (texto)
- Instrucciones de uso
- Diseño profesional con colores azules

**Archivo Adjunto:**
- `Entrada-[CODIGO].pdf`
- Tamaño: ~100-200 KB
- Contenido:
  - Código QR escaneable
  - Detalles del evento
  - Datos del comprador
  - Instrucciones

---

## 🎯 Script de Prueba Rápida

Si quieres probar SOLO el envío de email sin hacer una compra completa, ejecuta:

```powershell
cd backend
node test-email-simple.js
```

Este script (que crearemos a continuación) enviará un email de prueba.

---

## 📝 Logs a Revisar

### Backend (Terminal)

**Éxito:**
```
📧 Generando y enviando email automáticamente...
Email enviado: <mensaje-id>
✅ Email enviado exitosamente a: usuario@ejemplo.com
```

**Error:**
```
⚠️ Error al enviar email (el ticket se creó correctamente): [Mensaje de error]
```

### Frontend (Consola del navegador F12)

Después de presionar "Enviar por Email":

**Éxito:**
```
✅ Entrada enviada exitosamente a usuario@ejemplo.com
```

**Con Preview (Ethereal):**
```
Preview del email: https://ethereal.email/message/xxxxx
```

---

## 🚀 Comandos Rápidos

### Iniciar sistema completo:

```powershell
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm run dev
```

### Ver logs del backend en tiempo real:

```powershell
cd backend
Get-Content -Path "logs/app.log" -Wait
```

---

## ✨ Resultado Esperado

Al completar la prueba exitosamente:

1. ✅ Usuario completa compra
2. ✅ Ve página de confirmación con QR
3. ✅ Presiona "Enviar por Email"
4. ✅ Mensaje de éxito aparece
5. ✅ Email llega a bandeja (Gmail) o se visualiza en Ethereal
6. ✅ PDF adjunto se puede descargar y abrir
7. ✅ QR del PDF es escaneable

---

## 📞 Próximos Pasos

Una vez confirmado que funciona el botón manual, si quieres envío AUTOMÁTICO (sin presionar botón), avísame y activamos el código que ya preparé en `ticketController.js`.

**Diferencia:**
- **Manual:** Usuario presiona "Enviar por Email" → Llega email
- **Automático:** Usuario presiona "Procesar Pago" → Llega email (sin botón adicional)
