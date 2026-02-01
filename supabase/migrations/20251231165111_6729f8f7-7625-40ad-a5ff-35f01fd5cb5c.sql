-- Allow admins to view all profiles so they can manage roles in the admin panel
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add delivery_method and bank_transfer_proof fields to orders table for delivery and payment options
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'pickup' CHECK (delivery_method IN ('pickup', 'delivery')),
ADD COLUMN IF NOT EXISTS bank_transfer_proof TEXT;

-- Add delivery address fields
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_city TEXT,
ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
