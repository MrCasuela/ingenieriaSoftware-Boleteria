import jwt from 'jsonwebtoken';
import { Cliente, Operador, Administrador } from '../models/index.js';

/**
 * Middleware para verificar token JWT
 */
export const protect = async (req, res, next) => {
  let token;

  // Obtener token del header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Verificar que existe el token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado - Token no proporcionado'
    });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario en los tres modelos
    let user = await Cliente.findByPk(decoded.id);
    if (!user) user = await Operador.findByPk(decoded.id);
    if (!user) user = await Administrador.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Usuario no encontrado'
      });
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Cuenta desactivada'
      });
    }

    // Agregar usuario al request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado - Token inválido',
      error: error.message
    });
  }
};

/**
 * Middleware para autorizar roles específicos
 * @param  {...string} roles - Roles permitidos (Cliente, Operador, Administrador)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: `No tienes permisos para acceder a este recurso. Se requiere rol: ${roles.join(' o ')}`
      });
    }

    next();
  };
};

/**
 * Middleware solo para Clientes
 */
export const clienteOnly = authorize('Cliente');

/**
 * Middleware solo para Operadores
 */
export const operadorOnly = authorize('Operador');

/**
 * Middleware solo para Administradores
 */
export const adminOnly = authorize('Administrador');

/**
 * Middleware para Operadores y Administradores
 */
export const operadorOrAdmin = authorize('Operador', 'Administrador');

/**
 * Middleware para verificar permisos específicos de administrador
 */
export const checkAdminPermission = (permission) => {
  return (req, res, next) => {
    if (req.user.userType !== 'Administrador') {
      return res.status(403).json({
        success: false,
        message: 'Solo administradores pueden realizar esta acción'
      });
    }

    // Si es super admin, tiene todos los permisos
    if (req.user.adminLevel === 'super') {
      return next();
    }

    // Verificar permiso específico
    const permissions = req.user.permissions || [];
    
    if (!permissions.includes(permission) && !permissions.includes('full_access')) {
      return res.status(403).json({
        success: false,
        message: `No tienes permiso para: ${permission}`
      });
    }

    next();
  };
};
