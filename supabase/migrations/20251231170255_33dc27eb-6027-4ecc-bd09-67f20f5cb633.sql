ALTER TABLE public.orders ADD COLUMN user_id uuid;
ALTER TABLE public.customers ADD COLUMN user_id uuid;

-- Allow authenticated users to view their own orders
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
