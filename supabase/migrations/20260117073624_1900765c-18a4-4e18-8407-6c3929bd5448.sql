-- Add video columns for car hero video feature
ALTER TABLE public.cars 
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS video_thumbnail TEXT,
  ADD COLUMN IF NOT EXISTS video_overlay_opacity TEXT DEFAULT 'medium';

-- Add comments for documentation
COMMENT ON COLUMN public.cars.video_url IS 'URL for car hero video';
COMMENT ON COLUMN public.cars.video_thumbnail IS 'Thumbnail image for the video';
COMMENT ON COLUMN public.cars.video_overlay_opacity IS 'Overlay opacity: light, medium, or dark';