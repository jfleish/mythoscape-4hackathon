
CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  description text,
  cover_image_url text,
  dewey_category text NOT NULL DEFAULT '800',
  dewey_label text NOT NULL DEFAULT 'Literature',
  world_prompt text NOT NULL,
  world_marble_url text,
  world_id text,
  thumbnail_url text,
  pano_url text,
  splat_url text,
  passages jsonb NOT NULL DEFAULT '[]'::jsonb,
  audio_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active books"
  ON public.books FOR SELECT
  TO public
  USING (is_active = true);

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
