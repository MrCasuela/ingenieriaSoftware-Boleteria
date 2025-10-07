import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database.js';

/**
 * Modelo Ticket (Entrada comprada)
 */
class Ticket extends Model {
  /**
   * Validar ticket
   */
  async validate(operatorId) {
    if (this.status === 'validated') {
      throw new Error('Este ticket ya ha sido validado');
    }
    if (this.status === 'cancelled') {
      throw new Error('Este ticket ha sido cancelado');
    }
    
    this.status = 'validated';
    this.validatedBy = operatorId;
    this.validatedAt = new Date();
    await this.save();
    return this;
  }

  /**
   * Cancelar ticket
   */
  async cancel() {
    if (this.status === 'validated') {
      throw new Error('No se puede cancelar un ticket ya validado');
    }
    
    this.status = 'cancelled';
    await this.save();
    return this;
  }
}

Ticket.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ticketCode: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      field: 'ticket_code',
      defaultValue: () => `TKT-${uuidv4().split('-')[0].toUpperCase()}`
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
    ticketTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'ticket_type_id',
      references: {
        model: 'ticket_types',
        key: 'id'
      }
    },
    buyerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'buyer_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    serviceCharge: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 5.00,
      field: 'service_charge'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount'
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'validated', 'cancelled', 'refunded'),
      defaultValue: 'paid'
    },
    qrData: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'qr_data'
    },
    validatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'validated_by',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    validatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'validated_at'
    },
    purchaseDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'purchase_date'
    },
    paymentMethod: {
      type: DataTypes.ENUM('credit_card', 'debit_card', 'transfer', 'cash'),
      defaultValue: 'credit_card',
      field: 'payment_method'
    },
    paymentDetails: {
      type: DataTypes.JSON,
      defaultValue: {},
      field: 'payment_details'
    },
    additionalInfo: {
      type: DataTypes.JSON,
      defaultValue: {},
      field: 'additional_info'
    }
  },
  {
    sequelize,
    modelName: 'Ticket',
    tableName: 'tickets',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['ticket_code']
      },
      {
        fields: ['buyer_id']
      },
      {
        fields: ['event_id', 'status']
      }
    ],
    hooks: {
      beforeSave: (ticket) => {
        if (ticket.changed('price') || ticket.changed('quantity') || ticket.changed('serviceCharge')) {
          ticket.totalAmount = (parseFloat(ticket.price) * ticket.quantity) + parseFloat(ticket.serviceCharge);
        }
      }
    }
  }
);

export default Ticket;
