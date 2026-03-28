CREATE POLICY "Anon can delete books with null user_id"
ON public.books
FOR DELETE
TO anon
USING (user_id IS NULL);