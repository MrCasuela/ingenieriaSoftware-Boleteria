-- Migración: Actualizar ENUM de validation_type en audit_logs
-- Fecha: 2025-10-25
-- Descripción: Actualiza los valores permitidos de validation_type para coincidir con el modelo

USE ticketvue;

-- Actualizar la columna validation_type con los valores correctos
ALTER TABLE audit_logs 
MODIFY COLUMN validation_type ENUM('qr', 'manual', 'rut', 'qr_scan', 'manual_entry') NOT NULL
COMMENT 'Tipo: qr (escáner), manual (código), rut (búsqueda por RUT)';

COMMIT;
