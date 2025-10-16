# 🚀 Guía de Prueba Rápida del Sistema

## 📋 Prerequisitos

1. ✅ Node.js instalado (v14 o superior)
2. ✅ Backend corriendo (`cd backend && npm run dev`)
3. ✅ Frontend corriendo (`npm run dev`)

---

## 🧪 Pruebas Paso a Paso

### 1️⃣ Probar el Control de Acceso de Roles

#### A) Acceso de Operador (NO debe poder ver reportes)

1. **Navegar a**: `http://localhost:5173/operator/login`

2. **Credenciales de Operador**:
   ```
   Email: operador@ticketvue.com
   Password: operador123
   ```

3. **Verificar**:
   - ✅ Deberías ser redirigido a `/operator/panel`
   - ✅ Puedes ver la funcionalidad de validar tickets
   
4. **Intentar acceder a admin**:
   - Navega manualmente a: `http://localhost:5173/admin/panel`
   - ⚠️ Deberías ver un alert: "No tienes permisos para acceder al panel de administrador"
   - ✅ Deberías ser redirigido de vuelta a `/operator/panel`

#### B) Acceso de Administrador (Acceso completo)

1. **Logout** del operador (si estás logueado)

2. **Navegar a**: `http://localhost:5173/operator/login`

3. **Credenciales de Administrador**:
   ```
   Email: admin@ticketvue.com
   Password: admin123
   ```

4. **Verificar**:
   - ✅ Deberías ser redirigido a `/admin/panel`
   - ✅ Puedes ver reportes
   - ✅ Puedes gestionar eventos
   - ✅ Puedes ver estadísticas

5. **Intentar acceder a operador**:
   - Navega manualmente a: `http://localhost:5173/operator/panel`
   - ✅ Deberías ser redirigido a `/admin/panel`
   - ℹ️ Los admins tienen su propio panel

---

### 2️⃣ Probar el Envío Automático de PDF por Email

#### Opción A: Con Email Real Configurado

1. **Asegúrate de tener configurado el `.env`** en `backend/`:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASSWORD=tu-contraseña-de-aplicacion
   ```

2. **Comprar un ticket**:
   - Navega a `http://localhost:5173/`
   - Selecciona un evento
   - Elige tipo de ticket
   - Completa datos personales (usa tu email real)
   - Finaliza la compra

3. **Verificar**:
   - ✅ Deberías ver la página de confirmación
   - ✅ Revisa tu bandeja de entrada
   - ✅ Deberías recibir un email con el PDF adjunto
   - ✅ El PDF contiene código QR y todos los detalles

#### Opción B: Sin Email (Modo Desarrollo)

1. **NO configures email en `.env`** (déjalo comentado)

2. **Comprar un ticket** (mismo proceso anterior)

3. **Verificar en la consola del backend**:
   ```
   ✅ Email enviado: <message-id>
   📧 Preview URL: https://ethereal.email/message/xxxxx
   ```

4. **Abrir la URL de preview** para ver el email de prueba

---

### 3️⃣ Probar la API con Postman/Thunder Client

#### A) Login y Obtener Token

```http
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "admin@ticketvue.com",
  "password": "admin123",
  "user_type": "Administrador"
}
```

**Respuesta Esperada**:
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### B) Probar Endpoint Protegido (Admin)

```http
GET http://localhost:3000/api/admin/stats
Authorization: Bearer <TU_TOKEN_AQUI>
```

**Respuesta Esperada**:
```json
{
  "success": true,
  "data": {
    "clientes": 5,
    "operadores": 2,
    "administradores": 1,
    "total": 8,
    "activos": 7,
    "inactivos": 1
  }
}
```

#### C) Crear un Operador (como Admin)

```http
POST http://localhost:3000/api/admin/operators
Authorization: Bearer <TOKEN_DE_ADMIN>
Content-Type: application/json

{
  "email": "nuevo.operador@test.com",
  "password": "password123",
  "firstName": "Nuevo",
  "lastName": "Operador",
  "phone": "+56912345678",
  "employeeId": "OP-999",
  "shift": "tarde"
}
```

#### D) Intentar Acceso No Autorizado (debe fallar)

```http
GET http://localhost:3000/api/admin/users
Authorization: Bearer <TOKEN_DE_OPERADOR>
```

**Respuesta Esperada**:
```json
{
  "success": false,
  "message": "No tienes permisos para acceder a este recurso..."
}
```

---

### 4️⃣ Verificar el PDF Generado

1. **Comprar un ticket** (como cliente)

2. **En la página de confirmación**:
   - Click en "Descargar Entrada"
   - Abrir el PDF descargado

3. **Verificar que el PDF contiene**:
   - ✅ Código QR visible
   - ✅ Código de entrada (texto)
   - ✅ Detalles del evento (nombre, fecha, ubicación)
   - ✅ Tipo de ticket y cantidad
   - ✅ Datos del comprador (nombre, email, teléfono, documento)
   - ✅ Instrucciones de uso
   - ✅ Diseño profesional con colores

---

## 🔍 Checklist de Funcionalidades

### Control de Acceso
- [ ] Operador puede validar tickets
- [ ] Operador NO puede acceder a `/admin/panel`
- [ ] Admin puede acceder a `/admin/panel`
- [ ] Admin puede ver reportes
- [ ] Admin puede crear operadores
- [ ] Cliente solo puede comprar tickets
- [ ] Rutas protegidas bloquean acceso sin token

### Email con PDF
- [ ] Email se envía automáticamente al comprar ticket
- [ ] PDF se adjunta al email
- [ ] PDF contiene código QR legible
- [ ] Email tiene HTML bien formateado
- [ ] Si falla el email, la compra no se bloquea

### Gestión de Usuarios
- [ ] Admin puede ver lista de usuarios
- [ ] Admin puede crear operadores
- [ ] Admin puede cambiar roles
- [ ] Admin puede activar/desactivar usuarios
- [ ] Super admin puede crear otros admins

---

## 🐛 Solución de Problemas Comunes

### Email no se envía

**Síntoma**: No llega email después de comprar ticket

**Solución**:
1. Revisa la consola del backend para errores
2. Verifica configuración en `.env`
3. Para Gmail:
   - Activa verificación en 2 pasos
   - Genera "Contraseña de aplicación"
   - Usa esa contraseña en `EMAIL_PASSWORD`
4. Si no quieres configurar email, usa modo desarrollo (sin configuración)

### Token Inválido

**Síntoma**: "No autorizado - Token inválido"

**Solución**:
1. Verifica que `JWT_SECRET` esté configurado en `.env`
2. Haz logout y login nuevamente
3. Limpia localStorage del navegador

### Operador puede acceder a admin

**Síntoma**: El operador ve el panel de admin

**Solución**:
1. Verifica que el router esté actualizado (`src/router/index.js`)
2. Revisa que los guards estén funcionando
3. Limpia caché del navegador
4. Haz logout y login nuevamente

### PDF no se genera

**Síntoma**: Error al descargar o enviar PDF

**Solución**:
1. Verifica que `pdfkit` esté instalado: `cd backend && npm list pdfkit`
2. Si no está: `npm install pdfkit`
3. Reinicia el servidor backend

---

## 📊 Usuarios de Prueba (Seed)

Si ejecutaste el seed (`npm run db:seed`), tienes estos usuarios:

### Administrador
```
Email: admin@ticketvue.com
Password: admin123
Nivel: Super Admin
```

### Operador
```
Email: operador@ticketvue.com
Password: operador123
Turno: Mañana
```

### Cliente
```
Registro público en la interfaz
```

---

## 🎯 Flujo Completo de Prueba (5 minutos)

1. **Inicio**: `http://localhost:5173/`
2. **Comprar ticket**: Selecciona evento → tipo → datos → confirma
3. **Verificar email**: Revisa bandeja o consola del backend
4. **Login operador**: `/operator/login` → credenciales operador
5. **Intentar admin**: Navegar a `/admin/panel` → ver alerta
6. **Login admin**: Logout → Login con admin → ver panel completo
7. **Crear operador**: En panel admin → crear nuevo operador
8. **Validar ticket**: Login con operador → validar el ticket comprado

---

## ✅ Criterios de Aceptación

### Historia de Usuario Completada Si:

1. ✅ Operador NO puede acceder a reportes del admin
2. ✅ Admin tiene acceso completo a reportes
3. ✅ Cliente recibe email con PDF al comprar
4. ✅ PDF contiene código QR y todos los datos
5. ✅ Sistema de roles funciona en frontend y backend
6. ✅ Mensajes de error claros cuando acceso denegado

---

**¿Todo funcionando?** ✨ ¡Excelente! El sistema está listo.

**¿Algún problema?** 🐛 Revisa la sección de solución de problemas o los logs del servidor.
