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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Package, Truck, CreditCard, Building2, ShieldCheck, Zap, ArrowRight, Shield, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CheckoutDialog = ({ open, onOpenChange }: CheckoutDialogProps) => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const shadowClasses = "shadow-[0_0_50px_rgba(0,0,0,0.5)]";
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
        title: isRTL ? "خطأ في التحقق" : "VALIDATION_ERROR",
        description: isRTL ? "يرجى إدخال الهوية ورقم التواصل" : "Identity and contact frequency required for protocol clearance.",
      });
      return;
    }

    if (deliveryMethod === "delivery" && (!formData.deliveryAddress || !formData.deliveryCity)) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ في اللوجستيات" : "LOGISTICS_ERROR",
        description: isRTL ? "يرجى تحديد إحداثيات التوصيل" : "Geo-coordinates (City/Address) required for delivery protocol.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Use Secure RPC to get or create customer
      const { data: customerId, error: customerError } = await (supabase as any)
        .rpc('get_or_create_customer', {
          p_name: formData.customerName,
          p_phone: formData.customerPhone,
          p_email: formData.customerEmail || null,
          p_user_id: user?.id || null,
        });

      if (customerError) throw customerError;
      if (!customerId) throw new Error("Failed to generate institutional customer ID");

      // Create orders for each cart item
      let lastOrderId: string | null = null;

      for (const item of items) {
        const orderNumber = `SOV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

        const { data: order, error: orderError } = await (supabase as any)
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
                  ? `بروتوكول تحويل - ${settings?.bank_name}. حساب: ${settings?.bank_account_number}. ${formData.deliveryNotes || ""}`
                  : `TRANSFER_PROTOCOL - ${settings?.bank_name}. ACC: ${settings?.bank_account_number}. ${formData.deliveryNotes || ""}`
                : formData.deliveryNotes || null,
          })
          .select("id, order_number")
          .single();

        if (orderError) throw orderError;
        lastOrderId = order.id;

        // Send notification
        const carName = item.car ? (language === "ar" ? item.car.name_ar : item.car.name) : "Asset";
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
          console.error("Failed to transmit protocol notification:", emailError);
        }
      }

      await clearCart();

      toast({
        title: isRTL ? "تم إرسال البيان بنجاح" : "MANIFEST_TRANSMITTED",
        description:
          paymentMethod === "bank_transfer"
            ? isRTL
              ? `يرجى إتمام التصفية المالية لحساب ${settings?.bank_name} رقم ${settings?.bank_account_number}`
              : `Awaiting financial resolution to ${settings?.bank_name} repository ${settings?.bank_account_number}`
            : isRTL
              ? "سيتم تفعيل بروتوكول التواصل للمطابقة"
              : "Institutional contact protocol will be initiated for verification.",
      });

      onOpenChange(false);
      if (lastOrderId) {
        navigate(`/order-confirmation/${lastOrderId}`);
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Protocol error:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ في النظام" : "SYSTEM_FAULT",
        description: error.message || (isRTL ? "فشل تنفيذ البروتوكول" : "Execution of acquisition protocol failed."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 bg-black border border-white/10 rounded-none overflow-hidden outline-none shadow-2xl">
        <div className="grid md:grid-cols-12 max-h-[90vh]">
           {/* Sidebar Protocol Info */}
           <div className="md:col-span-4 bg-surface-low border-r border-white/5 p-12 flex flex-col justify-between hidden md:flex">
              <div className="space-y-12">
                 <div className="space-y-6">
                    <div className="h-1 w-12 bg-primary" />
                    <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
                       Acquisition <br /> Protocol
                    </h2>
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="h-3 w-3 text-primary opacity-40" />
                       <span className="text-[10px] tracking-[0.4em] text-white/20 uppercase font-black">Secure Verification</span>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="flex flex-col gap-2">
                       <span className="text-[9px] uppercase tracking-[0.4em] text-white/10 font-black">Manifest Total</span>
                       <span className="text-3xl font-black text-white italic">
                         {new Intl.NumberFormat(isRTL ? "ar-SD" : "en-US").format(totalPrice)} 
                         <span className="text-sm ml-2 text-white/40 not-italic uppercase">{(settings as any)?.currency_symbol || (isRTL ? "ج.س" : "SDG")}</span>
                       </span>
                    </div>
                    <div className="p-4 border border-white/5 bg-black/40 space-y-4">
                       <div className="flex items-center gap-4">
                          <Zap className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-black">Rapid Clearance</span>
                       </div>
                       <p className="text-[10px] text-white/20 leading-relaxed italic uppercase tracking-widest">
                         Orders are prioritized upon financial resolution verification.
                       </p>
                    </div>
                 </div>
              </div>

              <div className="pt-12 border-t border-white/5 space-y-4">
                 <div className="flex items-center gap-4 text-white/10">
                    <Globe className="h-3 w-3" />
                    <span className="text-[8px] uppercase tracking-[0.4em] font-black">Institutional Record // SD.v2.4</span>
                 </div>
              </div>
           </div>

           {/* Main Protocol Form */}
           <div className="md:col-span-8 p-8 md:p-16 overflow-y-auto custom-scrollbar">
              <div className="space-y-16">
                 {/* Step 01: Identity Clearance */}
                 <div className="space-y-10">
                    <div className="flex items-center gap-6">
                       <span className="text-[11px] font-black text-primary px-3 py-1 border border-primary/20">01</span>
                       <h3 className="text-[11px] uppercase tracking-[0.8em] text-white font-black">Identity Clearance</h3>
                    </div>
                    <div className="grid gap-12 sm:grid-cols-2">
                      <div className="relative group">
                        <Label htmlFor="name" className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-black mb-4 block group-focus-within:text-primary transition-colors">Legal Full Name</Label>
                        <Input
                          id="name"
                          value={formData.customerName}
                          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                          placeholder="JONATHAN DOE"
                          className="bg-transparent border-none border-b border-white/10 rounded-none px-0 py-6 text-sm tracking-[0.2em] font-black placeholder:text-white/5 focus-visible:ring-0 focus-visible:border-primary transition-all uppercase"
                        />
                      </div>
                      <div className="relative group">
                        <Label htmlFor="phone" className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-black mb-4 block group-focus-within:text-primary transition-colors">Priority Contact Frequency</Label>
                        <Input
                          id="phone"
                          value={formData.customerPhone}
                          onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                          placeholder="+249.XX.XXX.XXXX"
                          className="bg-transparent border-none border-b border-white/10 rounded-none px-0 py-6 text-sm tracking-[0.2em] font-black placeholder:text-white/5 focus-visible:ring-0 focus-visible:border-primary transition-all uppercase"
                          dir="ltr"
                        />
                      </div>
                      <div className="sm:col-span-2 relative group">
                        <Label htmlFor="email" className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-black mb-4 block group-focus-within:text-primary transition-colors">Electronic Mailing Address (Optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.customerEmail}
                          onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                          placeholder="CLIENT@SECURE.COM"
                          className="bg-transparent border-none border-b border-white/10 rounded-none px-0 py-6 text-sm tracking-[0.2em] font-black placeholder:text-white/5 focus-visible:ring-0 focus-visible:border-primary transition-all uppercase"
                          dir="ltr"
                        />
                      </div>
                    </div>
                 </div>

                 {/* Step 02: Acquisition Logistics */}
                 <div className="space-y-10">
                    <div className="flex items-center gap-6">
                       <span className="text-[11px] font-black text-primary px-3 py-1 border border-primary/20">02</span>
                       <h3 className="text-[11px] uppercase tracking-[0.8em] text-white font-black">Acquisition Logistics</h3>
                    </div>
                    <RadioGroup 
                      value={deliveryMethod} 
                      onValueChange={(v) => setDeliveryMethod(v as any)}
                      className="grid sm:grid-cols-2 gap-4"
                    >
                      <div className={`relative transition-all duration-700 ${deliveryMethod === "pickup" ? "bg-white/[0.03] border-primary/20" : "bg-transparent border-white/5"} border p-8 flex flex-col gap-6 cursor-pointer group hover:bg-white/[0.02]`}>
                         <RadioGroupItem value="pickup" id="pickup" className="sr-only" />
                         <Label htmlFor="pickup" className="cursor-pointer space-y-6">
                            <div className="flex items-center justify-between">
                               <Package className={`h-5 w-5 ${deliveryMethod === "pickup" ? "text-primary" : "text-white/10"}`} />
                               {deliveryMethod === "pickup" && <div className="h-1.5 w-1.5 bg-primary rounded-full" />}
                            </div>
                            <div className="space-y-2">
                               <p className="font-black text-[11px] uppercase tracking-[0.3em] text-white">Showroom Custody</p>
                               <p className="text-[9px] text-white/20 uppercase tracking-widest leading-loose">Direct asset collection from our primary vault.</p>
                            </div>
                         </Label>
                      </div>

                      <div className={`relative transition-all duration-700 ${deliveryMethod === "delivery" ? "bg-white/[0.03] border-primary/20" : "bg-transparent border-white/5"} border p-8 flex flex-col gap-6 cursor-pointer group hover:bg-white/[0.02]`}>
                         <RadioGroupItem value="delivery" id="delivery" className="sr-only" />
                         <Label htmlFor="delivery" className="cursor-pointer space-y-6">
                            <div className="flex items-center justify-between">
                               <Truck className={`h-5 w-5 ${deliveryMethod === "delivery" ? "text-primary" : "text-white/10"}`} />
                               {deliveryMethod === "delivery" && <div className="h-1.5 w-1.5 bg-primary rounded-full" />}
                            </div>
                            <div className="space-y-2">
                               <p className="font-black text-[11px] uppercase tracking-[0.3em] text-white">Direct Transit</p>
                               <p className="text-[9px] text-white/20 uppercase tracking-widest leading-loose">Secure transport to your specified coordinates.</p>
                            </div>
                         </Label>
                      </div>
                    </RadioGroup>

                    {/* Delivery Form (Conditional) */}
                    <AnimatePresence mode="wait">
                      {deliveryMethod === "delivery" && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-12 pt-8 border-t border-white/5 overflow-hidden"
                        >
                           <div className="grid gap-12 sm:grid-cols-2">
                             <div className="relative group">
                                <Label htmlFor="city" className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-black mb-4 block">Target City</Label>
                                <Input
                                  id="city"
                                  value={formData.deliveryCity}
                                  onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                                  placeholder="KHARTOUM / PORT SUDAN"
                                  className="bg-transparent border-none border-b border-white/10 rounded-none px-0 py-6 text-sm tracking-[0.2em] font-black uppercase placeholder:text-white/5 focus-visible:ring-0 focus-visible:border-primary transition-all"
                                />
                             </div>
                             <div className="relative group">
                                <Label htmlFor="address" className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-black mb-4 block">Deployment Address</Label>
                                <Input
                                  id="address"
                                  value={formData.deliveryAddress}
                                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                  placeholder="STREET 15, SECTOR C"
                                  className="bg-transparent border-none border-b border-white/10 rounded-none px-0 py-6 text-sm tracking-[0.2em] font-black uppercase placeholder:text-white/5 focus-visible:ring-0 focus-visible:border-primary transition-all"
                                />
                             </div>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>

                 {/* Step 03: Financial Resolution */}
                 <div className="space-y-10">
                    <div className="flex items-center gap-6">
                       <span className="text-[11px] font-black text-primary px-3 py-1 border border-primary/20">03</span>
                       <h3 className="text-[11px] uppercase tracking-[0.8em] text-white font-black">Financial Resolution</h3>
                    </div>
                    <RadioGroup 
                      value={paymentMethod} 
                      onValueChange={(v) => setPaymentMethod(v as any)}
                      className="grid gap-px bg-white/5 border border-white/10"
                    >
                      <div className={`relative transition-all duration-700 bg-black p-8 flex items-center gap-6 cursor-pointer group hover:bg-white/[0.01]`}>
                         <RadioGroupItem value="bank_transfer" id="bank_transfer" className="sr-only" />
                         <Label htmlFor="bank_transfer" className="flex items-center gap-8 cursor-pointer w-full">
                            <div className={`p-4 border ${paymentMethod === "bank_transfer" ? "border-primary/40 bg-primary/5 text-primary" : "border-white/5 text-white/20"}`}>
                               <Building2 className="h-5 w-5" />
                            </div>
                            <div className="flex-1 space-y-2">
                               <div className="flex items-center justify-between">
                                  <p className="font-black text-[11px] uppercase tracking-[0.4em] text-white">Bank Repository Transfer</p>
                                  {paymentMethod === "bank_transfer" && <Shield className="h-3 w-3 text-primary" />}
                               </div>
                               <p className="text-[9px] text-white/20 uppercase tracking-[0.2em]">
                                 Transfer to {isRTL ? settings?.bank_name : settings?.bank_name_en || settings?.bank_name} // {settings?.bank_account_number}
                               </p>
                            </div>
                         </Label>
                      </div>

                      <div className={`relative transition-all duration-700 bg-black p-8 flex items-center gap-6 cursor-pointer group hover:bg-white/[0.01]`}>
                         <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" className="sr-only" />
                         <Label htmlFor="cash_on_delivery" className="flex items-center gap-8 cursor-pointer w-full">
                            <div className={`p-4 border ${paymentMethod === "cash_on_delivery" ? "border-primary/40 bg-primary/5 text-primary" : "border-white/5 text-white/20"}`}>
                               <CreditCard className="h-5 w-5" />
                            </div>
                            <div className="flex-1 space-y-2">
                               <div className="flex items-center justify-between">
                                  <p className="font-black text-[11px] uppercase tracking-[0.4em] text-white">Settlement Upon Handover</p>
                                  {paymentMethod === "cash_on_delivery" && <Shield className="h-3 w-3 text-primary" />}
                               </div>
                               <p className="text-[9px] text-white/20 uppercase tracking-[0.2em]">Immediate resolution during asset transition.</p>
                            </div>
                         </Label>
                      </div>
                    </RadioGroup>
                 </div>

                 {/* Step 04: Tactical Notes */}
                 <div className="space-y-10">
                    <div className="flex items-center gap-6">
                       <span className="text-[11px] font-black text-primary px-3 py-1 border border-primary/20">04</span>
                       <h3 className="text-[11px] uppercase tracking-[0.8em] text-white font-black">Tactical Notes</h3>
                    </div>
                    <div className="relative group">
                      <Label htmlFor="notes" className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-black mb-4 block">Observation Entry</Label>
                      <Textarea
                        id="notes"
                        value={formData.deliveryNotes || ""}
                        onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                        placeholder="ENTER ANY ADDITIONAL OPERATIONAL CONSTRAINTS OR PREFERENCES..."
                        className="bg-transparent border-none border-b border-white/10 rounded-none px-0 py-6 text-[10px] tracking-[0.2em] font-black uppercase placeholder:text-white/5 min-h-[120px] focus-visible:ring-0 focus-visible:border-primary transition-all resize-none italic"
                      />
                    </div>
                 </div>

                 {/* Action Protocol */}
                 <div className="pt-24 flex flex-col sm:flex-row gap-6">
                   <button
                     onClick={() => onOpenChange(false)}
                     disabled={isSubmitting}
                     className="px-12 h-20 border border-white/5 text-white/30 text-[11px] font-black uppercase tracking-[0.5em] hover:bg-white/5 hover:text-white transition-all duration-700"
                   >
                     Void Protocol
                   </button>
                   <button
                     onClick={handleSubmit}
                     disabled={isSubmitting}
                     className="flex-1 h-20 bg-primary text-black text-[12px] font-black uppercase tracking-[0.8em] hover:bg-white transition-all duration-1000 flex items-center justify-center gap-6 shadow-[0_0_50px_rgba(196,164,132,0.1)]"
                   >
                     {isSubmitting ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                     ) : (
                        <>
                          <span className="relative z-10">Execute Acquisition Manifest</span>
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                        </>
                     )}
                   </button>
                 </div>
                 
                 <div className="text-center">
                    <p className="text-[8px] uppercase tracking-[0.5em] text-white/5 font-black">This resolution is legally binding under Sovereign Institutional Statutes.</p>
                 </div>
              </div>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;