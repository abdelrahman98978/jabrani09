-- !!! هام جداً: انسخ هذا الكود كاملاً ونفذه في Supabase SQL Editor !!!

-- 1. إصلاح جدول السيارات (Cars)
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Cars" ON public.cars;
DROP POLICY IF EXISTS "Anyone can view available cars" ON public.cars;
CREATE POLICY "Public Read Cars" ON public.cars FOR SELECT TO public USING (true);

-- 2. إصلاح جدول الماركات (Brands)
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Brands" ON public.brands;
DROP POLICY IF EXISTS "Anyone can view active brands" ON public.brands;
CREATE POLICY "Public Read Brands" ON public.brands FOR SELECT TO public USING (true);

-- 3. إصلاح جدول العروض (Promotions)
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Promotions" ON public.promotions;
CREATE POLICY "Public Read Promotions" ON public.promotions FOR SELECT TO public USING (true);

-- 4. إصلاح جدول الإعدادات (Settings)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Settings" ON public.settings;
CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT TO public USING (true);

-- 5. إصلاح جدول الإشعارات (Notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    message TEXT,
    user_id UUID REFERENCES auth.users(id),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 6. إضافة بيانات تجريبية (إذا كانت الجداول فارغة فقط)
INSERT INTO public.brands (name, name_ar, logo_url, is_active, sort_order)
SELECT 'Mercedes-Benz', 'مرسيدس بنز', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/512px-Mercedes-Logo.svg.png', true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'Mercedes-Benz');

INSERT INTO public.brands (name, name_ar, logo_url, is_active, sort_order)
SELECT 'BMW', 'بي إم دبليو', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/512px-BMW.svg.png', true, 2
WHERE NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'BMW');

-- إضافة سيارة تجريبية مرتبطة بأول ماركة
DO $$
DECLARE
  brand_id uuid;
BEGIN
  SELECT id INTO brand_id FROM public.brands LIMIT 1;
  IF brand_id IS NOT NULL THEN
    INSERT INTO public.cars (name, name_ar, model, year, price, brand_id, status, is_featured, main_image)
    SELECT 'Mercedes Demo', 'مرسيدس تجريبية', '2024', 2024, 500000, brand_id, 'available', true, 'https://images.unsplash.com/photo-1617788138017-80ad40651399'
    WHERE NOT EXISTS (SELECT 1 FROM public.cars LIMIT 1);
  END IF;
END $$;
