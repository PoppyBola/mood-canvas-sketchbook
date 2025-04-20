
-- Create a storage bucket for mood images
INSERT INTO storage.buckets (id, name, public)
VALUES ('mood_images', 'mood_images', true)
ON CONFLICT (id) DO NOTHING;
