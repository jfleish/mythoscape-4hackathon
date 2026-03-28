INSERT INTO storage.buckets (id, name, public) VALUES ('book-covers', 'book-covers', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view book covers" ON storage.objects FOR SELECT TO public USING (bucket_id = 'book-covers');
CREATE POLICY "Anyone can upload book covers" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'book-covers');