-- Create a bucket for item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'item-images' AND
  owner = auth.uid()
);

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'item-images' AND
  owner = auth.uid()
)
WITH CHECK (
  bucket_id = 'item-images' AND
  owner = auth.uid()
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'item-images' AND
  owner = auth.uid()
);

-- Allow public access to read images
CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'item-images');

-- Add image_url column to items table
ALTER TABLE items
ADD COLUMN image_url TEXT; 