-- Allow public SELECT on customers for checkout phone lookup while keeping admin control

-- 1) Ensure admin manage policy remains (created previously)
-- 2) Add SELECT policy for public to allow phone-based lookup
CREATE POLICY "Anyone can view customers for checkout"
ON public.customers
AS PERMISSIVE
FOR SELECT
TO public
USING (true);