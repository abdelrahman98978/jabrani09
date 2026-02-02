
-- 1. Update Settings (Showroom Name, Phone, Address)
UPDATE public.settings
SET 
  showroom_name = 'معرض الفخيم للسيارات',
  showroom_name_en = 'Al-Fakhim Car Showroom',
  phone = '+249123044745',
  address = 'Port Sudan, Sudan',
  address_ar = 'بورتسودان، السودان'
WHERE id = (SELECT id FROM public.settings LIMIT 1);

-- 0. Ensure Arabic columns exist
DO $$
BEGIN
    -- Add columns to 'brands' if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'name_ar') THEN
        ALTER TABLE public.brands ADD COLUMN name_ar TEXT;
    END IF;

    -- Add columns to 'cars' if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'model_ar') THEN
        ALTER TABLE public.cars ADD COLUMN model_ar TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'description_ar') THEN
        ALTER TABLE public.cars ADD COLUMN description_ar TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'features_ar') THEN
        ALTER TABLE public.cars ADD COLUMN features_ar TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'color_ar') THEN
        ALTER TABLE public.cars ADD COLUMN color_ar TEXT;
    END IF;
END $$;

-- 2. Insert Brands (Lexus, Toyota) if they don't exist
INSERT INTO public.brands (name, name_ar, logo_url, is_active)
SELECT 'Lexus', 'لكزس', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Lexus_logo_2023.svg/1200px-Lexus_logo_2023.svg.png', true
WHERE NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'Lexus');

INSERT INTO public.brands (name, name_ar, logo_url, is_active)
SELECT 'Toyota', 'تويوتا', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/1024px-Toyota_carlogo.svg.png', true
WHERE NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'Toyota');

-- 3. Insert Cars / Update Existing (Mark Featured)
WITH lexus_brand AS (SELECT id FROM public.brands WHERE name = 'Lexus' LIMIT 1),
     toyota_brand AS (SELECT id FROM public.brands WHERE name = 'Toyota' LIMIT 1),
     jetour_brand AS (SELECT id FROM public.brands WHERE name = 'Jetour' LIMIT 1),
     mercedes_brand AS (SELECT id FROM public.brands WHERE name = 'Mercedes-Benz' LIMIT 1)

INSERT INTO public.cars (
  brand_id, model, model_ar, year, price, image_url, images, description, description_ar, 
  features, features_ar, status, category, transmission, fuel_type, mileage, color, color_ar, is_featured
)
VALUES
  -- Lexus LX600
  (
    (SELECT id FROM lexus_brand),
    'LX 600 VIP', 'LX 600 VIP', 2025, 650000, 
    'https://images.unsplash.com/photo-1606734791535-f761fb0bbf5b?q=80&w=2070&auto=format&fit=crop', 
    ARRAY['https://images.unsplash.com/photo-1606734791535-f761fb0bbf5b?q=80&w=2070&auto=format&fit=crop'],
    'The ultimate luxury SUV. Lexus LX 600 VIP offers unparalleled comfort and off-road capability.',
    'أفخم سيارة دفع رباعي. لكزس LX 600 VIP تقدم راحة لا تضاهى وقدرات عالية على الطرق الوعرة.',
    ARRAY['Massage Seats', 'Rear Entertainment', 'Mark Levinson Audio', 'Head-Up Display'],
    ARRAY['مقاعد مساج', 'نظام ترفيه خلفي', 'صوتيات مارك ليفينسون', 'شاشة عرض رأسية'],
    'available', 'SUV', 'automatic', 'petrol', 0, 'White', 'أبيض', true
  ),

  -- Toyota Land Cruiser LC300
  (
    (SELECT id FROM toyota_brand),
    'Land Cruiser LC300', 'لاند كروزر LC300', 2025, 420000, 
    'https://images.unsplash.com/photo-1594502184342-2b5428f52532?q=80&w=2070&auto=format&fit=crop', 
    ARRAY['https://images.unsplash.com/photo-1594502184342-2b5428f52532?q=80&w=2070&auto=format&fit=crop'],
    'The king of 4WDs. Toyota Land Cruiser LC300 combines reliability with modern technology.',
    'ملك الدفع الرباعي. تويوتا لاند كروزر LC300 تجمع بين الاعتمادية والتكنولوجيا الحديثة.',
    ARRAY['4WD', 'Crawl Control', 'JBL Sound', 'Safety Sense'],
    ARRAY['دفع رباعي', 'نظام الزحف', 'صوتيات JBL', 'أنظمة الأمان'],
    'available', 'SUV', 'automatic', 'petrol', 0, 'Pearl White', 'أبيض لؤلؤي', true
  );

-- 4. Mark previously added Jetour/Mercedes as featured
UPDATE public.cars
SET is_featured = true
WHERE model IN ('T2 (Traveller)', 'G63 AMG', 'X70 Plus', 'Dashing');
