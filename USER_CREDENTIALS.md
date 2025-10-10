# 🔐 Credenciales de Usuarios de Prueba - TicketVue

## ✅ Usuarios Disponibles en el Sistema

### 👨‍💼 Administradores

#### Admin 1 (Super Administrador)
- **Email:** `admin1@ticketvue.com`
- **Contraseña:** `admin123`
- **Nivel:** Super
- **ID de Empleado:** ADM001
- **Permisos:** Full Access

#### Admin 2 (Moderador)
- **Email:** `admin2@ticketvue.com`
- **Contraseña:** `admin456`
- **Nivel:** Moderador
- **ID de Empleado:** ADM002
- **Permisos:** Manage Events, Manage Tickets

---

### 👷 Operadores

#### Operador 1 (Turno Mañana)
- **Email:** `operador1@ticketvue.com`
- **Contraseña:** `oper123`
- **ID de Empleado:** OP001
- **Turno:** Mañana

#### Operador 2 (Turno Tarde)
- **Email:** `operador2@ticketvue.com`
- **Contraseña:** `oper456`
- **ID de Empleado:** OP002
- **Turno:** Tarde

---

## 📝 Notas Importantes

1. **Todas las contraseñas están hasheadas** con bcrypt en la base de datos
2. **Las contraseñas aquí mostradas** son las contraseñas en texto plano para usar en el login
3. **Todos los usuarios están activos** (is_active = 1)
4. Los usuarios se crearon con el script: `backend/insert-test-users.sql`

---

## 🔄 Cómo Recrear los Usuarios

Si necesitas recrear los usuarios, ejecuta:

```powershell
# Desde la raíz del proyecto
docker cp backend/insert-test-users.sql ticketvue-mysql:/tmp/insert-test-users.sql
docker exec ticketvue-mysql bash -c "mysql -uroot -pTest1234! ticketvue < /tmp/insert-test-users.sql"
```

O ejecuta el script directamente:
```powershell
docker exec -e DB_HOST=mysql -e DB_PORT=3306 -e DB_ROOT_PASSWORD=Test1234! -e DB_NAME=ticketvue ticketvue-backend node create-users.js
```

---

## 🧪 Prueba de Login

Para probar que funciona el login, abre:
- **URL:** http://localhost
- **Email:** admin1@ticketvue.com  
- **Contraseña:** admin123

---

## 📊 Verificar Usuarios en la Base de Datos

```bash
docker exec ticketvue-mysql mysql -uticketuser -pCasuela1234! ticketvue -e "SELECT id, email, user_type, employee_id, is_active FROM users;"
```

---

**Fecha de Actualización:** Octubre 10, 2025  
**Estado:** ✅ 4 Usuarios Activos
