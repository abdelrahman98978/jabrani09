-- 1) Create order status history table
CREATE TABLE public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view order status history"
ON public.order_status_history
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 2) Create payment change history table
CREATE TABLE public.payment_change_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_payment_method text,
  new_payment_method text,
  old_payment_status text,
  new_payment_status text,
  changed_by uuid NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_change_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payment change history"
ON public.payment_change_history
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 3) Trigger to log order status changes
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_status_history (order_id, old_status, new_status, changed_by)
    VALUES (OLD.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_order_status_change ON public.orders;
CREATE TRIGGER trg_log_order_status_change
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_order_status_change();

-- 4) Trigger to log payment changes on orders
CREATE OR REPLACE FUNCTION public.log_payment_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $$
BEGIN
  IF (NEW.payment_method IS DISTINCT FROM OLD.payment_method)
     OR (NEW.payment_status IS DISTINCT FROM OLD.payment_status) THEN
    INSERT INTO public.payment_change_history (
      order_id,
      old_payment_method,
      new_payment_method,
      old_payment_status,
      new_payment_status,
      changed_by
    ) VALUES (
      OLD.id,
      OLD.payment_method,
      NEW.payment_method,
      OLD.payment_status,
      NEW.payment_status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_payment_change ON public.orders;
CREATE TRIGGER trg_log_payment_change
AFTER UPDATE OF payment_method, payment_status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_payment_change();
