-- Update the showroom name in the settings table
UPDATE public.settings
SET 
  showroom_name = 'الفخيم للسيارات',
  showroom_name_en = 'Al-Fakhim Motors'
WHERE id = (SELECT id FROM public.settings LIMIT 1);

-- Insert if not exists (fallback, though unlikely to be empty if app runs)
INSERT INTO public.settings (showroom_name, showroom_name_en)
SELECT 'الفخيم للسيارات', 'Al-Fakhim Motors'
WHERE NOT EXISTS (SELECT 1 FROM public.settings);
