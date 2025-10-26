-- Migración: Agregar campos faltantes a la tabla tickets
-- Fecha: 2025-10-25
-- Descripción: Agrega columnas para payment_reference, qr_code y datos del comprador

USE ticketvue;

-- Renombrar qr_data a qr_code
ALTER TABLE tickets 
CHANGE COLUMN qr_data qr_code TEXT NULL;
COMMIT;
