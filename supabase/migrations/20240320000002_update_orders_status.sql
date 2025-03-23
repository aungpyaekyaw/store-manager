-- First, drop the existing check constraint
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add new check constraint with updated status options
ALTER TABLE orders
ADD CONSTRAINT orders_status_check
CHECK (status IN ('pending', 'accept', 'delivered', 'cancelled'));

-- Set default value for status column to 'pending'
ALTER TABLE orders
ALTER COLUMN status SET DEFAULT 'pending'; 