import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  FileText,
  MessageCircle,
  Package,
  Loader2,
  Truck,
  Building2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Download
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion, AnimatePresence } from "framer-motion";

const OrderConfirmationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { data: settings } = useSettings();

  useEffect(() => {
    document.title = isRTL
      ? "تأكيد الاستحواذ - جـبـراني"
      : "Acquisition Confirmed - Jabrani Sovereign";
  }, [isRTL]);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-confirmation", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          customer:customers(*),
          car:cars(*)
        `)
        .eq("id", id)
        .maybeSingle();

      if (data) return data;

      const { data: rpcData, error: rpcError } = await (supabase as any)
        .rpc('get_order_details', { p_order_id: id });

      if (rpcError) throw rpcError;
      return rpcData;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-primary text-[10px] tracking-[1em] font-black uppercase"
        >
          Synchronizing_Manifest...
        </motion.div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,rgba(196,164,132,0.05)_0%,transparent_70%)]">
        <div className="max-w-md text-center space-y-8">
           <h2 className="text-4xl font-black tracking-tighter uppercase text-white">{isRTL ? "الطلب غير موجود" : "MANIFEST_VOID"}</h2>
           <p className="text-white/40 text-[11px] uppercase tracking-[0.4em] leading-relaxed">Identity sequence provided does not match any archived manifests in the sovereign ledger.</p>
           <Link to="/" className="inline-block px-12 py-5 bg-primary text-black text-[11px] font-black uppercase tracking-[0.6em] hover:bg-white transition-all duration-700">
             Return to Headquarters
           </Link>
        </div>
      </div>
    );
  }

  const paymentIsBank = order.payment_method === "bank_transfer";
  const deliveryIsShipping = order.delivery_method === "delivery";

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12">
          {/* Victory Header */}
          <div className="max-w-4xl mx-auto text-center space-y-12 mb-24">
            <motion.div 
               initial={{ scale: 0, rotate: -45 }}
               animate={{ scale: 1, rotate: 0 }}
               transition={{ type: "spring", stiffness: 200, damping: 15 }}
               className="mx-auto flex h-24 w-24 items-center justify-center rounded-none bg-primary text-black shadow-[0_0_50px_rgba(196,164,132,0.3)]"
            >
              <ShieldCheck className="h-12 w-12" />
            </motion.div>
            
            <div className="space-y-4">
               <motion.h1 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none"
               >
                 Manifest <span className="text-primary">Confirmed</span>
               </motion.h1>
               <p className="text-white/20 text-[10px] sm:text-[11px] uppercase tracking-[0.8em] font-black">
                 Institutional Acquisition Verified // Archive Sequence: {order.order_number}
               </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Manifest Details */}
            <div className="lg:col-span-8 space-y-12">
               <section className="space-y-8">
                  <div className="flex items-center gap-6 border-b border-white/5 pb-6">
                     <Package className="h-5 w-5 text-primary" />
                     <h3 className="text-[10px] uppercase tracking-[0.5em] font-black">{isRTL ? "مواصفات الأصول" : "ASSET_SPECIFICATIONS"}</h3>
                  </div>

                  {order.car && (
                     <div className="grid md:grid-cols-12 gap-12 bg-surface-low border border-white/5 p-8 group overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="md:col-span-5 relative">
                           <img
                             src={order.car.main_image || "/placeholder.svg"}
                             alt={isRTL ? order.car.name_ar : order.car.name}
                             className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0"
                           />
                        </div>
                        <div className="md:col-span-7 flex flex-col justify-center space-y-6">
                           <div>
                              <p className="text-primary text-[10px] uppercase tracking-[0.4em] font-black mb-2">{order.car.model}</p>
                              <h4 className="text-4xl font-bold tracking-tighter uppercase text-white">{isRTL ? order.car.name_ar : order.car.name}</h4>
                           </div>
                           <div className="grid grid-cols-2 gap-8 text-[10px] uppercase tracking-widest text-white/40">
                              <div className="flex items-center gap-3">
                                 <Zap className="h-4 w-4 text-primary" />
                                 <span>{order.car.year} Generation</span>
                              </div>
                              <div className="flex items-center gap-3">
                                 <Truck className="h-4 w-4 text-primary" />
                                 <span>{deliveryIsShipping ? "Global Logistics" : "Institutional Pickup"}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}
               </section>

               {/* Logistics Section */}
               <section className="grid md:grid-cols-2 gap-12">
                  <div className="bg-surface-low border border-white/5 p-8 space-y-8 relative">
                     <div className="absolute -top-px left-8 right-8 h-px bg-primary/20" />
                     <h3 className="text-[10px] uppercase tracking-[0.5em] font-black text-primary">{isRTL ? "بروتوكول التمويل" : "FINANCIAL_PROTOCOL"}</h3>
                     <div className="space-y-6">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-white/60 leading-relaxed italic">
                           {paymentIsBank 
                             ? (isRTL ? "يرجى تحويل القيمة الاستثمارية للحساب المؤسسي المذكور أدناه لإتمام الربط مع الأصول." : "Initiate financial transfer to the institutional account below to synchronize asset ownership.")
                             : (isRTL ? "سيتم تحصيل القيمة الاستثمارية نقداً عند إتمام بروتوكول التسليم." : "Financial resolution will be executed via cash protocol during the final delivery phase.")}
                        </p>
                        {paymentIsBank && (
                           <div className="space-y-4 p-6 bg-black border border-white/5">
                              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                                 <span className="text-white/20">Institutional Bank</span>
                                 <span className="text-white">{isRTL ? settings?.bank_name : (settings?.bank_name_en || settings?.bank_name)}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                                 <span className="text-white/20">Institutional Account</span>
                                 <span className="text-primary font-black tracking-[0.3em]">{settings?.bank_account_number}</span>
                              </div>
                              {settings?.bank_iban && (
                                <div className="pt-2 border-t border-white/5">
                                   <span className="text-white/10 text-[8px] uppercase tracking-[0.5em] block mb-2">IBAN MATRIX</span>
                                   <div className="font-mono text-[9px] text-white/40 break-all bg-white/[0.02] p-2">{settings.bank_iban}</div>
                                </div>
                              )}
                           </div>
                        )}
                        <button className="w-full h-14 bg-white/5 hover:bg-primary hover:text-black transition-all duration-700 text-[10px] font-black uppercase tracking-[0.5em] flex items-center justify-center gap-4 group">
                           <Download className="h-4 w-4 group-hover:-translate-y-1 transition-transform" />
                           {isRTL ? "تحميل الفاتورة الرقمية" : "ARCHIVE_INVOICE"}
                        </button>
                     </div>
                  </div>

                  <div className="bg-surface-low border border-white/5 p-8 space-y-8 relative">
                     <div className="absolute -top-px left-8 right-8 h-px bg-white/20" />
                     <h3 className="text-[10px] uppercase tracking-[0.5em] font-black text-white/40">{isRTL ? "بروتوكول التواصل" : "COMMUNICATION_LINK"}</h3>
                     <div className="space-y-8">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-white/60 leading-relaxed italic">
                           {isRTL ? "تم تفعيل خط تواصل مباشر مع القنصلية الفنية للمتابعة الرقمية." : "A direct communication link with the technical concierge has been established for real-time manifest tracking."}
                        </p>
                        
                        <div className="space-y-4">
                           <a 
                             href={`https://wa.me/${settings?.whatsapp?.replace(/\D/g, "")}`} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="w-full h-16 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-[10px] font-black uppercase tracking-[0.5em] hover:bg-[#25D366] hover:text-black transition-all duration-700 flex items-center justify-center gap-4"
                           >
                              <MessageCircle className="h-4 w-4" />
                              {isRTL ? "القنصلية المؤمنة" : "SECURED_CONCIERGE"}
                           </a>
                           <Link to={`/profile`} className="w-full h-14 border border-white/5 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.4em] text-white/20 hover:text-white hover:border-white/20 transition-all">
                              <FileText className="h-4 w-4" />
                              {isRTL ? "سجل النشاط" : "ACTIVITY_LOG"}
                           </Link>
                        </div>
                     </div>
                  </div>
               </section>
            </div>

            {/* Sidebar Ledger */}
            <div className="lg:col-span-4 space-y-8">
               <div className="bg-surface-low border border-white/5 p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.02]">
                     <ShieldCheck className="h-32 w-32 rotate-12" />
                  </div>
                  <h3 className="text-[10px] uppercase tracking-[0.5em] font-black mb-12 text-white/20">{isRTL ? "سجل الاستحواذ" : "ACQUISITION_LEDGER"}</h3>
                  
                  <div className="space-y-6">
                     <div className="space-y-4 pb-8 border-b border-white/5">
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.2em]">
                           <span className="text-white/20 font-medium">Asset Valuation</span>
                           <span className="text-white">{Number(order.total_amount).toLocaleString()} {settings?.currency_symbol || (isRTL ? "ج.س" : "SDG")}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.2em]">
                           <span className="text-white/20 font-medium">Logistics Deployment</span>
                           <span className="text-white">CREDENTIALED</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.2em]">
                           <span className="text-white/20 font-medium">Institutional Tax</span>
                           <span className="text-white">INCLUSIVE</span>
                        </div>
                     </div>

                     <div className="pt-4 flex justify-between items-end">
                        <div>
                           <p className="text-[8px] uppercase tracking-[0.6em] text-primary font-black mb-2">Institutional Total</p>
                           <h2 className="text-4xl font-black text-white tracking-tighter leading-none">
                              {Number(order.total_amount).toLocaleString()}
                           </h2>
                        </div>
                        <span className="text-xl font-black text-primary mb-1 uppercase tracking-tighter select-none">{settings?.currency_symbol || (isRTL ? "ج.س" : "SDG")}</span>
                     </div>
                  </div>
               </div>

               <div className="bg-surface-low border border-white/5 p-8">
                  <h3 className="text-[10px] uppercase tracking-[0.5em] font-black mb-8 text-white/20">{isRTL ? "بيانات المشغل" : "OPERATIVE_INTEL"}</h3>
                  <div className="space-y-6">
                     <div>
                        <p className="text-[8px] uppercase tracking-[0.4em] text-white/20 mb-1">Authenticated Operative</p>
                        <p className="text-[11px] font-black tracking-widest uppercase text-white">{order.customer?.name}</p>
                     </div>
                     <div>
                        <p className="text-[8px] uppercase tracking-[0.4em] text-white/20 mb-1">Communication Frequency</p>
                        <p className="text-[11px] font-black tracking-widest uppercase text-white">{order.customer?.phone}</p>
                     </div>
                     {deliveryIsShipping && (
                        <div className="pt-4 border-t border-white/5">
                           <p className="text-[8px] uppercase tracking-[0.4em] text-white/20 mb-1">Target Coordinates</p>
                           <p className="text-[11px] font-black tracking-widest uppercase text-white">{order.delivery_city}</p>
                           <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">{order.delivery_address}</p>
                        </div>
                     )}
                  </div>
               </div>

               <Link to="/" className="w-full h-20 bg-white text-black text-[11px] font-black uppercase tracking-[0.6em] hover:bg-primary transition-all duration-700 flex items-center justify-center gap-6 group">
                  Institutional HQ
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default OrderConfirmationPage;
