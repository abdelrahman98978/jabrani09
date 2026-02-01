-- Fix Checkout Flow Permissions and Logic
-- 1. Create a secure function to handle customer lookup/creation
-- This bypasses RLS issues by running as OWNER (Security Definer) causing "Permission denied" errors on the frontend.

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

-- Grant execute permission to everyone
GRANT EXECUTE ON FUNCTION public.get_or_create_customer TO anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_customer TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_customer TO service_role;

-- 2. Enhance Orders Permissions for Guest Checkout
-- Ensure guests (anon) can insert orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow anon to INSERT orders
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
TO public
WITH CHECK (true);

-- Allow anon to SELECT orders they just created? 
-- Difficult without session. Typically guests get a confirmation page with data loaded by ID or specific token.
-- The existing policy "Users can view their own orders" checks auth.uid() = user_id.
-- We might need a policy for guests to view order by ID if they just made it? 
-- For now, let's assume the confirmation page might fail to load details if auth is missing, 
-- but the INSERT will succeed, which is the "Permission denied" blocker.
-- If needed, we can make a function for "get_order_details_secure" or similar.

-- Grant table permissions
GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.customers TO anon; -- Fallback
GRANT SELECT ON public.customers TO anon; -- Fallback, though RPC overrides this needs.

-- 3. Fix Customers Table RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Allow INSERT to public
DROP POLICY IF EXISTS "Anyone can insert customers" ON public.customers;
CREATE POLICY "Anyone can insert customers"
ON public.customers
FOR INSERT
TO public
WITH CHECK (true);

-- Allow Authenticated to SELECT (Admins/Users)
-- We don't want public SELECT on customers for privacy, but to prevent 'permission denied' during legacy frontend calls:
DROP POLICY IF EXISTS "Authenticated can read customers" ON public.customers;
CREATE POLICY "Authenticated can read customers"
ON public.customers
FOR SELECT
TO authenticated
USING (true);

-- For Guests, we rely on the RPC. If the frontend still tries direct SELECT, it might fail or return empty if we don't allow it.
-- But allowing 'SELECT * FROM customers' to anon is a data leak.
-- So we MUST update the frontend to use the RPC.
