-- Temporary fix to allow legacy/cached clients to work until they refresh
-- Allow ANYONE to select from customers (needed for checking if customer exists by phone in old code)
-- This is a temporary measure to stop the 403 errors immediately.

DROP POLICY IF EXISTS "Anyone can select customers" ON public.customers;
CREATE POLICY "Anyone can select customers" ON public.customers FOR SELECT TO public USING (true);

-- Ensure insert is also open (already done in MASTER_FIX_ALL but reinforcing)
DROP POLICY IF EXISTS "Anyone can insert customers" ON public.customers;
CREATE POLICY "Anyone can insert customers" ON public.customers FOR INSERT TO public WITH CHECK (true);

-- Grant select permission explicitly to anon role
GRANT SELECT ON public.customers TO anon;
