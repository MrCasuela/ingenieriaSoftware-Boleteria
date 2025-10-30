import jwt from 'jsonwebtoken';
import { User, Cliente, Operador, Administrador } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Generar JWT Token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * @desc    Registrar nuevo cliente
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerCliente = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, document } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await Cliente.findOne({ 
      where: {
        [Op.or]: [{ email }, { document }]
      }
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email o RUT ya está registrado'
      });
    }

    // Crear nuevo cliente
    const cliente = await Cliente.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      document
    });

    // Generar token
    const token = generateToken(cliente.id);

    res.status(201).json({
      success: true,
      message: 'Cliente registrado exitosamente',
      data: {
        user: cliente.toPublicJSON(),
        token
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar cliente',
      error: error.message
    });
  }
};

/**
 * @desc    Login de usuario
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  console.log('🚀 INICIO DE LOGIN FUNCTION');
  try {
    const { email, password, userType: userTypeParam, user_type } = req.body;
    const userType = userTypeParam || user_type; // Aceptar ambos formatos
    console.log('📝 Datos recibidos - Email:', email, 'UserType:', userType);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son obligatorios'
      });
    }

    // Buscar usuario según tipo en la tabla base users
    const user = await User.findOne({ 
      where: { 
        email,
        userType: userType || 'Cliente' // Por defecto Cliente si no se especifica
      } 
    });

    console.log('👤 Usuario encontrado:', user ? 'SÍ' : 'NO');
    console.log('📧 Email:', user?.email);
    console.log('🔧 Tiene comparePassword?:', typeof user?.comparePassword);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar password
    console.log('🔍 Verificando contraseña...');
    console.log('Password recibido:', password);
    console.log('Password en BD:', user.password);
    console.log('Tipo de comparePassword:', typeof user.comparePassword);
    
    const isMatch = await user.comparePassword(password);
    console.log('Resultado de comparación:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si está activo
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Cuenta desactivada'
      });
    }

    // Actualizar último login si es administrador
    if (user.userType === 'Administrador') {
      user.lastLogin = new Date();
      await user.save();
    }

    // Generar token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: user.toPublicJSON(),
        token
      }
    });

  } catch (error) {
    console.error('❌ ERROR EN LOGIN:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error en login',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener perfil del usuario actual
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.toPublicJSON()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar perfil
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'phone'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field]) {
        updates[field] = req.body[field];
      }
    });

    const user = await req.user.constructor.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: user.toPublicJSON()
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
};
