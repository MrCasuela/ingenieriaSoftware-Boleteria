# 🔓 Contraseñas en Texto Plano

## ⚠️ IMPORTANTE

Este proyecto utiliza **contraseñas en texto plano** (sin hash) para simplificar el desarrollo y las pruebas en un entorno académico.

**NUNCA uses este enfoque en un proyecto real o en producción.**

## 🔐 Credenciales de Acceso

### 👨‍💼 Administradores:
- **Email:** `admin1@ticketvue.com` | **Contraseña:** `admin123`
- **Email:** `admin2@ticketvue.com` | **Contraseña:** `admin456`

### 👤 Operadores:
- **Email:** `operador1@ticketvue.com` | **Contraseña:** `oper123`
- **Email:** `operador2@ticketvue.com` | **Contraseña:** `oper456`

### 🧑 Clientes:
- **Email:** `cliente1@email.com` | **Contraseña:** `cliente123`
- **Email:** `cliente2@email.com` | **Contraseña:** `cliente456`

## 📝 ¿Por qué texto plano?

Para un proyecto académico, usar texto plano tiene varias ventajas:

1. **✅ Simplicidad**: No hay problemas con el hash de contraseñas
2. **✅ Debugging más fácil**: Puedes ver las contraseñas directamente en la base de datos
3. **✅ Sin errores de bcrypt**: No hay problemas de doble hash o incompatibilidades
4. **✅ Desarrollo rápido**: Los compañeros pueden probar fácilmente sin complicaciones

## 🚀 ¿Cómo funciona?

El modelo `User.js` ahora:
- **NO** tiene hooks `beforeCreate` o `beforeUpdate` que hasheen las contraseñas
- **NO** tiene método `comparePassword()`
- Las contraseñas se guardan y comparan directamente como texto

En `userController.js`:
```javascript
// Comparación directa (antes usaba bcrypt.compare)
const isValidPassword = password === user.password;
```

## 🔒 Para implementar seguridad real (futuro)

Si en el futuro quieres agregar hash de contraseñas:

1. Instalar bcrypt: `npm install bcryptjs`
2. Agregar hooks al modelo User.js:
```javascript
hooks: {
  beforeCreate: async (user) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }
}
```
3. Actualizar la comparación en userController.js:
```javascript
const isValidPassword = await bcrypt.compare(password, user.password);
```

## 📚 Recursos de Seguridad

Para aprender sobre seguridad de contraseñas:
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [bcrypt documentation](https://www.npmjs.com/package/bcryptjs)
- [Hashing vs Encryption](https://www.thesslstore.com/blog/difference-encryption-hashing-salting/)
