-- Create duos table
CREATE TABLE IF NOT EXISTS public.duos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  bio TEXT,
  user1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for the duos table
ALTER TABLE public.duos ENABLE ROW LEVEL SECURITY;

-- Users can view duos they're a part of
CREATE POLICY "Users can view their own duos" 
  ON public.duos
  FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can create duos where they are either user1 or user2
CREATE POLICY "Users can create duos as either user"
  ON public.duos
  FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can update duos they're a part of
CREATE POLICY "Users can update their own duos"
  ON public.duos
  FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can delete duos they're a part of
CREATE POLICY "Users can delete their own duos"
  ON public.duos
  FOR DELETE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id); 