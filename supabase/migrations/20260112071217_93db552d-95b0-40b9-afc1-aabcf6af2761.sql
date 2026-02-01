-- Add columns for video hero support
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_video_url TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_type TEXT DEFAULT 'image';

-- Add comment for documentation
COMMENT ON COLUMN public.settings.hero_video_url IS 'URL for the hero video background';
COMMENT ON COLUMN public.settings.hero_type IS 'Type of hero background: image or video';