-- Add location fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS latitude FLOAT,
ADD COLUMN IF NOT EXISTS longitude FLOAT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add location fields to duos table
ALTER TABLE public.duos
ADD COLUMN IF NOT EXISTS latitude FLOAT,
ADD COLUMN IF NOT EXISTS longitude FLOAT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Update sync_user_after_auth function to include location fields
CREATE OR REPLACE FUNCTION sync_user_after_auth() 
RETURNS TRIGGER AS $$
BEGIN
  -- Extract metadata
  INSERT INTO public.users (id, email, name, photos, latitude, longitude, location)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE((NEW.raw_user_meta_data->>'name')::TEXT, NEW.email),
    '{}'::TEXT[],
    (NEW.raw_user_meta_data->>'latitude')::FLOAT,
    (NEW.raw_user_meta_data->>'longitude')::FLOAT,
    (NEW.raw_user_meta_data->>'location')::TEXT
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update sync_user_updates function to include location fields
CREATE OR REPLACE FUNCTION sync_user_updates() 
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET 
    email = NEW.email,
    name = COALESCE((NEW.raw_user_meta_data->>'name')::TEXT, public.users.name),
    latitude = (NEW.raw_user_meta_data->>'latitude')::FLOAT,
    longitude = (NEW.raw_user_meta_data->>'longitude')::FLOAT,
    location = (NEW.raw_user_meta_data->>'location')::TEXT,
    updated_at = now()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 