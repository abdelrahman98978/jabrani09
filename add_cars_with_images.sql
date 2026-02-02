-- إضافة سيارات Jetour و Lexus و G-Class مع صور صحيحة
-- يجب تشغيل هذا السكريبت في Supabase SQL Editor

-- 1. إضافة العلامات التجارية
INSERT INTO public.brands (name, name_ar, logo_url, is_active, sort_order)
VALUES 
  ('Jetour', 'جيتور', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Jetour_logo.svg/2560px-Jetour_logo.svg.png', true, 11),
  ('Lexus', 'لكزس', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Lexus_logo.svg/2560px-Lexus_logo.svg.png', true, 12),
  ('Mercedes-Benz', 'مرسيدس بنز', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/1024px-Mercedes-Logo.svg.png', true, 13)
ON CONFLICT (name) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  logo_url = EXCLUDED.logo_url,
  is_active = EXCLUDED.is_active;

-- 2. إضافة السيارات
WITH 
jetour_brand AS (SELECT id FROM public.brands WHERE name = 'Jetour' LIMIT 1),
lexus_brand AS (SELECT id FROM public.brands WHERE name = 'Lexus' LIMIT 1),
mercedes_brand AS (SELECT id FROM public.brands WHERE name = 'Mercedes-Benz' LIMIT 1)

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
  -- 1. Jetour T2 (Traveller)
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

  -- 2. Jetour Dashing
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

  -- 3. Jetour X70 Plus
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

  -- 4. Lexus LX 600
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

  -- 5. Lexus ES 350
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

  -- 6. Mercedes-Benz G63 AMG
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
  );
