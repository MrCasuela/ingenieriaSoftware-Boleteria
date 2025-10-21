import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Modelo base Usuario
 * Esta es la clase padre de la cual heredan Cliente, Operador y Administrador
 */
class User extends Model {
  /**
   * Método para obtener datos públicos del usuario
   */
  toPublicJSON() {
    const { password, ...publicData } = this.toJSON();
    return publicData;
  }

  /**
   * Obtener nombre completo
   */
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Email inválido'
        }
      },
      set(value) {
        this.setDataValue('email', value.toLowerCase().trim());
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [6, 255],
          msg: 'La contraseña debe tener al menos 6 caracteres'
        }
      }
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'first_name',
      validate: {
        notEmpty: {
          msg: 'El nombre es obligatorio'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'last_name',
      validate: {
        notEmpty: {
          msg: 'El apellido es obligatorio'
        }
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    userType: {
      type: DataTypes.ENUM('Cliente', 'Operador', 'Administrador'),
      allowNull: false,
      field: 'user_type'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true
  }
);

export default User;
