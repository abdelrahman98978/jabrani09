
-- 1. Insert Brands (Jetour, Mercedes-Benz) if they don't exist
INSERT INTO public.brands (name, name_ar, logo_url, is_active)
VALUES 
  ('Jetour', 'جيتور', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Jetour_logo.svg/2560px-Jetour_logo.svg.png', true),
  ('Mercedes-Benz', 'مرسيدس بنز', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/1024px-Mercedes-Logo.svg.png', true)
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Cars
-- We need to look up brand IDs dynamically using a subquery

WITH jetour_brand AS (
  SELECT id FROM public.brands WHERE name = 'Jetour' LIMIT 1
),
mercedes_brand AS (
  SELECT id FROM public.brands WHERE name = 'Mercedes-Benz' LIMIT 1
)

INSERT INTO public.cars (
  brand_id, 
  model, 
  model_ar, 
  year, 
  price, 
  image_url, 
  images, 
  description, 
  description_ar, 
  features, 
  features_ar, 
  status, 
  category, 
  transmission, 
  fuel_type, 
  mileage, 
  color, 
  color_ar
)
VALUES
  -- 1. Jetour T2 (Traveller)
  (
    (SELECT id FROM jetour_brand),
    'T2 (Traveller)',
    'T2 (ترافيلر)',
    2025,
    135000,
    'https://images.unsplash.com/photo-1706859556770-449e25cb18c2?q=80&w=1974&auto=format&fit=crop', -- Placeholder offroad car
    ARRAY['https://images.unsplash.com/photo-1706859556770-449e25cb18c2?q=80&w=1974&auto=format&fit=crop', 'https://images.unsplash.com/photo-1699564639908-16629a997d98?q=80&w=2070&auto=format&fit=crop'],
    'The Jetour T2 is the ultimate off-road SUV, combining rugged capability with modern luxury. Features a 2.0T engine and 4WD system.',
    'جيتور T2 هي السيارة الرياضية متعددة الاستخدامات المثالية للطرق الوعرة، تجمع بين القدرة الصلبة والرفاهية الحديثة. تتميز بمحرك 2.0 تيربو ونظام دفع رباعي.',
    ARRAY['4WD', 'Diff Lock', 'Panoramic Roof', 'ADAS', 'Sony Sound System'],
    ARRAY['دفع رباعي', 'قفل تفاضلي', 'سقف بانورامي', 'أنظمة مساعدة القيادة', 'نظام صوتي Sony'],
    'available',
    'SUV',
    'automatic',
    'petrol',
    0,
    'Silver',
    'فضي'
  ),

  -- 2. Jetour Dashing
  (
    (SELECT id FROM jetour_brand),
    'Dashing',
    'داشينج',
    2025,
    95000,
    'https://images.unsplash.com/photo-1627454819213-f77e6859f131?q=80&w=2070&auto=format&fit=crop', -- Sleek SUV placeholder
    ARRAY['https://images.unsplash.com/photo-1627454819213-f77e6859f131?q=80&w=2070&auto=format&fit=crop'],
    'Jetour Dashing offers a futuristic design with cutting-edge technology. It is designed for the modern urban lifestyle.',
    'جيتور داشينج تقدم تصميماً مستقبلياً مع تكنولوجيا متطورة. صممت لتناسب نمط الحياة الحضري الحديث.',
    ARRAY['Heads-up Display', 'Voice Control', 'Sport Seats', 'Wireless Charging'],
    ARRAY['شاشة عرض رأسية', 'تحكم صوتي', 'مقاعد رياضية', 'شحن لاسلكي'],
    'available',
    'SUV',
    'automatic',
    'petrol',
    0,
    'White',
    'أبيض'
  ),

  -- 3. Jetour X70 Plus
  (
    (SELECT id FROM jetour_brand),
    'X70 Plus',
    'X70 بلس',
    2025,
    85000,
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop', -- Family SUV placeholder
    ARRAY['https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop'],
    'A spacious 7-seater family SUV with premium interior and advanced safety features.',
    'سيارة عائلية 7 مقاعد واسعة مع تصميم داخلي فاخر وميزات أمان متقدمة.',
    ARRAY['7 Seats', '360 Camera', 'Leather Seats', 'Power Tailgate'],
    ARRAY['7 مقاعد', 'كاميرا 360', 'مقاعد جلدية', 'باب خلفي كهربائي'],
    'available',
    'SUV',
    'automatic',
    'petrol',
    0,
    'Blue',
    'أزرق'
  ),

  -- 4. Mercedes-Benz G63 AMG
  (
    (SELECT id FROM mercedes_brand),
    'G63 AMG',
    'G63 AMG',
    2025,
    950000,
    'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=2071&auto=format&fit=crop', -- G-Wagon
    ARRAY['https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=2071&auto=format&fit=crop', 'https://images.unsplash.com/photo-1606229365485-93a3b8ee0385?q=80&w=1974&auto=format&fit=crop'],
    'The legendary G-Class "G-Wagon". Unmatched luxury, iconic design, and brutal performance from the V8 Biturbo engine.',
    'جي كلاس الأسطورية "G-Wagon". فخامة لا تضاهى، تصميم أيقوني، وأداء جبار من محرك V8 ثنائي التيربو.',
    ARRAY['V8 Biturbo', 'Burmester 3D Sound', 'Massage Seats', 'Night Package', 'Carbon Fiber Interior'],
    ARRAY['محرك V8 ثنائي التيربو', 'نظام صوتي Burmester 3D', 'مقاعد مساج', 'الباقة الليلية', 'داخلية كاربون فايبر'],
    'available',
    'SUV',
    'automatic',
    'petrol',
    0,
    'Matte Black',
    'أسود مطفي'
  );
