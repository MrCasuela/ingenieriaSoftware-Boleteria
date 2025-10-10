/**
 * Servicio de API para Tipos de Tickets
 * Conecta el frontend con el backend para gestionar tipos de tickets
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Obtener todos los tipos de tickets
 */
export const getAllTicketTypes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/ticket-types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener tipos de tickets:', error);
    throw error;
  }
};

/**
 * Obtener tipos de tickets por evento
 */
export const getTicketTypesByEvent = async (eventId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ticket-types/event/${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error al obtener tipos de tickets del evento ${eventId}:`, error);
    throw error;
  }
};

/**
 * Obtener un tipo de ticket por ID
 */
export const getTicketTypeById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ticket-types/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error al obtener tipo de ticket ${id}:`, error);
    throw error;
  }
};

/**
 * Crear un nuevo tipo de ticket
 */
export const createTicketType = async (ticketTypeData) => {
  try {
    console.log('🔵 Enviando datos al backend:', ticketTypeData);
    
    const response = await fetch(`${API_BASE_URL}/ticket-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ticketTypeData)
    });

    console.log('🔵 Status de respuesta:', response.status);
    console.log('🔵 Response OK?:', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('🔴 Error del servidor:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔵 Datos recibidos del servidor:', data);
    return data;
  } catch (error) {
    console.error('🔴 Error al crear tipo de ticket:', error);
    throw error;
  }
};

/**
 * Actualizar un tipo de ticket existente
 */
export const updateTicketType = async (id, ticketTypeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ticket-types/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ticketTypeData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error al actualizar tipo de ticket ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar un tipo de ticket
 */
export const deleteTicketType = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ticket-types/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error al eliminar tipo de ticket ${id}:`, error);
    throw error;
  }
};
