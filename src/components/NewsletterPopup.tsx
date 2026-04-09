import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Gift, X, Sparkles, ShieldCheck, Zap, ArrowRight, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

const POPUP_SHOWN_KEY = "newsletter_popup_shown";
const POPUP_SUBSCRIBED_KEY = "newsletter_subscribed";

const emailSchema = z.string().email();

const translations = {
  ar: {
    title: "الالتحاق بالبيانات السيادية",
    subtitle: "قائمة الإرسال للمجموعة الخاصة",
    offer: "انضم إلى الدائرة الداخلية لتلقي إشعارات فورية حول الأصول المضافة حديثاً والتحديثات المؤسسية.",
    emailPlaceholder: "العنوان الإلكتروني",
    subscribe: "تفعيل الاشتراك",
    noThanks: "تجاهل الإرسال",
    privacyAgree: "أوافق على بروتوكولات الخصوصية والشروط",
    success: "تم التفعيل بنجاح. بروتوكول التواصل مُفعل.",
    error: "خطأ في التشفير، يرجى إعادة المحاولة",
    benefits: [
      "إشعارات فورية للأصول النادرة",
      "أولوية الوصول للبيانات الفنية",
      "تقارير حصرية عن حالة السوق",
    ],
  },
  en: {
    title: "SOVEREIGN DISPATCH",
    subtitle: "Priority Collection Enrollment",
    offer: "Enroll in the inner circle to receive prioritized alerts on newly archived assets and institutional shifts.",
    emailPlaceholder: "ELECTRONIC_ADDRESS@DOMAIN.COM",
    subscribe: "ACTIVATE_ENROLLMENT",
    noThanks: "VOID_DISPATCH",
    privacyAgree: "I consent to privacy protocols and service terms",
    success: "Enrollment Confirmed. Communication frequency synchronized.",
    error: "System Fault. Please re-initiate sequence.",
    benefits: [
      "Immediate Rare Asset Intelligence",
      "Priority Access to Technical Dossiers",
      "Exclusive Institutional Market Reports",
    ],
  },
};

const NewsletterPopup = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language as keyof typeof translations] || translations.ar;

  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const hasShown = localStorage.getItem(POPUP_SHOWN_KEY);
    const hasSubscribed = localStorage.getItem(POPUP_SUBSCRIBED_KEY);

    if (!hasShown && !hasSubscribed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem(POPUP_SHOWN_KEY, "true");
      }, 8000); // 8 seconds for a more premium approach

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubscribe = async () => {
    const emailResult = emailSchema.safeParse(email.trim());
    if (!emailResult.success) {
      toast({
        title: t.error,
        variant: "destructive",
      });
      return;
    }

    if (!agreePrivacy) {
      toast({
        title: "PRIVACY_PROTOCOL_REQUIRED",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim() });

      if (error) {
        if (error.code === "23505") {
          toast({ title: t.success });
        } else {
          throw error;
        }
      } else {
        toast({ title: t.success });
      }

      localStorage.setItem(POPUP_SUBSCRIBED_KEY, "true");
      setIsOpen(false);
    } catch (error) {
      toast({
        title: t.error,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-black border border-white/10 rounded-none shadow-[0_50px_100px_rgba(0,0,0,0.9)] outline-none">
        <div className="grid md:grid-cols-12 min-h-[500px]">
           {/* Visual Brand Block */}
           <div className="md:col-span-5 bg-surface-low p-12 flex flex-col justify-between border-r border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(196,164,132,0.05)_0%,transparent_70%)]" />
              <div className="space-y-8 relative z-10">
                 <div className="h-1 w-10 bg-primary" />
                 <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">{t.title}</h2>
                 <p className="text-[10px] tracking-[0.6em] text-white/20 uppercase font-black">{t.subtitle}</p>
              </div>
              
              <div className="relative z-10 mt-auto">
                 <div className="flex items-center gap-4 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[9px] uppercase tracking-[0.4em] font-black">Authorized Data Stream</span>
                 </div>
              </div>

              <div className="absolute -bottom-20 -right-20 text-[10rem] font-black text-white/[0.02] uppercase select-none pointer-events-none italic">
                 Dispatch
              </div>
           </div>

           {/* Input Block */}
           <div className="md:col-span-7 p-12 md:p-16 flex flex-col justify-center">
              <button 
                onClick={handleClose}
                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
              >
                 <X className="h-5 w-5" />
              </button>

              <div className="space-y-12">
                 <p className="text-white/40 text-xs uppercase tracking-[0.3em] leading-relaxed font-medium italic">{t.offer}</p>

                 <div className="space-y-6">
                    {t.benefits.map((benefit, idx) => (
                       <div key={idx} className="flex items-center gap-6 group">
                          <div className="h-px w-6 bg-white/5 group-hover:bg-primary transition-all duration-700" />
                          <span className="text-[10px] uppercase tracking-[0.4em] text-white/20 group-hover:text-white transition-all">{benefit}</span>
                       </div>
                    ))}
                 </div>

                 <div className="space-y-8">
                    <div className="relative group">
                       <label className="text-[8px] uppercase tracking-[0.6em] text-white/20 font-black mb-4 block group-focus-within:text-primary transition-colors">Electronic Mailing Address</label>
                       <Input
                         type="email"
                         placeholder={t.emailPlaceholder}
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="bg-transparent border-none border-b border-white/10 rounded-none px-0 py-6 text-sm tracking-[0.3em] font-black uppercase placeholder:text-white/5 focus-visible:ring-0 focus-visible:border-primary transition-all"
                         dir="ltr"
                       />
                    </div>

                    <div className="flex items-start gap-4 p-4 border border-white/5 bg-white/[0.02]">
                       <Checkbox
                         id="privacy-popup"
                         checked={agreePrivacy}
                         onCheckedChange={(checked) => setAgreePrivacy(checked as boolean)}
                         className="mt-1 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                       />
                       <label htmlFor="privacy-popup" className="text-[9px] uppercase tracking-[0.2em] text-white/20 cursor-pointer leading-relaxed hover:text-white/40 transition-colors">
                         {t.privacyAgree}
                       </label>
                    </div>
                 </div>

                 <div className="flex flex-col gap-4">
                    <button 
                      onClick={handleSubscribe}
                      disabled={isLoading}
                      className="h-16 bg-primary text-black text-[11px] font-black uppercase tracking-[0.6em] hover:bg-white transition-all duration-1000 flex items-center justify-center gap-6 group"
                    >
                       {isLoading ? (
                          <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
                       ) : (
                          <>
                             {t.subscribe}
                             <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </>
                       )}
                    </button>
                    <button 
                      onClick={handleClose}
                      className="h-14 text-[9px] font-black uppercase tracking-[0.4em] text-white/10 hover:text-white/40 transition-colors"
                    >
                       {t.noThanks}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterPopup;
