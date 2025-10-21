/**
 * Servicio de API para Eventos
 * Conecta el frontend con el backend para gestionar eventos
 */

const API_BASE_URL = '/api';

/**
 * Función auxiliar para obtener el token de autenticación
 */
const getAuthToken = () => {
  const token = localStorage.getItem('apiToken') || localStorage.getItem('token');
  console.log('🔑 Token encontrado:', token ? `Sí (${token.substring(0, 20)}...)` : 'No');
  return token;
};

/**
 * Función auxiliar para crear headers con autenticación
 */
const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('⚠️ No se encontró token para la petición');
  }
  
  return headers;
};

/**
 * Obtener todos los eventos
 */
export const getAllEvents = async () => {
  try {
    const headers = getHeaders();

    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    throw error;
  }
};

/**
 * Obtener un evento por ID
 */
export const getEventById = async (id) => {
  try {
    const headers = getHeaders();

    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error al obtener evento ${id}:`, error);
    throw error;
  }
};

/**
 * Crear un nuevo evento
 */
export const createEvent = async (eventData) => {
  try {
    const headers = getHeaders();
    
    console.log('📤 Enviando petición para crear evento:', eventData);

    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify(eventData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error del servidor:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Evento creado exitosamente:', data);
    return data;
  } catch (error) {
    console.error('Error al crear evento:', error);
    throw error;
  }
};

/**
 * Actualizar un evento existente
 */
export const updateEvent = async (id, eventData) => {
  try {
    const headers = getHeaders();
    
    console.log(`📤 Actualizando evento ${id}:`, eventData);

    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(eventData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error del servidor:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Evento actualizado exitosamente:', data);
    return data;
  } catch (error) {
    console.error(`Error al actualizar evento ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar un evento
 */
export const deleteEvent = async (id) => {
  try {
    const headers = getHeaders();
    
    console.log(`🗑️ Eliminando evento ${id}`);

    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error del servidor:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Evento eliminado exitosamente');
    return data;
  } catch (error) {
    console.error(`Error al eliminar evento ${id}:`, error);
    throw error;
  }
};
