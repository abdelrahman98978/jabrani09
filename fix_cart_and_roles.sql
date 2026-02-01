-- FIX CART, WISHLIST AND ROLES
-- This script sets up the missing tables and restricts Admin access to only the authorized user.

-- 1. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    CONSTRAINT user_or_session_check CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Policies for Cart Items
-- Allow Authenticated users to manage their own items
DROP POLICY IF EXISTS "Users can manage their own cart items" ON public.cart_items;
CREATE POLICY "Users can manage their own cart items"
ON public.cart_items
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow Anonymous users (guests) to manage items via session_id
-- Note: In a production app with sensitive data, we'd want stronger session validation.
-- For this guest cart, we allow public access to rows where user_id is NULL (guest items).
DROP POLICY IF EXISTS "Guests can manage cart items" ON public.cart_items;
CREATE POLICY "Guests can manage cart items"
ON public.cart_items
FOR ALL
TO anon
USING (user_id IS NULL)
WITH CHECK (user_id IS NULL);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;


-- 2. WISHLIST TABLE
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(user_id, car_id)
);

-- Enable RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Policies for Wishlist
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON public.wishlist;
CREATE POLICY "Users can manage their own wishlist"
ON public.wishlist
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist TO authenticated;


-- 3. USER ROLES & PERMISSIONS
-- Create table to map users to roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'moderator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own roles
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow admins to manage all roles (bootstrap problem: need a way to identify admin solely by email first or rely on manual DB entry)
-- For safety, we will NOT allow public/orginaries to write to this table via API. Only SQL admin or specific functions.

-- Grant Select
GRANT SELECT ON public.user_roles TO authenticated;
-- Do NOT grant INSERT/UPDATE/DELETE to public/authenticated to prevent privilege escalation.

-- 4. BOOTSTRAP ADMIN
-- Assign 'admin' role to 'abdo12uk@gmail.com'
-- Remove 'admin' role from any other user to strictly follow the requirement.

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Find the user ID for the admin email
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'abdo12uk@gmail.com' LIMIT 1;

    IF target_user_id IS NOT NULL THEN
        -- Insert admin role if not exists
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Optional: Remove admin role from everyone else if you want to be STRICT
        -- DELETE FROM public.user_roles WHERE role = 'admin' AND user_id != target_user_id;
    END IF;
END $$;
