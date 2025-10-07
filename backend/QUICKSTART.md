# 🚀 Inicio Rápido - Backend

## Instalación en 5 minutos

### 1️⃣ Instalar MySQL

Si no tienes MySQL instalado:

**Windows:**
- Descargar: https://dev.mysql.com/downloads/installer/
- Instalar MySQL Server 8.0+
- Configurar password para root

**Mac (con Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

### 2️⃣ Configurar el Proyecto

```bash
# 1. Ir a la carpeta backend
cd backend

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env
cp .env.example .env
```

### 3️⃣ Editar .env

Abrir `.env` y configurar:

```env
PORT=3000
NODE_ENV=development

# Cambiar estos valores según tu instalación de MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ticketvue
DB_USER=root
DB_PASSWORD=TU_PASSWORD_MYSQL_AQUI

JWT_SECRET=mi_clave_secreta_super_segura_123
JWT_EXPIRE=7d
```

### 4️⃣ Crear Base de Datos

**Opción A: Con MySQL Workbench (GUI)**
1. Abrir MySQL Workbench
2. Conectar a localhost
3. Ejecutar:
   ```sql
   CREATE DATABASE ticketvue CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

**Opción B: Con terminal**
```bash
# Entrar a MySQL
mysql -u root -p

# Ejecutar en MySQL
CREATE DATABASE ticketvue CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

**Opción C: Con el script SQL**
```bash
mysql -u root -p < database-schema.sql
```

### 5️⃣ Iniciar el Servidor

```bash
npm run dev
```

Deberías ver:
```
✅ MySQL Conectado exitosamente
✅ Modelos sincronizados con la base de datos
🚀 Servidor corriendo en puerto 3000
📍 Modo: development
```

### 6️⃣ Probar que Funciona

Abrir navegador o usar curl:

```bash
curl http://localhost:3000
```

Deberías recibir:
```json
{
  "success": true,
  "message": "TicketVue API - Sistema de Boletería",
  "version": "1.0.0"
}
```

---

## ✅ ¡Listo!

Tu backend está corriendo en: **http://localhost:3000**

---

## 🔍 Verificar Tablas Creadas

```bash
# Entrar a MySQL
mysql -u root -p ticketvue

# Ver tablas
SHOW TABLES;
```

Deberías ver:
```
+--------------------+
| Tables_in_ticketvue|
+--------------------+
| events             |
| ticket_types       |
| tickets            |
| users              |
+--------------------+
```

---

## 🐛 Solución de Problemas

### Error: "Access denied for user 'root'@'localhost'"
- Verificar password en `.env`
- Resetear password de MySQL si es necesario

### Error: "Unknown database 'ticketvue'"
- Ejecutar: `CREATE DATABASE ticketvue;`

### Error: "Port 3000 is already in use"
- Cambiar el puerto en `.env` a 3001, 3002, etc.
- O matar el proceso:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:3000 | xargs kill
  ```

### Error: "Cannot find module"
- Ejecutar: `npm install` nuevamente
- Verificar que estás en la carpeta `backend/`

---

## 📝 Próximos Pasos

1. Crear controladores en `src/controllers/`
2. Crear rutas en `src/routes/`
3. Implementar autenticación JWT
4. Conectar con el frontend Vue.js

---

## 📚 Documentación Completa

- `README.md` - Documentación detallada
- `IMPLEMENTATION_SUMMARY.md` - Resumen de implementación
- `database-schema.sql` - Script SQL completo

---

## 💬 ¿Necesitas Ayuda?

Revisa los archivos de documentación o pregunta! 🤝
