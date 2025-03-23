-- Add is_disabled column to items table with default value of false
ALTER TABLE items
ADD COLUMN is_disabled BOOLEAN NOT NULL DEFAULT false;

-- Update RLS policies to include is_disabled field
CREATE POLICY "Public users can view enabled items" ON "public"."items"
FOR SELECT
TO public
USING (
  is_disabled = false
  AND EXISTS (
    SELECT 1 FROM shops 
    WHERE shops.id = items.shop_id 
    AND shops.is_disabled = false
  )
);

-- Ensure shop owners can see and manage all their items
CREATE POLICY "Shop owners can view all their items including disabled ones" ON "public"."items"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM shops 
    WHERE shops.id = items.shop_id 
    AND shops.user_id = auth.uid()
  )
); 