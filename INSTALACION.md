# 🚀 Guía Rápida de Instalación - Sistema de Boletería TicketVue

## 📋 Requisitos Previos
Antes de comenzar, asegúrate de tener instalado:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker y Docker Compose)
- [Git](https://git-scm.com/downloads)

## 🔧 Instalación

### 1. Clonar el Repositorio
```bash
git clone https://github.com/MrCasuela/ingenieriaSoftware-Boleteria.git
cd ingenieriaSoftware-Boleteria
```

### 2. Ejecutar con Docker
```bash
docker-compose up -d
```

**Importante:** La primera vez puede tardar 5-10 minutos porque:
- Descarga las imágenes de Docker
- Construye el frontend y backend
- Inicializa la base de datos
- **Crea automáticamente los usuarios predeterminados**

### 3. Esperar a que Todo esté Listo
Verifica que todos los contenedores estén "healthy":
```bash
docker-compose ps
```

Deberías ver algo así:
```
NAME                 STATUS
ticketvue-frontend   Up (healthy)
ticketvue-backend    Up (healthy)
ticketvue-mysql      Up (healthy)
```

Si algún contenedor no está "healthy", espera un minuto más y vuelve a verificar.

### 4. Acceder a la Aplicación
- **Aplicación Principal:** http://localhost
- **Panel de Administrador:** http://localhost/admin/panel
- **Panel de Operador:** http://localhost/operador

## 🔐 Usuarios Predeterminados

El sistema crea automáticamente estos usuarios en el primer arranque:

### 👨‍💼 Administradores
| Email | Contraseña |
|-------|------------|
| `admin1@ticketvue.com` | `admin123` |
| `admin2@ticketvue.com` | `admin456` |

### 👤 Operadores
| Email | Contraseña |
|-------|------------|
| `operador1@ticketvue.com` | `oper123` |
| `operador2@ticketvue.com` | `oper456` |

### 🧑 Clientes (opcional - para pruebas)
| Email | Contraseña |
|-------|------------|
| `cliente1@email.com` | `cliente123` |
| `cliente2@email.com` | `cliente456` |

## 🎯 Probar el Sistema

1. **Como Cliente:**
   - Ve a http://localhost
   - Selecciona un evento
   - Compra tickets usando la tarjeta de prueba: `5555555555555555`

2. **Como Administrador:**
   - Ve a http://localhost/admin/panel
   - Inicia sesión con `admin1@ticketvue.com` / `admin123`
   - Puedes crear eventos y tipos de tickets

3. **Como Operador:**
   - Ve a http://localhost/operador
   - Inicia sesión con `operador1@ticketvue.com` / `oper123`
   - Puedes validar tickets con código QR

## 🔄 Comandos Útiles

### Ver Logs en Tiempo Real
```bash
docker-compose logs -f
```

### Reiniciar el Sistema
```bash
docker-compose restart
```

### Detener el Sistema
```bash
docker-compose down
```

### Reiniciar Desde Cero (BORRA TODOS LOS DATOS)
```bash
docker-compose down -v
docker-compose up -d --build
```
*Los usuarios predeterminados se crearán automáticamente de nuevo*

## ❓ Problemas Comunes

### El puerto 80 está ocupado
Si recibes un error de "port is already allocated":
1. Detén el proceso que usa el puerto 80 (por ejemplo, Apache, IIS, o Nginx local)
2. O modifica el `docker-compose.yml` para usar otro puerto:
   ```yaml
   frontend:
     ports:
       - "8080:80"  # Cambiar 80 por 8080 u otro puerto libre
   ```
   Luego accede en: http://localhost:8080

### Los contenedores no arrancan
```bash
# Ver los logs para identificar el error
docker-compose logs

# Reconstruir desde cero
docker-compose down -v
docker-compose up --build
```

### Los usuarios no se crean
Si los usuarios no se crearon automáticamente:
1. Verifica los logs: `docker logs ticketvue-backend --tail 50`
2. Busca el mensaje de seed que dice "✅ Creados 6 usuarios"
3. Si no apareció, ejecuta manualmente:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

## 📱 Próximos Pasos

Una vez que el sistema esté funcionando:
1. ✅ Prueba crear una cuenta de cliente
2. ✅ Compra un ticket de prueba
3. ✅ Valida el ticket como operador
4. ✅ Crea un evento nuevo como administrador

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs: `docker-compose logs`
2. Verifica que Docker Desktop esté corriendo
3. Asegúrate de tener suficiente espacio en disco
4. Reinicia Docker Desktop

---

**Nota:** Este sistema es para desarrollo y pruebas. Los usuarios predeterminados tienen contraseñas simples que **NO deben usarse en producción**.
