import TicketType from '../models/TicketType.js';
import Event from '../models/Event.js';
import logger from '../utils/logger.js';

/**
 * Obtener todos los tipos de tickets
 */
export const getAllTicketTypes = async (req, res) => {
  try {
    const ticketTypes = await TicketType.findAll({
      order: [['created_at', 'DESC']]
    });
    
    // Mapear campos del modelo al formato de API
    const mappedTicketTypes = ticketTypes.map(tt => ({
      id: tt.id,
      event_id: tt.eventId,
      name: tt.name,
      description: tt.description,
      price: tt.price,
      total_capacity: tt.quantity,
      available_capacity: tt.available,
      sold_tickets: tt.quantity - tt.available,
      created_at: tt.createdAt,
      updated_at: tt.updatedAt
    }));
    
    res.json({
      success: true,
      data: mappedTicketTypes
    });
  } catch (error) {
    console.error('Error al obtener tipos de tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipos de tickets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener tipos de tickets por evento
 */
export const getTicketTypesByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const ticketTypes = await TicketType.findAll({
      where: { eventId: eventId },
      order: [['price', 'ASC']]
    });
    
    // Mapear campos del modelo al formato de API
    const mappedTicketTypes = ticketTypes.map(tt => ({
      id: tt.id,
      event_id: tt.eventId,
      name: tt.name,
      description: tt.description,
      price: tt.price,
      total_capacity: tt.quantity,
      available_capacity: tt.available,
      sold_tickets: tt.quantity - tt.available,
      created_at: tt.createdAt,
      updated_at: tt.updatedAt
    }));
    
    res.json({
      success: true,
      data: mappedTicketTypes
    });
  } catch (error) {
    console.error('Error al obtener tipos de tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipos de tickets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener un tipo de ticket por ID
 */
export const getTicketTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticketType = await TicketType.findByPk(id, {
      include: [{
        model: Event,
        as: 'event'
      }]
    });
    
    if (!ticketType) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de ticket no encontrado'
      });
    }
    
    // Mapear campos del modelo al formato de API
    const mappedTicketType = {
      id: ticketType.id,
      event_id: ticketType.eventId,
      name: ticketType.name,
      description: ticketType.description,
      price: ticketType.price,
      total_capacity: ticketType.quantity,
      available_capacity: ticketType.available,
      sold_tickets: ticketType.quantity - ticketType.available,
      created_at: ticketType.createdAt,
      updated_at: ticketType.updatedAt
    };
    
    res.json({
      success: true,
      data: mappedTicketType
    });
  } catch (error) {
    console.error('Error al obtener tipo de ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipo de ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Crear un nuevo tipo de ticket
 */
export const createTicketType = async (req, res) => {
  try {
    logger.info('TICKET_TYPES', 'Iniciando creación de tipo de ticket');
    logger.debug('TICKET_TYPES', 'Datos recibidos en req.body', req.body);
    
    const { event_id, name, description, price, total_capacity } = req.body;
    
    // Validar datos requeridos
    if (!event_id || !name || !price || !total_capacity) {
      logger.warn('TICKET_TYPES', 'Faltan datos requeridos', { 
        event_id, 
        name, 
        price, 
        total_capacity 
      });
      
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos (event_id, name, price, total_capacity)'
      });
    }
    
    logger.debug('TICKET_TYPES', `Buscando evento con ID: ${event_id} (tipo: ${typeof event_id})`);
    
    // Verificar que el evento existe
    const event = await Event.findByPk(event_id);
    
    if (!event) {
      logger.error('TICKET_TYPES', `Evento no encontrado con ID: ${event_id}`, {
        event_id,
        tipo: typeof event_id
      });
      
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }
    
    logger.success('TICKET_TYPES', `Evento encontrado: ${event.name} (ID: ${event.id})`);
    
    // Mapear campos del API a los campos del modelo
    const ticketTypeData = {
      eventId: event_id,
      name: name,
      description: description || '',
      price: parseFloat(price),
      quantity: parseInt(total_capacity),
      available: parseInt(total_capacity) // Inicialmente todas están disponibles
    };
    
    logger.debug('TICKET_TYPES', 'Creando tipo de ticket con datos', ticketTypeData);
    
    const ticketType = await TicketType.create(ticketTypeData);
    
    logger.success('TICKET_TYPES', `Tipo de ticket creado exitosamente: ${ticketType.name} (ID: ${ticketType.id})`);
    
    // Mapear campos del modelo de vuelta al formato de API
    const responseData = {
      id: ticketType.id,
      event_id: ticketType.eventId,
      name: ticketType.name,
      description: ticketType.description,
      price: ticketType.price,
      total_capacity: ticketType.quantity,
      available_capacity: ticketType.available,
      sold_tickets: ticketType.quantity - ticketType.available,
      created_at: ticketType.createdAt,
      updated_at: ticketType.updatedAt
    };
    
    logger.debug('TICKET_TYPES', 'Respuesta a enviar', responseData);
    
    res.status(201).json({
      success: true,
      message: 'Tipo de ticket creado exitosamente',
      data: responseData
    });
  } catch (error) {
    logger.error('TICKET_TYPES', 'Error al crear tipo de ticket', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al crear tipo de ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Actualizar un tipo de ticket
 */
export const updateTicketType = async (req, res) => {
  try {
    const { id } = req.params;
    const { event_id, name, description, price, total_capacity } = req.body;
    
    const ticketType = await TicketType.findByPk(id);
    
    if (!ticketType) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de ticket no encontrado'
      });
    }
    
    // Mapear campos del API a los campos del modelo
    const updateData = {};
    if (event_id !== undefined) updateData.eventId = event_id;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (total_capacity !== undefined) {
      const currentSold = ticketType.quantity - ticketType.available;
      updateData.quantity = parseInt(total_capacity);
      updateData.available = updateData.quantity - currentSold;
    }
    
    await ticketType.update(updateData);
    
    // Mapear campos del modelo de vuelta al formato de API
    res.json({
      success: true,
      message: 'Tipo de ticket actualizado exitosamente',
      data: {
        id: ticketType.id,
        event_id: ticketType.eventId,
        name: ticketType.name,
        description: ticketType.description,
        price: ticketType.price,
        total_capacity: ticketType.quantity,
        available_capacity: ticketType.available,
        sold_tickets: ticketType.quantity - ticketType.available,
        created_at: ticketType.createdAt,
        updated_at: ticketType.updatedAt
      }
    });
  } catch (error) {
    console.error('Error al actualizar tipo de ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar tipo de ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Eliminar un tipo de ticket
 */
export const deleteTicketType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ticketType = await TicketType.findByPk(id);
    
    if (!ticketType) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de ticket no encontrado'
      });
    }
    
    await ticketType.destroy();
    
    res.json({
      success: true,
      message: 'Tipo de ticket eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar tipo de ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar tipo de ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
