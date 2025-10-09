import Ticket from '../models/Ticket.js';
import TicketType from '../models/TicketType.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

/**
 * Obtener todos los tickets
 */
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'first_name', 'last_name']
        },
        {
          model: TicketType,
          as: 'ticketType',
          include: [{
            model: Event,
            as: 'event',
            attributes: ['id', 'name', 'date', 'location']
          }]
        }
      ],
      order: [['purchase_date', 'DESC']]
    });
    
    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tickets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener tickets por usuario
 */
export const getTicketsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const tickets = await Ticket.findAll({
      where: { user_id: userId },
      include: [
        {
          model: TicketType,
          as: 'ticketType',
          include: [{
            model: Event,
            as: 'event'
          }]
        }
      ],
      order: [['purchase_date', 'DESC']]
    });
    
    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error('Error al obtener tickets del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tickets del usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener un ticket por código
 */
export const getTicketByCode = async (req, res) => {
  try {
    const { ticketCode } = req.params;
    
    const ticket = await Ticket.findOne({
      where: { ticket_code: ticketCode },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'first_name', 'last_name']
        },
        {
          model: TicketType,
          as: 'ticketType',
          include: [{
            model: Event,
            as: 'event'
          }]
        }
      ]
    });
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error al obtener ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Crear un nuevo ticket (compra)
 */
export const createTicket = async (req, res) => {
  try {
    const ticketData = req.body;
    
    // Validar datos requeridos
    if (!ticketData.user_id || !ticketData.ticket_type_id || !ticketData.ticket_code) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos (user_id, ticket_type_id, ticket_code)'
      });
    }
    
    // Verificar que el tipo de ticket existe y tiene capacidad
    const ticketType = await TicketType.findByPk(ticketData.ticket_type_id);
    if (!ticketType) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de ticket no encontrado'
      });
    }
    
    if (ticketType.available_capacity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay capacidad disponible para este tipo de ticket'
      });
    }
    
    // Verificar que el usuario existe
    const user = await User.findByPk(ticketData.user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Crear el ticket
    const ticket = await Ticket.create({
      ...ticketData,
      purchase_date: ticketData.purchase_date || new Date(),
      status: ticketData.status || 'active',
      is_used: false
    });
    
    // Reducir la capacidad disponible
    await ticketType.decrement('available_capacity', { by: 1 });
    
    // Actualizar el evento también
    const event = await Event.findByPk(ticketType.event_id);
    if (event) {
      await event.decrement('available_capacity', { by: 1 });
    }
    
    res.status(201).json({
      success: true,
      message: 'Ticket creado exitosamente',
      data: ticket
    });
  } catch (error) {
    console.error('Error al crear ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Validar/Usar un ticket (para operadores)
 */
export const validateTicket = async (req, res) => {
  try {
    const { ticketCode } = req.params;
    const { operatorId } = req.body;
    
    const ticket = await Ticket.findOne({
      where: { ticket_code: ticketCode },
      include: [
        {
          model: TicketType,
          as: 'ticketType',
          include: [{
            model: Event,
            as: 'event'
          }]
        }
      ]
    });
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }
    
    if (ticket.is_used) {
      return res.status(400).json({
        success: false,
        message: 'Este ticket ya fue utilizado',
        data: {
          usedAt: ticket.used_at,
          validatedBy: ticket.validated_by
        }
      });
    }
    
    if (ticket.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Este ticket está cancelado'
      });
    }
    
    // Marcar como usado
    await ticket.update({
      is_used: true,
      used_at: new Date(),
      validated_by: operatorId
    });
    
    res.json({
      success: true,
      message: 'Ticket validado exitosamente',
      data: ticket
    });
  } catch (error) {
    console.error('Error al validar ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cancelar un ticket
 */
export const cancelTicket = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ticket = await Ticket.findByPk(id, {
      include: [{
        model: TicketType,
        as: 'ticketType'
      }]
    });
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }
    
    if (ticket.is_used) {
      return res.status(400).json({
        success: false,
        message: 'No se puede cancelar un ticket ya utilizado'
      });
    }
    
    // Cancelar el ticket
    await ticket.update({ status: 'cancelled' });
    
    // Devolver la capacidad
    if (ticket.ticketType) {
      await ticket.ticketType.increment('available_capacity', { by: 1 });
      
      const event = await Event.findByPk(ticket.ticketType.event_id);
      if (event) {
        await event.increment('available_capacity', { by: 1 });
      }
    }
    
    res.json({
      success: true,
      message: 'Ticket cancelado exitosamente',
      data: ticket
    });
  } catch (error) {
    console.error('Error al cancelar ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
