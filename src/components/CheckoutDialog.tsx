import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/hooks/useSettings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Package, Truck, CreditCard, Building2 } from "lucide-react";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CheckoutDialog = ({ open, onOpenChange }: CheckoutDialogProps) => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
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
    if (!formData.customerName || !formData.customerPhone) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى إدخال الاسم ورقم الهاتف" : "Please enter name and phone number",
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

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Create or get customer
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("phone", formData.customerPhone)
        .maybeSingle();

      let customerId = existingCustomer?.id;

      if (!customerId) {
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            name: formData.customerName,
            phone: formData.customerPhone,
            email: formData.customerEmail || null,
            user_id: user?.id || null,
          })
          .select("id")
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      // Create orders for each cart item
      let lastOrderId: string | null = null;

      for (const item of items) {
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            order_number: orderNumber,
            customer_id: customerId,
            user_id: user?.id || null,
            car_id: item.car_id,
            total_amount: (item.car?.price || 0) * item.quantity,
            status: "new",
            payment_status: "pending",
            payment_method: paymentMethod === "bank_transfer" ? "bank_transfer" : "cash",
            delivery_method: deliveryMethod,
            delivery_address: deliveryMethod === "delivery" ? formData.deliveryAddress : null,
            delivery_city: deliveryMethod === "delivery" ? formData.deliveryCity : null,
            delivery_notes: formData.deliveryNotes || null,
            notes:
              paymentMethod === "bank_transfer"
                ? isRTL
                  ? `تحويل بنكي - ${settings?.bank_name}. حساب: ${settings?.bank_account_number}. ${formData.deliveryNotes || ""}`
                  : `Bank Transfer - ${settings?.bank_name}. Acc: ${settings?.bank_account_number}. ${formData.deliveryNotes || ""}`
                : formData.deliveryNotes || null,
          })
          .select("id, order_number")
          .single();

        if (orderError) throw orderError;
        lastOrderId = order.id;

        // Send notification
        const carName = item.car ? (language === "ar" ? item.car.name_ar : item.car.name) : "السيارة";
        try {
          await supabase.functions.invoke("send-order-notification", {
            body: {
              orderId: order.id,
              orderNumber: order.order_number,
              customerEmail: formData.customerEmail,
              customerName: formData.customerName,
              customerPhone: formData.customerPhone,
              carName: `${carName} ${item.car?.model || ""} ${item.car?.year || ""}`.trim(),
              totalAmount: (item.car?.price || 0) * item.quantity,
              paymentMethod: paymentMethod === "bank_transfer" ? "bank_transfer" : "cash",
              language: language,
            },
          });
        } catch (emailError) {
          console.error("Failed to send order notification:", emailError);
        }
      }

      await clearCart();

      toast({
        title: isRTL ? "تم إرسال الطلب بنجاح" : "Order Submitted Successfully",
        description:
          paymentMethod === "bank_transfer"
            ? isRTL
              ? `يرجى تحويل المبلغ إلى حساب ${settings?.bank_name} رقم ${settings?.bank_account_number}`
              : `Please transfer the amount to ${settings?.bank_name} account ${settings?.bank_account_number}`
            : isRTL
              ? "سيتم التواصل معك قريباً لتأكيد الطلب"
              : "We will contact you soon to confirm the order",
      });

      onOpenChange(false);
      if (lastOrderId) {
        navigate(`/order-confirmation/${lastOrderId}`);
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message || (isRTL ? "فشل إتمام الطلب" : "Failed to complete order"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isRTL ? "إتمام الطلب" : "Complete Your Order"}</DialogTitle>
          <DialogDescription>
            {isRTL
              ? "أدخل معلوماتك واختر طريقة الاستلام والدفع"
              : "Enter your information and select delivery and payment methods"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{isRTL ? "معلومات العميل" : "Customer Information"}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{isRTL ? "الاسم" : "Name"}</Label>
                <Input
                  id="name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder={isRTL ? "أدخل اسمك" : "Enter your name"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{isRTL ? "رقم الهاتف" : "Phone"}</Label>
                <Input
                  id="phone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder={isRTL ? "05xxxxxxxx" : "05xxxxxxxx"}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">{isRTL ? "البريد الإلكتروني (اختياري)" : "Email (optional)"}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  placeholder={isRTL ? "example@email.com" : "example@email.com"}
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Delivery Method */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{isRTL ? "طريقة الاستلام" : "Delivery Method"}</h3>
            <RadioGroup value={deliveryMethod} onValueChange={(v) => setDeliveryMethod(v as any)}>
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{isRTL ? "استلام من المعرض" : "Pickup from Showroom"}</p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? "احضر واستلم سيارتك مباشرة" : "Come and collect your car directly"}
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{t.order.delivery}</p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? "سنوصل السيارة إلى عنوانك" : "We will deliver the car to your address"}
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Delivery Address (if delivery selected) */}
          {deliveryMethod === "delivery" && (
            <div className="space-y-4 border rounded-lg p-4 bg-secondary/30">
              <h3 className="text-sm font-semibold">{t.order.deliveryAddress}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">{isRTL ? "المدينة" : "City"}</Label>
                  <Input
                    id="city"
                    value={formData.deliveryCity}
                    onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                    placeholder={isRTL ? "مثال: الخرطوم" : "Example: Khartoum"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">{isRTL ? "العنوان التفصيلي" : "Detailed Address"}</Label>
                  <Input
                    id="address"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    placeholder={isRTL ? "الشارع، الحي..." : "Street, district..."}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{t.order.paymentMethod}</h3>
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 bg-blue-50/50 dark:bg-blue-950/20">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{t.order.bankTransfer}</p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? settings?.bank_name : settings?.bank_name_en || settings?.bank_name}: {settings?.bank_account_number}
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3">
                <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                <Label htmlFor="cash_on_delivery" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{t.order.cashOnDelivery}</p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? "ادفع عند استلام السيارة" : "Pay when you receive the car"}
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t.order.notes}</Label>
            <Textarea
              id="notes"
              value={formData.deliveryNotes}
              onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
              placeholder={isRTL ? "أي ملاحظات أو تعليمات إضافية..." : "Any additional notes or instructions..."}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            {isRTL ? "تأكيد الطلب" : "Confirm Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;