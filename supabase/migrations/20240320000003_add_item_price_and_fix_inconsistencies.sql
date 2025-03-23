-- Add price column to items table with a default value of 0 and not null constraint
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) NOT NULL DEFAULT 0
CHECK (price >= 0); -- Ensure price cannot be negative

-- Add user_id to items if not already inserting during creation
UPDATE items i
SET user_id = s.user_id
FROM shops s
WHERE i.shop_id = s.id
AND i.user_id IS NULL;

-- Make user_id NOT NULL after ensuring all rows have a value
ALTER TABLE items
ALTER COLUMN user_id SET NOT NULL;

-- Add missing timestamps to categories if they don't exist
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());

-- Create trigger for categories if it doesn't exist
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update RLS policies to include the new columns
DROP POLICY IF EXISTS "Users can view their items" ON items;
CREATE POLICY "Users can view their items"
    ON items FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their items" ON items;
CREATE POLICY "Users can manage their items"
    ON items FOR ALL
    USING (auth.uid() = user_id); 