/**
 * Sistema de Logging para Debug
 * Guarda logs en localStorage y en consola
 */

class Logger {
  constructor() {
    this.maxLogs = 500; // Máximo número de logs a guardar
    this.storageKey = 'app_debug_logs';
  }

  /**
   * Formatea un mensaje de log
   */
  _formatMessage(level, category, message, data) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      category,
      message,
      data: data || null
    };
  }

  /**
   * Guarda un log en localStorage
   */
  _saveToStorage(logEntry) {
    try {
      const logs = this.getLogs();
      logs.unshift(logEntry);
      
      // Mantener solo los últimos maxLogs
      if (logs.length > this.maxLogs) {
        logs.splice(this.maxLogs);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch (error) {
      console.warn('No se pudo guardar el log en localStorage:', error);
    }
  }

  /**
   * Registra un log de información
   */
  info(category, message, data) {
    const logEntry = this._formatMessage('INFO', category, message, data);
    console.log(`ℹ️ [${category}]`, message, data || '');
    this._saveToStorage(logEntry);
  }

  /**
   * Registra un log de éxito
   */
  success(category, message, data) {
    const logEntry = this._formatMessage('SUCCESS', category, message, data);
    console.log(`✅ [${category}]`, message, data || '');
    this._saveToStorage(logEntry);
  }

  /**
   * Registra un log de advertencia
   */
  warn(category, message, data) {
    const logEntry = this._formatMessage('WARN', category, message, data);
    console.warn(`⚠️ [${category}]`, message, data || '');
    this._saveToStorage(logEntry);
  }

  /**
   * Registra un log de error
   */
  error(category, message, data) {
    const logEntry = this._formatMessage('ERROR', category, message, data);
    console.error(`❌ [${category}]`, message, data || '');
    this._saveToStorage(logEntry);
  }

  /**
   * Registra un log de debug
   */
  debug(category, message, data) {
    const logEntry = this._formatMessage('DEBUG', category, message, data);
    console.log(`🔍 [${category}]`, message, data || '');
    this._saveToStorage(logEntry);
  }

  /**
   * Obtiene todos los logs guardados
   */
  getLogs() {
    try {
      const logs = localStorage.getItem(this.storageKey);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.warn('No se pudieron obtener los logs:', error);
      return [];
    }
  }

  /**
   * Filtra logs por categoría
   */
  getLogsByCategory(category) {
    return this.getLogs().filter(log => log.category === category);
  }

  /**
   * Filtra logs por nivel
   */
  getLogsByLevel(level) {
    return this.getLogs().filter(log => log.level === level);
  }

  /**
   * Obtiene los últimos N logs
   */
  getRecentLogs(count = 50) {
    return this.getLogs().slice(0, count);
  }

  /**
   * Limpia todos los logs
   */
  clearLogs() {
    localStorage.removeItem(this.storageKey);
    console.log('🗑️ Logs limpiados');
  }

  /**
   * Exporta los logs como texto
   */
  exportLogs() {
    const logs = this.getLogs();
    return logs.map(log => {
      return `[${log.timestamp}] [${log.level}] [${log.category}] ${log.message}${log.data ? '\n  Data: ' + JSON.stringify(log.data, null, 2) : ''}`;
    }).join('\n\n');
  }

  /**
   * Descarga los logs como archivo de texto
   */
  downloadLogs() {
    const logsText = this.exportLogs();
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Muestra un resumen de logs en la consola
   */
  showSummary() {
    const logs = this.getLogs();
    const summary = {
      total: logs.length,
      errors: logs.filter(l => l.level === 'ERROR').length,
      warnings: logs.filter(l => l.level === 'WARN').length,
      info: logs.filter(l => l.level === 'INFO').length,
      success: logs.filter(l => l.level === 'SUCCESS').length,
      debug: logs.filter(l => l.level === 'DEBUG').length
    };
    
    console.log('📊 Resumen de Logs:', summary);
    return summary;
  }
}

// Exportar instancia singleton
export const logger = new Logger();

// Hacer disponible globalmente para debugging en consola
if (typeof window !== 'undefined') {
  window.appLogger = logger;
}

export default logger;
