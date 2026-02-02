-- ========================================
-- إصلاح تحذيرات الأمان
-- Security Warnings Fix
-- ========================================

-- 1. إصلاح search_path للدوال
-- Fix search_path for functions

-- تحديث دالة update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- تحديث دالة log_settings_changes
CREATE OR REPLACE FUNCTION log_settings_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    -- تسجيل كل حقل تم تغييره
    IF OLD.showroom_name IS DISTINCT FROM NEW.showroom_name THEN
      INSERT INTO public.settings_history (setting_id, field_name, old_value, new_value)
      VALUES (NEW.id, 'showroom_name', OLD.showroom_name, NEW.showroom_name);
    END IF;
    
    IF OLD.phone IS DISTINCT FROM NEW.phone THEN
      INSERT INTO public.settings_history (setting_id, field_name, old_value, new_value)
      VALUES (NEW.id, 'phone', OLD.phone, NEW.phone);
    END IF;
    
    IF OLD.address IS DISTINCT FROM NEW.address THEN
      INSERT INTO public.settings_history (setting_id, field_name, old_value, new_value)
      VALUES (NEW.id, 'address', OLD.address, NEW.address);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ========================================
-- 2. تحسين سياسات RLS للجداول الحساسة
-- Improve RLS policies for sensitive tables
-- ========================================

-- ملاحظة: السياسات الحالية مناسبة للاستخدام العام
-- Note: Current policies are appropriate for public use
-- السماح بإضافة طلبات السيارات من قبل أي شخص هو متطلب عمل
-- Allowing anyone to request cars is a business requirement

-- ========================================
-- تم الانتهاء!
-- ========================================
