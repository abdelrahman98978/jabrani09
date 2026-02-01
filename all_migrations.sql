-- Create brands table
CREATE TABLE public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cars table
CREATE TABLE public.cars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  original_price DECIMAL(12,2),
  mileage INTEGER DEFAULT 0,
  fuel_type TEXT DEFAULT 'petrol',
  transmission TEXT DEFAULT 'automatic',
  engine_size TEXT,
  color TEXT,
  color_ar TEXT,
  description TEXT,
  description_ar TEXT,
  main_image TEXT,
  images TEXT[] DEFAULT '{}',
  is_new BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  has_discount BOOLEAN DEFAULT false,
  has_test_drive BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'available',
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create showroom settings table
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  showroom_name TEXT DEFAULT 'ظ…ط¹ط±ط¶ ط§ظ„ط³ظٹط§ط±ط§طھ',
  showroom_name_en TEXT DEFAULT 'Car Showroom',
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  address_ar TEXT,
  logo_url TEXT,
  hero_image_url TEXT,
  about_text TEXT,
  about_text_ar TEXT,
  working_hours TEXT,
  working_hours_ar TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for admin users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public read access for brands, cars, settings (showroom is public)
CREATE POLICY "Anyone can view active brands" ON public.brands FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view available cars" ON public.cars FOR SELECT USING (status = 'available');
CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);

-- Admin policies for full access
CREATE POLICY "Admins can manage brands" ON public.brands FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage cars" ON public.cars FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', 'admin');
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON public.cars FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.settings (showroom_name, showroom_name_en, whatsapp, email, phone)
VALUES ('ظ…ط¹ط±ط¶ ط§ظ„ط³ظٹط§ط±ط§طھ ط§ظ„ظپط§ط®ط±ط©', 'Luxury Car Showroom', '966543389314', 'abdo12uk@gmail.com', '966543389314');

-- Insert sample brands
INSERT INTO public.brands (name, name_ar, sort_order) VALUES
('Toyota', 'طھظˆظٹظˆطھط§', 1),
('Hyundai', 'ظ‡ظٹظˆظ†ط¯ط§ظٹ', 2),
('Kia', 'ظƒظٹط§', 3),
('Nissan', 'ظ†ظٹط³ط§ظ†', 4),
('Chevrolet', 'ط´ظٹظپط±ظˆظ„ظٹظ‡', 5),
('Ford', 'ظپظˆط±ط¯', 6),
('Mercedes', 'ظ…ط±ط³ظٹط¯ط³', 7),
('BMW', 'ط¨ظٹ ط§ظ… ط¯ط¨ظ„ظٹظˆ', 8),
('Lexus', 'ظ„ظƒط²ط³', 9),
('Honda', 'ظ‡ظˆظ†ط¯ط§', 10);
-- Add phone number field to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- Update handle_new_user function to include phone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  RETURN new;
END;
$$;
-- Create newsletter subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (true);

-- Allow admins to view all subscribers
CREATE POLICY "Admins can view subscribers"
ON public.newsletter_subscribers
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid()
  AND profiles.role = 'admin'
));
-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
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
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create customers table
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    city TEXT,
    notes TEXT,
    customer_type TEXT DEFAULT 'new' CHECK (customer_type IN ('new', 'potential', 'regular', 'vip')),
    total_purchases NUMERIC DEFAULT 0,
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage customers" ON public.customers
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create customer inquiry" ON public.customers
FOR INSERT WITH CHECK (true);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'processing', 'reserved', 'completed', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
    payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'financing')),
    total_amount NUMERIC NOT NULL,
    paid_amount NUMERIC DEFAULT 0,
    notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage orders" ON public.orders
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create orders" ON public.orders
FOR INSERT WITH CHECK (true);

-- Create payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'financing')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id TEXT,
    stripe_payment_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payments" ON public.payments
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create invoices table
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    tax_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invoices" ON public.invoices
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create promotions table
CREATE TABLE public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description TEXT,
    description_ar TEXT,
    type TEXT NOT NULL CHECK (type IN ('discount', 'coupon', 'featured', 'special_offer')),
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC,
    coupon_code TEXT UNIQUE,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    target_cars UUID[],
    target_brands UUID[],
    min_price NUMERIC,
    max_price NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage promotions" ON public.promotions
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active promotions" ON public.promotions
FOR SELECT USING (is_active = true AND (end_date IS NULL OR end_date > now()));

-- Create car_views table for analytics
CREATE TABLE public.car_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE NOT NULL,
    viewer_ip TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.car_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record views" ON public.car_views
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view analytics" ON public.car_views
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Create contact_messages table
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send messages" ON public.contact_messages
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage messages" ON public.contact_messages
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for car images
INSERT INTO storage.buckets (id, name, public) VALUES ('car-images', 'car-images', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies for car images
DROP POLICY IF EXISTS "Anyone can view car images" ON storage.objects;
CREATE POLICY "Anyone can view car images" ON storage.objects
FOR SELECT USING (bucket_id = 'car-images');

DROP POLICY IF EXISTS "Admins can upload car images" ON storage.objects;
CREATE POLICY "Admins can upload car images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'car-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update car images" ON storage.objects;
CREATE POLICY "Admins can update car images" ON storage.objects
FOR UPDATE USING (bucket_id = 'car-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete car images" ON storage.objects;
CREATE POLICY "Admins can delete car images" ON storage.objects
FOR DELETE USING (bucket_id = 'car-images' AND public.has_role(auth.uid(), 'admin'));

-- Update triggers for updated_at columns
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at
BEFORE UPDATE ON public.promotions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_order_number();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_invoice_number
BEFORE INSERT ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.generate_invoice_number();
-- Create email campaigns table
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  subject TEXT NOT NULL,
  subject_ar TEXT NOT NULL,
  content TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  target_audience TEXT DEFAULT 'all',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- Admin can manage campaigns
CREATE POLICY "Admins can manage email campaigns"
ON public.email_campaigns
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_email_campaigns_updated_at
BEFORE UPDATE ON public.email_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create cart_items table for shopping cart
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT cart_items_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own cart items"
ON public.cart_items FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  (session_id = current_setting('request.headers', true)::json->>'x-session-id')
);

CREATE POLICY "Users can add to their cart"
ON public.cart_items FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) OR 
  (session_id IS NOT NULL AND user_id IS NULL)
);

CREATE POLICY "Users can update their cart items"
ON public.cart_items FOR UPDATE
USING (
  (auth.uid() = user_id) OR 
  (session_id = current_setting('request.headers', true)::json->>'x-session-id')
);

CREATE POLICY "Users can delete their cart items"
ON public.cart_items FOR DELETE
USING (
  (auth.uid() = user_id) OR 
  (session_id = current_setting('request.headers', true)::json->>'x-session-id')
);

-- Create trigger for updated_at
CREATE TRIGGER update_cart_items_updated_at
BEFORE UPDATE ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create accessories table
CREATE TABLE public.accessories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  image_url TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for accessories
ALTER TABLE public.accessories ENABLE ROW LEVEL SECURITY;

-- Policies for accessories
CREATE POLICY "Anyone can view active accessories"
ON public.accessories FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage accessories"
ON public.accessories FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for accessories updated_at
CREATE TRIGGER update_accessories_updated_at
BEFORE UPDATE ON public.accessories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Add theme color settings to settings table
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS primary_color text,
ADD COLUMN IF NOT EXISTS secondary_color text,
ADD COLUMN IF NOT EXISTS accent_color text;
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
-- Create private bucket for bank transfer proofs
insert into storage.buckets (id, name, public)
values ('bank-transfers', 'bank-transfers', false)
on conflict (id) do nothing;

-- Allow admins to manage bank transfer proof objects
DROP POLICY IF EXISTS "Admins manage bank transfer proofs" ON storage.objects;
create policy "Admins manage bank transfer proofs"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'bank-transfers'
  and public.has_role(auth.uid(), 'admin')
)
with check (
  bucket_id = 'bank-transfers'
  and public.has_role(auth.uid(), 'admin')
);
-- 1) Create order status history table
CREATE TABLE public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view order status history"
ON public.order_status_history
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 2) Create payment change history table
CREATE TABLE public.payment_change_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_payment_method text,
  new_payment_method text,
  old_payment_status text,
  new_payment_status text,
  changed_by uuid NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_change_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payment change history"
ON public.payment_change_history
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 3) Trigger to log order status changes
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_status_history (order_id, old_status, new_status, changed_by)
    VALUES (OLD.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_order_status_change ON public.orders;
CREATE TRIGGER trg_log_order_status_change
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_order_status_change();

-- 4) Trigger to log payment changes on orders
CREATE OR REPLACE FUNCTION public.log_payment_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $$
BEGIN
  IF (NEW.payment_method IS DISTINCT FROM OLD.payment_method)
     OR (NEW.payment_status IS DISTINCT FROM OLD.payment_status) THEN
    INSERT INTO public.payment_change_history (
      order_id,
      old_payment_method,
      new_payment_method,
      old_payment_status,
      new_payment_status,
      changed_by
    ) VALUES (
      OLD.id,
      OLD.payment_method,
      NEW.payment_method,
      OLD.payment_status,
      NEW.payment_status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_payment_change ON public.orders;
CREATE TRIGGER trg_log_payment_change
AFTER UPDATE OF payment_method, payment_status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_payment_change();
ALTER TABLE public.orders ADD COLUMN user_id uuid;
ALTER TABLE public.customers ADD COLUMN user_id uuid;

-- Allow authenticated users to view their own orders
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
-- Fix RLS on customers to allow public inserts while keeping admin control

-- 1) Drop existing policies to avoid restrictive conflicts
DROP POLICY IF EXISTS "Admins can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Anyone can create customer inquiry" ON public.customers;

-- 2) Recreate admin management policy (authenticated admins only)
CREATE POLICY "Admins can manage customers"
ON public.customers
AS PERMISSIVE
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3) Allow anyone (including anonymous website visitors) to insert customer records
CREATE POLICY "Anyone can create customer inquiry"
ON public.customers
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (true);
-- Allow public SELECT on customers for checkout phone lookup while keeping admin control

-- 1) Ensure admin manage policy remains (created previously)
-- 2) Add SELECT policy for public to allow phone-based lookup
CREATE POLICY "Anyone can view customers for checkout"
ON public.customers
AS PERMISSIVE
FOR SELECT
TO public
USING (true);
-- Enable status change logging and realtime for orders

-- 1) Create trigger to log status changes into order_status_history
DROP TRIGGER IF EXISTS trg_log_order_status_change ON public.orders;
CREATE TRIGGER trg_log_order_status_change
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_order_status_change();

-- 2) Ensure realtime works properly on orders table
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
-- Add bank settings columns to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_name_en TEXT,
ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS bank_iban TEXT;
-- Add columns for video hero support
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_video_url TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_type TEXT DEFAULT 'image';

-- Add comment for documentation
COMMENT ON COLUMN public.settings.hero_video_url IS 'URL for the hero video background';
COMMENT ON COLUMN public.settings.hero_type IS 'Type of hero background: image or video';
-- Add hero overlay opacity setting
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_overlay_opacity TEXT DEFAULT 'medium';
-- Options: light, medium, dark

-- Add marquee settings
ALTER TABLE settings ADD COLUMN IF NOT EXISTS marquee_enabled BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS marquee_text TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS marquee_text_ar TEXT;
-- Add 360 video columns to cars table
ALTER TABLE cars 
  ADD COLUMN IF NOT EXISTS video_360_url TEXT,
  ADD COLUMN IF NOT EXISTS video_360_thumbnail TEXT,
  ADD COLUMN IF NOT EXISTS video_360_type TEXT DEFAULT 'equirectangular';

COMMENT ON COLUMN cars.video_360_url IS 'ط±ط§ط¨ط· ظپظٹط¯ظٹظˆ 360 ط¯ط±ط¬ط©';
COMMENT ON COLUMN cars.video_360_thumbnail IS 'طµظˆط±ط© ظ…طµط؛ط±ط© ظ„ظ„ظپظٹط¯ظٹظˆ 360';
COMMENT ON COLUMN cars.video_360_type IS 'ظ†ظˆط¹ ط§ظ„ط¥ط³ظ‚ط§ط·: equirectangular, cubemap';
-- Add video columns for car hero video feature
ALTER TABLE public.cars 
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS video_thumbnail TEXT,
  ADD COLUMN IF NOT EXISTS video_overlay_opacity TEXT DEFAULT 'medium';

-- Add comments for documentation
COMMENT ON COLUMN public.cars.video_url IS 'URL for car hero video';
COMMENT ON COLUMN public.cars.video_thumbnail IS 'Thumbnail image for the video';
COMMENT ON COLUMN public.cars.video_overlay_opacity IS 'Overlay opacity: light, medium, or dark';
-- Create car_reviews table for ratings and reviews
CREATE TABLE public.car_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.car_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews"
ON public.car_reviews
FOR SELECT
USING (is_approved = true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
ON public.car_reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON public.car_reviews
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews"
ON public.car_reviews
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_car_reviews_updated_at
BEFORE UPDATE ON public.car_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_car_reviews_car_id ON public.car_reviews(car_id);
CREATE INDEX idx_car_reviews_user_id ON public.car_reviews(user_id);
CREATE INDEX idx_car_reviews_rating ON public.car_reviews(rating);
-- Create wishlist table
CREATE TABLE public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  notify_on_price_drop BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, car_id)
);

-- Enable RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- RLS policies for wishlist
CREATE POLICY "Users can view own wishlist" ON public.wishlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to wishlist" ON public.wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from wishlist" ON public.wishlist
  FOR DELETE USING (auth.uid() = user_id);

-- Create FAQ table
CREATE TABLE public.faq (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  question_ar TEXT NOT NULL,
  answer TEXT NOT NULL,
  answer_ar TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;

-- RLS policies for FAQ
CREATE POLICY "Anyone can view active FAQs" ON public.faq
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage FAQs" ON public.faq
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create test drive bookings table
CREATE TABLE public.test_drive_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
  user_id UUID,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.test_drive_bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies for test drive bookings
CREATE POLICY "Anyone can create test drive booking" ON public.test_drive_bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own bookings" ON public.test_drive_bookings
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage bookings" ON public.test_drive_bookings
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  title_ar TEXT,
  message TEXT NOT NULL,
  message_ar TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage notifications" ON public.notifications
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  reward_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Admins can manage referrals" ON public.referrals
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Add referral_code to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_earnings NUMERIC DEFAULT 0;

-- Create trigger for updated_at on new tables
CREATE TRIGGER update_faq_updated_at
  BEFORE UPDATE ON public.faq
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_test_drive_bookings_updated_at
  BEFORE UPDATE ON public.test_drive_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample FAQ data
INSERT INTO public.faq (question, question_ar, answer, answer_ar, category, sort_order) VALUES
('How can I book a test drive?', 'ظƒظٹظپ ظٹظ…ظƒظ†ظ†ظٹ ط­ط¬ط² طھط¬ط±ط¨ط© ظ‚ظٹط§ط¯ط©طں', 'You can book a test drive by clicking the "Book Test Drive" button on any car page and selecting your preferred date and time.', 'ظٹظ…ظƒظ†ظƒ ط­ط¬ط² طھط¬ط±ط¨ط© ظ‚ظٹط§ط¯ط© ط¨ط§ظ„ط¶ط؛ط· ط¹ظ„ظ‰ ط²ط± "ط­ط¬ط² طھط¬ط±ط¨ط© ظ‚ظٹط§ط¯ط©" ظپظٹ ط£ظٹ طµظپط­ط© ط³ظٹط§ط±ط© ظˆط§ط®طھظٹط§ط± ط§ظ„طھط§ط±ظٹط® ظˆط§ظ„ظˆظ‚طھ ط§ظ„ظ…ظ†ط§ط³ط¨ ظ„ظƒ.', 'test-drive', 1),
('What payment methods do you accept?', 'ظ…ط§ ظ‡ظٹ ط·ط±ظ‚ ط§ظ„ط¯ظپط¹ ط§ظ„ظ…ظ‚ط¨ظˆظ„ط©طں', 'We accept cash, bank transfer, and financing options through our partner banks.', 'ظ†ظ‚ط¨ظ„ ط§ظ„ط¯ظپط¹ ظ†ظ‚ط¯ط§ظ‹طŒ ط§ظ„طھط­ظˆظٹظ„ ط§ظ„ط¨ظ†ظƒظٹطŒ ظˆط®ظٹط§ط±ط§طھ ط§ظ„طھظ…ظˆظٹظ„ ط¹ط¨ط± ط§ظ„ط¨ظ†ظˆظƒ ط§ظ„ط´ط±ظٹظƒط©.', 'payment', 2),
('Do you offer warranty on used cars?', 'ظ‡ظ„ طھظ‚ط¯ظ…ظˆظ† ط¶ظ…ط§ظ† ط¹ظ„ظ‰ ط§ظ„ط³ظٹط§ط±ط§طھ ط§ظ„ظ…ط³طھط¹ظ…ظ„ط©طں', 'Yes, all our used cars come with a 6-month warranty covering major components.', 'ظ†ط¹ظ…طŒ ط¬ظ…ظٹط¹ ط³ظٹط§ط±ط§طھظ†ط§ ط§ظ„ظ…ط³طھط¹ظ…ظ„ط© طھط£طھظٹ ظ…ط¹ ط¶ظ…ط§ظ† 6 ط£ط´ظ‡ط± ظٹط؛ط·ظٹ ط§ظ„ظ…ظƒظˆظ†ط§طھ ط§ظ„ط±ط¦ظٹط³ظٹط©.', 'warranty', 3),
('Can I trade in my current car?', 'ظ‡ظ„ ظٹظ…ظƒظ†ظ†ظٹ ط§ط³طھط¨ط¯ط§ظ„ ط³ظٹط§ط±طھظٹ ط§ظ„ط­ط§ظ„ظٹط©طں', 'Yes, we offer trade-in services. Bring your car for a free evaluation.', 'ظ†ط¹ظ…طŒ ظ†ظ‚ط¯ظ… ط®ط¯ظ…ط© ط§ظ„ط§ط³طھط¨ط¯ط§ظ„. ط£ط­ط¶ط± ط³ظٹط§ط±طھظƒ ظ„ظ„طھظ‚ظٹظٹظ… ط§ظ„ظ…ط¬ط§ظ†ظٹ.', 'purchase', 4),
('How long does the delivery take?', 'ظƒظ… طھط³طھط؛ط±ظ‚ ط¹ظ…ظ„ظٹط© ط§ظ„طھظˆطµظٹظ„طں', 'Delivery typically takes 3-5 business days within the city, and 7-10 days for other regions.', 'ظٹط³طھط؛ط±ظ‚ ط§ظ„طھظˆطµظٹظ„ ط¹ط§ط¯ط© 3-5 ط£ظٹط§ظ… ط¹ظ…ظ„ ط¯ط§ط®ظ„ ط§ظ„ظ…ط¯ظٹظ†ط©طŒ ظˆ7-10 ط£ظٹط§ظ… ظ„ظ„ظ…ظ†ط§ط·ظ‚ ط§ظ„ط£ط®ط±ظ‰.', 'delivery', 5);
-- Create addresses table for user saved addresses
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label TEXT NOT NULL DEFAULT 'home',
  city TEXT,
  district TEXT,
  street TEXT,
  building_number TEXT,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Users can view their own addresses
CREATE POLICY "Users can view own addresses"
ON public.addresses
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own addresses
CREATE POLICY "Users can insert own addresses"
ON public.addresses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
CREATE POLICY "Users can update own addresses"
ON public.addresses
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "Users can delete own addresses"
ON public.addresses
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_addresses_updated_at
BEFORE UPDATE ON public.addresses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
