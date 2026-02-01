-- FIX ORDER COMPLETION TABLE AND PERMISSIONS
-- This script creates the missing order completion tables and sets up permissions.

-- 1. Create order_status_history table if not exists
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

-- Enable RLS
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- 2. Policies for order_status_history

-- Allow Admin (from user_roles) to insert/view history
DROP POLICY IF EXISTS "Admins can manage order history" ON public.order_status_history;
CREATE POLICY "Admins can manage order history"
ON public.order_status_history
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- Allow users to view their own order history
DROP POLICY IF EXISTS "Users can view their own order history" ON public.order_status_history;
CREATE POLICY "Users can view their own order history"
ON public.order_status_history
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_status_history.order_id 
        AND orders.user_id = auth.uid()
    )
);

-- 3. Fix Orders Table Permissions (if not already done)
-- Allow Authenticated users to create orders
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;
CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow Anonymous users (guests) to create orders?
-- Usually, we require login. But if your flow supports guest checkout, you'd need:
DROP POLICY IF EXISTS "Anon users can create orders" ON public.orders;
-- CREATE POLICY "Anon users can create orders" ON public.orders FOR INSERT TO anon WITH CHECK (userid IS NULL); -- Only if guest checkout enabled

-- Allow Users to view their own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow Admins to View/Update ALL orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);

DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
CREATE POLICY "Admins can update all orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- Grant permissions
GRANT SELECT, INSERT ON public.order_status_history TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
