import Event from '../models/Event.js';

/**
 * Obtener todos los eventos
 */
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [['date', 'ASC']]
    });
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener eventos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener un evento por ID
 */
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener evento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Crear un nuevo evento
 */
export const createEvent = async (req, res) => {
  try {
    const eventData = req.body;
    
    // Validar datos requeridos
    if (!eventData.name || !eventData.date || !eventData.location) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos (name, date, location)'
      });
    }
    
    const event = await Event.create(eventData);
    
    res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente',
      data: event
    });
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear evento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Actualizar un evento
 */
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const eventData = req.body;
    
    const event = await Event.findByPk(id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }
    
    await event.update(eventData);
    
    res.json({
      success: true,
      message: 'Evento actualizado exitosamente',
      data: event
    });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar evento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Eliminar un evento
 */
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByPk(id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }
    
    await event.destroy();
    
    res.json({
      success: true,
      message: 'Evento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar evento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener eventos activos
 */
export const getActiveEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      where: {
        is_active: true
      },
      order: [['date', 'ASC']]
    });
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error al obtener eventos activos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener eventos activos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
