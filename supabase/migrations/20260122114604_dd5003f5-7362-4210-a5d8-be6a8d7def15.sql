-- Create wishlist table
CREATE TABLE public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  notify_on_price_drop BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, car_id)
);

-- Enable RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- RLS policies for wishlist
CREATE POLICY "Users can view own wishlist" ON public.wishlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to wishlist" ON public.wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from wishlist" ON public.wishlist
  FOR DELETE USING (auth.uid() = user_id);

-- Create FAQ table
CREATE TABLE public.faq (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  question_ar TEXT NOT NULL,
  answer TEXT NOT NULL,
  answer_ar TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;

-- RLS policies for FAQ
CREATE POLICY "Anyone can view active FAQs" ON public.faq
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage FAQs" ON public.faq
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create test drive bookings table
CREATE TABLE public.test_drive_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
  user_id UUID,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.test_drive_bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies for test drive bookings
CREATE POLICY "Anyone can create test drive booking" ON public.test_drive_bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own bookings" ON public.test_drive_bookings
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage bookings" ON public.test_drive_bookings
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  title_ar TEXT,
  message TEXT NOT NULL,
  message_ar TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage notifications" ON public.notifications
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  reward_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Admins can manage referrals" ON public.referrals
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Add referral_code to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_earnings NUMERIC DEFAULT 0;

-- Create trigger for updated_at on new tables
CREATE TRIGGER update_faq_updated_at
  BEFORE UPDATE ON public.faq
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_test_drive_bookings_updated_at
  BEFORE UPDATE ON public.test_drive_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample FAQ data
INSERT INTO public.faq (question, question_ar, answer, answer_ar, category, sort_order) VALUES
('How can I book a test drive?', 'كيف يمكنني حجز تجربة قيادة؟', 'You can book a test drive by clicking the "Book Test Drive" button on any car page and selecting your preferred date and time.', 'يمكنك حجز تجربة قيادة بالضغط على زر "حجز تجربة قيادة" في أي صفحة سيارة واختيار التاريخ والوقت المناسب لك.', 'test-drive', 1),
('What payment methods do you accept?', 'ما هي طرق الدفع المقبولة؟', 'We accept cash, bank transfer, and financing options through our partner banks.', 'نقبل الدفع نقداً، التحويل البنكي، وخيارات التمويل عبر البنوك الشريكة.', 'payment', 2),
('Do you offer warranty on used cars?', 'هل تقدمون ضمان على السيارات المستعملة؟', 'Yes, all our used cars come with a 6-month warranty covering major components.', 'نعم، جميع سياراتنا المستعملة تأتي مع ضمان 6 أشهر يغطي المكونات الرئيسية.', 'warranty', 3),
('Can I trade in my current car?', 'هل يمكنني استبدال سيارتي الحالية؟', 'Yes, we offer trade-in services. Bring your car for a free evaluation.', 'نعم، نقدم خدمة الاستبدال. أحضر سيارتك للتقييم المجاني.', 'purchase', 4),
('How long does the delivery take?', 'كم تستغرق عملية التوصيل؟', 'Delivery typically takes 3-5 business days within the city, and 7-10 days for other regions.', 'يستغرق التوصيل عادة 3-5 أيام عمل داخل المدينة، و7-10 أيام للمناطق الأخرى.', 'delivery', 5);