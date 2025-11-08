# ✅ VERIFICACIÓN: Instalación Limpia de Docker

## 📋 Checklist de Tablas en Base de Datos

Después de ejecutar `docker-compose up -d`, la base de datos debe tener **5 tablas**:

1. ✅ `users` - Usuarios del sistema
2. ✅ `events` - Eventos disponibles
3. ✅ `ticket_types` - Tipos de tickets por evento
4. ✅ `tickets` - Tickets comprados
5. ✅ `audit_logs` - **Historial de auditoría y validaciones** ⭐

## 🔍 Comando de Verificación

```bash
docker exec ticketvue-mysql mysql -u ticketuser -pticketpass ticketvue -e "SHOW TABLES;"
```

**Resultado esperado:**
```
Tables_in_ticketvue
audit_logs          <- ⭐ NUEVA TABLA
events
ticket_types
tickets
users
```

## 🧪 Verificación de Datos Iniciales en audit_logs

```bash
docker exec ticketvue-mysql mysql -u ticketuser -pticketpass ticketvue -e "SELECT COUNT(*) as registros_auditoria FROM audit_logs;"
```

**Resultado esperado:** Al menos 2 registros de prueba

## 🚨 Si la Tabla NO Existe

Si después de `docker-compose up -d` la tabla `audit_logs` no existe, ejecutar:

```bash
# Opción 1: Ejecutar migración manual
docker exec -i ticketvue-mysql mysql -u ticketuser -pticketpass ticketvue < backend/migrations/create-audit-logs-table.sql

# Opción 2: Insertar datos de prueba
docker exec -i ticketvue-mysql mysql -u ticketuser -pticketpass ticketvue < backend/migrations/insert-audit-sample-data.sql
```

## 🔄 Instalación Limpia Completa

Para simular una instalación completamente desde cero:

```bash
# 1. Detener y eliminar TODO (contenedores + volúmenes + redes)
docker-compose down -v

# 2. Eliminar imágenes (opcional, para rebuild completo)
docker rmi ticketvue-backend ticketvue-frontend

# 3. Limpiar sistema Docker (opcional)
docker system prune -f

# 4. Reconstruir y levantar desde cero
docker-compose up -d --build

# 5. Esperar a que todo esté healthy (~30 segundos)
sleep 30

# 6. Verificar tablas
docker exec ticketvue-mysql mysql -u ticketuser -pticketpass ticketvue -e "SHOW TABLES;"

# 7. Verificar que backend responde
curl http://localhost:3000/api/audit/stats

# 8. Verificar frontend
curl http://localhost/
```

## 📂 Archivos Actualizados

Los siguientes archivos fueron actualizados para incluir `audit_logs`:

### 1. `backend/database-schema-init.sql` ⭐ (Usado por Docker)
- Ejecutado automáticamente cuando MySQL se crea por primera vez
- Incluye definición completa de `audit_logs`
- Incluye 2 registros de prueba

### 2. `backend/database-schema.sql`
- Schema completo del proyecto
- Incluye definición completa de `audit_logs`
- Incluye 2 registros de prueba

### 3. `backend/migrations/create-audit-logs-table.sql`
- Migración standalone para crear `audit_logs`
- Útil para actualizar bases de datos existentes
- Incluye 3 registros de prueba

### 4. `backend/migrations/insert-audit-sample-data.sql`
- 10 registros adicionales de prueba
- Datos realistas con diferentes escenarios

## 🎯 Resultado Final Esperado

Después de una instalación limpia:

```bash
$ docker exec ticketvue-mysql mysql -u ticketuser -pticketpass ticketvue -e "SELECT COUNT(*) as total FROM audit_logs;"

total
2
```

```bash
$ curl -s http://localhost:3000/api/audit/stats | jq '.stats.total'

2
```

Si ejecutaste también los datos adicionales:
```bash
$ curl -s http://localhost:3000/api/audit/stats | jq '.stats.total'

12
```

## 🔧 Troubleshooting

### Error: "Table doesn't exist"
**Causa:** El volumen de MySQL ya existía antes de actualizar el schema

**Solución:**
```bash
docker-compose down -v  # El -v es CRÍTICO
docker-compose up -d --build
```

### Error: "Access denied"
**Causa:** Credenciales incorrectas

**Solución:** Verificar en `docker-compose.yml`:
- Usuario: `ticketuser`
- Password: `ticketpass`
- Database: `ticketvue`

### Los Datos No Se Muestran en el Frontend
**Causa:** Backend no reiniciado después de crear la tabla

**Solución:**
```bash
docker restart ticketvue-backend
```

## ✅ Checklist Final

- [ ] Ejecutar `docker-compose down -v`
- [ ] Ejecutar `docker-compose up -d --build`
- [ ] Esperar 30 segundos
- [ ] Verificar 5 tablas existen
- [ ] Verificar al menos 2 registros en `audit_logs`
- [ ] Verificar endpoint `/api/audit/stats` responde
- [ ] Verificar endpoint `/api/audit/logs` responde
- [ ] Abrir http://localhost/admin/panel
- [ ] Ir a pestaña "Historial"
- [ ] Confirmar que muestra estadísticas
- [ ] Confirmar que muestra registros en la tabla
- [ ] Probar botón "Generar Reporte PDF"

---

**Estado:** ✅ Archivos actualizados y listos para instalación limpia

**Fecha:** 8 de Noviembre de 2025

**Nota importante:** Si alguien clona el repositorio AHORA, debe hacer `docker-compose up -d` y todo funcionará automáticamente sin pasos adicionales.
