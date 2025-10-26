/**
 * Índice de modelos
 * Exporta todos los modelos de la aplicación y define las relaciones
 */

import User from './User.js';
import Cliente from './Cliente.js';
import Operador from './Operador.js';
import Administrador from './Administrador.js';
import Event from './Event.js';
import TicketType from './TicketType.js';
import Ticket from './Ticket.js';
import AuditLog from './AuditLog.js';

/**
 * Definir relaciones entre modelos
 */

// Event - TicketType (1:N)
Event.hasMany(TicketType, {
  foreignKey: 'eventId',
  as: 'ticketTypes',
  onDelete: 'CASCADE'
});
TicketType.belongsTo(Event, {
  foreignKey: 'eventId',
  as: 'event'
});

// Event - Ticket (1:N)
Event.hasMany(Ticket, {
  foreignKey: 'eventId',
  as: 'tickets',
  onDelete: 'CASCADE'
});
Ticket.belongsTo(Event, {
  foreignKey: 'eventId',
  as: 'event'
});

// TicketType - Ticket (1:N)
TicketType.hasMany(Ticket, {
  foreignKey: 'ticketTypeId',
  as: 'tickets'
});
Ticket.belongsTo(TicketType, {
  foreignKey: 'ticketTypeId',
  as: 'ticketType'
});

// User - Ticket (1:N) - Comprador
User.hasMany(Ticket, {
  foreignKey: 'buyerId',
  as: 'tickets'
});
Ticket.belongsTo(User, {
  foreignKey: 'buyerId',
  as: 'user'
});

// User - Ticket (1:N) - Validador
User.hasMany(Ticket, {
  foreignKey: 'validatedBy',
  as: 'validatedTickets'
});
Ticket.belongsTo(User, {
  foreignKey: 'validatedBy',
  as: 'operatorValidator'
});

// User - Ticket (1:N) - Validador general (para reportes)
User.hasMany(Ticket, {
  foreignKey: 'validatedBy',
  as: 'validatedTickets'
});
Ticket.belongsTo(User, {
  foreignKey: 'validatedBy',
  as: 'validator'
});

// Event - AuditLog (1:N)
Event.hasMany(AuditLog, {
  foreignKey: 'event_id',
  as: 'auditLogs'
});
AuditLog.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event'
});

export {
  User,
  Cliente,
  Operador,
  Administrador,
  Event,
  TicketType,
  Ticket,
  AuditLog
};
