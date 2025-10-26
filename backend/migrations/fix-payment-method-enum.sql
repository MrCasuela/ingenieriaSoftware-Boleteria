-- Migración: Actualizar ENUM de payment_method
-- Fecha: 2025-10-25
-- Descripción: Actualiza los valores permitidos de payment_method para coincidir con el modelo

USE ticketvue;

-- Actualizar la columna payment_method con los valores correctos en español
ALTER TABLE tickets 
MODIFY COLUMN payment_method ENUM(
    'tarjeta_credito',
    'tarjeta_debito', 
    'transferencia',
    'efectivo',
    'mercadopago',
    'paypal',
    'credit_card',
    'debit_card',
    'transfer',
    'cash'
) DEFAULT 'tarjeta_credito';

COMMIT;
