-- Create matches table to track likes and matches between duos
CREATE TABLE IF NOT EXISTS public.duo_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  liker_duo_id UUID NOT NULL REFERENCES public.duos(id) ON DELETE CASCADE,
  liked_duo_id UUID NOT NULL REFERENCES public.duos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Adding a unique constraint to prevent duplicate likes
  UNIQUE(liker_duo_id, liked_duo_id)
);

-- Add RLS policies for the duo_matches table
ALTER TABLE public.duo_matches ENABLE ROW LEVEL SECURITY;

-- Users can view matches they're a part of
CREATE POLICY "Users can view their own duo matches" 
  ON public.duo_matches
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT duos.user1_id FROM public.duos WHERE duos.id = liker_duo_id
      UNION
      SELECT duos.user2_id FROM public.duos WHERE duos.id = liker_duo_id
      UNION
      SELECT duos.user1_id FROM public.duos WHERE duos.id = liked_duo_id
      UNION
      SELECT duos.user2_id FROM public.duos WHERE duos.id = liked_duo_id
    )
  );

-- Users can create matches where they are the liker
CREATE POLICY "Users can create duo matches only for their own duos"
  ON public.duo_matches
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT duos.user1_id FROM public.duos WHERE duos.id = liker_duo_id
      UNION
      SELECT duos.user2_id FROM public.duos WHERE duos.id = liker_duo_id
    )
  );

-- Create a function to check if a match exists
CREATE OR REPLACE FUNCTION public.check_duo_match(duo1_id UUID, duo2_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  match_exists BOOLEAN;
BEGIN
  -- Check if both duos have liked each other
  SELECT EXISTS (
    SELECT 1 FROM public.duo_matches
    WHERE 
      (liker_duo_id = duo1_id AND liked_duo_id = duo2_id)
      AND
      EXISTS (
        SELECT 1 FROM public.duo_matches
        WHERE liker_duo_id = duo2_id AND liked_duo_id = duo1_id
      )
  ) INTO match_exists;
  
  RETURN match_exists;
END;
$$;

-- Create a view for matched duos
CREATE OR REPLACE VIEW public.matched_duos AS
SELECT 
  dm1.liker_duo_id AS duo1_id,
  dm1.liked_duo_id AS duo2_id,
  GREATEST(dm1.created_at, dm2.created_at) AS matched_at
FROM 
  public.duo_matches dm1
JOIN 
  public.duo_matches dm2
  ON dm1.liker_duo_id = dm2.liked_duo_id 
  AND dm1.liked_duo_id = dm2.liker_duo_id
WHERE 
  dm1.liker_duo_id < dm1.liked_duo_id; 