import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Modelo TicketType (Tipo de Entrada)
 */
class TicketType extends Model {
  /**
   * Decrementar disponibilidad
   */
  async decrementAvailable(quantity = 1) {
    if (this.available < quantity) {
      throw new Error('No hay suficientes entradas disponibles');
    }
    this.available -= quantity;
    await this.save();
    return this;
  }

  /**
   * Incrementar disponibilidad (cancelaciones)
   */
  async incrementAvailable(quantity = 1) {
    this.available += quantity;
    await this.save();
    return this;
  }
}

TicketType.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'event_id',
      references: {
        model: 'events',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre del tipo de entrada es obligatorio'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'El precio no puede ser negativo'
        }
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'La cantidad no puede ser negativa'
        }
      }
    },
    available: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    features: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  },
  {
    sequelize,
    modelName: 'TicketType',
    tableName: 'ticket_types',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['event_id']
      }
    ],
    hooks: {
      beforeCreate: (ticketType) => {
        if (ticketType.available === undefined || ticketType.available === null) {
          ticketType.available = ticketType.quantity;
        }
      }
    }
  }
);

export default TicketType;
