# Guía para Probar la Validación por RUT

## Problema Resuelto

Se han corregido dos problemas principales:

### 1. ✅ Caracteres especiales en PDF
- Eliminados todos los emojis y caracteres Unicode
- Removidas las tildes de los textos principales
- El símbolo © reemplazado por (c)

### 2. ✅ Autenticación para validación por RUT
- El frontend ahora requiere un token JWT válido del backend
- Se eliminó la generación de tokens temporales inválidos
- El backend genera y devuelve tokens JWT válidos firmados

## Pasos para Probar

### 1. Limpiar el Navegador
Es CRÍTICO limpiar el localStorage antes de probar:

```javascript
// Abrir Consola del Navegador (F12) y ejecutar:
localStorage.clear()
location.reload()
```

### 2. Iniciar Sesión como Operador
1. Ir a: http://localhost:5173/operator-login
2. Usar credenciales:
   - Email: `operador1@ticketvue.com`
   - Contraseña: `oper123`
3. Esperar redirección al panel de operador

### 3. Verificar Token Guardado
En la consola del navegador, verificar:

```javascript
const token = localStorage.getItem('apiToken')
console.log('Token guardado:', token ? 'SÍ (' + token.length + ' chars)' : 'NO')
```

**Resultado esperado:** Debe mostrar un token largo (JWT válido)

### 4. Probar Validación por RUT

En el panel de operador:

1. **Ir a la sección "Ingreso Manual por Código o RUT"**
2. **Ingresar un RUT de prueba**: `21597713-7` 
3. **Presionar "Validar Ingreso"**

#### Resultados Posibles:

✅ **Éxito - Ticket encontrado:**
```
✅ Ticket Válido (Por RUT)
Se encontraron X ticket(s) para el RUT 21597713-7
```

❌ **RUT no encontrado:**
```
❌ RUT No Encontrado
No se encontraron tickets asociados al RUT 21597713-7
```

⚠️ **Tickets ya usados:**
```
⚠️ Tickets Ya Utilizados
Se encontraron X ticket(s) para el RUT 21597713-7, pero todos ya fueron utilizados.
```

❌ **Error de autenticación (significa que el token no es válido):**
```
❌ Error de Autenticación
No se pudo verificar tu sesión...
```

### 5. Verificar PDF de Auditoría

Como **Administrador**:

1. Ir a: http://localhost:5173/operator-login
2. Credenciales:
   - Email: `admin1@ticketvue.com`
   - Contraseña: `admin123`
3. Ir a la pestaña **"📋 Historial"**
4. Click en **"📄 Generar Reporte PDF"**
5. Verificar que NO hay caracteres extraños

**Esperado:**
- Títulos sin tildes: "Informacion del Reporte", "AUDITORIA"
- Estadísticas con etiquetas: `[OK]`, `[X]`, `[!]`, `[QR]`, `[MANUAL]`, `[RUT]`
- Pie de página: "Generado por TicketVue (c) 2025"

## Logs de Depuración

### Frontend (Consola del Navegador)
Al validar por RUT, deberías ver:

```
🔎 Buscando tickets para RUT: 21597713-7
✅ Token encontrado: eyJhbGciOiJIUzI1NiI...
📋 Tickets encontrados: { tickets: [...] }
```

### Backend (Docker Logs)
```bash
docker logs ticketvue-backend --tail 50 -f
```

Deberías ver:
```
🔍 Buscando tickets por RUT: 21597713-7
📋 Tickets encontrados para RUT 21597713-7: X
```

## Troubleshooting

### Problema: "No hay token de autenticación"

**Causa:** El token no se guardó correctamente en localStorage.

**Solución:**
1. Cerrar sesión
2. Ejecutar en consola: `localStorage.clear()`
3. Recargar la página: `location.reload()`
4. Volver a iniciar sesión

### Problema: "No autorizado" (401)

**Causa:** El token expiró o no es válido.

**Solución:**
1. Verificar que el backend esté corriendo: `docker ps`
2. Ver logs del backend: `docker logs ticketvue-backend --tail 30`
3. Cerrar sesión y volver a iniciar sesión

### Problema: Caracteres extraños en PDF

**Causa:** La versión anterior del código tenía emojis y tildes.

**Solución:**
1. Asegurarse de que el backend se reinició: `docker-compose restart backend`
2. Regenerar el PDF desde el panel de admin

## RUTs de Prueba

Estos RUTs tienen tickets en la base de datos de prueba:

- `21597713-7` - Juan Operador
- Otros RUTs según los datos en tu base de datos

Para ver todos los RUTs con tickets, ejecutar en MySQL:

```sql
SELECT DISTINCT buyer_document, buyer_name, COUNT(*) as total_tickets
FROM tickets
WHERE buyer_document IS NOT NULL
GROUP BY buyer_document, buyer_name
ORDER BY total_tickets DESC;
```

## Verificación Final

1. ✅ Login como operador funciona
2. ✅ Token JWT válido se guarda en localStorage
3. ✅ Validación por RUT encuentra tickets
4. ✅ Auditoría registra validaciones con tipo 'rut'
5. ✅ PDF se genera sin caracteres extraños

## Comandos Útiles

```bash
# Ver containers corriendo
docker ps

# Reiniciar backend
docker-compose restart backend

# Ver logs en tiempo real
docker logs ticketvue-backend --tail 100 -f

# Conectar a MySQL
docker exec -it ticketvue-mysql mysql -u ticketvue_user -pticketvue_password ticketvue_db
```
