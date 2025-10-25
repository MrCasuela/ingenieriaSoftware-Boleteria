<template>
  <div class="admin-panel">
    <!-- Header -->
    <header class="admin-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="goHome" class="btn-home">
            🏠 Inicio
          </button>
          <div class="header-title">
            <h1>📊 Panel de Administrador</h1>
            <p>Gestión de Eventos y Tickets</p>
          </div>
        </div>
        <div class="header-right">
          <span class="user-info">
            👨‍💼 {{ userName }}
          </span>
          <button @click="handleLogout" class="btn-logout">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <div class="tabs-container">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- Main Content -->
    <div class="admin-content">
      <!-- Tab: Eventos -->
      <div v-if="activeTab === 'events'" class="tab-content">
        <div class="section-header">
          <h2>🎭 Gestión de Eventos</h2>
          <button @click="showEventForm = true" class="btn-primary">
            ➕ Nuevo Evento
          </button>
        </div>

        <!-- Lista de Eventos -->
        <div class="events-grid">
          <div v-for="event in events" :key="event.id" class="event-card">
            <div class="event-image">
              <img :src="event.imageUrl" :alt="event.name" />
              <span class="event-category">{{ event.category }}</span>
            </div>
            <div class="event-info">
              <h3>{{ event.name }}</h3>
              <p class="event-description">{{ event.description }}</p>
              <div class="event-details">
                <div class="detail-item">
                  <span class="label">📅 Fecha:</span>
                  <span class="value">{{ formatDate(event.date) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">📍 Lugar:</span>
                  <span class="value">{{ event.venue }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">👥 Aforo Total:</span>
                  <span class="value">{{ event.totalCapacity }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">💵 Precio desde:</span>
                  <span class="value">${{ formatPrice(event.minPrice) }}</span>
                </div>
              </div>
              <div class="event-actions">
                <button @click="editEvent(event)" class="btn-edit">
                  ✏️ Editar
                </button>
                <button @click="manageTicketTypes(event)" class="btn-info">
                  🎫 Tipos de Ticket
                </button>
                <button @click="deleteEvent(event.id)" class="btn-danger">
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulario de Evento (Modal) -->
        <div v-if="showEventForm" class="modal-overlay" @click.self="closeEventForm">
          <div class="modal-content">
            <div class="modal-header">
              <h3>{{ editingEvent ? '✏️ Editar Evento' : '➕ Nuevo Evento' }}</h3>
              <button @click="closeEventForm" class="btn-close">✖</button>
            </div>
            <form @submit.prevent="saveEvent" class="event-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Nombre del Evento *</label>
                  <input 
                    v-model="eventForm.name" 
                    type="text" 
                    required 
                    placeholder="Ej: Concierto de Rock"
                  />
                </div>
                <div class="form-group">
                  <label>Categoría *</label>
                  <select v-model="eventForm.category" required>
                    <option value="">Seleccione...</option>
                    <option value="Concierto">Concierto</option>
                    <option value="Teatro">Teatro</option>
                    <option value="Deporte">Deporte</option>
                    <option value="Festival">Festival</option>
                    <option value="Conferencia">Conferencia</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Descripción *</label>
                <textarea 
                  v-model="eventForm.description" 
                  required 
                  rows="3"
                  placeholder="Describe el evento..."
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Fecha *</label>
                  <input v-model="eventForm.date" type="date" required />
                </div>
                <div class="form-group">
                  <label>Hora *</label>
                  <input v-model="eventForm.time" type="time" required />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Lugar/Venue *</label>
                  <input 
                    v-model="eventForm.venue" 
                    type="text" 
                    required 
                    placeholder="Ej: Estadio Nacional"
                  />
                </div>
                <div class="form-group">
                  <label>Ciudad *</label>
                  <input 
                    v-model="eventForm.city" 
                    type="text" 
                    required 
                    placeholder="Ej: Santiago"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Aforo Total *</label>
                  <input 
                    v-model.number="eventForm.totalCapacity" 
                    type="number" 
                    required 
                    min="1"
                    placeholder="Ej: 5000"
                  />
                </div>
                <div class="form-group">
                  <label>URL de Imagen</label>
                  <input 
                    v-model="eventForm.imageUrl" 
                    type="url" 
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div class="form-actions">
                <button type="button" @click="closeEventForm" class="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" class="btn-primary">
                  {{ editingEvent ? 'Actualizar' : 'Crear' }} Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Tab: Tipos de Ticket -->
      <div v-if="activeTab === 'ticketTypes'" class="tab-content">
        <div class="section-header">
          <h2>🎫 Gestión de Tipos de Ticket</h2>
          <div class="header-controls">
            <select v-model.number="selectedEventForTickets" class="event-selector">
              <option value="">Seleccione un evento...</option>
              <option v-for="event in events" :key="event.id" :value="event.id">
                {{ event.name }}
              </option>
            </select>
            <button 
              @click="openNewTicketTypeForm" 
              class="btn-primary"
              :disabled="!selectedEventForTickets"
            >
              ➕ Nuevo Tipo de Ticket
            </button>
          </div>
        </div>

        <!-- Lista de Tipos de Ticket -->
        <div v-if="selectedEventForTickets" class="ticket-types-list">
          <div 
            v-for="ticketType in filteredTicketTypes" 
            :key="ticketType.id" 
            class="ticket-type-card"
          >
            <div class="ticket-type-header">
              <h3>{{ ticketType.name }}</h3>
              <span class="ticket-price">${{ formatPrice(ticketType.price) }}</span>
            </div>
            <div class="ticket-type-body">
              <p>{{ ticketType.description }}</p>
              <div class="ticket-stats">
                <div class="stat">
                  <span class="stat-label">Aforo:</span>
                  <span class="stat-value">{{ ticketType.capacity }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Vendidos:</span>
                  <span class="stat-value">{{ ticketType.sold || 0 }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Disponibles:</span>
                  <span class="stat-value">{{ ticketType.capacity - (ticketType.sold || 0) }}</span>
                </div>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: getOccupancyPercentage(ticketType) + '%' }"
                ></div>
              </div>
              <p class="occupancy-text">
                {{ getOccupancyPercentage(ticketType) }}% ocupado
              </p>
            </div>
            <div class="ticket-type-actions">
              <button @click="editTicketType(ticketType)" class="btn-edit">
                ✏️ Editar
              </button>
              <button @click="deleteTicketType(ticketType.id)" class="btn-danger">
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>

        <!-- Mensaje si no hay evento seleccionado -->
        <div v-else class="empty-state">
          <p>👆 Seleccione un evento para ver sus tipos de ticket</p>
        </div>

        <!-- Formulario de Tipo de Ticket (Modal) -->
        <div v-if="showTicketTypeForm" class="modal-overlay" @click.self="closeTicketTypeForm">
          <div class="modal-content">
            <div class="modal-header">
              <h3>{{ editingTicketType ? '✏️ Editar Tipo de Ticket' : '➕ Nuevo Tipo de Ticket' }}</h3>
              <button @click="closeTicketTypeForm" class="btn-close">✖</button>
            </div>
            <form @submit.prevent="saveTicketType" class="ticket-type-form">
              <div class="form-group">
                <label>Evento *</label>
                <select v-model.number="ticketTypeForm.eventId" required :disabled="editingTicketType">
                  <option value="">Seleccione un evento...</option>
                  <option v-for="event in events" :key="event.id" :value="event.id">
                    {{ event.name }}
                  </option>
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Nombre del Tipo *</label>
                  <input 
                    v-model="ticketTypeForm.name" 
                    type="text" 
                    required 
                    placeholder="Ej: VIP, General, Platea"
                  />
                </div>
                <div class="form-group">
                  <label>Precio *</label>
                  <input 
                    v-model.number="ticketTypeForm.price" 
                    type="number" 
                    required 
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Descripción</label>
                <textarea 
                  v-model="ticketTypeForm.description" 
                  rows="2"
                  placeholder="Describe las características de este tipo de ticket..."
                ></textarea>
              </div>

              <div class="form-group">
                <label>Aforo (Capacidad) *</label>
                <input 
                  v-model.number="ticketTypeForm.capacity" 
                  type="number" 
                  required 
                  min="1"
                  placeholder="Ej: 100"
                />
                <small class="form-hint">
                  Número máximo de tickets de este tipo que se pueden vender
                </small>
              </div>

              <div class="form-actions">
                <button type="button" @click="closeTicketTypeForm" class="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" class="btn-primary">
                  {{ editingTicketType ? 'Actualizar' : 'Crear' }} Tipo de Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Tab: Reportes (HU6) -->
      <div v-if="activeTab === 'reports'" class="tab-content">
        <div class="section-header">
          <h2>📊 Reportes de Asistencia y Accesos</h2>
        </div>

        <!-- Filtros de Búsqueda -->
        <div class="filters-section">
          <h3>🔍 Filtros</h3>
          <div class="filters-grid">
            <div class="filter-group">
              <label>Evento:</label>
              <select v-model="reportFilters.eventId" class="form-control">
                <option value="">Todos los eventos</option>
                <option v-for="event in events" :key="event.id" :value="event.id">
                  {{ event.name }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label>Estado:</label>
              <select v-model="reportFilters.status" class="form-control">
                <option value="">Todos los estados</option>
                <option value="validated">Validados</option>
                <option value="paid">Pagados</option>
                <option value="pending">Pendientes</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>

            <div class="filter-group">
              <label>Sector:</label>
              <input 
                type="text" 
                v-model="reportFilters.sector" 
                placeholder="Ej: VIP, General" 
                class="form-control"
              />
            </div>

            <div class="filter-group">
              <label>Fecha Desde:</label>
              <input 
                type="date" 
                v-model="reportFilters.startDate" 
                class="form-control"
              />
            </div>

            <div class="filter-group">
              <label>Fecha Hasta:</label>
              <input 
                type="date" 
                v-model="reportFilters.endDate" 
                class="form-control"
              />
            </div>

            <div class="filter-actions">
              <button @click="loadReportData" class="btn-primary">
                🔍 Buscar
              </button>
              <button @click="clearFilters" class="btn-secondary">
                🔄 Limpiar
              </button>
            </div>
          </div>
        </div>

        <!-- Estadísticas en Tiempo Real -->
        <div v-if="reportData" class="report-stats-section">
          <h3>📈 Estadísticas en Tiempo Real</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">🎫</div>
              <div class="stat-info">
                <h4>Total Tickets</h4>
                <p class="stat-number">{{ reportData.stats?.totalTickets || 0 }}</p>
              </div>
            </div>
            <div class="stat-card success">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <h4>Validados</h4>
                <p class="stat-number">{{ reportData.stats?.validated || 0 }}</p>
              </div>
            </div>
            <div class="stat-card warning">
              <div class="stat-icon">⏳</div>
              <div class="stat-info">
                <h4>Pendientes</h4>
                <p class="stat-number">{{ reportData.stats?.pending || 0 }}</p>
              </div>
            </div>
            <div class="stat-card danger">
              <div class="stat-icon">❌</div>
              <div class="stat-info">
                <h4>Cancelados</h4>
                <p class="stat-number">{{ reportData.stats?.cancelled || 0 }}</p>
              </div>
            </div>
            <div class="stat-card info">
              <div class="stat-icon">💰</div>
              <div class="stat-info">
                <h4>Ingresos Totales</h4>
                <p class="stat-number">${{ formatPrice(reportData.stats?.totalRevenue || 0) }}</p>
              </div>
            </div>
          </div>

          <!-- Última actualización -->
          <div class="update-info">
            <span>🕐 Última actualización: {{ lastUpdateTime }}</span>
            <button @click="loadReportData" class="btn-refresh">
              🔄 Actualizar
            </button>
          </div>
        </div>

        <!-- Botones de Exportación -->
        <div class="export-section">
          <h3>📥 Exportar Reportes</h3>
          <div class="export-buttons">
            <button @click="exportCSV" class="btn-export btn-csv" :disabled="isExporting">
              <span v-if="!isExporting">📄 Exportar CSV (Detallado)</span>
              <span v-else>⏳ Exportando...</span>
            </button>
            <button @click="exportStatsCSV" class="btn-export btn-csv" :disabled="isExporting">
              <span v-if="!isExporting">📊 Exportar CSV (Estadísticas)</span>
              <span v-else>⏳ Exportando...</span>
            </button>
            <button @click="exportPDF" class="btn-export btn-pdf" :disabled="isExporting">
              <span v-if="!isExporting">📕 Exportar PDF</span>
              <span v-else>⏳ Exportando...</span>
            </button>
          </div>
        </div>

        <!-- Estadísticas por Evento -->
        <div v-if="reportData && reportData.byEvent?.length > 0" class="report-section">
          <h3>🎭 Check-ins por Evento</h3>
          <div class="report-table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Fecha</th>
                  <th>Lugar</th>
                  <th>Total Check-ins</th>
                  <th>Validados</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="event in reportData.byEvent" :key="event.eventName">
                  <td><strong>{{ event.eventName }}</strong></td>
                  <td>{{ formatDate(event.eventDate) }}</td>
                  <td>{{ event.venue || 'N/A' }}</td>
                  <td>{{ event.totalCheckins }}</td>
                  <td>
                    <span class="badge-success">{{ event.validated }}</span>
                  </td>
                  <td>${{ formatPrice(event.revenue) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Estadísticas por Sector -->
        <div v-if="reportData && reportData.bySector?.length > 0" class="report-section">
          <h3>🎯 Check-ins por Sector</h3>
          <div class="report-table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Sector</th>
                  <th>Total Check-ins</th>
                  <th>Validados</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sector in reportData.bySector" :key="sector.sector">
                  <td><strong>{{ sector.sector }}</strong></td>
                  <td>{{ sector.totalCheckins }}</td>
                  <td>
                    <span class="badge-success">{{ sector.validated }}</span>
                  </td>
                  <td>${{ formatPrice(sector.revenue) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Estadísticas por Operador -->
        <div v-if="reportData && reportData.byOperator?.length > 0" class="report-section">
          <h3>👤 Validaciones por Operador</h3>
          <div class="report-table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Operador</th>
                  <th>Total Validaciones</th>
                  <th>Última Validación</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="operator in reportData.byOperator" :key="operator.operatorName">
                  <td><strong>{{ operator.operatorName }}</strong></td>
                  <td>{{ operator.totalValidations }}</td>
                  <td>{{ formatDateTime(operator.lastValidation) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mensaje cuando no hay datos -->
        <div v-if="!reportData" class="empty-state">
          <p>🔍 Selecciona los filtros y presiona "Buscar" para generar el reporte</p>
        </div>

        <div v-else-if="reportData && reportData.tickets?.length === 0" class="empty-state">
          <p>📭 No se encontraron datos para los filtros seleccionados</p>
        </div>
      </div>

      <!-- Tab: Estadísticas -->
      <div v-if="activeTab === 'stats'" class="tab-content">
        <div class="section-header">
          <h2>📈 Estadísticas y Reportes</h2>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🎭</div>
            <div class="stat-info">
              <h3>Total Eventos</h3>
              <p class="stat-number">{{ events.length }}</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🎫</div>
            <div class="stat-info">
              <h3>Tipos de Ticket</h3>
              <p class="stat-number">{{ ticketTypes.length }}</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <h3>Aforo Total</h3>
              <p class="stat-number">{{ totalCapacity }}</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
              <h3>Ingresos Potenciales</h3>
              <p class="stat-number">${{ formatPrice(totalPotentialRevenue) }}</p>
            </div>
          </div>
        </div>

        <!-- Tabla de Eventos con Detalles -->
        <div class="stats-table-container">
          <h3>📊 Detalle por Evento</h3>
          <table class="stats-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Fecha</th>
                <th>Tipos de Ticket</th>
                <th>Aforo Total</th>
                <th>Ocupación</th>
                <th>Ingresos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in events" :key="event.id">
                <td>{{ event.name }}</td>
                <td>{{ formatDate(event.date) }}</td>
                <td>{{ getEventTicketTypesCount(event.id) }}</td>
                <td>{{ event.totalCapacity }}</td>
                <td>
                  <span class="occupancy-badge">
                    {{ getEventOccupancy(event.id) }}%
                  </span>
                </td>
                <td>${{ formatPrice(getEventRevenue(event.id)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab: Usuarios (NUEVO) -->
      <div v-if="activeTab === 'users'" class="tab-content">
        <div class="section-header">
          <h2>👥 Gestión de Usuarios y Roles</h2>
          <div class="user-actions">
            <button @click="showUserForm = true; userForm.role = 'Cliente'" class="btn-primary">
              ➕ Nuevo Cliente
            </button>
            <button @click="showUserForm = true; userForm.role = 'Operador'" class="btn-success">
              ➕ Nuevo Operador
            </button>
          </div>
        </div>

        <!-- Estadísticas de Usuarios -->
        <div class="stats-grid" style="margin-bottom: 2rem;">
          <div class="stat-card">
            <div class="stat-icon">👨‍💼</div>
            <div class="stat-info">
              <h3>Clientes</h3>
              <p class="stat-number">{{ users.clientes?.length || 0 }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🎫</div>
            <div class="stat-info">
              <h3>Operadores</h3>
              <p class="stat-number">{{ users.operadores?.length || 0 }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🔐</div>
            <div class="stat-info">
              <h3>Administradores</h3>
              <p class="stat-number">{{ users.administradores?.length || 0 }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <h3>Total Usuarios</h3>
              <p class="stat-number">{{ totalUsers }}</p>
            </div>
          </div>
        </div>

        <!-- Filtros -->
        <div class="filters-bar">
          <button 
            @click="filterRole = 'all'" 
            :class="['filter-btn', { active: filterRole === 'all' }]"
          >
            Todos
          </button>
          <button 
            @click="filterRole = 'Cliente'" 
            :class="['filter-btn', { active: filterRole === 'Cliente' }]"
          >
            👨‍💼 Clientes
          </button>
          <button 
            @click="filterRole = 'Operador'" 
            :class="['filter-btn', { active: filterRole === 'Operador' }]"
          >
            🎫 Operadores
          </button>
          <button 
            @click="filterRole = 'Administrador'" 
            :class="['filter-btn', { active: filterRole === 'Administrador' }]"
          >
            🔐 Administradores
          </button>
        </div>

        <!-- Tabla de Usuarios -->
        <div class="users-table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Info Adicional</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>{{ user.email }}</td>
                <td>{{ user.firstName }} {{ user.lastName }}</td>
                <td>
                  <span :class="['role-badge', getRoleClass(user.userType)]">
                    {{ getRoleIcon(user.userType) }} {{ user.userType }}
                  </span>
                </td>
                <td>
                  <span :class="['status-badge', user.isActive ? 'active' : 'inactive']">
                    {{ user.isActive ? '✅ Activo' : '❌ Inactivo' }}
                  </span>
                </td>
                <td class="user-extra-info">
                  <span v-if="user.userType === 'Operador'">
                    ID: {{ user.employeeId }} | Turno: {{ user.shift }}
                  </span>
                  <span v-else-if="user.userType === 'Cliente'">
                    RUT: {{ user.document || 'N/A' }}
                  </span>
                  <span v-else-if="user.userType === 'Administrador'">
                    Nivel: {{ user.adminLevel }}
                  </span>
                </td>
                <td class="user-actions-cell">
                  <button 
                    @click="changeUserRole(user)" 
                    class="btn-edit-small"
                    title="Cambiar rol"
                  >
                    🔄
                  </button>
                  <button 
                    @click="toggleUserStatus(user)" 
                    :class="['btn-toggle-small', user.isActive ? 'btn-deactivate' : 'btn-activate']"
                    :title="user.isActive ? 'Desactivar' : 'Activar'"
                  >
                    {{ user.isActive ? '🔒' : '🔓' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Formulario de Usuario (Modal) -->
        <div v-if="showUserForm" class="modal-overlay" @click.self="closeUserForm">
          <div class="modal-content">
            <div class="modal-header">
              <h3>{{ editingUser ? '✏️ Editar Usuario' : '➕ Nuevo ' + userForm.role }}</h3>
              <button @click="closeUserForm" class="btn-close">✖</button>
            </div>
            <form @submit.prevent="saveUser" class="user-form">
              <div class="form-group">
                <label>Rol *</label>
                <select v-model="userForm.role" required :disabled="editingUser">
                  <option value="Cliente">Cliente</option>
                  <option value="Operador">Operador</option>
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Email *</label>
                  <input 
                    v-model="userForm.email" 
                    type="email" 
                    required 
                    placeholder="usuario@ejemplo.com"
                  />
                </div>
                <div class="form-group" v-if="!editingUser">
                  <label>Contraseña *</label>
                  <input 
                    v-model="userForm.password" 
                    type="password" 
                    :required="!editingUser"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Nombre *</label>
                  <input 
                    v-model="userForm.firstName" 
                    type="text" 
                    required 
                    placeholder="Nombre"
                  />
                </div>
                <div class="form-group">
                  <label>Apellido *</label>
                  <input 
                    v-model="userForm.lastName" 
                    type="text" 
                    required 
                    placeholder="Apellido"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Teléfono *</label>
                <input 
                  v-model="userForm.phone" 
                  type="tel" 
                  required 
                  placeholder="+56912345678"
                />
              </div>

              <!-- Campos específicos para Cliente -->
              <div v-if="userForm.role === 'Cliente'" class="form-group">
                <label>RUT/Documento *</label>
                <input 
                  v-model="userForm.document" 
                  type="text" 
                  required 
                  placeholder="12345678-9"
                />
              </div>

              <!-- Campos específicos para Operador -->
              <div v-if="userForm.role === 'Operador'">
                <div class="form-row">
                  <div class="form-group">
                    <label>ID de Empleado</label>
                    <input 
                      v-model="userForm.employeeId" 
                      type="text" 
                      placeholder="OP-001"
                    />
                  </div>
                  <div class="form-group">
                    <label>Turno *</label>
                    <select v-model="userForm.shift" required>
                      <option value="mañana">Mañana</option>
                      <option value="tarde">Tarde</option>
                      <option value="noche">Noche</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" @click="closeUserForm" class="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" class="btn-primary">
                  {{ editingUser ? 'Actualizar' : 'Crear' }} Usuario
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal de Cambio de Rol -->
        <div v-if="showRoleChangeModal" class="modal-overlay" @click.self="showRoleChangeModal = false">
          <div class="modal-content modal-small">
            <div class="modal-header">
              <h3>🔄 Cambiar Rol de Usuario</h3>
              <button @click="showRoleChangeModal = false" class="btn-close">✖</button>
            </div>
            <div class="modal-body">
              <p><strong>Usuario:</strong> {{ selectedUser?.email }}</p>
              <p><strong>Rol actual:</strong> {{ selectedUser?.userType }}</p>
              
              <div class="form-group">
                <label>Nuevo Rol:</label>
                <select v-model="newRole" class="form-control">
                  <option value="Cliente">Cliente</option>
                  <option value="Operador">Operador</option>
                  <option value="Administrador" v-if="authStore.user?.adminLevel === 'super'">
                    Administrador (Solo Super Admin)
                  </option>
                </select>
              </div>

              <div class="alert alert-warning">
                ⚠️ <strong>Advertencia:</strong> Cambiar el rol modificará los permisos del usuario.
              </div>
            </div>
            <div class="form-actions">
              <button @click="showRoleChangeModal = false" class="btn-cancel">
                Cancelar
              </button>
              <button @click="confirmRoleChange" class="btn-primary">
                Confirmar Cambio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import * as ticketTypeApi from '../services/ticketTypeApiService'
import * as eventApi from '../services/eventApiService'
import { reportService } from '../services/apiService'

export default {
  name: 'AdminPanel',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    // State
    const activeTab = ref('events')
    const showEventForm = ref(false)
    const showTicketTypeForm = ref(false)
    const editingEvent = ref(null)
    const editingTicketType = ref(null)
    const selectedEventForTickets = ref('')

    // Data
    const events = ref([])
    const ticketTypes = ref([])
    const users = ref({ clientes: [], operadores: [], administradores: [] })
    const showUserForm = ref(false)
    const showRoleChangeModal = ref(false)
    const editingUser = ref(null)
    const selectedUser = ref(null)
    const newRole = ref('')
    const filterRole = ref('all')
    const userForm = ref({
      role: 'Cliente',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      document: '',
      employeeId: '',
      shift: 'mañana'
    })

    // Reportes (HU6)
    const reportData = ref(null)
    const reportFilters = ref({
      eventId: '',
      startDate: '',
      endDate: '',
      status: '',
      sector: '',
      ticketTypeId: '',
      operatorId: ''
    })
    const isExporting = ref(false)
    const lastUpdateTime = ref('')

    // Tabs
    const tabs = [
      { id: 'events', label: 'Eventos', icon: '🎭' },
      { id: 'ticketTypes', label: 'Tipos de Ticket', icon: '🎫' },
      { id: 'users', label: 'Usuarios', icon: '👥' },
      { id: 'reports', label: 'Reportes', icon: '📊' },
      { id: 'stats', label: 'Estadísticas', icon: '📈' }
    ]

    // Event Form
    const eventForm = ref({
      name: '',
      category: '',
      description: '',
      date: '',
      time: '',
      venue: '',
      city: '',
      totalCapacity: 0,
      imageUrl: ''
    })

    // Ticket Type Form
    const ticketTypeForm = ref({
      eventId: '',
      name: '',
      description: '',
      price: 0,
      capacity: 0
    })

    // Computed
    const userName = computed(() => authStore.userName)

    const filteredTicketTypes = computed(() => {
      if (!selectedEventForTickets.value) return []
      return ticketTypes.value.filter(
        tt => tt.eventId === selectedEventForTickets.value
      )
    })

    const totalCapacity = computed(() => {
      return events.value.reduce((sum, event) => sum + event.totalCapacity, 0)
    })

    const totalPotentialRevenue = computed(() => {
      return ticketTypes.value.reduce((sum, tt) => {
        return sum + (tt.price * tt.capacity)
      }, 0)
    })

    // Computed para usuarios
    const totalUsers = computed(() => {
      return (users.value.clientes?.length || 0) + 
             (users.value.operadores?.length || 0) + 
             (users.value.administradores?.length || 0)
    })

    const filteredUsers = computed(() => {
      const allUsers = [
        ...(users.value.clientes || []),
        ...(users.value.operadores || []),
        ...(users.value.administradores || [])
      ]
      
      if (filterRole.value === 'all') return allUsers
      return allUsers.filter(u => u.userType === filterRole.value)
    })

    // Methods
    const loadData = async () => {
      try {
        // Cargar todos los tipos de ticket desde la API
        const ticketTypesResponse = await ticketTypeApi.getAllTicketTypes()
        
        // Mapear datos de la API al formato del frontend
        if (ticketTypesResponse && ticketTypesResponse.success && Array.isArray(ticketTypesResponse.data)) {
          ticketTypes.value = ticketTypesResponse.data.map(tt => ({
            id: tt.id,
            eventId: tt.event_id,
            name: tt.name,
            description: tt.description || '',
            price: tt.price,
            capacity: tt.total_capacity,
            sold: tt.sold_tickets || 0
          }))
          console.log('✅ Tipos de ticket cargados desde la base de datos:', ticketTypes.value.length)
        } else {
          console.log('ℹ️ No hay tipos de ticket en la base de datos')
          ticketTypes.value = []
        }
      } catch (error) {
        console.error('Error al cargar tipos de ticket:', error)
        // Si falla la carga, inicializar con array vacío
        ticketTypes.value = []
      }

      try {
        // Cargar eventos desde la API
        const eventsResponse = await eventApi.getAllEvents()
        
        if (eventsResponse && eventsResponse.success && Array.isArray(eventsResponse.data)) {
          events.value = eventsResponse.data.map(event => ({
            id: event.id,
            name: event.name,
            category: event.category || 'Otro',
            description: event.description || '',
            date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
            time: event.date ? new Date(event.date).toTimeString().slice(0, 5) : '',
            venue: event.location || '',
            city: event.city || '',
            totalCapacity: event.total_capacity || 0,
            imageUrl: event.image || 'https://picsum.photos/400/300'
          }))
          console.log('✅ Eventos cargados desde la base de datos:', events.value.length)
        } else {
          console.log('ℹ️ No hay eventos en la base de datos')
          events.value = []
        }
      } catch (error) {
        console.error('Error al cargar eventos:', error)
        events.value = []
      }

      // Cargar usuarios
      await loadUsers()
    }

    const loadUsers = async () => {
      try {
        console.log('==================== INICIO LOAD USERS ====================')
        const token = localStorage.getItem('apiToken')
        console.log('Token en loadUsers:', token ? 'Existe' : 'NO EXISTE')
        
        if (!token) {
          console.error('❌ No hay token de autenticación en loadUsers')
          return
        }

        console.log('Llamando a /api/admin/users...')
        const response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        console.log('Response status:', response.status)
        console.log('Response ok:', response.ok)

        if (response.ok) {
          const data = await response.json()
          console.log('Data recibida:', data)
          
          if (data.success) {
            users.value = data.data
            console.log('✅ Usuarios cargados:', totalUsers.value)
          } else {
            console.error('❌ Success = false:', data)
          }
        } else {
          const errorText = await response.text()
          console.error('❌ Error al cargar usuarios. Status:', response.status)
          console.error('❌ Error text:', errorText)
        }
        console.log('==================== FIN LOAD USERS ====================')
      } catch (error) {
        console.error('==================== ERROR EN LOAD USERS ====================')
        console.error('Error completo:', error)
        console.error('Error message:', error.message)
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-CL').format(price)
    }

    const getOccupancyPercentage = (ticketType) => {
      if (!ticketType.capacity) return 0
      const sold = ticketType.sold || 0
      return Math.round((sold / ticketType.capacity) * 100)
    }

    const getEventTicketTypesCount = (eventId) => {
      return ticketTypes.value.filter(tt => tt.eventId === eventId).length
    }

    const getEventOccupancy = (eventId) => {
      const eventTickets = ticketTypes.value.filter(tt => tt.eventId === eventId)
      if (eventTickets.length === 0) return 0
      
      const totalSold = eventTickets.reduce((sum, tt) => sum + (tt.sold || 0), 0)
      const totalCapacity = eventTickets.reduce((sum, tt) => sum + tt.capacity, 0)
      
      return totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0
    }

    const getEventRevenue = (eventId) => {
      const eventTickets = ticketTypes.value.filter(tt => tt.eventId === eventId)
      return eventTickets.reduce((sum, tt) => {
        return sum + (tt.price * (tt.sold || 0))
      }, 0)
    }

    const closeEventForm = () => {
      showEventForm.value = false
      editingEvent.value = null
      resetEventForm()
    }

    const closeTicketTypeForm = () => {
      showTicketTypeForm.value = false
      editingTicketType.value = null
      resetTicketTypeForm()
    }

    const resetEventForm = () => {
      eventForm.value = {
        name: '',
        category: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        city: '',
        totalCapacity: 0,
        imageUrl: ''
      }
    }

    const resetTicketTypeForm = () => {
      const eventId = selectedEventForTickets.value || ''
      console.log('🔄 Reseteando formulario con eventId:', eventId)
      console.log('🔄 Tipo de eventId:', typeof eventId)
      
      ticketTypeForm.value = {
        eventId: eventId,
        name: '',
        description: '',
        price: 0,
        capacity: 0
      }
      
      console.log('🔄 ticketTypeForm después de reset:', ticketTypeForm.value)
    }

    const editEvent = (event) => {
      editingEvent.value = event.id
      eventForm.value = { ...event }
      showEventForm.value = true
    }

    const saveEvent = () => {
      if (editingEvent.value) {
        // Actualizar evento existente
        const index = events.value.findIndex(e => e.id === editingEvent.value)
        if (index !== -1) {
          events.value[index] = { ...eventForm.value, id: editingEvent.value }
        }
      } else {
        // Crear nuevo evento
        const newEvent = {
          ...eventForm.value,
          id: Date.now(),
          minPrice: 0 // Se calculará según los tipos de ticket
        }
        events.value.push(newEvent)
      }
      saveEvents()
      closeEventForm()
    }

    const deleteEvent = (eventId) => {
      if (confirm('¿Estás seguro de eliminar este evento? También se eliminarán todos sus tipos de ticket.')) {
        events.value = events.value.filter(e => e.id !== eventId)
        ticketTypes.value = ticketTypes.value.filter(tt => tt.eventId !== eventId)
        saveEvents()
        saveTicketTypes()
      }
    }

    const manageTicketTypes = (event) => {
      selectedEventForTickets.value = event.id
      activeTab.value = 'ticketTypes'
    }

    const openNewTicketTypeForm = () => {
      resetTicketTypeForm()
      showTicketTypeForm.value = true
    }

    const editTicketType = (ticketType) => {
      editingTicketType.value = ticketType.id
      ticketTypeForm.value = { ...ticketType }
      showTicketTypeForm.value = true
    }

    const saveTicketType = async () => {
      try {
        // Log de depuración para ver el formulario completo
        console.log('==================== INICIO SAVE TICKET TYPE ====================')
        console.log('🔍 ticketTypeForm.value completo:', JSON.stringify(ticketTypeForm.value, null, 2))
        console.log('🔍 ticketTypeForm.value.eventId:', ticketTypeForm.value.eventId, '(tipo:', typeof ticketTypeForm.value.eventId, ')')
        console.log('🔍 selectedEventForTickets.value:', selectedEventForTickets.value, '(tipo:', typeof selectedEventForTickets.value, ')')
        
        // Validar que el eventId no esté vacío
        if (!ticketTypeForm.value.eventId) {
          console.error('❌ VALIDACIÓN FALLIDA: eventId está vacío')
          alert('❌ Error: Debe seleccionar un evento')
          return
        }
        
        // Preparar datos para la API (mapear campos del frontend al backend)
        const ticketTypeData = {
          event_id: ticketTypeForm.value.eventId,
          name: ticketTypeForm.value.name,
          description: ticketTypeForm.value.description || '',
          price: parseFloat(ticketTypeForm.value.price),
          total_capacity: parseInt(ticketTypeForm.value.capacity)
        }
        
        console.log('📤 ticketTypeData a enviar:', JSON.stringify(ticketTypeData, null, 2))

        if (editingTicketType.value) {
          // Actualizar tipo de ticket existente
          const response = await ticketTypeApi.updateTicketType(editingTicketType.value, ticketTypeData)
          
          // Actualizar en el array local
          const index = ticketTypes.value.findIndex(tt => tt.id === editingTicketType.value)
          if (index !== -1 && response.success && response.data) {
            ticketTypes.value[index] = {
              id: response.data.id,
              eventId: response.data.event_id,
              name: response.data.name,
              description: response.data.description || '',
              price: response.data.price,
              capacity: response.data.total_capacity,
              sold: response.data.sold_tickets || 0
            }
          }
          alert('✅ Tipo de ticket actualizado correctamente')
        } else {
          // Crear nuevo tipo de ticket
          const response = await ticketTypeApi.createTicketType(ticketTypeData)
          
          console.log('📦 Respuesta completa del servidor:', response)
          console.log('✅ response.success:', response.success)
          console.log('✅ response.data:', response.data)
          console.log('✅ Tipo de response.data:', typeof response.data)
          
          // Agregar al array local
          if (response && response.success && response.data) {
            console.log('✅ Entrando a crear newTicketType...')
            console.log('✅ response.data.id:', response.data.id)
            console.log('✅ response.data.event_id:', response.data.event_id)
            
            const newTicketType = {
              id: response.data.id,
              eventId: response.data.event_id,
              name: response.data.name,
              description: response.data.description || '',
              price: response.data.price,
              capacity: response.data.total_capacity,
              sold: response.data.sold_tickets || 0
            }
            ticketTypes.value.push(newTicketType)
            console.log('✅ Tipo de ticket agregado al array local:', newTicketType)
            alert('✅ Tipo de ticket creado correctamente y guardado en la base de datos')
          } else {
            console.error('❌ Respuesta no válida:', { response })
            throw new Error('La respuesta del servidor no tiene el formato esperado')
          }
        }
        
        // Actualizar precio mínimo del evento
        updateEventMinPrice(ticketTypeForm.value.eventId)
        console.log('==================== FIN SAVE TICKET TYPE (ÉXITO) ====================')
        closeTicketTypeForm()
      } catch (error) {
        console.log('==================== FIN SAVE TICKET TYPE (ERROR) ====================')
        console.error('❌ Error completo:', error)
        console.error('❌ Error name:', error.name)
        console.error('❌ Error message:', error.message)
        console.error('❌ Error stack:', error.stack)
        alert('❌ Error al guardar el tipo de ticket: ' + error.message)
      }
    }

    const deleteTicketType = async (ticketTypeId) => {
      if (confirm('¿Estás seguro de eliminar este tipo de ticket?')) {
        try {
          const ticketType = ticketTypes.value.find(tt => tt.id === ticketTypeId)
          
          // Eliminar desde la API
          await ticketTypeApi.deleteTicketType(ticketTypeId)
          
          // Actualizar array local
          ticketTypes.value = ticketTypes.value.filter(tt => tt.id !== ticketTypeId)
          
          // Actualizar precio mínimo del evento
          if (ticketType) {
            updateEventMinPrice(ticketType.eventId)
          }
          
          alert('✅ Tipo de ticket eliminado correctamente')
        } catch (error) {
          console.error('Error al eliminar tipo de ticket:', error)
          alert('❌ Error al eliminar el tipo de ticket: ' + error.message)
        }
      }
    }

    const updateEventMinPrice = (eventId) => {
      const eventTickets = ticketTypes.value.filter(tt => tt.eventId === eventId)
      const event = events.value.find(e => e.id === eventId)
      
      if (event) {
        if (eventTickets.length > 0) {
          event.minPrice = Math.min(...eventTickets.map(tt => tt.price))
        } else {
          event.minPrice = 0
        }
      }
    }

    // ==========================================
    // FUNCIONES PARA GESTIÓN DE USUARIOS
    // ==========================================
    
    const getRoleClass = (role) => {
      const classes = {
        'Cliente': 'role-client',
        'Operador': 'role-operator',
        'Administrador': 'role-admin'
      }
      return classes[role] || 'role-default'
    }

    const getRoleIcon = (role) => {
      const icons = {
        'Cliente': '👨‍💼',
        'Operador': '🎫',
        'Administrador': '🔐'
      }
      return icons[role] || '👤'
    }

    const closeUserForm = () => {
      showUserForm.value = false
      editingUser.value = null
      userForm.value = {
        role: 'Cliente',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        document: '',
        employeeId: '',
        shift: 'mañana'
      }
    }

    const saveUser = async () => {
      try {
        console.log('==================== INICIO SAVE USER ====================')
        const token = localStorage.getItem('apiToken')
        console.log('Token obtenido:', token ? 'Existe' : 'NO EXISTE')
        console.log('Token length:', token?.length)
        
        if (!token) {
          console.error('❌ No hay token de autenticación')
          alert('❌ Error: No hay token de autenticación. Por favor, cierre sesión e inicie sesión nuevamente.')
          return
        }

        let endpoint = ''
        let userData = {
          email: userForm.value.email,
          password: userForm.value.password,
          firstName: userForm.value.firstName,
          lastName: userForm.value.lastName,
          phone: userForm.value.phone
        }

        // Configurar endpoint y datos según el rol
        if (userForm.value.role === 'Cliente') {
          endpoint = '/api/admin/clients'
          userData.document = userForm.value.document
        } else if (userForm.value.role === 'Operador') {
          endpoint = '/api/admin/operators'
          userData.employeeId = userForm.value.employeeId || `OP-${Date.now()}`
          userData.shift = userForm.value.shift
        }

        console.log('Endpoint:', endpoint)
        console.log('User Data:', userData)
        console.log('Enviando petición...')

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        })

        console.log('Response status:', response.status)
        console.log('Response ok:', response.ok)
        
        const data = await response.json()
        console.log('Response data:', data)

        if (response.ok && data.success) {
          console.log('✅ Usuario creado exitosamente')
          alert(`✅ ${userForm.value.role} creado exitosamente`)
          closeUserForm()
          await loadUsers()
        } else {
          console.error('❌ Error en respuesta:', data)
          alert(`❌ Error: ${data.message || 'Error desconocido'}`)
        }
        console.log('==================== FIN SAVE USER ====================')
      } catch (error) {
        console.error('==================== ERROR EN SAVE USER ====================')
        console.error('Error completo:', error)
        console.error('Error name:', error.name)
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
        alert(`❌ Error al crear usuario: ${error.message}`)
      }
    }

    const changeUserRole = (user) => {
      selectedUser.value = user
      newRole.value = user.userType
      showRoleChangeModal.value = true
    }

    const confirmRoleChange = async () => {
      try {
        const token = localStorage.getItem('apiToken')
        if (!token) {
          alert('No hay token de autenticación')
          return
        }

        if (newRole.value === selectedUser.value.userType) {
          alert('El usuario ya tiene ese rol')
          return
        }

        const response = await fetch(`/api/admin/users/${selectedUser.value.id}/role`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ newRole: newRole.value })
        })

        const data = await response.json()

        if (response.ok && data.success) {
          alert(`✅ Rol cambiado exitosamente de ${selectedUser.value.userType} a ${newRole.value}`)
          showRoleChangeModal.value = false
          selectedUser.value = null
          await loadUsers()
        } else {
          alert(`❌ Error: ${data.message}`)
        }
      } catch (error) {
        console.error('Error al cambiar rol:', error)
        alert('❌ Error al cambiar rol')
      }
    }

    const toggleUserStatus = async (user) => {
      try {
        const token = localStorage.getItem('apiToken')
        if (!token) {
          alert('No hay token de autenticación')
          return
        }

        const action = user.isActive ? 'desactivar' : 'activar'
        if (!confirm(`¿Está seguro que desea ${action} a ${user.email}?`)) {
          return
        }

        const response = await fetch(`/api/admin/users/${user.id}/toggle-status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()

        if (response.ok && data.success) {
          alert(`✅ Usuario ${action}do exitosamente`)
          await loadUsers()
        } else {
          alert(`❌ Error: ${data.message}`)
        }
      } catch (error) {
        console.error('Error al cambiar estado:', error)
        alert('❌ Error al cambiar estado del usuario')
      }
    }

    const handleLogout = () => {
      authStore.logout()
      router.push('/operator/login')
    }

    const goHome = () => {
      router.push('/')
    }

    // ========== FUNCIONES DE REPORTES (HU6) ==========

    const loadReportData = async () => {
      try {
        console.log('🔍 Cargando reporte con filtros:', reportFilters.value)
        
        const data = await reportService.getAttendanceReport(reportFilters.value)
        reportData.value = data
        
        // Actualizar tiempo de última actualización
        lastUpdateTime.value = new Date().toLocaleString('es-ES')
        
        console.log('✅ Reporte cargado:', data)
      } catch (error) {
        console.error('❌ Error al cargar reporte:', error)
        alert('Error al cargar el reporte. Por favor intenta nuevamente.')
      }
    }

    const clearFilters = () => {
      reportFilters.value = {
        eventId: '',
        startDate: '',
        endDate: '',
        status: '',
        sector: '',
        ticketTypeId: '',
        operatorId: ''
      }
      reportData.value = null
      lastUpdateTime.value = ''
    }

    const exportCSV = async () => {
      try {
        isExporting.value = true
        console.log('📄 Exportando CSV con filtros:', reportFilters.value)
        
        await reportService.exportToCSV(reportFilters.value)
        
        console.log('✅ CSV exportado exitosamente')
        alert('✅ Reporte CSV descargado exitosamente')
      } catch (error) {
        console.error('❌ Error al exportar CSV:', error)
        alert('Error al exportar el reporte CSV. Por favor intenta nuevamente.')
      } finally {
        isExporting.value = false
      }
    }

    const exportStatsCSV = async () => {
      try {
        isExporting.value = true
        console.log('📊 Exportando estadísticas CSV con filtros:', reportFilters.value)
        
        await reportService.exportStatsToCSV(reportFilters.value)
        
        console.log('✅ Estadísticas CSV exportadas exitosamente')
        alert('✅ Estadísticas CSV descargadas exitosamente')
      } catch (error) {
        console.error('❌ Error al exportar estadísticas CSV:', error)
        alert('Error al exportar estadísticas CSV. Por favor intenta nuevamente.')
      } finally {
        isExporting.value = false
      }
    }

    const exportPDF = async () => {
      try {
        isExporting.value = true
        console.log('📕 Exportando PDF con filtros:', reportFilters.value)
        
        await reportService.exportToPDF(reportFilters.value)
        
        console.log('✅ PDF exportado exitosamente')
        alert('✅ Reporte PDF descargado exitosamente')
      } catch (error) {
        console.error('❌ Error al exportar PDF:', error)
        alert('Error al exportar el reporte PDF. Por favor intenta nuevamente.')
      } finally {
        isExporting.value = false
      }
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Lifecycle
    onMounted(() => {
      loadData()
    })

    return {
      activeTab,
      tabs,
      showEventForm,
      showTicketTypeForm,
      editingEvent,
      editingTicketType,
      selectedEventForTickets,
      events,
      ticketTypes,
      eventForm,
      ticketTypeForm,
      userName,
      filteredTicketTypes,
      totalCapacity,
      totalPotentialRevenue,
      formatDate,
      formatPrice,
      getOccupancyPercentage,
      handleLogout,
      goHome,
      getEventTicketTypesCount,
      getEventOccupancy,
      getEventRevenue,
      closeEventForm,
      closeTicketTypeForm,
      editEvent,
      saveEvent,
      deleteEvent,
      manageTicketTypes,
      openNewTicketTypeForm,
      editTicketType,
      saveTicketType,
      deleteTicketType,
      handleLogout,
      // Usuarios
      users,
      showUserForm,
      showRoleChangeModal,
      editingUser,
      selectedUser,
      newRole,
      filterRole,
      userForm,
      totalUsers,
      filteredUsers,
      getRoleClass,
      getRoleIcon,
      closeUserForm,
      saveUser,
      changeUserRole,
      confirmRoleChange,
      toggleUserStatus,
      loadUsers,
      authStore,
      // Reportes (HU6)
      reportData,
      reportFilters,
      isExporting,
      lastUpdateTime,
      loadReportData,
      clearFilters,
      exportCSV,
      exportStatsCSV,
      exportPDF,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.admin-panel {
  min-height: 100vh;
  background: #f5f7fa;
}

/* Header */
.admin-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-title h1 {
  font-size: 28px;
  margin-bottom: 5px;
}

.header-title p {
  font-size: 14px;
  opacity: 0.9;
}

.btn-home {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.btn-home:hover {
  background: white;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-home:active {
  transform: translateY(0);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  font-size: 16px;
  font-weight: 600;
}

.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-logout:hover {
  background: white;
  color: #667eea;
}

/* Tabs */
.tabs-container {
  background: white;
  padding: 0 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 10px;
  max-width: 1400px;
  margin: 0 auto;
}

.tab-button {
  background: none;
  border: none;
  padding: 15px 25px;
  font-size: 16px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab-button:hover {
  color: #667eea;
  background: #f5f7fa;
}

.tab-button.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

/* Content */
.admin-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
}

.tab-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-header h2 {
  font-size: 24px;
  color: #333;
}

.header-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.event-selector {
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  min-width: 250px;
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-edit {
  background: #ffc107;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.btn-edit:hover {
  background: #e0a800;
}

.btn-info {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.btn-info:hover {
  background: #138496;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.btn-danger:hover {
  background: #c82333;
}

/* Events Grid */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.event-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.event-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-category {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(102, 126, 234, 0.9);
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.event-info {
  padding: 20px;
}

.event-info h3 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #333;
}

.event-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

.event-details {
  display: grid;
  gap: 8px;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.detail-item .label {
  color: #666;
  font-weight: 600;
}

.detail-item .value {
  color: #333;
}

.event-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Ticket Types */
.ticket-types-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.ticket-type-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ticket-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.ticket-type-header h3 {
  font-size: 20px;
  color: #333;
}

.ticket-price {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 16px;
}

.ticket-type-body p {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

.ticket-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.progress-bar {
  background: #e0e0e0;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 100%;
  transition: width 0.3s;
}

.occupancy-text {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.ticket-type-actions {
  display: flex;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
}

/* Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 48px;
}

.stat-info h3 {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  margin: 0;
}

.stats-table-container {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-table-container h3 {
  margin-bottom: 20px;
  color: #333;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
}

.stats-table th,
.stats-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.stats-table th {
  background: #f5f7fa;
  font-weight: 600;
  color: #333;
}

.stats-table td {
  color: #666;
}

.occupancy-badge {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  font-size: 22px;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  transition: color 0.3s;
}

.btn-close:hover {
  color: #333;
}

/* Forms */
.event-form,
.ticket-type-form {
  padding: 30px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-hint {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 25px;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .header-left {
    flex-direction: column;
    gap: 10px;
  }

  .btn-home {
    padding: 8px 16px;
    font-size: 13px;
  }

  .tabs-container {
    overflow-x: auto;
  }

  .events-grid,
  .ticket-types-list {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stats-table-container {
    overflow-x: auto;
  }
}

/* ========================================
   ESTILOS PARA GESTIÓN DE USUARIOS
   ======================================== */

.user-actions {
  display: flex;
  gap: 1rem;
}

.btn-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(56, 239, 125, 0.2);
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(56, 239, 125, 0.3);
}

.filters-bar {
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.users-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.users-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
}

.users-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.users-table tbody tr:hover {
  background-color: #f8f9fa;
}

.users-table td {
  padding: 1rem;
}

.role-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.role-client {
  background: #e3f2fd;
  color: #1976d2;
}

.role-operator {
  background: #fff3e0;
  color: #f57c00;
}

.role-admin {
  background: #fce4ec;
  color: #c2185b;
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.inactive {
  background: #ffebee;
  color: #c62828;
}

.user-extra-info {
  font-size: 0.9rem;
  color: #666;
}

.user-actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-edit-small,
.btn-toggle-small {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.btn-edit-small {
  background: #fff3e0;
  color: #f57c00;
}

.btn-edit-small:hover {
  background: #f57c00;
  color: white;
  transform: scale(1.1);
}

.btn-toggle-small.btn-deactivate {
  background: #ffebee;
  color: #c62828;
}

.btn-toggle-small.btn-deactivate:hover {
  background: #c62828;
  color: white;
  transform: scale(1.1);
}

.btn-toggle-small.btn-activate {
  background: #e8f5e9;
  color: #2e7d32;
}

.btn-toggle-small.btn-activate:hover {
  background: #2e7d32;
  color: white;
  transform: scale(1.1);
}

.user-form .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-small {
  max-width: 500px;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alert-warning {
  background: #fff3cd;
  border: 1px solid #ffc107;
  color: #856404;
}

/* ========== ESTILOS REPORTES (HU6) ========== */

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filters-section h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  align-items: end;
}

.report-stats-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.report-stats-section h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.stat-card.success {
  background: linear-gradient(135deg, #4caf50 0%, #81c784 100%);
  color: white;
}

.stat-card.warning {
  background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
  color: white;
}

.stat-card.danger {
  background: linear-gradient(135deg, #f44336 0%, #e57373 100%);
  color: white;
}

.stat-card.info {
  background: linear-gradient(135deg, #2196f3 0%, #64b5f6 100%);
  color: white;
}

.update-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding: 1rem;
  background: #f5f7fa;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #666;
}

.btn-refresh {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-refresh:hover {
  background: #764ba2;
  transform: translateY(-2px);
}

.export-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.export-section h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.export-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-export {
  flex: 1;
  min-width: 200px;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-export:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-csv {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  color: white;
}

.btn-csv:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.btn-pdf {
  background: linear-gradient(135deg, #f44336 0%, #ef5350 100%);
  color: white;
}

.btn-pdf:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
}

.report-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.report-section h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.report-table-container {
  overflow-x: auto;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.report-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.report-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
}

.report-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.report-table tbody tr:hover {
  background: #f5f7fa;
}

.badge-success {
  background: #4caf50;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.empty-state {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-state p {
  margin: 0;
}

/* Responsive para reportes */
@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    grid-column: 1;
  }

  .export-buttons {
    flex-direction: column;
  }

  .btn-export {
    width: 100%;
    min-width: auto;
  }

  .report-table {
    font-size: 0.8rem;
  }

  .report-table th,
  .report-table td {
    padding: 0.5rem;
  }
}
</style>
