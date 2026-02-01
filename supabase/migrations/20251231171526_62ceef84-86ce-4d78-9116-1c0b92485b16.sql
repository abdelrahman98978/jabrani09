-- Fix RLS on customers to allow public inserts while keeping admin control

-- 1) Drop existing policies to avoid restrictive conflicts
DROP POLICY IF EXISTS "Admins can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Anyone can create customer inquiry" ON public.customers;

-- 2) Recreate admin management policy (authenticated admins only)
CREATE POLICY "Admins can manage customers"
ON public.customers
AS PERMISSIVE
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3) Allow anyone (including anonymous website visitors) to insert customer records
CREATE POLICY "Anyone can create customer inquiry"
ON public.customers
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (true);
