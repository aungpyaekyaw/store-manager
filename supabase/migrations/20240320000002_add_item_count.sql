-- Add count column to items table with a default value of 0 and not null constraint
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS count INTEGER NOT NULL DEFAULT 0
CHECK (count >= 0); -- Ensure count cannot be negative

-- Update RLS policies to include the new column
DROP POLICY IF EXISTS "Users can view their items" ON items;
CREATE POLICY "Users can view their items"
    ON items FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their items" ON items;
CREATE POLICY "Users can manage their items"
    ON items FOR ALL
    USING (auth.uid() = user_id); 