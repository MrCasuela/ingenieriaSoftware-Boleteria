import { Cliente, Operador, Administrador } from '../models/index.js';
import User from '../models/User.js';

/**
 * @desc    Obtener todos los usuarios (solo para administradores)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsersAdmin = async (req, res) => {
  try {
    // Obtener todos los tipos de usuarios
    const clientes = await Cliente.findAll();
    const operadores = await Operador.findAll();
    const administradores = await Administrador.findAll();

    res.json({
      success: true,
      data: {
        clientes: clientes.map(u => u.toPublicJSON()),
        operadores: operadores.map(u => u.toPublicJSON()),
        administradores: administradores.map(u => u.toPublicJSON()),
        total: clientes.length + operadores.length + administradores.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

/**
 * @desc    Crear un nuevo operador
 * @route   POST /api/admin/operators
 * @access  Private/Admin
 */
export const createOperator = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, employeeId, shift } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear nuevo operador
    const operador = await Operador.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      employeeId: employeeId || `OP-${Date.now()}`,
      shift: shift || 'mañana',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Operador creado exitosamente',
      data: operador.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear operador',
      error: error.message
    });
  }
};

/**
 * @desc    Crear un nuevo administrador
 * @route   POST /api/admin/administrators
 * @access  Private/Admin (solo super admin)
 */
export const createAdministrator = async (req, res) => {
  try {
    // Verificar que el usuario que crea es super admin
    if (req.user.adminLevel !== 'super') {
      return res.status(403).json({
        success: false,
        message: 'Solo super administradores pueden crear otros administradores'
      });
    }

    const { email, password, firstName, lastName, phone, adminLevel, permissions } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear nuevo administrador
    const administrador = await Administrador.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      adminLevel: adminLevel || 'moderador',
      permissions: permissions || ['manage_events', 'view_reports'],
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Administrador creado exitosamente',
      data: administrador.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear administrador',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar rol de usuario
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { newRole, ...userData } = req.body;

    // Buscar usuario actual
    let user = await Cliente.findByPk(id);
    if (!user) user = await Operador.findByPk(id);
    if (!user) user = await Administrador.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Si el rol no cambia, solo actualizar datos
    if (user.userType === newRole) {
      await user.update(userData);
      return res.json({
        success: true,
        message: 'Usuario actualizado',
        data: user.toPublicJSON()
      });
    }

    // Cambiar de rol requiere eliminar y recrear en otra tabla
    const userFullData = {
      email: user.email,
      password: user.password, // Ya está hasheada
      firstName: userData.firstName || user.firstName,
      lastName: userData.lastName || user.lastName,
      phone: userData.phone || user.phone,
      isActive: user.isActive
    };

    // Eliminar usuario actual
    await user.destroy();

    // Crear en el nuevo rol
    let newUser;
    if (newRole === 'Cliente') {
      newUser = await Cliente.create({
        ...userFullData,
        document: userData.document || user.document || ''
      });
    } else if (newRole === 'Operador') {
      newUser = await Operador.create({
        ...userFullData,
        employeeId: userData.employeeId || `OP-${Date.now()}`,
        shift: userData.shift || 'mañana'
      });
    } else if (newRole === 'Administrador') {
      // Solo super admin puede crear administradores
      if (req.user.adminLevel !== 'super') {
        return res.status(403).json({
          success: false,
          message: 'Solo super administradores pueden promover a administrador'
        });
      }
      newUser = await Administrador.create({
        ...userFullData,
        adminLevel: userData.adminLevel || 'moderador',
        permissions: userData.permissions || ['view_reports']
      });
    }

    res.json({
      success: true,
      message: `Usuario cambiado de ${user.userType} a ${newRole}`,
      data: newUser.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar rol',
      error: error.message
    });
  }
};

/**
 * @desc    Desactivar/Activar usuario
 * @route   PUT /api/admin/users/:id/toggle-status
 * @access  Private/Admin
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar usuario
    let user = await Cliente.findByPk(id);
    if (!user) user = await Operador.findByPk(id);
    if (!user) user = await Administrador.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir desactivarse a sí mismo
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes desactivar tu propia cuenta'
      });
    }

    // Cambiar estado
    await user.update({ isActive: !user.isActive });

    res.json({
      success: true,
      message: `Usuario ${user.isActive ? 'activado' : 'desactivado'}`,
      data: user.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar permisos de administrador
 * @route   PUT /api/admin/administrators/:id/permissions
 * @access  Private/Admin (solo super admin)
 */
export const updateAdminPermissions = async (req, res) => {
  try {
    // Solo super admin puede modificar permisos
    if (req.user.adminLevel !== 'super') {
      return res.status(403).json({
        success: false,
        message: 'Solo super administradores pueden modificar permisos'
      });
    }

    const { id } = req.params;
    const { permissions, adminLevel } = req.body;

    const admin = await Administrador.findByPk(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrador no encontrado'
      });
    }

    // Actualizar permisos y/o nivel
    await admin.update({
      permissions: permissions || admin.permissions,
      adminLevel: adminLevel || admin.adminLevel
    });

    res.json({
      success: true,
      message: 'Permisos actualizados',
      data: admin.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar permisos',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener estadísticas de usuarios
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getUserStats = async (req, res) => {
  try {
    const clientesCount = await Cliente.count();
    const operadoresCount = await Operador.count();
    const administradoresCount = await Administrador.count();
    const activeCount = await User.count({ where: { isActive: true } });
    const inactiveCount = await User.count({ where: { isActive: false } });

    res.json({
      success: true,
      data: {
        clientes: clientesCount,
        operadores: operadoresCount,
        administradores: administradoresCount,
        total: clientesCount + operadoresCount + administradoresCount,
        activos: activeCount,
        inactivos: inactiveCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};
