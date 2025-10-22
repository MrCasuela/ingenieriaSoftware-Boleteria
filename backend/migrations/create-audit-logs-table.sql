-- Script de migración para crear tabla audit_logs
-- Sistema de Auditoría y Trazabilidad de Validaciones

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Información del ticket
  ticket_code VARCHAR(255) NOT NULL,
  ticket_id INT NULL,
  ticket_type VARCHAR(100),
  ticket_category ENUM('normal', 'vip', 'general', 'premium', 'other') DEFAULT 'other',
  
  -- Información del operador
  operator_name VARCHAR(255) NOT NULL,
  operator_email VARCHAR(255),
  operator_id INT NULL,
  
  -- Información del evento
  event_id INT NULL,
  event_name VARCHAR(255),
  
  -- Resultado de la validación
  validation_result ENUM('approved', 'rejected', 'error') NOT NULL,
  validation_type ENUM('qr', 'manual', 'rut') DEFAULT 'manual',
  
  -- Mensajes y razones
  message TEXT,
  rejection_reason TEXT,
  
  -- Detección de fraude
  fraud_detected BOOLEAN DEFAULT FALSE,
  
  -- Información del usuario/cliente
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  user_rut VARCHAR(20),
  
  -- Metadata adicional (JSON)
  metadata JSON,
  
  -- Timestamps
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices para consultas rápidas
  INDEX idx_event_id (event_id),
  INDEX idx_ticket_code (ticket_code),
  INDEX idx_operator_name (operator_name),
  INDEX idx_validation_result (validation_result),
  INDEX idx_validation_type (validation_type),
  INDEX idx_timestamp (timestamp),
  INDEX idx_fraud_detected (fraud_detected),
  INDEX idx_ticket_category (ticket_category),
  
  -- Clave foránea a eventos (opcional, puede ser NULL si el evento no existe)
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos de prueba (opcional)
INSERT INTO audit_logs (
  ticket_code, 
  operator_name, 
  operator_email,
  event_id,
  event_name,
  validation_result, 
  validation_type,
  ticket_category,
  message,
  fraud_detected,
  user_name,
  user_rut
) VALUES 
(
  'TICK-001-ABC',
  'Juan Pérez',
  'juan.perez@example.com',
  1,
  'Concierto Rock 2024',
  'approved',
  'qr',
  'normal',
  'Ticket validado correctamente',
  FALSE,
  'María González',
  '12345678-9'
),
(
  'TICK-002-DEF',
  'Ana Martínez',
  'ana.martinez@example.com',
  1,
  'Concierto Rock 2024',
  'rejected',
  'manual',
  'vip',
  'Ticket ya utilizado',
  TRUE,
  'Carlos Rojas',
  '98765432-1'
);

SELECT 'Tabla audit_logs creada exitosamente' AS resultado;
