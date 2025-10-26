import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * Endpoint de diagnóstico para verificar el estado de un usuario
 */
router.get('/check-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.json({
        found: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Información detallada del usuario
    const userInfo = {
      found: true,
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      isActive: user.isActive,
      isActive_raw: user.get('is_active'),
      isActive_dataValue: user.dataValues.is_active,
      allDataValues: user.dataValues
    };
    
    res.json(userInfo);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

/**
 * Endpoint para verificar un token JWT
 */
router.post('/check-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.json({ valid: false, message: 'No se proporcionó token' });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key-12345');
    
    // Buscar usuario
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.json({
        valid: false,
        decoded,
        message: 'Usuario del token no encontrado'
      });
    }
    
    res.json({
      valid: true,
      decoded,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        isActive: user.isActive,
        isActive_raw: user.get('is_active'),
        isActive_dataValue: user.dataValues.is_active
      }
    });
  } catch (error) {
    res.json({
      valid: false,
      error: error.message
    });
  }
});

/**
 * Endpoint para activar un usuario
 */
router.post('/activate-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Activar usuario
    user.isActive = true;
    await user.save();
    
    res.json({
      success: true,
      message: 'Usuario activado correctamente',
      user: {
        id: user.id,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
