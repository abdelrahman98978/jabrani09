-- Create cart_items table for shopping cart
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT cart_items_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own cart items"
ON public.cart_items FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  (session_id = current_setting('request.headers', true)::json->>'x-session-id')
);

CREATE POLICY "Users can add to their cart"
ON public.cart_items FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) OR 
  (session_id IS NOT NULL AND user_id IS NULL)
);

CREATE POLICY "Users can update their cart items"
ON public.cart_items FOR UPDATE
USING (
  (auth.uid() = user_id) OR 
  (session_id = current_setting('request.headers', true)::json->>'x-session-id')
);

CREATE POLICY "Users can delete their cart items"
ON public.cart_items FOR DELETE
USING (
  (auth.uid() = user_id) OR 
  (session_id = current_setting('request.headers', true)::json->>'x-session-id')
);

-- Create trigger for updated_at
CREATE TRIGGER update_cart_items_updated_at
BEFORE UPDATE ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create accessories table
CREATE TABLE public.accessories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  image_url TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for accessories
ALTER TABLE public.accessories ENABLE ROW LEVEL SECURITY;

-- Policies for accessories
CREATE POLICY "Anyone can view active accessories"
ON public.accessories FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage accessories"
ON public.accessories FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for accessories updated_at
CREATE TRIGGER update_accessories_updated_at
BEFORE UPDATE ON public.accessories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();