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

// Cliente - Ticket (1:N) - Comprador
Cliente.hasMany(Ticket, {
  foreignKey: 'buyerId',
  as: 'purchasedTickets'
});
Ticket.belongsTo(Cliente, {
  foreignKey: 'buyerId',
  as: 'buyer'
});

// Operador - Ticket (1:N) - Validador
Operador.hasMany(Ticket, {
  foreignKey: 'validatedBy',
  as: 'validatedTickets'
});
Ticket.belongsTo(Operador, {
  foreignKey: 'validatedBy',
  as: 'validator'
});

// Administrador - Event (1:N) - Organizador
Administrador.hasMany(Event, {
  foreignKey: 'organizerId',
  as: 'organizedEvents'
});
Event.belongsTo(Administrador, {
  foreignKey: 'organizerId',
  as: 'organizer'
});

export {
  User,
  Cliente,
  Operador,
  Administrador,
  Event,
  TicketType,
  Ticket
};
