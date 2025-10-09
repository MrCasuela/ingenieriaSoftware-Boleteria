# 🔒 Guía de Seguridad - Información Sensible

## ⚠️ INFORMACIÓN CRÍTICA

Este documento explica qué archivos y datos **NUNCA** deben subirse al repositorio y cómo proteger la información sensible del proyecto.

---

## 🚫 Archivos que NUNCA Subir

### 1. Variables de Entorno
```
❌ .env
❌ .env.local
❌ .env.production
❌ Cualquier archivo .env con datos reales
```

**✅ SÍ subir:** `.env.example` (plantilla sin valores reales)

### 2. Archivos de Configuración con Credenciales
```
❌ config.local.js
❌ secrets.json
❌ credentials.json
❌ database.config.js (con contraseñas reales)
```

### 3. Claves y Certificados
```
❌ *.pem
❌ *.key
❌ *.cert
❌ id_rsa / id_rsa.pub
❌ *.p12
```

### 4. Base de Datos
```
❌ *.sqlite
❌ *.db
❌ backup.sql (con datos reales)
❌ dump.sql (con datos de producción)
```

### 5. Datos de Usuarios
```
❌ users.json (con datos reales)
❌ customers.json
❌ operators.json (con contraseñas)
❌ Archivos con RUT, emails, teléfonos reales
```

### 6. Logs con Información Sensible
```
❌ audit-logs/ (si contienen datos personales)
❌ *.log (si contienen contraseñas o tokens)
❌ error.log (si tiene stack traces con credenciales)
```

---

## ✅ Archivos que SÍ Subir

```
✅ .env.example (plantilla)
✅ database-schema.sql (solo estructura, sin datos)
✅ README.md
✅ Documentación (*.md)
✅ Código fuente (*.js, *.vue, etc.)
✅ Archivos de configuración sin credenciales
```

---

## 🔐 Información Sensible en el Proyecto

### Credenciales de Base de Datos
**Ubicación:** `backend/.env`
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA_AQUI  # ⚠️ NUNCA SUBIR
DB_NAME=ticketvue
```

### JWT Secret
**Ubicación:** `backend/.env`
```env
JWT_SECRET=clave_super_secreta_cambiar  # ⚠️ NUNCA SUBIR
```

**Generar clave segura:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Credenciales de Email
**Ubicación:** `backend/.env`
```env
EMAIL_USER=tu_email@gmail.com        # ⚠️ NUNCA SUBIR
EMAIL_PASSWORD=tu_app_password       # ⚠️ NUNCA SUBIR
```

### Credenciales de Usuarios (Desarrollo)

**Para desarrollo local solamente:**
```javascript
// authStore.js - SOLO PARA DESARROLLO
// En producción, estos datos deben estar en BD encriptados

Operadores:
- operador1 / admin123
- operador2 / admin456

Administradores:
- admin1 / admin123
- admin2 / admin456
```

**⚠️ IMPORTANTE:** Estas credenciales de ejemplo deben cambiarse en producción.

---

## 🛡️ Buenas Prácticas de Seguridad

### 1. Variables de Entorno

**❌ NUNCA hacer esto:**
```javascript
const password = "miPassword123"; // Hardcoded
const apiKey = "sk_live_abc123xyz"; // Hardcoded
```

**✅ SIEMPRE hacer esto:**
```javascript
const password = process.env.DB_PASSWORD;
const apiKey = process.env.API_KEY;
```

### 2. Contraseñas

**Requisitos mínimos:**
- Mínimo 12 caracteres
- Letras mayúsculas y minúsculas
- Números
- Caracteres especiales
- **NUNCA** usar contraseñas por defecto en producción

**Almacenamiento:**
```javascript
// ✅ CORRECTO: Usar bcrypt
const hashedPassword = await bcrypt.hash(password, 10);

// ❌ INCORRECTO: Guardar en texto plano
const password = "admin123"; 
```

### 3. Tokens JWT

**Configuración segura:**
```javascript
// backend/src/controllers/authController.js
const token = jwt.sign(
  { id: user._id }, 
  process.env.JWT_SECRET,  // ✅ Desde variable de entorno
  { expiresIn: '7d' }      // ✅ Con expiración
);
```

### 4. Datos Personales (GDPR/Ley de Protección de Datos)

**Datos sensibles que requieren protección:**
- ✅ RUT/DNI/Identificación
- ✅ Emails
- ✅ Teléfonos
- ✅ Direcciones
- ✅ Datos de tarjetas de crédito (PCI DSS)

**Medidas:**
- Encriptar en base de datos
- Usar HTTPS en producción
- Implementar políticas de retención
- Consentimiento del usuario

### 5. SQL Injection Prevention

**❌ PELIGROSO:**
```javascript
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

**✅ SEGURO (Sequelize ORM):**
```javascript
const user = await User.findOne({ where: { email } });
```

### 6. XSS Prevention

**Frontend (Vue.js):**
```vue
<!-- ✅ SEGURO: Vue escapa automáticamente -->
<div>{{ userInput }}</div>

<!-- ⚠️ PELIGROSO: Usar solo con datos confiables -->
<div v-html="userInput"></div>
```

---

## 📋 Checklist de Seguridad

### Antes de Commit

- [ ] Revisar que no haya archivos `.env` en el staging
- [ ] Verificar que no haya contraseñas hardcodeadas
- [ ] Comprobar que no haya API keys en el código
- [ ] Asegurar que no haya datos personales reales
- [ ] Revisar logs para eliminar información sensible

### Antes de Deploy

- [ ] Cambiar todas las contraseñas por defecto
- [ ] Generar nuevo JWT_SECRET para producción
- [ ] Configurar variables de entorno en el servidor
- [ ] Habilitar HTTPS
- [ ] Configurar CORS correctamente
- [ ] Revisar permisos de archivos en el servidor
- [ ] Configurar backups encriptados

---

## 🔍 Detectar Información Sensible

### Comando para buscar posibles problemas:

```bash
# Buscar posibles contraseñas hardcodeadas
git grep -i "password.*=" 

# Buscar posibles API keys
git grep -i "api[_-]key.*="

# Buscar tokens
git grep -i "token.*="

# Verificar archivos .env
git status | grep ".env"
```

### Herramientas Recomendadas

1. **git-secrets**: Previene commits con secretos
   ```bash
   git secrets --install
   git secrets --register-aws
   ```

2. **truffleHog**: Encuentra secretos en el historial
   ```bash
   trufflehog git file://. --json
   ```

3. **gitleaks**: Detecta secretos y credenciales
   ```bash
   gitleaks detect --source . -v
   ```

---

## 🚨 Si Subiste Información Sensible por Error

### 1. Eliminar del Último Commit
```bash
git reset --soft HEAD~1
# Editar archivos para remover información sensible
git add .
git commit -m "Fix: Remove sensitive data"
```

### 2. Si Ya Hiciste Push

```bash
# 1. Cambiar INMEDIATAMENTE las credenciales expuestas
# 2. Reescribir el historial (PELIGROSO)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch PATH/TO/FILE" \
  --prune-empty --tag-name-filter cat -- --all

# 3. Force push (solo si trabajas solo o con permiso)
git push origin --force --all
```

**⚠️ CRÍTICO:** Si expusiste:
- Contraseñas de BD → Cambiarlas inmediatamente
- API Keys → Revocarlas y generar nuevas
- JWT Secret → Invalidará todas las sesiones activas
- Datos de usuarios → Notificar según la ley

---

## 🔐 Configuración de Git para Seguridad

### .gitignore Local (adicional)
Crear `~/.gitignore_global`:
```bash
# Configurar globalmente
git config --global core.excludesfile ~/.gitignore_global
```

Contenido:
```
# Archivos del sistema
.DS_Store
Thumbs.db

# Archivos del IDE
.vscode/
.idea/

# Archivos temporales
*.tmp
*.temp
*.swp
```

### Pre-commit Hook

Crear `.git/hooks/pre-commit`:
```bash
#!/bin/sh

# Prevenir commit de archivos .env
if git diff --cached --name-only | grep -E '\.env$|\.env\..*$' | grep -v '\.env\.example$'
then
    echo "❌ ERROR: Intentando hacer commit de archivo .env"
    echo "Por favor, remueve el archivo .env del staging"
    exit 1
fi

# Buscar posibles secretos
if git diff --cached | grep -i "password.*=" | grep -v ".env.example"
then
    echo "⚠️  WARNING: Posible contraseña detectada en el código"
    echo "Verifica antes de continuar"
    read -p "¿Continuar de todas formas? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]
    then
        exit 1
    fi
fi

exit 0
```

Hacer ejecutable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## 📚 Recursos Adicionales

### Documentación
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Git Secrets Management](https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### Herramientas
- [1Password](https://1password.com/) - Gestión de contraseñas
- [Vault by HashiCorp](https://www.vaultproject.io/) - Gestión de secretos
- [dotenv-vault](https://www.dotenv.org/docs/dotenv-vault) - Encriptación de .env

---

## 📞 Contacto en Caso de Incidente

Si detectas una brecha de seguridad:

1. **No hacer commit** de información que confirme la vulnerabilidad
2. **Cambiar inmediatamente** las credenciales comprometidas
3. **Notificar** al equipo de desarrollo
4. **Documentar** el incidente para prevenir repetición

---

## ✅ Resumen de Comandos Útiles

```bash
# Ver qué archivos están en staging
git status

# Ver cambios antes de commit
git diff --cached

# Remover archivo del staging (sin eliminarlo)
git reset HEAD archivo.env

# Ver historial de un archivo
git log --follow -- archivo.js

# Buscar en todo el código
git grep "password"

# Ver archivos ignorados
git status --ignored
```

---

**Última actualización:** Octubre 2025  
**Versión:** 1.0  
**Mantenido por:** Equipo TicketVue

---

## 🔒 Recuerda

> "La seguridad no es un producto, es un proceso"
> - Bruce Schneier

**Principios clave:**
1. **Defense in Depth** - Múltiples capas de seguridad
2. **Least Privilege** - Acceso mínimo necesario
3. **Zero Trust** - Verificar siempre, nunca asumir
4. **Security by Design** - Seguridad desde el inicio
