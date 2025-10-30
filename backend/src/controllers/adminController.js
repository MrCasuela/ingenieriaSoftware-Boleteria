import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import TicketType from '../models/TicketType.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';


/**
 * @desc    Obtener todos los usuarios (solo para administradores)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsersAdmin = async (req, res) => {
  try {
    // Obtener todos los usuarios
    const allUsers = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    // Separar por tipo
    const clientes = allUsers.filter(u => u.userType === 'Cliente');
    const operadores = allUsers.filter(u => u.userType === 'Operador');
    const administradores = allUsers.filter(u => u.userType === 'Administrador');

    res.json({
      success: true,
      data: {
        clientes,
        operadores,
        administradores,
        total: allUsers.length
      }
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
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
    const { email, password, firstName, lastName, phone } = req.body;

    // Validaciones básicas
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, firstName y lastName son requeridos'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear nuevo operador usando el modelo User
    const operador = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || '',
      userType: 'Operador',
      isActive: true
    });

    // Remover password de la respuesta
    const operadorData = operador.toJSON();
    delete operadorData.password;

    res.status(201).json({
      success: true,
      message: 'Operador creado exitosamente',
      data: operadorData
    });
  } catch (error) {
    console.error('Error al crear operador:', error);
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
    const { email, password, firstName, lastName, phone } = req.body;

    // Validaciones básicas
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, firstName y lastName son requeridos'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear nuevo administrador usando el modelo User
    const administrador = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || '',
      userType: 'Administrador',
      isActive: true
    });

    // Remover password de la respuesta
    const administradorData = administrador.toJSON();
    delete administradorData.password;

    res.status(201).json({
      success: true,
      message: 'Administrador creado exitosamente',
      data: administradorData
    });
  } catch (error) {
    console.error('Error al crear administrador:', error);
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
    const { newRole, ...updateData } = req.body;

    // Buscar usuario actual usando el modelo User
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar el rol y otros datos
    await user.update({
      ...updateData,
      userType: newRole
    });

    // Remover password de la respuesta
    const userDataResponse = user.toJSON();
    delete userDataResponse.password;

    res.json({
      success: true,
      message: `Usuario actualizado a ${newRole}`,
      data: userDataResponse
    });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
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

    // Buscar usuario usando el modelo User
    const user = await User.findByPk(id);

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
    const clientesCount = await User.count({ where: { userType: 'Cliente' } });
    const operadoresCount = await User.count({ where: { userType: 'Operador' } });
    const administradoresCount = await User.count({ where: { userType: 'Administrador' } });
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
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};


/**
 * @desc    Obtener reporte de asistencia con filtros
 * @route   GET /api/admin/reports/attendance
 * @access  Private/Admin
 */
export const getAttendanceReport = async (req, res) => {
  try {
    const { 
      eventId, 
      startDate, 
      endDate, 
      status,
      sector,
      ticketTypeId,
      operatorId 
    } = req.query;

    // Construir filtros dinámicos
    const whereClause = {};
    
    if (eventId) {
      whereClause.eventId = eventId;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (ticketTypeId) {
      whereClause.ticketTypeId = ticketTypeId;
    }
    
    if (operatorId) {
      whereClause.validatedBy = operatorId;
    }
    
    // Filtro de fechas
    if (startDate || endDate) {
      whereClause.validatedAt = {};
      if (startDate) {
        whereClause.validatedAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.validatedAt[Op.lte] = new Date(endDate);
      }
    }

    // Obtener tickets con datos relacionados
    const tickets = await Ticket.findAll({
      where: whereClause,
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'name', 'date', 'venue', 'category']
        },
        {
          model: TicketType,
          as: 'ticketType',
          attributes: ['id', 'name', 'sector', 'price']
        },
        {
          model: User,
          as: 'validator',
          attributes: ['id', 'firstName', 'lastName', 'userType']
        }
      ],
      order: [['validatedAt', 'DESC']]
    });

    // Calcular estadísticas en tiempo real
    const stats = {
      totalTickets: tickets.length,
      validated: tickets.filter(t => t.status === 'validated').length,
      pending: tickets.filter(t => t.status === 'pending' || t.status === 'paid').length,
      cancelled: tickets.filter(t => t.status === 'cancelled').length,
      totalRevenue: tickets.reduce((sum, t) => sum + parseFloat(t.totalAmount || 0), 0)
    };

    // Agrupar por evento
    const byEvent = tickets.reduce((acc, ticket) => {
      const eventName = ticket.event?.name || 'Sin evento';
      if (!acc[eventName]) {
        acc[eventName] = {
          event: ticket.event,
          count: 0,
          validated: 0,
          revenue: 0
        };
      }
      acc[eventName].count++;
      if (ticket.status === 'validated') {
        acc[eventName].validated++;
      }
      acc[eventName].revenue += parseFloat(ticket.totalAmount || 0);
      return acc;
    }, {});

    // Agrupar por sector
    const bySector = tickets.reduce((acc, ticket) => {
      const sector = ticket.ticketType?.sector || 'Sin sector';
      if (!acc[sector]) {
        acc[sector] = {
          count: 0,
          validated: 0,
          revenue: 0
        };
      }
      acc[sector].count++;
      if (ticket.status === 'validated') {
        acc[sector].validated++;
      }
      acc[sector].revenue += parseFloat(ticket.totalAmount || 0);
      return acc;
    }, {});

    // Agrupar por operador
    const byOperator = tickets.reduce((acc, ticket) => {
      if (ticket.validatedBy) {
        const operatorName = ticket.validator 
          ? `${ticket.validator.firstName} ${ticket.validator.lastName}` 
          : `Operador ${ticket.validatedBy}`;
        
        if (!acc[operatorName]) {
          acc[operatorName] = {
            count: 0,
            lastValidation: null
          };
        }
        acc[operatorName].count++;
        
        if (!acc[operatorName].lastValidation || 
            new Date(ticket.validatedAt) > new Date(acc[operatorName].lastValidation)) {
          acc[operatorName].lastValidation = ticket.validatedAt;
        }
      }
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        tickets: tickets.map(t => ({
          id: t.id,
          ticketCode: t.ticketCode,
          eventName: t.event?.name,
          eventDate: t.event?.date,
          sector: t.ticketType?.sector,
          ticketType: t.ticketType?.name,
          price: t.price,
          totalAmount: t.totalAmount,
          status: t.status,
          buyerName: t.buyerName,
          buyerEmail: t.buyerEmail,
          buyerDocument: t.buyerDocument,
          validatedBy: t.validator 
            ? `${t.validator.firstName} ${t.validator.lastName}` 
            : null,
          validatedAt: t.validatedAt,
          purchaseDate: t.purchaseDate
        })),
        stats,
        byEvent: Object.entries(byEvent).map(([name, data]) => ({
          eventName: name,
          eventDate: data.event?.date,
          venue: data.event?.venue,
          totalCheckins: data.count,
          validated: data.validated,
          revenue: data.revenue
        })),
        bySector: Object.entries(bySector).map(([sector, data]) => ({
          sector,
          totalCheckins: data.count,
          validated: data.validated,
          revenue: data.revenue
        })),
        byOperator: Object.entries(byOperator).map(([name, data]) => ({
          operatorName: name,
          totalValidations: data.count,
          lastValidation: data.lastValidation
        })),
        filters: {
          eventId,
          startDate,
          endDate,
          status,
          sector,
          ticketTypeId,
          operatorId
        },
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error en getAttendanceReport:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reporte de asistencia',
      error: error.message
    });
  }
};

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

    // Crear nuevo cliente
    const cliente = await Cliente.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      document,
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

