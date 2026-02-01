-- MASTER FIX SCRIPT
-- This script combines ALL fixes for Cart, Checkout, Roles, Contact Form, and Permissions.
-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR TO FIX EVERYTHING AT ONCE.

-- =================================================================
-- 1. BASE PERMISSIONS (Fix 403 Errors)
-- =================================================================
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- =================================================================
-- 2. CUSTOMERS & CHECKOUT FIXES (Fix Permission Denied on Checkout)
-- =================================================================

-- Create Secure RPC for Customer Creation (Bypasses RLS issues safely)
CREATE OR REPLACE FUNCTION public.get_or_create_customer(
    p_name TEXT,
    p_phone TEXT,
    p_email TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_customer_id UUID;
BEGIN
    -- Check if customer exists by phone
    SELECT id INTO v_customer_id
    FROM public.customers
    WHERE phone = p_phone
    LIMIT 1;

    -- If not found, create new
    IF v_customer_id IS NULL THEN
        INSERT INTO public.customers (name, phone, email, user_id)
        VALUES (p_name, p_phone, p_email, p_user_id)
        RETURNING id INTO v_customer_id;
    END IF;

    RETURN v_customer_id;
END;
$$;

-- Grant permissions for RPC
GRANT EXECUTE ON FUNCTION public.get_or_create_customer TO anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_customer TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_customer TO service_role;

-- Fix Customers Table RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert customers" ON public.customers;
CREATE POLICY "Anyone can insert customers" ON public.customers FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can read customers" ON public.customers;
CREATE POLICY "Authenticated can read customers" ON public.customers FOR SELECT TO authenticated USING (true);

-- Fix Orders Table RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT TO public WITH CHECK (true);

-- Grant Insert on Orders
GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.orders TO authenticated;

-- =================================================================
-- 3. CART & WISHLIST TABLES (Fix Cart Errors)
-- =================================================================

-- Cart Items
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    CONSTRAINT user_or_session_check CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can manage their own cart items" ON public.cart_items;
CREATE POLICY "Users can manage their own cart items" ON public.cart_items FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Guests can manage cart items" ON public.cart_items;
CREATE POLICY "Guests can manage cart items" ON public.cart_items FOR ALL TO anon USING (user_id IS NULL) WITH CHECK (user_id IS NULL);

GRANT ALL ON public.cart_items TO anon;
GRANT ALL ON public.cart_items TO authenticated;

-- Wishlist
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(user_id, car_id)
);
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own wishlist" ON public.wishlist;
CREATE POLICY "Users can manage their own wishlist" ON public.wishlist FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
GRANT ALL ON public.wishlist TO authenticated;

-- =================================================================
-- 4. ROLES & ADMIN ACCESS
-- =================================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'moderator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
GRANT SELECT ON public.user_roles TO authenticated;

-- Assign Admin Role to abdo12uk@gmail.com
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'abdo12uk@gmail.com' LIMIT 1;
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;

-- =================================================================
-- 5. CONTACT FORM
-- =================================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived', 'replied'))
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read messages" ON public.contact_messages;
CREATE POLICY "Authenticated users can read messages" ON public.contact_messages FOR SELECT TO authenticated USING (true);

GRANT INSERT ON public.contact_messages TO anon;
GRANT INSERT ON public.contact_messages TO authenticated;
GRANT SELECT, UPDATE ON public.contact_messages TO authenticated;

-- =================================================================
-- 6. ORDER HIISTORY & COMPLETION
-- =================================================================

CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT
);
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Admins policy for history
DROP POLICY IF EXISTS "Admins can manage order history" ON public.order_status_history;
CREATE POLICY "Admins can manage order history" ON public.order_status_history FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Users policy for history
DROP POLICY IF EXISTS "Users can view their own order history" ON public.order_status_history;
CREATE POLICY "Users can view their own order history" ON public.order_status_history FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid()));

GRANT ALL ON public.order_status_history TO authenticated;

-- Ensure Admins can view/update ALL orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
CREATE POLICY "Admins can update all orders" ON public.orders FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
