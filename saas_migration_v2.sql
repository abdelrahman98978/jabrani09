-- Jabrani Automotive SaaS: Multi-Tenant Migration V2
-- Adding isolation to secondary tables and updating role management

DO $$
DECLARE
    main_tenant_id UUID;
BEGIN
    -- 1. Get the main tenant ID
    SELECT id INTO main_tenant_id FROM public.tenants WHERE slug = 'jabrani' LIMIT 1;
    
    IF main_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Main tenant (jabrani) not found. Please run saas_migration.sql first.';
    END IF;

    -- 2. Add tenant_id to secondary tables

    -- Table: user_roles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.user_roles ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        UPDATE public.user_roles SET tenant_id = main_tenant_id;
        ALTER TABLE public.user_roles ALTER COLUMN tenant_id SET NOT NULL;
        EXECUTE format('ALTER TABLE public.user_roles ALTER COLUMN tenant_id SET DEFAULT %%L', main_tenant_id);
        
        -- Update unique constraint: user can have a specific role in a specific tenant
        ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_tenant_unique UNIQUE (user_id, role, tenant_id);
    END IF;

    -- Table: contact_messages
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contact_messages' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.contact_messages ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        UPDATE public.contact_messages SET tenant_id = main_tenant_id;
        ALTER TABLE public.contact_messages ALTER COLUMN tenant_id SET NOT NULL;
        EXECUTE format('ALTER TABLE public.contact_messages ALTER COLUMN tenant_id SET DEFAULT %%L', main_tenant_id);
    END IF;

    -- Table: customers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.customers ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        UPDATE public.customers SET tenant_id = main_tenant_id;
        ALTER TABLE public.customers ALTER COLUMN tenant_id SET NOT NULL;
        EXECUTE format('ALTER TABLE public.customers ALTER COLUMN tenant_id SET DEFAULT %%L', main_tenant_id);
    END IF;

    -- Table: newsletter_subscribers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'newsletter_subscribers' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.newsletter_subscribers ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        UPDATE public.newsletter_subscribers SET tenant_id = main_tenant_id;
        ALTER TABLE public.newsletter_subscribers ALTER COLUMN tenant_id SET NOT NULL;
        EXECUTE format('ALTER TABLE public.newsletter_subscribers ALTER COLUMN tenant_id SET DEFAULT %%L', main_tenant_id);
    END IF;

    -- Table: email_campaigns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_campaigns' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.email_campaigns ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        UPDATE public.email_campaigns SET tenant_id = main_tenant_id;
        ALTER TABLE public.email_campaigns ALTER COLUMN tenant_id SET NOT NULL;
        EXECUTE format('ALTER TABLE public.email_campaigns ALTER COLUMN tenant_id SET DEFAULT %%L', main_tenant_id);
    END IF;

    -- Table: promotions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'promotions' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.promotions ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        UPDATE public.promotions SET tenant_id = main_tenant_id;
        ALTER TABLE public.promotions ALTER COLUMN tenant_id SET NOT NULL;
        EXECUTE format('ALTER TABLE public.promotions ALTER COLUMN tenant_id SET DEFAULT %%L', main_tenant_id);
    END IF;

    -- Table: accessories
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'accessories' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.accessories ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        UPDATE public.accessories SET tenant_id = main_tenant_id;
        ALTER TABLE public.accessories ALTER COLUMN tenant_id SET NOT NULL;
        EXECUTE format('ALTER TABLE public.accessories ALTER COLUMN tenant_id SET DEFAULT %%L', main_tenant_id);
    END IF;

    -- Table: cart_items
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cart_items' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.cart_items ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        UPDATE public.cart_items SET tenant_id = main_tenant_id;
        ALTER TABLE public.cart_items ALTER COLUMN tenant_id SET NOT NULL;
        EXECUTE format('ALTER TABLE public.cart_items ALTER COLUMN tenant_id SET DEFAULT %%L', main_tenant_id);
    END IF;

END $$;

-- 3. Update has_role function to be tenant-aware
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role, _tenant_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (tenant_id = _tenant_id OR _tenant_id IS NULL)
  )
$$;

-- 4. Re-configure RLS Policies to be tenant-aware
-- We will implement a pattern where admins can only manage data in their assigned tenant.

-- Example: Brands
DROP POLICY IF EXISTS "Admins can manage brands" ON public.brands;
CREATE POLICY "Admins can manage brands in their tenant" ON public.brands
FOR ALL USING (
  public.has_role(auth.uid(), 'admin', tenant_id)
);

-- Example: Cars
DROP POLICY IF EXISTS "Admins can manage cars" ON public.cars;
CREATE POLICY "Admins can manage cars in their tenant" ON public.cars
FOR ALL USING (
  public.has_role(auth.uid(), 'admin', tenant_id)
);

-- Example: Orders
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders in their tenant" ON public.orders
FOR ALL USING (
  public.has_role(auth.uid(), 'admin', tenant_id)
);

-- Public access remains global for select (unless we want showroom-specific subdomains/paths)
-- Usually, we want people to see cars of the showroom they are currently visiting.
-- This can be handled by filtering on tenant_id in the frontend, 
-- but RLS can also enforce it if we pass the current tenant via a session variable.
