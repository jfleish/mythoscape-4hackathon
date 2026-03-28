-- Create book-audio storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-audio', 'book-audio', true);

-- Allow public read access
CREATE POLICY "Public read access for book-audio"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'book-audio');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload book-audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'book-audio');