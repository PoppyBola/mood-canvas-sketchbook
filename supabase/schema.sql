
-- =========================================================
-- SUPABASE SCHEMA FOR DAILY MOOD CANVAS
-- =========================================================
-- Instructions: Run these SQL commands in your Supabase SQL Editor
-- =========================================================

-- Main table for mood entries and associated content
CREATE TABLE public.mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote text NOT NULL,
  quote_author text,
  image_path text NOT NULL, -- Path in Supabase Storage bucket (e.g., 'public/happy_1.png')
  mood_tags text[] NOT NULL, -- Array of mood keywords (e.g., {'happy', 'uplifting'})
  gradient_classes text[] NOT NULL, -- Array of Tailwind gradient classes
  is_approved boolean DEFAULT true, -- For potential future moderation
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add an index on mood_tags for faster searching using the contains operator
CREATE INDEX idx_mood_entries_tags ON public.mood_entries USING gin (mood_tags);

-- Enable Row Level Security
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access for approved entries
CREATE POLICY "Allow public read access" ON public.mood_entries
  FOR SELECT USING (is_approved = true);

-- Policy: Allow admin users full access (requires admin role setup)
CREATE POLICY "Allow admin full access" ON public.mood_entries
  FOR ALL USING (auth.role() = 'service_role' OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true
  ));

-- User profiles linked to Supabase Auth
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  is_admin boolean DEFAULT false,
  mood_preference_tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view any profile
CREATE POLICY "Allow public read access" ON public.profiles
  FOR SELECT USING (true);

-- Policy: Allow users to insert/update their own profile
CREATE POLICY "Allow individual insert/update" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    -- Generate a username based on the email if available, or a random string
    COALESCE(
      SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(NEW.id::text, 1, 6),
      'user_' || SUBSTRING(NEW.id::text, 1, 10)
    ),
    -- Use email as initial display name if available
    COALESCE(SPLIT_PART(NEW.email, '@', 1), 'New User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the handle_new_user function when a new user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User mood journal entries table
CREATE TABLE public.user_mood_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_text text NOT NULL,
  mood_entry_id uuid REFERENCES public.mood_entries(id),
  personal_note text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_mood_history ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to manage their own entries
CREATE POLICY "Allow users to manage their entries" ON public.user_mood_history
  FOR ALL USING (auth.uid() = user_id);

-- Policy: Allow admin to view all entries
CREATE POLICY "Allow admin to view all entries" ON public.user_mood_history
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true
  ));

-- =========================================================
-- Sample Data Insertion (optional)
-- =========================================================

-- Insert sample mood entries
INSERT INTO public.mood_entries (quote, quote_author, image_path, mood_tags, gradient_classes)
VALUES
  (
    'Happiness is not something ready-made. It comes from your own actions.',
    'Dalai Lama',
    'public/happy_1.png',
    ARRAY['happy', 'joyful', 'cheerful'],
    ARRAY['from-yellow-200', 'to-orange-200']
  ),
  (
    'Peace comes from within. Do not seek it without.',
    'Buddha',
    'public/calm_1.png',
    ARRAY['calm', 'peaceful', 'serene'],
    ARRAY['from-blue-100', 'to-green-100']
  ),
  (
    'The purpose of our lives is to be happy.',
    'Dalai Lama',
    'public/content_1.png',
    ARRAY['content', 'satisfied', 'fulfilled'],
    ARRAY['from-green-100', 'to-blue-200']
  );
