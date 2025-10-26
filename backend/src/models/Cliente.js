import { DataTypes } from 'sequelize';
import User from './User.js';
import sequelize from '../config/database.js';

/**
 * Modelo Cliente - Hereda de Usuario
 * Clientes que compran tickets
 */
class Cliente extends User {
  /**
   * Método para agregar una compra al historial
   */
  async addPurchase(ticketId, amount) {
    this.totalPurchases += 1;
    this.totalSpent += amount;
    await this.save();
    // La relación con tickets se maneja por el modelo Ticket
    return this;
  }

  /**
   * Override del método toPublicJSON
   */
  toPublicJSON() {
    const baseData = super.toPublicJSON();
    return {
      ...baseData,
      document: this.document,
      totalPurchases: this.totalPurchases,
      totalSpent: this.totalSpent,
      preferences: this.preferences
    };
  }
}

Cliente.init(
  {
    document: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true,
      validate: {
        is: {
          args: /^\d{7,8}-[\dkK]$/,
          msg: 'RUT inválido (formato: 12345678-9)'
        }
      }
    },
    totalPurchases: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_purchases'
    },
    totalSpent: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      field: 'total_spent'
    },
    preferences: {
      type: DataTypes.JSON,
      defaultValue: {
        notifications: true,
        newsletter: false
      }
    }
  },
  {
    sequelize,
    modelName: 'Cliente',
    tableName: 'users', // Misma tabla que User (Single Table Inheritance)
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: (cliente) => {
        cliente.userType = 'Cliente';
      }
    }
  }
);

export default Cliente;
