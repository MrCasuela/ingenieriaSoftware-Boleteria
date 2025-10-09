# 🔒 Configuración de Seguridad - Resumen

## ✅ Archivos Creados

He creado la siguiente estructura de seguridad para proteger tu proyecto:

### 1. `.gitignore` (Raíz del proyecto)
**Ubicación:** `/.gitignore`

Protege contra subir:
- ✅ Variables de entorno (`.env`, `.env.local`, etc.)
- ✅ Node modules
- ✅ Archivos de configuración con credenciales
- ✅ Claves y certificados (`.pem`, `.key`, `.cert`)
- ✅ Bases de datos locales (`.sqlite`, `.db`)
- ✅ Logs con información sensible
- ✅ Backups con datos reales
- ✅ Archivos temporales del IDE
- ✅ Uploads de usuarios
- ✅ Archivos del sistema operativo

### 2. `.env.example` (Plantilla de variables de entorno)
**Ubicación:** `/.env.example`

Plantilla que incluye:
- 🔧 Configuración del servidor
- 🗄️ Credenciales de MySQL (plantilla)
- 🔐 JWT Secret (ejemplo)
- 📧 Configuración de email/SMTP
- 🌐 URLs del sistema
- 🛡️ Configuración de seguridad
- 📊 Configuración de logs
- 💳 Pasarelas de pago (futuro)

**⚠️ IMPORTANTE:** Este archivo SÍ se sube al repositorio como referencia.

### 3. `SECURITY_INFO.md` (Guía completa de seguridad)
**Ubicación:** `/SECURITY_INFO.md`

Incluye:
- 🚫 Lista de archivos que NUNCA subir
- ✅ Lista de archivos seguros para subir
- 🔐 Identificación de información sensible
- 🛡️ Buenas prácticas de seguridad
- 📋 Checklist antes de commit/deploy
- 🔍 Comandos para detectar información sensible
- 🚨 Qué hacer si expusiste datos por error
- 🔧 Configuración de git hooks
- 📚 Recursos y herramientas

---

## 🚀 Próximos Pasos

### 1. Crear tu archivo `.env` local

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita con tus credenciales reales
# En Windows:
copy .env.example .env
# Luego edita con tu editor favorito
```

**Configuración mínima requerida:**
```env
# Base de Datos
DB_PASSWORD=tu_contraseña_mysql_real

# JWT (genera una clave segura)
JWT_SECRET=clave_muy_larga_y_aleatoria_cambiar_esto

# Email (si vas a probar envío de emails)
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password_de_gmail
```

### 2. Generar JWT Secret Seguro

```bash
# Opción 1: Con Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Opción 2: Con PowerShell
[System.Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Opción 3: Online (menos seguro)
# https://www.grc.com/passwords.htm
```

### 3. Verificar que `.gitignore` funciona

```bash
# Ver estado de git
git status

# NO deberías ver archivos .env en la lista
# Si aparecen, hay un problema con el .gitignore
```

### 4. Hacer commit de la configuración de seguridad

```bash
# Agregar los archivos de seguridad
git add .gitignore
git add .env.example
git add SECURITY_INFO.md
git add GITIGNORE_SETUP.md

# Commit
git commit -m "feat: Add security configuration and .gitignore"

# ⚠️ ANTES de push, verificar:
git diff --cached
# NO debe aparecer ningún archivo .env con datos reales
```

---

## ✅ Verificación Rápida

### Comando 1: Ver archivos ignorados
```bash
git status --ignored
```

**Deberías ver:**
```
Ignored files:
  node_modules/
  .env
  dist/
  ... (otros archivos ignorados)
```

### Comando 2: Buscar posibles secretos
```bash
# Buscar "password" en el código
git grep -i "password.*=" | grep -v ".example"

# Buscar archivos .env en staging
git diff --cached --name-only | grep ".env"
```

### Comando 3: Ver lo que se va a subir
```bash
git diff --cached
```

**NO deberías ver:**
- Contraseñas reales
- API keys
- Tokens
- Credenciales de base de datos
- Información personal de usuarios

---

## 🛡️ Configuración Adicional Recomendada

### Pre-commit Hook (Opcional pero recomendado)

Crea el archivo `.git/hooks/pre-commit`:

```bash
#!/bin/sh
# Pre-commit hook para prevenir commits de información sensible

echo "🔍 Verificando información sensible..."

# Prevenir commit de archivos .env
if git diff --cached --name-only | grep -E '\.env$' | grep -v '\.env\.example$'
then
    echo "❌ ERROR: Intentando hacer commit de archivo .env"
    echo "   Archivo .env no debe subirse al repositorio"
    exit 1
fi

# Buscar posibles contraseñas hardcodeadas
if git diff --cached | grep -iE "(password|passwd|pwd)\s*=\s*['\"]" | grep -v ".env.example"
then
    echo "⚠️  WARNING: Posible contraseña en el código"
    echo "   Verifica que no sea una credencial real"
fi

echo "✅ Verificación completada"
exit 0
```

**Para Windows (PowerShell):**
```powershell
# Crear el archivo
New-Item -Path ".git/hooks/pre-commit" -ItemType File -Force

# Copiar el contenido de arriba y pegarlo en el archivo
# Nota: En Windows, los hooks pueden no funcionar sin Git Bash
```

---

## 📁 Estructura de Archivos de Seguridad

```
proyecto/
├── .gitignore              ← Ignora archivos sensibles
├── .env.example           ← Plantilla SIN credenciales (se sube)
├── .env                   ← Tus credenciales REALES (NO se sube)
├── SECURITY_INFO.md       ← Guía de seguridad completa
├── GITIGNORE_SETUP.md     ← Este archivo (resumen)
│
├── backend/
│   ├── .env.example       ← Plantilla backend
│   └── .env               ← Credenciales backend (NO se sube)
│
└── .git/
    └── hooks/
        └── pre-commit     ← Hook de verificación (opcional)
```

---

## 🔴 ATENCIÓN: Si Ya Tienes Commits con .env

Si ya subiste archivos `.env` al repositorio:

### Opción 1: Remover del último commit (si no hiciste push)
```bash
# Sacar del staging
git reset HEAD .env

# Agregar al .gitignore (si no está)
echo ".env" >> .gitignore

# Commit del .gitignore
git add .gitignore
git commit -m "feat: Add .env to .gitignore"
```

### Opción 2: Si ya hiciste push (MÁS COMPLEJO)
```bash
# 1. CAMBIAR INMEDIATAMENTE todas las credenciales expuestas
# 2. Remover del historial (requiere reescritura)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 3. Force push (solo si trabajas solo)
git push origin --force --all
```

**⚠️ CRÍTICO:** Después de esto, debes:
- ✅ Cambiar contraseña de MySQL
- ✅ Generar nuevo JWT_SECRET
- ✅ Cambiar passwords de email
- ✅ Revocar cualquier API key expuesta

---

## 📊 Estado Actual del Proyecto

### ✅ Archivos Protegidos
- Variables de entorno (`.env`)
- Node modules
- Archivos de build (`dist/`)
- Logs
- Bases de datos locales
- Credenciales y certificados

### ✅ Archivos en Repositorio (Seguros)
- Código fuente (`.js`, `.vue`)
- Documentación (`.md`)
- Configuración sin credenciales
- `.env.example` (plantilla)
- `.gitignore`

---

## 🎯 Checklist Final

Antes de continuar trabajando:

- [ ] Crear archivo `.env` con tus credenciales
- [ ] Verificar que `.env` NO aparece en `git status`
- [ ] Revisar que `.gitignore` está funcionando
- [ ] Leer `SECURITY_INFO.md` completo
- [ ] Generar JWT_SECRET seguro
- [ ] Configurar credenciales de base de datos
- [ ] (Opcional) Configurar pre-commit hook
- [ ] Hacer commit de archivos de seguridad
- [ ] Verificar antes de push que no hay secretos

---

## 📞 Ayuda Rápida

### ¿El .gitignore no funciona?

```bash
# Si un archivo ya está trackeado, el .gitignore no lo afecta
# Debes removerlo del index primero:
git rm --cached archivo.env
git add .gitignore
git commit -m "Remove .env from tracking"
```

### ¿Cómo verifico qué archivos están ignorados?

```bash
git status --ignored
```

### ¿Cómo sé si mi .env está en el repositorio?

```bash
# Buscar en el historial
git log --all --full-history -- .env

# Si devuelve resultados, el archivo está/estuvo en el repo
```

---

## 🎉 ¡Listo!

Tu proyecto ahora tiene:
- ✅ `.gitignore` completo y robusto
- ✅ Plantilla `.env.example` documentada
- ✅ Guía de seguridad completa
- ✅ Instrucciones claras de configuración

**Siguiente paso:** Crea tu archivo `.env` local y comienza a desarrollar de forma segura.

---

**Creado:** Octubre 2025  
**Proyecto:** Sistema de Boletería TicketVue  
**Versión:** 1.0
