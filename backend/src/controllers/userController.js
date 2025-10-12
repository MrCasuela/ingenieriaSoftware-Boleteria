import User from '../models/User.js';

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
    const rawData = req.body;
    console.log('📥 POST /api/users/register - Datos recibidos:', JSON.stringify(rawData, null, 2));
    
    // Normalizar los datos: aceptar tanto camelCase como snake_case
    const userData = {
      email: rawData.email,
      password: rawData.password,
      firstName: rawData.firstName || rawData.first_name,
      lastName: rawData.lastName || rawData.last_name,
      phone: rawData.phone,
      document: rawData.document,
      userType: rawData.userType || rawData.user_type
    };
    
    // Validar datos requeridos
    if (!userData.email || !userData.password || !userData.firstName || !userData.lastName || !userData.userType) {
      console.log('❌ Faltan datos requeridos:', {
        email: !!userData.email,
        password: !!userData.password,
        firstName: !!userData.firstName,
        lastName: !!userData.lastName,
        userType: !!userData.userType
      });
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos (email, password, firstName/first_name, lastName/last_name, userType/user_type)'
      });
    }
    
    // Verificar que el email no exista
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      console.log('⚠️ Email ya existe:', userData.email);
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }
    
    // Crear usuario (el hook beforeCreate hasheará la contraseña automáticamente)
    const user = await User.create(userData);
    
    console.log('✅ Usuario creado exitosamente:', user.id);
    
    // No devolver la contraseña
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: userResponse
    });
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
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
    
    // Actualizar usuario (el hook beforeUpdate hasheará la contraseña si cambió)
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
    const rawData = req.body;
    console.log('📥 POST /api/users/login - Datos recibidos:', JSON.stringify(rawData, null, 2));
    
    const email = rawData.email;
    const password = rawData.password;
    const userType = rawData.userType || rawData.user_type;
    
    if (!email || !password || !userType) {
      console.log('❌ Faltan datos de login:', { email: !!email, password: !!password, userType: !!userType });
      return res.status(400).json({
        success: false,
        message: 'Email, contraseña y tipo de usuario son requeridos'
      });
    }
    
    // Buscar usuario por email y tipo (usando camelCase para Sequelize)
    const user = await User.findOne({
      where: {
        email,
        userType
      }
    });
    
    if (!user) {
      console.log('❌ Usuario no encontrado:', { email, userType });
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Verificar contraseña (comparación directa sin hash)
    const isValidPassword = password === user.password;
    
    if (!isValidPassword) {
      console.log('❌ Contraseña inválida para:', email);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Verificar que el usuario esté activo
    if (!user.isActive) {
      console.log('⚠️ Usuario inactivo:', email);
      return res.status(403).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }
    
    console.log('✅ Login exitoso:', email);
    
    // No devolver la contraseña
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: userResponse
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en login',
      error: error.message
    });
  }
};
