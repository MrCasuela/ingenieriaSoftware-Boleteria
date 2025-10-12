/**
 * Sistema de Logging Profesional
 * Escribe logs en archivos y consola
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Logger {
  constructor() {
    // Directorio de logs
    this.logsDir = path.join(__dirname, '../../logs');
    
    // Crear directorio si no existe
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
    
    // Archivos de log por tipo
    this.files = {
      error: path.join(this.logsDir, 'errors.log'),
      combined: path.join(this.logsDir, 'combined.log'),
      ticket_types: path.join(this.logsDir, 'ticket-types.log'),
      events: path.join(this.logsDir, 'events.log'),
      database: path.join(this.logsDir, 'database.log')
    };
  }

  /**
   * Formatea el timestamp
   */
  _getTimestamp() {
    const now = new Date();
    return now.toISOString();
  }

  /**
   * Formatea el mensaje de log
   */
  _formatMessage(level, category, message, data = null) {
    const timestamp = this._getTimestamp();
    let logMessage = `[${timestamp}] [${level}] [${category}] ${message}`;
    
    if (data) {
      if (typeof data === 'object') {
        logMessage += '\n' + JSON.stringify(data, null, 2);
      } else {
        logMessage += ` ${data}`;
      }
    }
    
    return logMessage + '\n';
  }

  /**
   * Escribe en archivo
   */
  _writeToFile(filename, content) {
    try {
      fs.appendFileSync(filename, content, 'utf8');
    } catch (error) {
      console.error('Error al escribir en archivo de log:', error);
    }
  }

  /**
   * Log de información
   */
  info(category, message, data = null) {
    const logMessage = this._formatMessage('INFO', category, message, data);
    this._writeToFile(this.files.combined, logMessage);
    
    // Escribir en archivo específico si existe
    if (this.files[category.toLowerCase()]) {
      this._writeToFile(this.files[category.toLowerCase()], logMessage);
    }
  }

  /**
   * Log de éxito
   */
  success(category, message, data = null) {
    const logMessage = this._formatMessage('SUCCESS', category, message, data);
    this._writeToFile(this.files.combined, logMessage);
    
    if (this.files[category.toLowerCase()]) {
      this._writeToFile(this.files[category.toLowerCase()], logMessage);
    }
  }

  /**
   * Log de advertencia
   */
  warn(category, message, data = null) {
    const logMessage = this._formatMessage('WARN', category, message, data);
    console.warn(`⚠️  ${logMessage.trim()}`);
    this._writeToFile(this.files.combined, logMessage);
    
    if (this.files[category.toLowerCase()]) {
      this._writeToFile(this.files[category.toLowerCase()], logMessage);
    }
  }

  /**
   * Log de error
   */
  error(category, message, error = null) {
    let errorData = null;
    
    if (error) {
      errorData = {
        message: error.message,
        stack: error.stack,
        name: error.name
      };
      
      // Si el error tiene datos adicionales
      if (error.response) {
        errorData.response = error.response;
      }
      if (error.code) {
        errorData.code = error.code;
      }
    }
    
    const logMessage = this._formatMessage('ERROR', category, message, errorData);
    
    // Siempre escribir en error.log
    this._writeToFile(this.files.error, logMessage);
    this._writeToFile(this.files.combined, logMessage);
    
    if (this.files[category.toLowerCase()]) {
      this._writeToFile(this.files[category.toLowerCase()], logMessage);
    }
  }

  /**
   * Log de debug (solo en desarrollo)
   */
  debug(category, message, data = null) {
    if (process.env.NODE_ENV !== 'production') {
      const logMessage = this._formatMessage('DEBUG', category, message, data);
      this._writeToFile(this.files.combined, logMessage);
    }
  }

  /**
   * Log específico para peticiones HTTP
   */
  http(method, url, statusCode, data = null) {
    const message = `${method} ${url} - Status: ${statusCode}`;
    const logMessage = this._formatMessage('HTTP', 'API', message, data);
    this._writeToFile(this.files.combined, logMessage);
  }

  /**
   * Log específico para base de datos
   */
  database(operation, message, data = null) {
    const logMessage = this._formatMessage('DATABASE', operation, message, data);
    this._writeToFile(this.files.database, logMessage);
    this._writeToFile(this.files.combined, logMessage);
  }

  /**
   * Limpiar logs antiguos (más de 30 días)
   */
  cleanOldLogs(days = 30) {
    const now = Date.now();
    const maxAge = days * 24 * 60 * 60 * 1000; // días a milisegundos
    
    Object.values(this.files).forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtime.getTime();
        
        if (fileAge > maxAge) {
          fs.unlinkSync(filePath);
        }
      }
    });
  }

  /**
   * Rotar logs si son muy grandes (más de 10MB)
   */
  rotateLogs() {
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    Object.entries(this.files).forEach(([name, filePath]) => {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        
        if (stats.size > maxSize) {
          const timestamp = new Date().toISOString().replace(/:/g, '-');
          const backupPath = filePath.replace('.log', `-${timestamp}.log`);
          
          fs.renameSync(filePath, backupPath);
        }
      }
    });
  }
}

// Exportar instancia singleton
const logger = new Logger();

// Rotar logs al iniciar si es necesario
logger.rotateLogs();

export default logger;
