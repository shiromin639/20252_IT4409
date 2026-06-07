-- Drop the old check constraint on orders.status so Hibernate can recreate it
-- with the new AWAITING_PAYMENT enum value.
-- This runs on app startup before Hibernate's ddl-auto=update.
ALTER TABLE IF EXISTS orders DROP CONSTRAINT IF EXISTS orders_status_check;
