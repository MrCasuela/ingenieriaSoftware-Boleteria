import Ticket from '../models/Ticket.js';
import TicketType from '../models/TicketType.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';
import { generateTicketPDF } from '../services/pdfService.js';
import { sendTicketEmail } from '../services/emailService.js';

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
    
    // Normalizar campos (aceptar camelCase y snake_case)
    const buyerId = ticketData.buyerId || ticketData.buyer_id || ticketData.user_id;
    const ticketTypeId = ticketData.ticketTypeId || ticketData.ticket_type_id;
    const eventId = ticketData.eventId || ticketData.event_id;
    const ticketCode = ticketData.ticketCode || ticketData.ticket_code;
    const quantity = ticketData.quantity || 1;
    const price = ticketData.price || ticketData.unit_price;
    const serviceCharge = ticketData.serviceCharge || ticketData.service_charge || 5.00;
    const totalAmount = ticketData.totalAmount || ticketData.total_amount || ticketData.final_price;
    const paymentMethod = ticketData.paymentMethod || ticketData.payment_method || 'tarjeta_credito';
    const paymentReference = ticketData.paymentReference || ticketData.payment_reference || ticketData.transaction_id;
    const qrCode = ticketData.qrCode || ticketData.qr_code;
    
    // Validar datos requeridos
    if (!buyerId || !ticketTypeId || !ticketCode) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos (buyerId/buyer_id, ticketTypeId/ticket_type_id, ticketCode/ticket_code)'
      });
    }
    
    // Verificar que el tipo de ticket existe y tiene capacidad
    const ticketType = await TicketType.findByPk(ticketTypeId, { 
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
    if (ticketType.available < quantity) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Solo hay ${ticketType.available} tickets disponibles de este tipo`
      });
    }
    
    // Verificar que el usuario existe
    const user = await User.findByPk(buyerId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Obtener el evento si no se proporcionó
    let finalEventId = eventId;
    if (!finalEventId) {
      finalEventId = ticketType.eventId;
    }
    
    // Crear el ticket con los campos correctos de la BD
    const ticket = await Ticket.create({
      ticketCode: ticketCode,
      eventId: finalEventId,
      ticketTypeId: ticketTypeId,
      buyerId: buyerId,
      quantity: quantity,
      price: price,
      serviceCharge: serviceCharge,
      totalAmount: totalAmount,
      status: ticketData.status || 'paid',
      paymentMethod: paymentMethod,
      paymentReference: paymentReference,
      qrCode: qrCode,
      // Datos del comprador para auditoría
      buyerName: ticketData.buyerName || ticketData.buyer_name,
      buyerEmail: ticketData.buyerEmail || ticketData.buyer_email,
      buyerDocument: ticketData.buyerDocument || ticketData.buyer_document,
      buyerPhone: ticketData.buyerPhone || ticketData.buyer_phone,
      purchaseDate: ticketData.purchaseDate || ticketData.purchase_date || new Date()
    }, { transaction });
    
    // Reducir la capacidad disponible del tipo de ticket
    await ticketType.update(
      { available: ticketType.available - quantity },
      { transaction }
    );
    
    // Actualizar el total vendido en el evento
    const event = await Event.findByPk(finalEventId, { 
      transaction,
      lock: transaction.LOCK.UPDATE 
    });
    
    if (event) {
      await event.update(
        { totalSold: (event.totalSold || 0) + quantity },
        { transaction }
      );
    }
    
    // Confirmar transacción
    await transaction.commit();
    
    // Recargar ticket con asociaciones
    const fullTicket = await Ticket.findByPk(ticket.id, {
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'email', 'firstName', 'lastName']
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
    
    // 🆕 ENVÍO AUTOMÁTICO DE EMAIL CON PDF
    try {
      console.log('📧 Generando y enviando email automáticamente...');
      
      // Generar PDF del ticket
      const pdfBuffer = await generateTicketPDF({
        ticketCode: ticket.ticketCode,
        eventName: event?.name || 'Evento',
        eventDate: event?.date || new Date(),
        eventLocation: event?.location || event?.venue?.name || 'Por confirmar',
        ticketTypeName: ticketType.name,
        quantity: quantity,
        price: price,
        totalAmount: totalAmount,
        buyerName: ticketData.buyerName || ticketData.buyer_name || `${user.firstName} ${user.lastName}`,
        buyerEmail: ticketData.buyerEmail || ticketData.buyer_email || user.email,
        buyerPhone: ticketData.buyerPhone || ticketData.buyer_phone || user.phone,
        buyerDocument: ticketData.buyerDocument || ticketData.buyer_document || user.rut
      });
      
      // Enviar email con PDF adjunto
      await sendTicketEmail({
        email: ticketData.buyerEmail || ticketData.buyer_email || user.email,
        firstName: user.firstName || ticketData.buyerName?.split(' ')[0] || 'Cliente',
        lastName: user.lastName || '',
        eventName: event?.name || 'Evento',
        ticketCode: ticket.ticketCode
      }, pdfBuffer);
      
      console.log('✅ Email enviado exitosamente a:', ticketData.buyerEmail || user.email);
    } catch (emailError) {
      // No bloquear la compra si falla el email
      console.error('⚠️ Error al enviar email (el ticket se creó correctamente):', emailError.message);
    }
    
    res.status(201).json({
      success: true,
      message: 'Ticket creado exitosamente',
      data: fullTicket
    });
  } catch (error) {
    // Solo hacer rollback si la transacción no ha sido completada
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error('Error al crear ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear ticket',
      error: error.message
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