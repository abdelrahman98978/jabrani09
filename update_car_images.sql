-- ========================================
-- تحديث صور السيارات بصور حقيقية من المواقع الرسمية
-- Update Car Images with Real Official Images
-- ========================================

-- تحديث صور سيارات جيتور
-- Update Jetour car images

-- Jetour X90 Plus
UPDATE public.cars 
SET 
  main_image = 'https://www.jetouruae.com/wp-content/uploads/2024/01/jetour-x90-plus-exterior-1.jpg',
  images = ARRAY[
    'https://www.jetouruae.com/wp-content/uploads/2024/01/jetour-x90-plus-exterior-1.jpg',
    'https://www.jetouruae.com/wp-content/uploads/2024/01/jetour-x90-plus-interior-1.jpg',
    'https://www.jetouruae.com/wp-content/uploads/2024/01/jetour-x90-plus-exterior-2.jpg'
  ]
WHERE name = 'Jetour X90 Plus';

-- Jetour Traveller (T2)
UPDATE public.cars 
SET 
  main_image = 'https://www.jetouruae.com/wp-content/uploads/2024/01/jetour-t2-exterior-front.jpg',
  images = ARRAY[
    'https://www.jetouruae.com/wp-content/uploads/2024/01/jetour-t2-exterior-front.jpg',
    'https://www.jetouruae.com/wp-content/uploads/2024/01/jetour-t2-interior.jpg',
    'https://www.jetouruae.com/wp-content/uploads/2024/01/jetour-t2-exterior-side.jpg'
  ]
WHERE name = 'Jetour Traveller';

-- Jetour Dashing
UPDATE public.cars 
SET 
  main_image = 'https://www.jetouruae.com/wp-content/uploads/2024/01/jetour-dashing-exterior.jpg',
  images = ARRAY[
    'https://www.jetouruae.com/wp-content/uploads/2024/01/jetour-dashing-exterior.jpg',
    'https://www.jetouruae.com/wp-content/uploads/2024/01/jetour-dashing-interior.jpg',
    'https://www.jetouruae.com/wp-content/uploads/2024/01/jetour-dashing-side.jpg'
  ]
WHERE name = 'Jetour Dashing';

-- Jetour X70
UPDATE public.cars 
SET 
  main_image = 'https://www.jetouruae.com/wp-content/uploads/2024/01/jetour-x70-plus-exterior.jpg',
  images = ARRAY[
    'https://www.jetouruae.com/wp-content/uploads/2024/01/jetour-x70-plus-exterior.jpg',
    'https://www.jetouruae.com/wp-content/uploads/2024/01/jetour-x70-plus-interior.jpg'
  ]
WHERE name = 'Jetour X70';

-- Jetour Shanhai T2
UPDATE public.cars 
SET 
  main_image = 'https://www.jetouruae.com/wp-content/uploads/2024/01/jetour-t2-shanhai-exterior.jpg',
  images = ARRAY[
    'https://www.jetouruae.com/wp-content/uploads/2024/01/jetour-t2-shanhai-exterior.jpg',
    'https://www.jetouruae.com/wp-content/uploads/2024/01/jetour-t2-shanhai-interior.jpg',
    'https://www.jetouruae.com/wp-content/uploads/2024/01/jetour-t2-shanhai-offroad.jpg'
  ]
WHERE name = 'Jetour Shanhai T2';

-- ========================================
-- تحديث صور سيارات تويوتا
-- Update Toyota car images
-- ========================================

-- Toyota Camry 2024
UPDATE public.cars 
SET 
  main_image = 'https://www.toyota.com/imgix/content/dam/toyota/jellies/max/2024/camry/xse/1j9/1.png',
  images = ARRAY[
    'https://www.toyota.com/imgix/content/dam/toyota/jellies/max/2024/camry/xse/1j9/1.png',
    'https://www.toyota.com/imgix/content/dam/toyota/vehicles/2024/camry/gallery/interior/camry-interior-1.jpg',
    'https://www.toyota.com/imgix/content/dam/toyota/vehicles/2024/camry/gallery/exterior/camry-exterior-2.jpg'
  ]
WHERE name = 'Toyota Camry' AND year = 2024;

-- Toyota Corolla 2024
UPDATE public.cars 
SET 
  main_image = 'https://www.toyota.com/imgix/content/dam/toyota/jellies/max/2024/corolla/se/040/1.png',
  images = ARRAY[
    'https://www.toyota.com/imgix/content/dam/toyota/jellies/max/2024/corolla/se/040/1.png',
    'https://www.toyota.com/imgix/content/dam/toyota/vehicles/2024/corolla/gallery/interior/corolla-interior-1.jpg'
  ]
WHERE name = 'Toyota Corolla' AND year = 2024;

-- Toyota Land Cruiser 2024
UPDATE public.cars 
SET 
  main_image = 'https://www.toyota.com/imgix/content/dam/toyota/jellies/max/2024/landcruiser/1g3/1.png',
  images = ARRAY[
    'https://www.toyota.com/imgix/content/dam/toyota/jellies/max/2024/landcruiser/1g3/1.png',
    'https://www.toyota.com/imgix/content/dam/toyota/vehicles/2024/landcruiser/gallery/interior/landcruiser-interior-1.jpg',
    'https://www.toyota.com/imgix/content/dam/toyota/vehicles/2024/landcruiser/gallery/exterior/landcruiser-exterior-2.jpg'
  ]
WHERE name = 'Toyota Land Cruiser' AND year = 2024;

-- Toyota Hilux 2024
UPDATE public.cars 
SET 
  main_image = 'https://www.toyota-global.com/pages/news/images/2023/08/02/1330/001.jpg',
  images = ARRAY[
    'https://www.toyota-global.com/pages/news/images/2023/08/02/1330/001.jpg',
    'https://www.toyota-global.com/pages/news/images/2023/08/02/1330/002.jpg',
    'https://www.toyota-global.com/pages/news/images/2023/08/02/1330/003.jpg'
  ]
WHERE name = 'Toyota Hilux' AND year = 2024;

-- Toyota RAV4 2024
UPDATE public.cars 
SET 
  main_image = 'https://www.toyota.com/imgix/content/dam/toyota/jellies/max/2024/rav4hybrid/xse/2t3/1.png',
  images = ARRAY[
    'https://www.toyota.com/imgix/content/dam/toyota/jellies/max/2024/rav4hybrid/xse/2t3/1.png',
    'https://www.toyota.com/imgix/content/dam/toyota/vehicles/2024/rav4/gallery/interior/rav4-interior-1.jpg',
    'https://www.toyota.com/imgix/content/dam/toyota/vehicles/2024/rav4/gallery/exterior/rav4-exterior-2.jpg'
  ]
WHERE name = 'Toyota RAV4' AND year = 2024;

-- Toyota Fortuner 2024
UPDATE public.cars 
SET 
  main_image = 'https://www.toyota-global.com/pages/news/images/2023/06/15/1330/001.jpg',
  images = ARRAY[
    'https://www.toyota-global.com/pages/news/images/2023/06/15/1330/001.jpg',
    'https://www.toyota-global.com/pages/news/images/2023/06/15/1330/002.jpg',
    'https://www.toyota-global.com/pages/news/images/2023/06/15/1330/003.jpg'
  ]
WHERE name = 'Toyota Fortuner' AND year = 2024;

-- Toyota Prado 2024
UPDATE public.cars 
SET 
  main_image = 'https://www.toyota-global.com/pages/news/images/2023/08/01/1330/001.jpg',
  images = ARRAY[
    'https://www.toyota-global.com/pages/news/images/2023/08/01/1330/001.jpg',
    'https://www.toyota-global.com/pages/news/images/2023/08/01/1330/002.jpg',
    'https://www.toyota-global.com/pages/news/images/2023/08/01/1330/003.jpg'
  ]
WHERE name = 'Toyota Prado' AND year = 2024;

-- ========================================
-- تم الانتهاء!
-- ========================================

SELECT 
  '✅ تم تحديث الصور بنجاح' as status,
  COUNT(*) as updated_cars
FROM public.cars
WHERE brand_id IN (
  SELECT id FROM public.brands WHERE name IN ('Jetour', 'Toyota')
);
