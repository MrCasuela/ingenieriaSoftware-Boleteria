import { DataTypes } from 'sequelize';
import User from './User.js';
import sequelize from '../config/database.js';

/**
 * Modelo Operador - Hereda de Usuario
 * Operadores que validan tickets en eventos
 */
class Operador extends User {
  /**
   * Método para validar un ticket
   */
  async validateTicket(ticketId) {
    this.totalValidations += 1;
    await this.save();
    // La validación del ticket se registra en el modelo Ticket
    return this;
  }

  /**
   * Override del método toPublicJSON
   */
  toPublicJSON() {
    const baseData = super.toPublicJSON();
    return {
      ...baseData,
      employeeId: this.employeeId,
      totalValidations: this.totalValidations,
      shift: this.shift
    };
  }
}

Operador.init(
  {
    employeeId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'employee_id'
    },
    totalValidations: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_validations'
    },
    shift: {
      type: DataTypes.ENUM('mañana', 'tarde', 'noche', 'completo'),
      defaultValue: 'completo'
    }
  },
  {
    sequelize,
    modelName: 'Operador',
    tableName: 'users', // Misma tabla que User (Single Table Inheritance)
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: (operador) => {
        operador.userType = 'Operador';
      }
    }
  }
);

export default Operador;
