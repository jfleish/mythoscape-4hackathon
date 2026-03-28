-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create media_assets table
CREATE TABLE public.media_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'image',
  worldlabs_asset_id TEXT,
  upload_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own media assets"
  ON public.media_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own media assets"
  ON public.media_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own media assets"
  ON public.media_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own media assets"
  ON public.media_assets FOR DELETE USING (auth.uid() = user_id);

-- Create worlds table
CREATE TABLE public.worlds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'text',
  media_asset_id UUID REFERENCES public.media_assets(id),
  world_labs_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  scene_url TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  share_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.worlds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own worlds"
  ON public.worlds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own worlds"
  ON public.worlds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own worlds"
  ON public.worlds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own worlds"
  ON public.worlds FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public worlds"
  ON public.worlds FOR SELECT USING (is_public = true);

CREATE TRIGGER update_worlds_updated_at
  BEFORE UPDATE ON public.worlds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for image uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('world-uploads', 'world-uploads', true);

CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'world-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'world-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public uploads are accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'world-uploads');