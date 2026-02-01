-- Add 360 video columns to cars table
ALTER TABLE cars 
  ADD COLUMN IF NOT EXISTS video_360_url TEXT,
  ADD COLUMN IF NOT EXISTS video_360_thumbnail TEXT,
  ADD COLUMN IF NOT EXISTS video_360_type TEXT DEFAULT 'equirectangular';

COMMENT ON COLUMN cars.video_360_url IS 'رابط فيديو 360 درجة';
COMMENT ON COLUMN cars.video_360_thumbnail IS 'صورة مصغرة للفيديو 360';
COMMENT ON COLUMN cars.video_360_type IS 'نوع الإسقاط: equirectangular, cubemap';