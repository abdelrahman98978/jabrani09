-- NUCLEAR OPTION: Fix All Permissions Forcefully
-- Run this to fix the 403 Forbidden errors immediately

-- 1. Grant usage on schema (Essential for RLS to work for anon)
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 2. Grant SELECT on all tables to anon and authenticated
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- 3. Reset RLS for critical tables
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- 4. Re-create permissive policies
DROP POLICY IF EXISTS "Public Read Cars" ON public.cars;
DROP POLICY IF EXISTS "Let everyone read cars" ON public.cars;
CREATE POLICY "Let everyone read cars" ON public.cars FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public Read Brands" ON public.brands;
DROP POLICY IF EXISTS "Let everyone read brands" ON public.brands;
CREATE POLICY "Let everyone read brands" ON public.brands FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public Read Settings" ON public.settings;
DROP POLICY IF EXISTS "Let everyone read settings" ON public.settings;
CREATE POLICY "Let everyone read settings" ON public.settings FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public Read Promotions" ON public.promotions;
DROP POLICY IF EXISTS "Let everyone read promotions" ON public.promotions;
CREATE POLICY "Let everyone read promotions" ON public.promotions FOR SELECT TO public USING (true);

-- 5. Ensure settings exist
INSERT INTO public.settings (id, showroom_name)
SELECT 1, 'Premium Motors'
WHERE NOT EXISTS (SELECT 1 FROM public.settings);
