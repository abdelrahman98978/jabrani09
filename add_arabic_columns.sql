
-- Add missing Arabic columns to 'brands' table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'name_ar') THEN
        ALTER TABLE public.brands ADD COLUMN name_ar TEXT;
    END IF;
END $$;

-- Add missing Arabic columns to 'cars' table
DO $$
BEGIN
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
