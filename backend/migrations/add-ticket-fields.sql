-- Migración: Agregar campos faltantes a la tabla tickets
-- Fecha: 2025-10-25
-- Descripción: Agrega columnas para payment_reference, qr_code y datos del comprador

USE ticketvue;

-- Renombrar qr_data a qr_code
ALTER TABLE tickets 
CHANGE COLUMN qr_data qr_code TEXT NULL;

-- Agregar columna payment_reference
ALTER TABLE tickets 
ADD COLUMN payment_reference VARCHAR(100) NULL AFTER payment_details;

-- Agregar campos del comprador
ALTER TABLE tickets 
ADD COLUMN buyer_name VARCHAR(100) NULL AFTER qr_code;

ALTER TABLE tickets 
ADD COLUMN buyer_email VARCHAR(100) NULL AFTER buyer_name;

ALTER TABLE tickets 
ADD COLUMN buyer_document VARCHAR(12) NULL AFTER buyer_email;

ALTER TABLE tickets 
ADD COLUMN buyer_phone VARCHAR(20) NULL AFTER buyer_document;

-- Índices adicionales para mejorar el rendimiento
CREATE INDEX idx_payment_reference ON tickets(payment_reference);
CREATE INDEX idx_buyer_document ON tickets(buyer_document);

COMMIT;
