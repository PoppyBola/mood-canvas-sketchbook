
-- Create bucket for mood images if it doesn't exist
INSERT INTO storage.buckets(id, name, public)
VALUES('mood_images', 'Mood Images Bucket', true)
ON CONFLICT (id) DO NOTHING;

-- Set up public access policy for mood_images bucket
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'mood_images');

-- Set up policy allowing authenticated users to upload to mood_images bucket
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'mood_images' AND auth.role() = 'authenticated');

-- Set up policy allowing users to update their own uploads
CREATE POLICY "Users can update own content" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'mood_images' AND auth.uid() = owner);

-- Set up policy allowing users to delete their own uploads
CREATE POLICY "Users can delete own content" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'mood_images' AND auth.uid() = owner);
