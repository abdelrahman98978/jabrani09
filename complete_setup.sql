-- ========================================
-- سكريبت إعداد كامل لمعرض الفخيم للسيارات
-- Al-Fakhim Car Showroom Complete Setup
-- ========================================
-- قم بتشغيل هذا السكريبت في Supabase SQL Editor للمشروع الجديد

-- ========================================
-- 1. إنشاء الجداول الأساسية
-- ========================================

-- جدول العلامات التجارية
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول السيارات
CREATE TABLE IF NOT EXISTS public.cars (
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

-- جدول الإعدادات
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  showroom_name TEXT DEFAULT 'معرض الفخيم للسيارات',
  showroom_name_en TEXT DEFAULT 'Al-Fakhim Car Showroom',
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  address_ar TEXT,
  logo_url TEXT,
  hero_image_url TEXT,
  hero_video_url TEXT,
  hero_type TEXT DEFAULT 'image',
  about_text TEXT,
  about_text_ar TEXT,
  working_hours TEXT,
  working_hours_ar TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  marquee_enabled BOOLEAN DEFAULT true,
  marquee_text TEXT,
  marquee_text_ar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول الأدوار
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'moderator')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- جدول العملاء
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول الطلبات
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
  user_id UUID,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'processing', 'reserved', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'financing')),
  total_amount NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول سلة التسوق
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT cart_items_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- جدول قائمة الأمنيات
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, car_id)
);

-- جدول رسائل الاتصال
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول المشتركين في النشرة البريدية
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- ========================================
-- 2. تفعيل Row Level Security
-- ========================================

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. سياسات الوصول (RLS Policies)
-- ========================================

-- العلامات التجارية - الجميع يمكنهم القراءة
DROP POLICY IF EXISTS "Anyone can view active brands" ON public.brands;
CREATE POLICY "Anyone can view active brands" ON public.brands FOR SELECT USING (is_active = true);

-- السيارات - الجميع يمكنهم القراءة
DROP POLICY IF EXISTS "Anyone can view available cars" ON public.cars;
CREATE POLICY "Anyone can view available cars" ON public.cars FOR SELECT USING (status = 'available');

-- الإعدادات - الجميع يمكنهم القراءة
DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);

-- الأدوار - المستخدمون يمكنهم رؤية أدوارهم
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- العملاء - الجميع يمكنهم الإضافة
DROP POLICY IF EXISTS "Anyone can insert customers" ON public.customers;
CREATE POLICY "Anyone can insert customers" ON public.customers FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view customers" ON public.customers;
CREATE POLICY "Anyone can view customers" ON public.customers FOR SELECT TO public USING (true);

-- الطلبات - الجميع يمكنهم الإضافة
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- سلة التسوق
DROP POLICY IF EXISTS "Users can manage their own cart items" ON public.cart_items;
CREATE POLICY "Users can manage their own cart items" ON public.cart_items FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Guests can manage cart items" ON public.cart_items;
CREATE POLICY "Guests can manage cart items" ON public.cart_items FOR ALL TO anon USING (user_id IS NULL) WITH CHECK (user_id IS NULL);

-- قائمة الأمنيات
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON public.wishlist;
CREATE POLICY "Users can manage their own wishlist" ON public.wishlist FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- رسائل الاتصال
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT TO public WITH CHECK (true);

-- النشرة البريدية
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- ========================================
-- 4. الصلاحيات الأساسية
-- ========================================

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON public.cart_items TO anon;
GRANT ALL ON public.cart_items TO authenticated;
GRANT ALL ON public.wishlist TO authenticated;
GRANT INSERT ON public.customers TO anon;
GRANT INSERT ON public.customers TO authenticated;
GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.orders TO authenticated;
GRANT INSERT ON public.contact_messages TO anon;
GRANT INSERT ON public.contact_messages TO authenticated;

-- ========================================
-- 5. إدراج البيانات الأساسية
-- ========================================

-- إعدادات المعرض
INSERT INTO public.settings (
  showroom_name,
  showroom_name_en,
  phone,
  whatsapp,
  email,
  address,
  address_ar,
  working_hours,
  working_hours_ar
) VALUES (
  'معرض الفخيم للسيارات',
  'Al-Fakhim Car Showroom',
  '+249123044745',
  '249123044745',
  'info@alfakhim.com',
  'Port Sudan, Sudan',
  'بورتسودان، السودان',
  'Sat - Thu: 9 AM - 10 PM',
  'السبت - الخميس: 9 صباحاً - 10 مساءً'
) ON CONFLICT (id) DO NOTHING;

-- العلامات التجارية
INSERT INTO public.brands (name, name_ar, logo_url, is_active, sort_order)
VALUES 
  ('Toyota', 'تويوتا', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Toyota.svg/2560px-Toyota.svg.png', true, 1),
  ('Hyundai', 'هيونداي', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Hyundai_Motor_Company_logo.svg/2560px-Hyundai_Motor_Company_logo.svg.png', true, 2),
  ('Kia', 'كيا', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Kia-logo.svg/2560px-Kia-logo.svg.png', true, 3),
  ('Nissan', 'نيسان', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Nissan_logo.svg/2560px-Nissan_logo.svg.png', true, 4),
  ('Ford', 'فورد', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/2560px-Ford_logo_flat.svg.png', true, 5),
  ('Chevrolet', 'شيفروليه', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Chevrolet_logo.svg/2560px-Chevrolet_logo.svg.png', true, 6),
  ('Honda', 'هوندا', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Honda_logo.svg/2560px-Honda_logo.svg.png', true, 7),
  ('BMW', 'بي ام دبليو', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/BMW_logo_%28gray%29.svg/2560px-BMW_logo_%28gray%29.svg.png', true, 8),
  ('Mercedes-Benz', 'مرسيدس بنز', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/1024px-Mercedes-Logo.svg.png', true, 9),
  ('Lexus', 'لكزس', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Lexus_logo.svg/2560px-Lexus_logo.svg.png', true, 10),
  ('Jetour', 'جيتور', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Jetour_logo.svg/2560px-Jetour_logo.svg.png', true, 11)
ON CONFLICT (name) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  logo_url = EXCLUDED.logo_url,
  is_active = EXCLUDED.is_active;

-- السيارات المميزة
WITH 
jetour_brand AS (SELECT id FROM public.brands WHERE name = 'Jetour' LIMIT 1),
lexus_brand AS (SELECT id FROM public.brands WHERE name = 'Lexus' LIMIT 1),
mercedes_brand AS (SELECT id FROM public.brands WHERE name = 'Mercedes-Benz' LIMIT 1),
toyota_brand AS (SELECT id FROM public.brands WHERE name = 'Toyota' LIMIT 1)

INSERT INTO public.cars (
  brand_id,
  name,
  name_ar,
  model,
  year,
  price,
  main_image,
  images,
  description,
  description_ar,
  status,
  transmission,
  fuel_type,
  mileage,
  color,
  color_ar,
  is_featured,
  is_new
)
VALUES
  -- Jetour T2 Traveller
  (
    (SELECT id FROM jetour_brand),
    'Jetour T2 Traveller',
    'جيتور T2 ترافيلر',
    'T2',
    2025,
    135000,
    'https://images.unsplash.com/photo-1706859556770-449e25cb18c2?q=80&w=1974&auto=format&fit=crop',
    ARRAY[
      'https://images.unsplash.com/photo-1706859556770-449e25cb18c2?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1699564639908-16629a997d98?q=80&w=2070&auto=format&fit=crop'
    ],
    'The Jetour T2 is the ultimate off-road SUV, combining rugged capability with modern luxury. Features a 2.0T engine and 4WD system.',
    'جيتور T2 هي السيارة الرياضية متعددة الاستخدامات المثالية للطرق الوعرة، تجمع بين القدرة الصلبة والرفاهية الحديثة. تتميز بمحرك 2.0 تيربو ونظام دفع رباعي.',
    'available',
    'automatic',
    'petrol',
    0,
    'Silver',
    'فضي',
    true,
    true
  ),

  -- Jetour Dashing
  (
    (SELECT id FROM jetour_brand),
    'Jetour Dashing',
    'جيتور داشينج',
    'Dashing',
    2025,
    95000,
    'https://images.unsplash.com/photo-1627454819213-f77e6859f131?q=80&w=2070&auto=format&fit=crop',
    ARRAY['https://images.unsplash.com/photo-1627454819213-f77e6859f131?q=80&w=2070&auto=format&fit=crop'],
    'Jetour Dashing offers a futuristic design with cutting-edge technology. Designed for the modern urban lifestyle.',
    'جيتور داشينج تقدم تصميماً مستقبلياً مع تكنولوجيا متطورة. صممت لتناسب نمط الحياة الحضري الحديث.',
    'available',
    'automatic',
    'petrol',
    0,
    'White',
    'أبيض',
    true,
    true
  ),

  -- Jetour X70 Plus
  (
    (SELECT id FROM jetour_brand),
    'Jetour X70 Plus',
    'جيتور X70 بلس',
    'X70 Plus',
    2025,
    85000,
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop',
    ARRAY['https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop'],
    'A spacious 7-seater family SUV with premium interior and advanced safety features.',
    'سيارة عائلية 7 مقاعد واسعة مع تصميم داخلي فاخر وميزات أمان متقدمة.',
    'available',
    'automatic',
    'petrol',
    0,
    'Blue',
    'أزرق',
    true,
    true
  ),

  -- Lexus LX 600
  (
    (SELECT id FROM lexus_brand),
    'Lexus LX 600',
    'لكزس LX 600',
    'LX 600',
    2025,
    550000,
    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop',
    ARRAY[
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=2070&auto=format&fit=crop'
    ],
    'The flagship Lexus LX 600 combines luxury, capability, and cutting-edge technology. V6 Twin-Turbo engine with unmatched refinement.',
    'لكزس LX 600 الرائدة تجمع بين الفخامة والقدرة والتكنولوجيا المتطورة. محرك V6 ثنائي التيربو مع تطور لا مثيل له.',
    'available',
    'automatic',
    'petrol',
    0,
    'Pearl White',
    'أبيض لؤلؤي',
    true,
    true
  ),

  -- Lexus ES 350
  (
    (SELECT id FROM lexus_brand),
    'Lexus ES 350',
    'لكزس ES 350',
    'ES 350',
    2024,
    280000,
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2070&auto=format&fit=crop',
    ARRAY['https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2070&auto=format&fit=crop'],
    'Elegant luxury sedan with exceptional comfort and reliability. Perfect for executive transportation.',
    'سيدان فاخرة أنيقة مع راحة وموثوقية استثنائية. مثالية للنقل التنفيذي.',
    'available',
    'automatic',
    'hybrid',
    0,
    'Silver',
    'فضي',
    true,
    true
  ),

  -- Mercedes-Benz G63 AMG
  (
    (SELECT id FROM mercedes_brand),
    'Mercedes-Benz G63 AMG',
    'مرسيدس بنز G63 AMG',
    'G63 AMG',
    2025,
    950000,
    'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=2071&auto=format&fit=crop',
    ARRAY[
      'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=2071&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1606229365485-93a3b8ee0385?q=80&w=1974&auto=format&fit=crop'
    ],
    'The legendary G-Class "G-Wagon". Unmatched luxury, iconic design, and brutal performance from the V8 Biturbo engine.',
    'جي كلاس الأسطورية "G-Wagon". فخامة لا تضاهى، تصميم أيقوني، وأداء جبار من محرك V8 ثنائي التيربو.',
    'available',
    'automatic',
    'petrol',
    0,
    'Matte Black',
    'أسود مطفي',
    true,
    true
  ),

  -- Toyota Land Cruiser
  (
    (SELECT id FROM toyota_brand),
    'Toyota Land Cruiser',
    'تويوتا لاند كروزر',
    'Land Cruiser',
    2024,
    450000,
    'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop',
    ARRAY['https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop'],
    'The legendary Toyota Land Cruiser. Unbeatable reliability and off-road capability.',
    'تويوتا لاند كروزر الأسطورية. موثوقية لا تقهر وقدرة على الطرق الوعرة.',
    'available',
    'automatic',
    'diesel',
    0,
    'White',
    'أبيض',
    true,
    true
  );

-- إضافة دور المدير للبريد الإلكتروني المحدد
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

-- ========================================
-- تم الانتهاء من الإعداد!
-- ========================================
