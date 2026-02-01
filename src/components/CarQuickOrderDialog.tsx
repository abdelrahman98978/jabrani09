import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Package, Truck, CreditCard, Building2 } from "lucide-react";
import { z } from "zod";

interface CarQuickOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car: any;
}

const orderSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(1, { message: "الاسم مطلوب" })
    .max(100, { message: "الاسم طويل جدًا" }),
  customerPhone: z
    .string()
    .trim()
    .min(7, { message: "رقم الهاتف غير صحيح" })
    .max(20, { message: "رقم الهاتف غير صحيح" }),
  customerEmail: z
    .string()
    .trim()
    .email({ message: "البريد الإلكتروني غير صحيح" })
    .max(255, { message: "البريد الإلكتروني طويل جدًا" })
    .optional()
    .or(z.literal("")),
  deliveryAddress: z.string().trim().max(255).optional().or(z.literal("")),
  deliveryCity: z.string().trim().max(100).optional().or(z.literal("")),
  deliveryNotes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const CarQuickOrderDialog = ({ open, onOpenChange, car }: CarQuickOrderDialogProps) => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const navigate = useNavigate();
  const { data: settings } = useSettings();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "cash_on_delivery">("bank_transfer");
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryNotes: "",
  });

  const handleSubmit = async () => {
    const parsed = orderSchema.safeParse(formData);

    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ في البيانات" : "Validation error",
        description: firstError || (isRTL ? "يرجى التحقق من البيانات المدخلة" : "Please check your inputs"),
      });
      return;
    }

    if (deliveryMethod === "delivery" && (!formData.deliveryAddress || !formData.deliveryCity)) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى إدخال عنوان التوصيل والمدينة" : "Please enter delivery address and city",
      });
      return;
    }

    if (!car) {
      toast({
        variant: "destructive",
        title: isRTL ? "لا توجد سيارة" : "No car selected",
        description: isRTL ? "حدث خطأ في تحميل بيانات السيارة" : "Failed to load car data",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Use Secure RPC to get or create customer
      // This avoids "Permission denied" errors for guest users trying to SELECT from customers table
      const { data: customerId, error: customerError } = await supabase
        .rpc('get_or_create_customer', {
          p_name: formData.customerName.trim(),
          p_phone: formData.customerPhone.trim(),
          p_email: formData.customerEmail?.trim() || null,
          p_user_id: user?.id || null,
        });

      if (customerError) throw customerError;
      if (!customerId) throw new Error("Failed to generate customer ID");

      // Create order for this car
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          customer_id: customerId,
          user_id: user?.id || null,
          car_id: car.id,
          total_amount: car.price || 0,
          status: "new",
          payment_status: "pending",
          payment_method: paymentMethod === "bank_transfer" ? "bank_transfer" : "cash",
          delivery_method: deliveryMethod,
          delivery_address: deliveryMethod === "delivery" ? formData.deliveryAddress || null : null,
          delivery_city: deliveryMethod === "delivery" ? formData.deliveryCity || null : null,
          delivery_notes: formData.deliveryNotes || null,
          notes:
            paymentMethod === "bank_transfer"
              ? isRTL
                ? `طلب عبر الموقع - تحويل بنكي (${settings?.bank_name} حساب: ${settings?.bank_account_number}). ${formData.deliveryNotes || ""}`
                : `Website order - bank transfer (${settings?.bank_name} Acc: ${settings?.bank_account_number}). ${formData.deliveryNotes || ""}`
              : formData.deliveryNotes || null,
        })
        .select("id")
        .single();

      if (orderError) throw orderError;

      toast({
        title: isRTL ? "تم إرسال الطلب بنجاح" : "Order submitted successfully",
        description:
          paymentMethod === "bank_transfer"
            ? isRTL
              ? `يرجى تحويل المبلغ إلى حساب ${settings?.bank_name} رقم ${settings?.bank_account_number}`
              : `Please transfer the amount to ${settings?.bank_name} account ${settings?.bank_account_number}`
            : isRTL
              ? "سيتم التواصل معك قريبًا لتأكيد موعد الاستلام أو التوصيل."
              : "We will contact you soon to confirm pickup or delivery.",
      });

      onOpenChange(false);
      if (order?.id) {
        navigate(`/order-confirmation/${order.id}`);
      }
    } catch (error: any) {
      console.error("Car quick order error:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "فشل إرسال الطلب" : "Failed to submit order",
        description: error.message || (isRTL ? "حدث خطأ غير متوقع" : "An unexpected error occurred"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.order.details}</DialogTitle>
          <DialogDescription>
            {isRTL
              ? "أدخل بياناتك لتأكيد طلب السيارة عبر الموقع."
              : "Enter your details to confirm the car order via the website."}
          </DialogDescription>
        </DialogHeader>

        {/* Car summary */}
        {car && (
          <div className="mb-4 flex items-center gap-4 rounded-lg bg-secondary/40 p-3 border border-border/50">
            <img
              src={car.main_image || "/placeholder.svg"}
              alt={language === "ar" ? car.name_ar : car.name}
              className="h-16 w-24 rounded-md object-cover border border-border/50"
            />
            <div className="space-y-1">
              <p className="font-semibold text-sm">{language === "ar" ? car.name_ar : car.name}</p>
              <p className="text-xs text-muted-foreground">
                {car.model} - {car.year}
              </p>
              <p className="text-sm font-bold text-primary">
                {Number(car.price || 0).toLocaleString()} {isRTL ? "ر.س" : "SAR"}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6 py-2">
          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              {t.order.customerInfo}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name-quick">{isRTL ? "الاسم" : "Name"}</Label>
                <Input
                  id="name-quick"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder={isRTL ? "أدخل اسمك" : "Enter your name"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone-quick">{isRTL ? "رقم الهاتف" : "Phone"}</Label>
                <Input
                  id="phone-quick"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder={isRTL ? "05xxxxxxxx" : "05xxxxxxxx"}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email-quick">
                  {isRTL ? "البريد الإلكتروني (اختياري)" : "Email (optional)"}
                </Label>
                <Input
                  id="email-quick"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Delivery Method */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">
              {t.order.deliveryMethod}
            </h3>
            <RadioGroup value={deliveryMethod} onValueChange={(v) => setDeliveryMethod(v as any)}>
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 hover:bg-secondary/20 cursor-pointer">
                <RadioGroupItem value="pickup" id="pickup-quick" />
                <Label htmlFor="pickup-quick" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {t.order.pickup}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL
                        ? "استلم سيارتك مباشرة من المعرض"
                        : "Collect your car directly from the showroom"}
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 hover:bg-secondary/20 cursor-pointer">
                <RadioGroupItem value="delivery" id="delivery-quick" />
                <Label htmlFor="delivery-quick" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {t.order.delivery}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL
                        ? "نقوم بتوصيل السيارة إلى عنوانك"
                        : "We will deliver the car to your address"}
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Delivery Address (if delivery selected) */}
          {deliveryMethod === "delivery" && (
            <div className="space-y-4 border rounded-lg p-4 bg-secondary/30">
              <h3 className="text-sm font-semibold">
                {t.order.deliveryAddress}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city-quick">{isRTL ? "المدينة" : "City"}</Label>
                  <Input
                    id="city-quick"
                    value={formData.deliveryCity}
                    onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                    placeholder={isRTL ? "مثال: الخرطوم" : "Example: Khartoum"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address-quick">
                    {isRTL ? "العنوان التفصيلي" : "Detailed address"}
                  </Label>
                  <Input
                    id="address-quick"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    placeholder={isRTL ? "الحي، الشارع، المعلم" : "Neighborhood, street, landmark"}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              {t.order.paymentMethod}
            </h3>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as any)}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 cursor-pointer">
                <RadioGroupItem value="bank_transfer" id="bank-quick" />
                <Label htmlFor="bank-quick" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">
                      {t.order.bankTransfer}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {isRTL ? settings?.bank_name : (settings?.bank_name_en || settings?.bank_name)}
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 hover:bg-secondary/20 cursor-pointer">
                <RadioGroupItem value="cash_on_delivery" id="cash-quick" />
                <Label htmlFor="cash-quick" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {t.order.cashOnDelivery}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {isRTL ? "نقدًا عند الاستلام" : "Cash on delivery"}
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes-quick">
              {t.order.notes}
            </Label>
            <Textarea
              id="notes-quick"
              value={formData.deliveryNotes}
              onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
              className="min-h-[80px]"
              placeholder={isRTL ? "أي ملاحظات إضافية..." : "Any additional notes..."}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
            {isRTL ? "تأكيد الطلب" : "Confirm order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
