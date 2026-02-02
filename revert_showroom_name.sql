-- Revert the showroom name in the settings table
UPDATE public.settings
SET 
  showroom_name = 'الفخيم للسيارات',
  showroom_name_en = 'Al-Fakhim Motors'
WHERE id = (SELECT id FROM public.settings LIMIT 1);
