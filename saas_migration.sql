-- Jabrani Automotive SaaS: Multi-Tenant Migration
-- This script prepares the database for multi-tenancy by creating the tenants table 
-- and adding tenant_id columns to all core entity tables.

DO $$
DECLARE
    main_tenant_id UUID;
BEGIN
    -- 1. Create tenants table
    CREATE TABLE IF NOT EXISTS public.tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        custom_domain TEXT UNIQUE,
        plan_tier TEXT DEFAULT 'basic' CHECK (plan_tier IN ('basic', 'pro', 'sovereign')),
        branding JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT now()
    );

    -- 2. Insert main tenant if not exists
    INSERT INTO public.tenants (name, slug, plan_tier)
    VALUES ('Jabrani Main Showroom', 'jabrani', 'sovereign')
    ON CONFLICT (slug) DO NOTHING;

    -- 3. Get the tenant ID
    SELECT id INTO main_tenant_id FROM public.tenants WHERE slug = 'jabrani' LIMIT 1;

    -- 4. Add tenant_id to tables
    -- This block handles adding the column, populating it, and adding constraints safely

    -- Table: brands
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'brands' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.brands ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        UPDATE public.brands SET tenant_id = main_tenant_id;
        ALTER TABLE public.brands ALTER COLUMN tenant_id SET NOT NULL;
        EXECUTE format('ALTER TABLE public.brands ALTER COLUMN tenant_id SET DEFAULT %%L', main_tenant_id);
    END IF;

    -- Table: cars
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cars' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.cars ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        UPDATE public.cars SET tenant_id = main_tenant_id;
        ALTER TABLE public.cars ALTER COLUMN tenant_id SET NOT NULL;
        EXECUTE format('ALTER TABLE public.cars ALTER COLUMN tenant_id SET DEFAULT %%L', main_tenant_id);
    END IF;

    -- Table: orders
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.orders ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        UPDATE public.orders SET tenant_id = main_tenant_id;
        ALTER TABLE public.orders ALTER COLUMN tenant_id SET NOT NULL;
        EXECUTE format('ALTER TABLE public.orders ALTER COLUMN tenant_id SET DEFAULT %%L', main_tenant_id);
    END IF;

    -- Table: profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.profiles ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        UPDATE public.profiles SET tenant_id = main_tenant_id;
        ALTER TABLE public.profiles ALTER COLUMN tenant_id SET NOT NULL;
        EXECUTE format('ALTER TABLE public.profiles ALTER COLUMN tenant_id SET DEFAULT %%L', main_tenant_id);
    END IF;

    -- Table: car_reviews
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'car_reviews' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.car_reviews ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        UPDATE public.car_reviews SET tenant_id = main_tenant_id;
        ALTER TABLE public.car_reviews ALTER COLUMN tenant_id SET NOT NULL;
        EXECUTE format('ALTER TABLE public.car_reviews ALTER COLUMN tenant_id SET DEFAULT %%L', main_tenant_id);
    END IF;

    -- Table: test_drive_bookings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'test_drive_bookings' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.test_drive_bookings ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        UPDATE public.test_drive_bookings SET tenant_id = main_tenant_id;
        ALTER TABLE public.test_drive_bookings ALTER COLUMN tenant_id SET NOT NULL;
        EXECUTE format('ALTER TABLE public.test_drive_bookings ALTER COLUMN tenant_id SET DEFAULT %%L', main_tenant_id);
    END IF;

    -- Table: wishlist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'wishlist' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.wishlist ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        UPDATE public.wishlist SET tenant_id = main_tenant_id;
        ALTER TABLE public.wishlist ALTER COLUMN tenant_id SET NOT NULL;
        EXECUTE format('ALTER TABLE public.wishlist ALTER COLUMN tenant_id SET DEFAULT %%L', main_tenant_id);
    END IF;

    -- Table: faq
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'faq' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.faq ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        UPDATE public.faq SET tenant_id = main_tenant_id;
        ALTER TABLE public.faq ALTER COLUMN tenant_id SET NOT NULL;
        EXECUTE format('ALTER TABLE public.faq ALTER COLUMN tenant_id SET DEFAULT %%L', main_tenant_id);
    END IF;

    -- Table: notifications
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.notifications ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        UPDATE public.notifications SET tenant_id = main_tenant_id;
        ALTER TABLE public.notifications ALTER COLUMN tenant_id SET NOT NULL;
        EXECUTE format('ALTER TABLE public.notifications ALTER COLUMN tenant_id SET DEFAULT %%L', main_tenant_id);
    END IF;

    -- Table: manifests (new sovereign feature)
    CREATE TABLE IF NOT EXISTS public.manifests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES public.tenants(id) DEFAULT main_tenant_id,
        manifest_number TEXT NOT NULL UNIQUE,
        vessel_name TEXT,
        departure_date DATE,
        arrival_date DATE,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
    );

END $$;

-- 5. Enable RLS and isolate data
-- We use a function to get the current tenant id from the session or settings
CREATE OR REPLACE FUNCTION get_current_tenant_id() RETURNS UUID AS $$
    SELECT current_setting('app.current_tenant', true)::UUID;
$$ LANGUAGE SQL STABLE;

-- Note: In Supabase, you usually set this via: set_config('app.current_tenant', '...', true)
-- Or better, compare against a column in the auth.users table if you store tenant_id there.

-- Simplified RLS for now (Filtering will be done at the query level in the frontend)
-- To fully enforce this, we would need to check the JWT or a session variable.
