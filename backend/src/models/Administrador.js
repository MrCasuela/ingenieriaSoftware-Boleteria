import { DataTypes } from 'sequelize';
import User from './User.js';
import sequelize from '../config/database.js';

/**
 * Modelo Administrador - Hereda de Usuario
 * Administradores con permisos completos del sistema
 */
class Administrador extends User {
  /**
   * Método para verificar permiso
   */
  hasPermission(permission) {
    const permissions = JSON.parse(this.permissions || '[]');
    return permissions.includes(permission) || 
           permissions.includes('full_access') ||
           this.adminLevel === 'super';
  }

  /**
   * Método para actualizar último login
   */
  async updateLastLogin() {
    this.lastLogin = new Date();
    await this.save();
    return this;
  }

  /**
   * Override del método toPublicJSON
   */
  toPublicJSON() {
    const baseData = super.toPublicJSON();
    return {
      ...baseData,
      adminLevel: this.adminLevel,
      permissions: JSON.parse(this.permissions || '[]'),
      lastLogin: this.lastLogin
    };
  }
}

Administrador.init(
  {
    adminLevel: {
      type: DataTypes.ENUM('super', 'moderador', 'soporte'),
      defaultValue: 'moderador',
      field: 'admin_level'
    },
    permissions: {
      type: DataTypes.JSON,
      defaultValue: JSON.stringify([
        'manage_events',
        'view_reports',
        'manage_tickets'
      ])
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login'
    }
  },
  {
    sequelize,
    modelName: 'Administrador',
    tableName: 'users', // Misma tabla que User (Single Table Inheritance)
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: (admin) => {
        admin.userType = 'Administrador';
      }
    }
  }
);

export default Administrador;
