# 🚀 Prueba Rápida de Email - 3 Pasos

## Opción más rápida (Sin configuración)

### Paso 1: Ir a la carpeta backend
```powershell
cd backend
```

### Paso 2: Ejecutar el script de prueba
```powershell
node test-email-simple.js
```

### Paso 3: Ver el resultado
Busca en la consola una línea como:
```
🌐 Preview URL (Ethereal):
   👉 https://ethereal.email/message/xxxxx
```

Abre esa URL en tu navegador para ver el email.

---

## Alternativa: Probar desde la aplicación web

### Paso 1: Iniciar el sistema
```powershell
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
npm run dev
```

### Paso 2: Hacer una compra
1. Abre `http://localhost:5173`
2. Selecciona cualquier evento
3. Elige un tipo de ticket
4. Completa tus datos (puedes usar datos de prueba)
5. Presiona "Procesar Pago"

### Paso 3: Enviar el email
En la página de confirmación:
1. Presiona el botón **"Enviar por Email"** ✉️
2. Revisa la consola del backend
3. Copia la URL de preview que aparece
4. Ábrela en tu navegador

---

## ✅ Resultado Esperado

Deberías ver un email con:
- 📧 Asunto: "Tu Entrada - [Nombre del Evento]"
- 🎨 Diseño HTML profesional
- 📎 PDF adjunto con el ticket y código QR

---

## 🐛 Si no funciona

1. Verifica que el backend esté corriendo sin errores
2. Busca mensajes de error en la consola del backend
3. Lee el archivo `PRUEBA_EMAIL_HU2.md` para soluciones detalladas
