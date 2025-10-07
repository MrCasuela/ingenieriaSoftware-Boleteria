# 🚀 INICIO RÁPIDO

## ✅ El sistema está listo para usar

### 📋 Comandos Rápidos

#### 1. Iniciar Backend (Terminal 1)
```bash
cd backend
node server.js
```

#### 2. Iniciar Frontend (Terminal 2)
```bash
npm run dev
```

#### 3. Abrir Aplicación
```
http://localhost:5173
```

---

## 🎯 Estado Actual

- ✅ Backend: FUNCIONANDO
- ✅ Frontend: LISTO
- ✅ Integración: COMPLETA
- ⚠️ Email: Necesita configuración (opcional)

---

## 📧 Configurar Email (Opcional)

### Opción Rápida: Ethereal (Desarrollo)

1. Ve a: https://ethereal.email/
2. Crea una cuenta
3. Edita `backend/.env`:
   ```env
   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_USER=tu-usuario-ethereal
   SMTP_PASSWORD=tu-password-ethereal
   ```
4. Reinicia el backend

---

## 📚 Documentación

- `FINAL_VERIFICATION.md` - Verificación completa
- `EMAIL_FEATURE_GUIDE.md` - Guía de funcionalidad de email
- `backend/EMAIL_SETUP.md` - Configuración de email
- `test-integration.bat` - Script de pruebas

---

## 🆘 Problemas Comunes

### Backend no inicia
```bash
cd backend
npm install
node server.js
```

### Frontend no inicia
```bash
npm install
npm run dev
```

### Puerto 3000 ocupado
Edita `backend/.env`:
```env
PORT=3001
```

Y `.env` (raíz):
```env
VITE_API_URL=http://localhost:3001
```

---

## ✨ Funcionalidades Disponibles

1. **Descargar Entrada (PDF)** - ✅ FUNCIONA
   - Genera PDF con QR
   - Descarga automática

2. **Enviar por Email** - ⚠️ Requiere configuración
   - Envía PDF por email
   - Fallback a mailto si falla

---

¡Todo listo para empezar! 🎉
