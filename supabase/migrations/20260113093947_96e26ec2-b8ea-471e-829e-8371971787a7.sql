-- Add hero overlay opacity setting
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_overlay_opacity TEXT DEFAULT 'medium';
-- Options: light, medium, dark

-- Add marquee settings
ALTER TABLE settings ADD COLUMN IF NOT EXISTS marquee_enabled BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS marquee_text TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS marquee_text_ar TEXT;