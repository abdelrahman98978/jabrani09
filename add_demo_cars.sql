-- Create demo data for cars, brands, and images including 360 view links

-- 1. Insert Brands
INSERT INTO public.brands (name, name_ar, logo_url, sort_order) VALUES
('Mercedes-Benz', 'مرسيدس بنز', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/1024px-Mercedes-Logo.svg.png', 1),
('BMW', 'بي إم دبليو', 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg', 2),
('Audi', 'أودي', 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg', 3),
('Porsche', 'بورش', 'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Porsche_Wappen.svg/1200px-Porsche_Wappen.svg.png', 4),
('Range Rover', 'رنج روفر', 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Land_Rover_Logo_2020.svg/1200px-Land_Rover_Logo_2020.svg.png', 5)
ON CONFLICT DO NOTHING;

-- 2. Insert Cars with 360 capability
INSERT INTO public.cars (
  brand_id, name, name_ar, model, year, price, original_price, 
  fuel_type, transmission, engine_size, color, color_ar, 
  description, description_ar, 
  main_image, images, 
  is_new, is_featured, has_discount, has_test_drive, status,
  video_360_url, video_360_type
) VALUES
-- Mercedes AMG GT
(
  (SELECT id FROM public.brands WHERE name = 'Mercedes-Benz' LIMIT 1),
  'Mercedes-AMG GT', 'مرسيدس إيه إم جي جي تي', 'GT 63 S', 2025, 950000, 1050000,
  'petrol', 'automatic', '4.0L V8', 'Obsidian Black', 'أسود',
  'The Mercedes-AMG GT 63 S E PERFORMANCE is the most powerful series-production model ever from Affalterbach.',
  'مرسيدس AMG GT 63 S هي أقوى سيارة إنتاجية من مرسيدس، تجمع بين الفخامة والأداء الرياضي الخارق.',
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070', 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070'],
  true, true, true, true, 'available',
  'https://www.apple.com/105/media/us/mac-pro/2019/3cd13146-240f-4f81-93c6-9436e2547b2d/anim/360/large.mp4', -- Dummy video for 360 demo
  'equirectangular'
),
-- BMW M4
(
  (SELECT id FROM public.brands WHERE name = 'BMW' LIMIT 1),
  'BMW M4 Competition', 'بي إم دبليو إم 4', 'M4 Competition', 2024, 580000, 600000,
  'petrol', 'automatic', '3.0L TwinPower Turbo', 'Sao Paulo Yellow', 'أصفر',
  'The BMW M4 Competition Coupe offers the perfect combination of track-level performance and everyday usability.',
  'بي إم دبليو M4 كومبتيشن كوبيه تقدم المزيج المثالي بين أداء الحلبات والاستخدام اليومي.',
  'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=2115&auto=format&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1607853202273-797f1c22a38e?q=80&w=2127'],
  true, true, true, true, 'available',
  NULL, NULL
),
-- Porsche 911
(
  (SELECT id FROM public.brands WHERE name = 'Porsche' LIMIT 1),
  'Porsche 911 GT3', 'بورش 911 جي تي 3', '911 GT3 RS', 2025, 1200000, NULL,
  'petrol', 'automatic', '4.0L Flat-6', 'Guards Red', 'أحمر',
  'The new 911 GT3 RS is designed for maximum performance, with increased downforce and reduced weight.',
  'بورش 911 GT3 RS الجديدة مصممة لأقصى درجات الأداء، مع زيادة القوة السفلية وتقليل الوزن.',
  'https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2070&auto=format&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=2070'],
  true, true, false, false, 'available',
  NULL, NULL
),
-- Range Rover
(
  (SELECT id FROM public.brands WHERE name = 'Range Rover' LIMIT 1),
  'Range Rover Autobiography', 'رنج روفر، أوتوبيوغرافي', 'P530', 2024, 850000, NULL,
  'petrol', 'automatic', '4.4L V8', 'Santorini Black', 'أسود',
  'The Range Rover Autobiography represents the pinnacle of luxury SUVs with unmatched refinement.',
  'رنج روفر أوتوبيوغرافي تمثل قمة سيارات الدفع الرباعي الفاخرة مع دقة لا مثيل لها.',
  'https://images.unsplash.com/photo-1606220838315-056192d5e927?q=80&w=2148&auto=format&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1675257020144-839316d28994?q=80&w=2070'],
  true, false, false, true, 'available',
  NULL, NULL
);
