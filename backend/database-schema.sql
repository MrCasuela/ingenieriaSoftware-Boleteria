-- Script de creación de base de datos y tablas para TicketVue
-- MySQL 8.0+

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS ticketvue 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE ticketvue;

-- Tabla: users (con herencia - Single Table Inheritance)
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

-- Tabla: events
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
    organizer_id INT,
    total_sold INT DEFAULT 0,
    revenue DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_date_status (date, status),
    INDEX idx_category (category),
    FULLTEXT INDEX idx_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: ticket_types
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

-- Tabla: tickets
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
    qr_data TEXT NOT NULL,
    validated_by INT,
    validated_at DATETIME,
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('credit_card', 'debit_card', 'transfer', 'cash') DEFAULT 'credit_card',
    payment_details JSON,
    additional_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (validated_by) REFERENCES users(id),
    INDEX idx_ticket_code (ticket_code),
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_event_status (event_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos de ejemplo (opcional)

-- Insertar un administrador de prueba
-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO users (email, password, first_name, last_name, user_type, admin_level, permissions) 
VALUES (
    'admin@ticketvue.com',
    '$2a$10$xQZwXVzLKqL1KxYvPQNh1eOQJzLZ8vKFq.TqUjvXLp4JmPUOKqK8K',
    'Admin',
    'Sistema',
    'Administrador',
    'super',
    '["full_access"]'
);

-- Insertar un operador de prueba
-- Contraseña: operador123
INSERT INTO users (email, password, first_name, last_name, user_type, employee_id, shift) 
VALUES (
    'operador@ticketvue.com',
    '$2a$10$xQZwXVzLKqL1KxYvPQNh1eOQJzLZ8vKFq.TqUjvXLp4JmPUOKqK8K',
    'Juan',
    'Pérez',
    'Operador',
    'OP001',
    'completo'
);

COMMIT;
