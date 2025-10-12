# 👥 Usuarios Predeterminados

Este proyecto viene con usuarios predeterminados para facilitar el desarrollo y las pruebas.

## 🔐 Credenciales de Acceso

### 👨‍💼 Administradores:
- **Email:** `admin1@ticketvue.com` | **Contraseña:** `admin123`
- **Email:** `admin2@ticketvue.com` | **Contraseña:** `admin456`

### 👤 Operadores:
- **Email:** `operador1@ticketvue.com` | **Contraseña:** `oper123`
- **Email:** `operador2@ticketvue.com` | **Contraseña:** `oper456`

### 🧑 Clientes (opcional):
- **Email:** `cliente1@email.com` | **Contraseña:** `cliente123`
- **Email:** `cliente2@email.com` | **Contraseña:** `cliente456`

## 📝 Nota Importante

Estos usuarios se crean automáticamente cuando se ejecuta el proyecto por primera vez con Docker Compose.

### ¿Cómo se crean?

Los usuarios se crean automáticamente cuando:
1. Ejecutas `docker-compose up` por primera vez
2. El backend detecta que la base de datos está vacía
3. Ejecuta el script de seed (`backend/src/config/seed.js`)

### ¿Cómo recrear los usuarios?

Si necesitas recrear los usuarios desde cero:

```bash
# Detener los contenedores
docker-compose down

# Eliminar el volumen de la base de datos (ESTO BORRARÁ TODOS LOS DATOS)
docker volume rm ingenieriasoftware-boleteria_mysql-data

# Volver a iniciar (creará usuarios nuevamente)
docker-compose up
```

### Ejecutar el seed manualmente

Si solo quieres crear los usuarios sin eliminar la base de datos:

```bash
# Entrar al contenedor del backend
docker exec -it ticketvue-backend sh

# Ejecutar el script de seed
node -e "import('./src/config/seed.js').then(m => m.default())"
```

## ⚠️ Seguridad en Producción

**IMPORTANTE:** Estos usuarios con contraseñas simples son solo para desarrollo. 
En un entorno de producción:
1. Elimina estos usuarios
2. Crea usuarios con contraseñas seguras
3. Usa variables de entorno para las credenciales
