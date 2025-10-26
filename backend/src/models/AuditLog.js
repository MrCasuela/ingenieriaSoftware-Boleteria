import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Modelo para el registro de auditoría de validaciones de tickets
 * Almacena todos los eventos de validación (exitosos y fallidos)
 */
const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Código del ticket validado
  ticket_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Código del ticket (TKT-XXXXX) o RUT del usuario'
  },
  
  // Operador que realizó la validación
  operator_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre del operador que realizó la validación'
  },
  
  operator_email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Email del operador'
  },
  
  // Resultado de la validación
  validation_result: {
    type: DataTypes.ENUM('approved', 'rejected', 'error'),
    allowNull: false,
    defaultValue: 'approved',
    comment: 'Resultado: approved, rejected, error'
  },
  
  // Tipo de validación realizada
  validation_type: {
    type: DataTypes.ENUM('qr', 'manual', 'rut'),
    allowNull: false,
    comment: 'Tipo: qr (escáner), manual (código), rut (búsqueda por RUT)'
  },
  
  // Información del evento
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID del evento asociado'
  },
  
  event_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Nombre del evento'
  },
  
  // Información del ticket
  ticket_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Tipo de ticket: VIP, General, etc.'
  },
  
  ticket_category: {
    type: DataTypes.ENUM('normal', 'vip', 'general', 'premium', 'other'),
    allowNull: true,
    defaultValue: 'normal',
    comment: 'Categoría del ticket para estadísticas'
  },
  
  // Detalles del usuario del ticket
  user_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Nombre completo del usuario del ticket'
  },
  
  user_rut: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'RUT del usuario del ticket'
  },
  
  // Mensaje descriptivo
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Mensaje descriptivo del resultado de la validación'
  },
  
  // Razón del rechazo
  rejection_reason: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Razón por la cual se rechazó (ticket usado, inválido, etc.)'
  },
  
  // Detección de fraude
  fraud_detected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indica si se detectó un intento de fraude'
  },
  
  // Metadata adicional (JSON)
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Información adicional en formato JSON'
  },
  
  // IP y datos de sesión
  ip_address: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Dirección IP desde donde se realizó la validación'
  },
  
  user_agent: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'User agent del navegador'
  },
  
  // Timestamp
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha y hora exacta de la validación'
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  indexes: [
    {
      fields: ['ticket_code']
    },
    {
      fields: ['operator_email']
    },
    {
      fields: ['event_id']
    },
    {
      fields: ['validation_result']
    },
    {
      fields: ['validation_type']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['ticket_category']
    }
  ]
});

// Métodos estáticos útiles
AuditLog.getStatsByEvent = async function(eventId) {
  const stats = await this.findAll({
    where: { event_id: eventId },
    attributes: [
      'validation_result',
      'validation_type',
      'ticket_category',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['validation_result', 'validation_type', 'ticket_category']
  });
  
  return stats;
};

AuditLog.getRecentLogs = async function(limit = 50) {
  return await this.findAll({
    order: [['timestamp', 'DESC']],
    limit
  });
};

export default AuditLog;
