-- Create set_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Add RLS policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Shop owners can view their orders
CREATE POLICY "Shop owners can view their orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    shop_id IN (
      SELECT id FROM shops
      WHERE user_id = auth.uid()
    )
  );

-- Shop owners can update their orders
CREATE POLICY "Shop owners can update their orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    shop_id IN (
      SELECT id FROM shops
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    shop_id IN (
      SELECT id FROM shops
      WHERE user_id = auth.uid()
    )
  );

-- Anyone can create orders
CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX orders_shop_id_idx ON orders(shop_id);
CREATE INDEX orders_item_id_idx ON orders(item_id);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_created_at_idx ON orders(created_at DESC); 