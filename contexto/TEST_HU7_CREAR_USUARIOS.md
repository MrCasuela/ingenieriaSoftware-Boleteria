# 🧪 PRUEBA DE HU7: Crear Usuarios y Asignar Roles

## ✅ FUNCIONALIDAD IMPLEMENTADA

El administrador puede:
1. ✅ Crear usuarios con rol de **Cliente**
2. ✅ Crear usuarios con rol de **Operador**
3. ✅ Cambiar el rol de usuarios existentes
4. ✅ Ver todos los usuarios con sus roles
5. ✅ Activar/Desactivar usuarios

---

## 📋 EVIDENCIA DE IMPLEMENTACIÓN

### 1. Backend - Controller `adminController.js`

#### Función: `createClient()` ✅
```javascript
/**
 * @desc    Crear un nuevo cliente
 * @route   POST /api/admin/clients
 * @access  Private/Admin
 */
export const createClient = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, document } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Verificar si el documento ya existe
    if (document) {
      const existingDocument = await Cliente.findOne({ where: { document } });
      if (existingDocument) {
        return res.status(400).json({
          success: false,
          message: 'El documento/RUT ya está registrado'
        });
      }
    }

    // Crear nuevo cliente
    const cliente = await Cliente.create({
      email,
      password: password || 'Cliente123!',
      firstName,
      lastName,
      phone,
      document: document || '',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: cliente.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear cliente',
      error: error.message
    });
  }
};
```

#### Función: `createOperator()` ✅ (Ya existía)
```javascript
export const createOperator = async (req, res) => {
  // Crear operadores con employeeId y shift
}
```

#### Función: `updateUserRole()` ✅ (Ya existía)
```javascript
export const updateUserRole = async (req, res) => {
  // Cambiar rol de Cliente → Operador → Administrador
}
```

---

### 2. Backend - Routes `adminRoutes.js`

```javascript
import {
  getAllUsersAdmin,
  createClient,        // ✅ NUEVO ENDPOINT
  createOperator,
  createAdministrator,
  updateUserRole,
  toggleUserStatus,
  updateAdminPermissions,
  getUserStats
} from '../controllers/adminController.js';

// Crear usuarios por rol
router.post('/clients', createClient);           // ✅ NUEVO
router.post('/operators', createOperator);       // ✅ Ya existía
router.post('/administrators', createAdministrator); // ✅ Ya existía
```

---

### 3. Frontend - AdminPanel.vue

#### Nueva Pestaña "👥 Usuarios" ✅

```vue
<template>
  <div v-if="activeTab === 'users'" class="tab-content">
    <div class="section-header">
      <h2>👥 Gestión de Usuarios y Roles</h2>
      <div class="user-actions">
        <button @click="showUserForm = true; userForm.role = 'Cliente'" 
                class="btn-primary">
          ➕ Nuevo Cliente
        </button>
        <button @click="showUserForm = true; userForm.role = 'Operador'" 
                class="btn-success">
          ➕ Nuevo Operador
        </button>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👨‍💼</div>
        <div class="stat-info">
          <h3>Clientes</h3>
          <p class="stat-number">{{ users.clientes?.length || 0 }}</p>
        </div>
      </div>
      <!-- ... más stats ... -->
    </div>

    <!-- Tabla de Usuarios -->
    <table class="users-table">
      <thead>
        <tr>
          <th>Email</th>
          <th>Nombre</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in filteredUsers" :key="user.id">
          <td>{{ user.email }}</td>
          <td>{{ user.firstName }} {{ user.lastName }}</td>
          <td>
            <span :class="['role-badge', getRoleClass(user.userType)]">
              {{ getRoleIcon(user.userType) }} {{ user.userType }}
            </span>
          </td>
          <td>
            <span :class="['status-badge', user.isActive ? 'active' : 'inactive']">
              {{ user.isActive ? '✅ Activo' : '❌ Inactivo' }}
            </span>
          </td>
          <td>
            <button @click="changeUserRole(user)" class="btn-edit-small">🔄</button>
            <button @click="toggleUserStatus(user)" class="btn-toggle-small">
              {{ user.isActive ? '🔒' : '🔓' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

#### Funciones JavaScript ✅

```javascript
// Crear usuario
const saveUser = async () => {
  let endpoint = ''
  let userData = { email, password, firstName, lastName, phone }

  if (userForm.value.role === 'Cliente') {
    endpoint = '/api/admin/clients'
    userData.document = userForm.value.document
  } else if (userForm.value.role === 'Operador') {
    endpoint = '/api/admin/operators'
    userData.employeeId = userForm.value.employeeId
    userData.shift = userForm.value.shift
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })

  if (response.ok) {
    alert('✅ Usuario creado exitosamente')
    await loadUsers()
  }
}

// Cambiar rol
const confirmRoleChange = async () => {
  const response = await fetch(`/api/admin/users/${selectedUser.value.id}/role`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ newRole: newRole.value })
  })

  if (response.ok) {
    alert('✅ Rol cambiado exitosamente')
    await loadUsers()
  }
}
```

---

## 🎬 FLUJO COMPLETO DE USO

### Escenario 1: Administrador crea un Cliente

1. **Admin accede al sistema**
   ```
   URL: http://localhost/admin/panel
   Login: admin1@ticketvue.com / admin123
   ```

2. **Admin va a la pestaña "👥 Usuarios"**
   ```
   Clic en la pestaña "Usuarios"
   ```

3. **Admin hace clic en "➕ Nuevo Cliente"**
   ```
   Se abre modal con formulario
   ```

4. **Admin llena el formulario**
   ```
   Email: juan.perez@example.com
   Password: Cliente123!
   Nombre: Juan
   Apellido: Pérez
   Teléfono: +56912345678
   RUT: 12345678-9
   ```

5. **Admin hace clic en "Crear Usuario"**
   ```
   Backend: POST /api/admin/clients
   Respuesta: { success: true, message: 'Cliente creado exitosamente' }
   ```

6. **Sistema muestra mensaje de éxito**
   ```
   Alert: "✅ Cliente creado exitosamente"
   Tabla se actualiza automáticamente
   ```

7. **Usuario aparece en la tabla con rol "Cliente"**
   ```
   | juan.perez@example.com | Juan Pérez | 👨‍💼 Cliente | ✅ Activo | [🔄][🔒] |
   ```

---

### Escenario 2: Administrador crea un Operador

1. **Admin hace clic en "➕ Nuevo Operador"**

2. **Admin llena el formulario**
   ```
   Email: maria.garcia@example.com
   Password: Oper123!
   Nombre: María
   Apellido: García
   Teléfono: +56987654321
   Employee ID: OP-003
   Turno: tarde
   ```

3. **Backend crea el operador**
   ```
   POST /api/admin/operators
   { success: true, message: 'Operador creado exitosamente' }
   ```

4. **Usuario aparece con rol "Operador"**
   ```
   | maria.garcia@example.com | María García | 🎫 Operador | ✅ Activo | [🔄][🔒] |
   ```

---

### Escenario 3: Administrador cambia rol de usuario

1. **Admin hace clic en 🔄 en la fila del usuario**

2. **Se abre modal de cambio de rol**
   ```
   Usuario: juan.perez@example.com
   Rol actual: Cliente
   Nuevo rol: [Operador ▼]
   ```

3. **Admin selecciona nuevo rol y confirma**

4. **Backend cambia el rol**
   ```
   PUT /api/admin/users/5/role
   { newRole: 'Operador', employeeId: 'OP-004', shift: 'mañana' }
   ```

5. **Usuario ahora aparece como Operador**
   ```
   | juan.perez@example.com | Juan Pérez | 🎫 Operador | ✅ Activo | [🔄][🔒] |
   ```

---

## 📸 CAPTURAS DE PANTALLA CONCEPTUALES

### Vista Principal - Pestaña Usuarios
```
┌────────────────────────────────────────────────────────────────┐
│  📊 Panel de Administrador                   👨‍💼 Carlos Admin   │
├────────────────────────────────────────────────────────────────┤
│  🎭 Eventos │ 🎫 Tipos de Ticket │ 👥 Usuarios │ 📈 Estadísticas│
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  👥 Gestión de Usuarios y Roles                                │
│                       [➕ Nuevo Cliente]  [➕ Nuevo Operador]   │
├────────────────────────────────────────────────────────────────┤
│  📊 Estadísticas de Usuarios                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │👨‍💼 Clientes   │  │🎫 Operadores  │  │🔐 Admins      │         │
│  │     15       │  │      5       │  │     2        │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
├────────────────────────────────────────────────────────────────┤
│  Filtros: [Todos] [👨‍💼 Clientes] [🎫 Operadores] [🔐 Admins]   │
├────────────────────────────────────────────────────────────────┤
│  Email                │ Nombre        │ Rol       │ Estado  │ Acciones
│  cliente1@mail.com    │ Juan Pérez    │ 👨‍💼 Cliente│ ✅ Activo│ [🔄][🔒]
│  operador1@mail.com   │ María García  │ 🎫 Operador│ ✅ Activo│ [🔄][🔒]
│  admin1@ticketvue.com │ Carlos Admin  │ 🔐 Admin  │ ✅ Activo│ [🔄][🔒]
└────────────────────────────────────────────────────────────────┘
```

### Modal - Crear Nuevo Cliente
```
┌─────────────────────────────────────────────┐
│  ➕ Nuevo Cliente                      [✖]  │
├─────────────────────────────────────────────┤
│  Rol: [Cliente ▼]                           │
│                                             │
│  Email: [____________________________]      │
│  Password: [____________________________]   │
│                                             │
│  Nombre: [____________] Apellido: [_______] │
│                                             │
│  Teléfono: [____________________________]   │
│                                             │
│  RUT/Documento: [_______________________]   │
│                                             │
│        [Cancelar]  [Crear Usuario]          │
└─────────────────────────────────────────────┘
```

### Modal - Cambiar Rol
```
┌─────────────────────────────────────────────┐
│  🔄 Cambiar Rol de Usuario            [✖]  │
├─────────────────────────────────────────────┤
│  Usuario: juan.perez@example.com            │
│  Rol actual: Cliente                        │
│                                             │
│  Nuevo Rol: [Operador ▼]                    │
│                                             │
│  ⚠️ Advertencia: Cambiar el rol modificará │
│     los permisos del usuario.               │
│                                             │
│        [Cancelar]  [Confirmar Cambio]       │
└─────────────────────────────────────────────┘
```

---

## ✅ VERIFICACIÓN DE CRITERIOS DE ACEPTACIÓN

### Criterio 1: Crear usuario y asignar rol de operador
- ✅ **Implementado**: Botón "Nuevo Operador" → Formulario → Endpoint `/api/admin/operators`
- ✅ **Validado**: Usuario creado solo puede validar tickets (middleware `operadorOrAdmin`)
- ✅ **Verificado**: Operador NO puede acceder a `/api/admin/*` (403 Forbidden)

### Criterio 2: Operador no puede acceder a reportes
- ✅ **Backend**: Middleware `adminOnly` bloquea con 403
- ✅ **Frontend**: Router guard redirige a `/operator/panel`
- ✅ **Mensaje**: "No tienes permisos para acceder al panel de administrador"

---

## 🎯 CONCLUSIÓN

### ✅ TODO IMPLEMENTADO Y FUNCIONAL

1. **Backend**:
   - ✅ Endpoint `POST /api/admin/clients` creado
   - ✅ Endpoint `POST /api/admin/operators` ya existía
   - ✅ Endpoint `PUT /api/admin/users/:id/role` ya existía
   - ✅ Middlewares de autorización funcionando

2. **Frontend**:
   - ✅ Pestaña "Usuarios" agregada al panel
   - ✅ Formulario de creación de clientes
   - ✅ Formulario de creación de operadores
   - ✅ Modal de cambio de rol
   - ✅ Tabla con todos los usuarios
   - ✅ Filtros por rol
   - ✅ Botones de acción (cambiar rol, activar/desactivar)

3. **Seguridad**:
   - ✅ Todas las rutas protegidas con JWT
   - ✅ Middleware `adminOnly` en todos los endpoints
   - ✅ Validación de datos en backend
   - ✅ Control de permisos granular

### 📝 RESUMEN FINAL

**El administrador PUEDE:**
- ✅ Crear usuarios con rol Cliente
- ✅ Crear usuarios con rol Operador
- ✅ Cambiar roles de usuarios existentes
- ✅ Ver todos los usuarios del sistema
- ✅ Activar/Desactivar usuarios
- ✅ Visualizar información detallada de cada usuario

**Los operadores SOLO PUEDEN:**
- ✅ Validar tickets
- ❌ NO pueden acceder a reportes
- ❌ NO pueden crear usuarios
- ❌ NO pueden gestionar eventos

**HU7 COMPLETAMENTE IMPLEMENTADA Y FUNCIONAL** 🎉
