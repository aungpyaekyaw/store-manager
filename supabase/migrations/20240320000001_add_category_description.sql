-- Add description column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update RLS policies to include the new column
DROP POLICY IF EXISTS "Users can view their categories" ON categories;
CREATE POLICY "Users can view their categories"
    ON categories FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their categories" ON categories;
CREATE POLICY "Users can manage their categories"
    ON categories FOR ALL
    USING (auth.uid() = user_id); 