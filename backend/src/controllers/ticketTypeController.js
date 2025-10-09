import TicketType from '../models/TicketType.js';
import Event from '../models/Event.js';

/**
 * Obtener todos los tipos de tickets
 */
export const getAllTicketTypes = async (req, res) => {
  try {
    const ticketTypes = await TicketType.findAll({
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: ticketTypes
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
      where: { event_id: eventId },
      order: [['price', 'ASC']]
    });
    
    res.json({
      success: true,
      data: ticketTypes
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
    
    res.json({
      success: true,
      data: ticketType
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
    const ticketTypeData = req.body;
    
    // Validar datos requeridos
    if (!ticketTypeData.event_id || !ticketTypeData.name || !ticketTypeData.price || !ticketTypeData.total_capacity) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos (event_id, name, price, total_capacity)'
      });
    }
    
    // Verificar que el evento existe
    const event = await Event.findByPk(ticketTypeData.event_id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }
    
    // Establecer available_capacity igual a total_capacity si no se proporciona
    if (!ticketTypeData.available_capacity) {
      ticketTypeData.available_capacity = ticketTypeData.total_capacity;
    }
    
    const ticketType = await TicketType.create(ticketTypeData);
    
    res.status(201).json({
      success: true,
      message: 'Tipo de ticket creado exitosamente',
      data: ticketType
    });
  } catch (error) {
    console.error('Error al crear tipo de ticket:', error);
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
    const ticketTypeData = req.body;
    
    const ticketType = await TicketType.findByPk(id);
    
    if (!ticketType) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de ticket no encontrado'
      });
    }
    
    await ticketType.update(ticketTypeData);
    
    res.json({
      success: true,
      message: 'Tipo de ticket actualizado exitosamente',
      data: ticketType
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
