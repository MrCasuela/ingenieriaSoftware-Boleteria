import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Modelo Evento
 */
class Event extends Model {}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    organizerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'organizer_id'
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'El nombre del evento es obligatorio'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true
      }
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    venue: {
      type: DataTypes.JSON,
      defaultValue: {
        name: '',
        address: '',
        capacity: 0,
        city: '',
        country: ''
      }
    },
    image: {
      type: DataTypes.STRING(500),
      defaultValue: 'https://via.placeholder.com/400x200'
    },
    category: {
      type: DataTypes.ENUM('concierto', 'deportes', 'teatro', 'conferencia', 'festival', 'otro'),
      defaultValue: 'otro'
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'cancelled', 'completed'),
      defaultValue: 'published'
    },
    totalCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'total_capacity',
      validate: {
        min: {
          args: [1],
          msg: 'El aforo total debe ser mayor a 0'
        }
      }
    },
    totalSold: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_sold'
    },
    revenue: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00
    }
  },
  {
    sequelize,
    modelName: 'Event',
    tableName: 'events',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['date', 'status']
      },
      {
        fields: ['category']
      },
      {
        type: 'FULLTEXT',
        fields: ['name', 'description']
      }
    ]
  }
);

export default Event;
