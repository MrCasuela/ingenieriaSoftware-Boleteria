-- Script de inicialización de base de datos con soporte para migraciones
-- TicketVue - Sistema de Boletería
-- MySQL 8.0+

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS ticketvue 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE ticketvue;

-- ===================================
-- TABLA: users
-- ===================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    user_type ENUM('Cliente', 'Operador', 'Administrador') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Campos específicos de Cliente
    document VARCHAR(12) UNIQUE,
    total_purchases INT DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0.00,
    preferences JSON,
    
    -- Campos específicos de Operador
    employee_id VARCHAR(20) UNIQUE,
    total_validations INT DEFAULT 0,
    shift ENUM('mañana', 'tarde', 'noche', 'completo'),
    
    -- Campos específicos de Administrador
    admin_level ENUM('super', 'moderador', 'soporte'),
    permissions JSON,
    last_login DATETIME,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_user_type (user_type),
    INDEX idx_document (document),
    INDEX idx_employee_id (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- TABLA: events
-- Verificar si la tabla existe y migrarla si es necesario
-- ===================================

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    date DATETIME NOT NULL,
    location VARCHAR(200) NOT NULL,
    venue JSON,
    image VARCHAR(500) DEFAULT 'https://via.placeholder.com/400x200',
    category ENUM('concierto', 'deportes', 'teatro', 'conferencia', 'festival', 'otro') DEFAULT 'otro',
    status ENUM('draft', 'published', 'cancelled', 'completed') DEFAULT 'published',
    total_capacity INT NOT NULL DEFAULT 1000 CHECK (total_capacity > 0),
    total_sold INT DEFAULT 0,
    revenue DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_date_status (date, status),
    INDEX idx_category (category),
    FULLTEXT INDEX idx_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migración: Eliminar organizer_id si existe
SET @dbname = DATABASE();
SET @tablename = 'events';
SET @columnname = 'organizer_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  CONCAT('ALTER TABLE ', @tablename, ' DROP COLUMN ', @columnname, ';'),
  'SELECT 1;'
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

-- Migración: Agregar total_capacity si no existe
SET @columnname = 'total_capacity';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) = 0,
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NOT NULL DEFAULT 1000 CHECK (', @columnname, ' > 0) AFTER status;'),
  'SELECT 1;'
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

-- Migración: Eliminar eventos duplicados (mantener solo el más antiguo)
DELETE e1 FROM events e1
INNER JOIN events e2 
WHERE 
  e1.id > e2.id 
  AND e1.name = e2.name;

-- Migración: Agregar restricción UNIQUE a name si no existe
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (INDEX_NAME = 'unique_event_name')
  ) = 0,
  CONCAT('ALTER TABLE ', @tablename, ' ADD UNIQUE KEY unique_event_name (name);'),
  'SELECT 1;'
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

-- Migración: Agregar índice a name si no existe
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (INDEX_NAME = 'idx_name')
  ) = 0,
  CONCAT('ALTER TABLE ', @tablename, ' ADD INDEX idx_name (name);'),
  'SELECT 1;'
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

-- ===================================
-- TABLA: ticket_types
-- ===================================
CREATE TABLE IF NOT EXISTS ticket_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    quantity INT NOT NULL CHECK (quantity >= 0),
    available INT NOT NULL CHECK (available >= 0),
    features JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_event_id (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- TABLA: tickets
-- ===================================
CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_code VARCHAR(50) NOT NULL UNIQUE,
    event_id INT NOT NULL,
    ticket_type_id INT NOT NULL,
    buyer_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    service_charge DECIMAL(10, 2) DEFAULT 5.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'paid', 'validated', 'cancelled', 'refunded') DEFAULT 'paid',
    payment_method ENUM('tarjeta_credito', 'tarjeta_debito', 'transferencia', 'efectivo', 'mercadopago', 'paypal') DEFAULT 'tarjeta_credito',
    payment_reference VARCHAR(100),
    qr_code TEXT,
    
    -- Datos del comprador (almacenados por auditoría)
    buyer_name VARCHAR(100),
    buyer_email VARCHAR(100),
    buyer_document VARCHAR(12),
    buyer_phone VARCHAR(20),
    
    -- Validación
    validated_by INT,
    validated_at DATETIME,
    
    -- Timestamps
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT,
    FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_ticket_code (ticket_code),
    INDEX idx_event_id (event_id),
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_status (status),
    INDEX idx_purchase_date (purchase_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- TABLA: audit_logs
-- Sistema de Auditoría y Trazabilidad de Validaciones
-- ===================================
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
    
    -- Información de sesión
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    
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

-- NOTA: Los datos de prueba de audit_logs se comentaron porque requieren que existan eventos primero
-- Los registros de auditoría se crearán automáticamente cuando se validen tickets en la aplicación

-- Insertar datos de prueba en audit_logs (COMENTADO - descomentar solo si ya existen eventos)
-- INSERT INTO audit_logs (
--   ticket_code, 
--   operator_name, 
--   operator_email,
--   event_id,
--   event_name,
--   validation_result, 
--   validation_type,
--   ticket_category,
--   message,
--   fraud_detected,
--   user_name,
--   user_rut
-- ) VALUES 
-- (
--   'TICK-001-ABC',
--   'Juan Pérez',
--   'juan.perez@example.com',
--   1,
--   'Concierto Rock 2024',
--   'approved',
--   'qr',
--   'normal',
--   'Ticket validado correctamente',
--   FALSE,
--   'María González',
--   '12345678-9'
-- ),
-- (
--   'TICK-002-DEF',
--   'Ana Martínez',
--   'ana.martinez@example.com',
--   1,
--   'Concierto Rock 2024',
--   'rejected',
--   'manual',
--   'vip',
--   'Ticket ya utilizado',
--   TRUE,
--   'Carlos Rojas',
--   '98765432-1'
-- );

-- Mensaje de confirmación
SELECT 'Base de datos inicializada correctamente con tabla audit_logs' AS status;
