-- Create new migration to fix permissions and table issues

-- 1. Fix RLS policies to be more permissive for public read access
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view active brands" ON public.brands;
DROP POLICY IF EXISTS "Anyone can view available cars" ON public.cars;
DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
DROP POLICY IF EXISTS "Anyone can view active promotions" ON public.promotions;

-- Re-create policies with explicit 'public' access
CREATE POLICY "Anyone can view active brands" 
ON public.brands FOR SELECT 
TO public 
USING (is_active = true);

CREATE POLICY "Anyone can view available cars" 
ON public.cars FOR SELECT 
TO public 
USING (status = 'available');

CREATE POLICY "Anyone can view settings" 
ON public.settings FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Anyone can view active promotions" 
ON public.promotions FOR SELECT 
TO public 
USING (is_active = true);

-- 2. Fix Wishlist permissions
-- Allow authenticated users to manage their own wishlist
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, car_id)
);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.wishlist;

CREATE POLICY "Users can manage own wishlist"
ON public.wishlist
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Ensure 'settings' table exists and has correct columns (in case migration failed)
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  showroom_name TEXT DEFAULT 'Jabrani Cars',
  location TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on settings if not already
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
