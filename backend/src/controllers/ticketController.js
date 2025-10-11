import Ticket from '../models/Ticket.js';
import TicketType from '../models/TicketType.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import sequelize from '../config/database.js';
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
 * Obtener tickets por RUT del usuario
 */
export const getTicketsByRut = async (req, res) => {
  try {
    const { rut } = req.params;
    // Buscar usuario por RUT
    const user = await User.findOne({
      where: { rut: rut }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró usuario con este RUT',
        tickets: []
      });
    }
    
    
    // Buscar tickets del usuario
    const tickets = await Ticket.findAll({
      where: { user_id: user.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'first_name', 'last_name', 'rut']
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
    
    console.log(`📋 Tickets encontrados: ${tickets.length}`);
    
    // Formatear tickets para el frontend (compatible con ticketStore)
    const formattedTickets = tickets.map(ticket => ({
      id: ticket.id,
      codigo: ticket.ticket_code,
      nombre: `${user.first_name} ${user.last_name}`,
      rut: user.rut,
      email: user.email,
      evento: ticket.ticketType?.event?.name || 'Evento desconocido',
      tipo: ticket.ticketType?.name || 'Tipo desconocido',
      precio: ticket.ticketType?.price || 0,
      usado: ticket.is_used,
      fechaUso: ticket.used_at,
      fechaCompra: ticket.purchase_date,
      validadoPor: ticket.validated_by
    }));
    
    res.json({
      success: true,
      tickets: formattedTickets,
      user: {
        id: user.id,
        nombre: `${user.first_name} ${user.last_name}`,
        rut: user.rut,
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ Error al buscar tickets por RUT:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar tickets por RUT',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Crear un nuevo ticket (compra)
 */
export const createTicket = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const ticketData = req.body;
    
    // Validar datos requeridos
    if (!ticketData.user_id || !ticketData.ticket_type_id || !ticketData.ticket_code) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos (user_id, ticket_type_id, ticket_code)'
      });
    }
    
    // Cantidad a comprar (por defecto 1)
    const quantity = ticketData.quantity || 1;
    
    // Verificar que el tipo de ticket existe y tiene capacidad
    const ticketType = await TicketType.findByPk(ticketData.ticket_type_id, { 
      transaction,
      lock: transaction.LOCK.UPDATE 
    });
    
    if (!ticketType) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Tipo de ticket no encontrado'
      });
    }
    
    // Verificar capacidad disponible
    if (ticketType.available_capacity < quantity) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Solo hay ${ticketType.available_capacity} tickets disponibles de este tipo`
      });
    }
    
    // Verificar que el usuario existe
    const user = await User.findByPk(ticketData.user_id, { transaction });
    if (!user) {
      await transaction.rollback();
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
      is_used: false,
      quantity: quantity
    }, { transaction });
    
    // Reducir la capacidad disponible del tipo de ticket
    await ticketType.decrement('available_capacity', { 
      by: quantity,
      transaction 
    });
    
    // Actualizar el evento también
    const event = await Event.findByPk(ticketType.event_id, { 
      transaction,
      lock: transaction.LOCK.UPDATE 
    });
    
    if (event) {
      await event.decrement('available_capacity', { 
        by: quantity,
        transaction 
      });
    }
    
    // Confirmar transacción
    await transaction.commit();
    
    // Recargar ticket con asociaciones
    const fullTicket = await Ticket.findByPk(ticket.id, {
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
    
    res.status(201).json({
      success: true,
      message: 'Ticket creado exitosamente',
      data: fullTicket
    });
  } catch (error) {
    await transaction.rollback();
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
