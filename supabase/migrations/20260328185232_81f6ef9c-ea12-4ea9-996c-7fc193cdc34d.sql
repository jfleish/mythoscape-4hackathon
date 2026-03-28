
-- Add user_id column to books (nullable so existing books still work)
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Allow authenticated users to insert their own books
CREATE POLICY "Authenticated users can insert books"
ON public.books
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own books
CREATE POLICY "Users can update their own books"
ON public.books
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to delete their own books
CREATE POLICY "Users can delete their own books"
ON public.books
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
