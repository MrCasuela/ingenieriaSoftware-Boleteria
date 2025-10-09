import User from '../models/User.js';
import bcrypt from 'bcryptjs';

/**
 * Obtener todos los usuarios
 */
export const getAllUsers = async (req, res) => {
  try {
    const { userType } = req.query;
    
    const where = {};
    if (userType) {
      where.user_type = userType;
    }
    
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] }, // No enviar contraseñas
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener un usuario por ID
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Crear un nuevo usuario
 */
export const createUser = async (req, res) => {
  try {
    const userData = req.body;
    
    // Validar datos requeridos
    if (!userData.email || !userData.password || !userData.first_name || !userData.last_name || !userData.user_type) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos (email, password, first_name, last_name, user_type)'
      });
    }
    
    // Verificar que el email no exista
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await User.create({
      ...userData,
      password: hashedPassword
    });
    
    // No devolver la contraseña
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: userResponse
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Actualizar un usuario
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Si se está actualizando la contraseña, hashearla
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    await user.update(userData);
    
    // No devolver la contraseña
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: userResponse
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Eliminar un usuario
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    await user.destroy();
    
    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Login de usuario
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password, user_type } = req.body;
    
    if (!email || !password || !user_type) {
      return res.status(400).json({
        success: false,
        message: 'Email, contraseña y tipo de usuario son requeridos'
      });
    }
    
    // Buscar usuario por email y tipo
    const user = await User.findOne({
      where: {
        email,
        user_type
      }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Verificar que el usuario esté activo
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }
    
    // Actualizar último login
    await user.update({ lastLogin: new Date() });
    
    // No devolver la contraseña
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: userResponse
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
