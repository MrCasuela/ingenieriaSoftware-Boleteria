import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// Middleware para autenticar por token JWT (si el proyecto usa JWT)
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ success: false, message: 'No autorizado', error: error.message });
  }
};

// Middleware para autorizar por rol(s) permitidos
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      // user.userType viene del modelo y puede ser 'Cliente','Operador','Administrador'
      const normalized = (user.userType || '').toString().toLowerCase();
      const allowed = allowedRoles.map(r => r.toString().toLowerCase());

      if (!allowed.includes(normalized)) {
        return res.status(403).json({ success: false, message: 'Acceso denegado' });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ success: false, message: 'Error en autorización' });
    }
  };
};
