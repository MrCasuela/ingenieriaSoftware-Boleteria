// Simulación de API para manejo de eventos y tickets
export const eventService = {
  async getEvents() {
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return [
      {
        id: 1,
        name: 'Concierto Rock en Vivo',
        description: 'Una noche increíble con las mejores bandas de rock nacional e internacional.',
        date: '15 de Noviembre, 2025',
        location: 'Estadio Nacional',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
        minPrice: 50,
        tickets: [
          {
            id: 1,
            name: 'Entrada General',
            description: 'Acceso a la zona general del estadio',
            price: 50,
            available: 500
          },
          {
            id: 2,
            name: 'Entrada VIP',
            description: 'Acceso preferencial con bebida incluida',
            price: 120,
            available: 100
          }
        ]
      },
      // ... más eventos
    ]
  },

  async getEventById(id) {
    const events = await this.getEvents()
    return events.find(event => event.id === parseInt(id))
  }
}

export const paymentService = {
  async processPayment(paymentData, personalData, ticket) {
    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Validaciones básicas
    if (!paymentData.cardNumber || !paymentData.cardName || !paymentData.expiry || !paymentData.cvv) {
      throw new Error('Datos de pago incompletos')
    }

    if (!personalData.firstName || !personalData.lastName || !personalData.email) {
      throw new Error('Datos personales incompletos')
    }

    // Simular respuesta exitosa
    return {
      success: true,
      transactionId: 'TXN-' + Date.now(),
      ticketCode: 'TKT-' + Date.now().toString().slice(-8)
    }
  }
}

// Servicio de reportes para administradores (HU6)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const reportService = {
  /**
   * Obtener reporte de asistencia con filtros
   */
  async getAttendanceReport(filters = {}) {
    try {
      const token = localStorage.getItem('apiToken') || localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      // Agregar filtros a la query string
      if (filters.eventId) queryParams.append('eventId', filters.eventId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.sector) queryParams.append('sector', filters.sector);
      if (filters.ticketTypeId) queryParams.append('ticketTypeId', filters.ticketTypeId);
      if (filters.operatorId) queryParams.append('operatorId', filters.operatorId);

      const response = await fetch(`${API_URL}/admin/reports/attendance?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener reporte');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error en getAttendanceReport:', error);
      throw error;
    }
  },

  /**
   * Exportar reporte a CSV (tickets detallados)
   */
  async exportToCSV(filters = {}) {
    try {
      const token = localStorage.getItem('apiToken') || localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.eventId) queryParams.append('eventId', filters.eventId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.sector) queryParams.append('sector', filters.sector);
      if (filters.ticketTypeId) queryParams.append('ticketTypeId', filters.ticketTypeId);
      if (filters.operatorId) queryParams.append('operatorId', filters.operatorId);

      const response = await fetch(`${API_URL}/admin/reports/attendance/export/csv?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al exportar CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-asistencia-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      throw error;
    }
  },

  /**
   * Exportar estadísticas a CSV
   */
  async exportStatsToCSV(filters = {}) {
    try {
      const token = localStorage.getItem('apiToken') || localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.eventId) queryParams.append('eventId', filters.eventId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.sector) queryParams.append('sector', filters.sector);

      const response = await fetch(`${API_URL}/admin/reports/attendance/export/csv-stats?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al exportar estadísticas CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estadisticas-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al exportar estadísticas CSV:', error);
      throw error;
    }
  },

  /**
   * Exportar reporte a PDF
   */
  async exportToPDF(filters = {}) {
    try {
      const token = localStorage.getItem('apiToken') || localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.eventId) queryParams.append('eventId', filters.eventId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.sector) queryParams.append('sector', filters.sector);

      const response = await fetch(`${API_URL}/admin/reports/attendance/export/pdf?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al exportar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-asistencia-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      throw error;
    }
  }
}