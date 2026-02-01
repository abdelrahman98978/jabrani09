-- Comprehensive Seed Data for Cars and Brands

-- 1. Ensure Brands Exist
INSERT INTO public.brands (name, name_ar, logo_url, is_active, sort_order) VALUES
('Mercedes-Benz', 'مرسيدس بنز', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/512px-Mercedes-Logo.svg.png', true, 1),
('BMW', 'بي إم دبليو', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/512px-BMW.svg.png', true, 2),
('Audi', 'أودي', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/512px-Audi-Logo_2016.svg.png', true, 3),
('Toyota', 'تويوتا', 'https://global.toyota/pages/global_toyota/mobility/toyota-brand/emblem_ogp_001.png', true, 4),
('Lexus', 'لكزس', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Lexus_Division.svg/512px-Lexus_Division.svg.png', true, 5),
('Range Rover', 'رنج روفر', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Land_Rover_logo_2014.png/512px-Land_Rover_logo_2014.png', true, 6),
('Porsche', 'بورش', 'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Porsche_Wappen.svg/120px-Porsche_Wappen.svg.png', true, 7)
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Cars
-- Mercedes
WITH brand AS (SELECT id FROM public.brands WHERE name = 'Mercedes-Benz' LIMIT 1)
INSERT INTO public.cars (
  brand_id, name, name_ar, model, year, price, original_price, 
  fuel_type, transmission, color, color_ar, mileage,
  description, description_ar, 
  main_image, images, 
  status, is_active, is_featured, is_new, has_discount
) SELECT 
  brand.id, 'S-Class S500', 'اس كلاس S500', 'S500', 2025, 750000, 800000,
  'petrol', 'automatic', 'Black', 'أسود', 0,
  'Mercedes-Benz S-Class S500 4MATIC Luxury Sedan.', 'مرسيدس بنز اس كلاس S500 قمة الفخامة والرفاهية.',
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070', 
  ARRAY['https://images.unsplash.com/photo-1609521256037-83ebce82b13c?q=80&w=2070'],
  'available', true, true, true, true
FROM brand
WHERE NOT EXISTS (SELECT 1 FROM public.cars WHERE name = 'S-Class S500');

WITH brand AS (SELECT id FROM public.brands WHERE name = 'Mercedes-Benz' LIMIT 1)
INSERT INTO public.cars (
  brand_id, name, name_ar, model, year, price, 
  fuel_type, transmission, color, color_ar, mileage,
  description, description_ar, 
  main_image, images, 
  status, is_active, is_featured, is_new
) SELECT 
  brand.id, 'G-Class G63', 'جي كلاس G63', 'AMG G63', 2024, 1100000,
  'petrol', 'automatic', 'White', 'أبيض', 5000,
  'The legendary G-Class G63 AMG.', 'الأسطورة جي كلاس G63 AMG.',
  'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=2070', 
  ARRAY['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070'],
  'available', true, true, false
FROM brand
WHERE NOT EXISTS (SELECT 1 FROM public.cars WHERE name = 'G-Class G63');

-- BMW
WITH brand AS (SELECT id FROM public.brands WHERE name = 'BMW' LIMIT 1)
INSERT INTO public.cars (
  brand_id, name, name_ar, model, year, price, original_price,
  fuel_type, transmission, color, color_ar, mileage,
  description, description_ar, 
  main_image, images, 
  status, is_active, is_featured, is_new, has_discount
) SELECT 
  brand.id, 'BMW 7 Series', 'بي إم دبليو الفئة السابعة', '740i', 2024, 620000, 650000,
  'petrol', 'automatic', 'Grey', 'رمادي', 0,
  'The new BMW 7 Series. Pure elegance.', 'بي إم دبليو الفئة السابعة الجديدة. أناقة خالصة.',
  'https://images.unsplash.com/photo-1555215696-99ac45e751c8?q=80&w=2070', 
  ARRAY['https://images.unsplash.com/photo-1556189250-72ba95452242?q=80&w=2070'],
  'available', true, true, true, true
FROM brand
WHERE NOT EXISTS (SELECT 1 FROM public.cars WHERE name = 'BMW 7 Series');

-- Toyota
WITH brand AS (SELECT id FROM public.brands WHERE name = 'Toyota' LIMIT 1)
INSERT INTO public.cars (
  brand_id, name, name_ar, model, year, price,
  fuel_type, transmission, color, color_ar, mileage,
  description, description_ar, 
  main_image, images, 
  status, is_active, is_featured, is_new
) SELECT 
  brand.id, 'Land Cruiser', 'لاند كروزر', 'GXR', 2024, 320000,
  'petrol', 'automatic', 'White', 'أبيض', 0,
  'Toyota Land Cruiser GXR 2024.', 'تويوتا لاند كروزر GXR 2024.',
  'https://images.unsplash.com/photo-1594502184342-2b54284d8581?q=80&w=2070', 
  ARRAY['https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=2070'],
  'available', true, true, true
FROM brand
WHERE NOT EXISTS (SELECT 1 FROM public.cars WHERE name = 'Land Cruiser');

-- Range Rover
WITH brand AS (SELECT id FROM public.brands WHERE name = 'Range Rover' LIMIT 1)
INSERT INTO public.cars (
  brand_id, name, name_ar, model, year, price, original_price,
  fuel_type, transmission, color, color_ar, mileage,
  description, description_ar, 
  main_image, images, 
  status, is_active, is_featured, is_new, has_discount
) SELECT 
  brand.id, 'Range Rover Vogue', 'رنج روفر فوج', 'SE', 2024, 780000, 820000,
  'petrol', 'automatic', 'Silver', 'فضي', 0,
  'Range Rover Vogue SE 2024.', 'رنج روفر فوج SE 2024.',
  'https://images.unsplash.com/photo-1606220838315-056192d5e927?q=80&w=2148', 
  ARRAY['https://images.unsplash.com/photo-1675257020144-839316d28994?q=80&w=2070'],
  'available', true, true, true, true
FROM brand
WHERE NOT EXISTS (SELECT 1 FROM public.cars WHERE name = 'Range Rover Vogue');

-- 3. Fix 360 Video Type type definition if needed (optional check)
-- DO $$ 
-- BEGIN 
--   IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'video_360_type_enum') THEN
--     -- handle enum creation if required or just use text
--   END IF;
-- END $$;
