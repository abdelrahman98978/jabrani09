import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { motion } from "framer-motion";

const emailSchema = z.string().email().max(255);

const Newsletter = () => {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = emailSchema.safeParse(email.trim());
    if (!result.success) {
      toast({
        variant: "destructive",
        title: isRTL ? "برجاء إدخال بريد إلكتروني صحيح" : "Please enter a valid email",
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
          toast({
            title: isRTL ? "أنت مشترك بالفعل" : "Already Subscribed",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: isRTL ? "تم الاشتراك بنجاح" : "Successfully Subscribed",
        });
      }
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "حدث خطأ ما" : "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-64 bg-black overflow-hidden border-t border-white/5 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_center,rgba(196,164,132,0.03)_0%,transparent_70%)]" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          {/* Section Header */}
          <div className="max-w-4xl mb-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              className="mb-12 flex items-center justify-center gap-6"
            >
              <div className="h-0.5 w-8 bg-white/10" />
              <span className="text-[11px] uppercase tracking-[1em] text-primary font-black">
                {isRTL ? "بريد السيادة" : "Sovereign Dispatch"}
              </span>
              <div className="h-0.5 w-8 bg-white/10" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
              className="text-6xl md:text-[8rem] text-hero text-white mb-16 leading-[0.85] uppercase"
            >
              {isRTL ? (
                <>
                  كن في <br /><span className="font-bold">الطليعة</span>
                </>
              ) : (
                <>
                  Enter the <br /><span className="font-bold">Circle.</span>
                </>
              )}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="text-white/20 text-[11px] uppercase tracking-[0.6em] leading-relaxed max-w-2xl mx-auto italic"
            >
              {isRTL 
                ? "انضم إلى نخبة متميزة تتلقى آخر التحديثات والاقتناءات الحصرية."
                : "Join the elite circle receiving categorized dispatches of our newest acquisitions."}
            </motion.p>
          </div>

          {/* Institutional Form */}
          <motion.form
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
            onSubmit={handleSubmit}
            className="w-full max-w-3xl flex flex-col md:flex-row gap-0 group relative"
          >
            <div className="flex-1 relative">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isRTL ? "العنوان الإلكتروني..." : "ELECTRONIC ADDRESS..."}
                className="h-28 bg-surface-low border-0 border-b border-white/5 rounded-none text-white placeholder:text-white/5 focus-visible:ring-0 focus-visible:ring-offset-0 px-16 text-[13px] uppercase tracking-[0.5em] w-full transition-all group-focus-within:border-primary group-focus-within:bg-black/40"
                required
                disabled={isLoading}
              />
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 group-focus-within:text-primary transition-colors" />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="group/btn relative h-28 px-20 bg-white text-black text-[12px] uppercase tracking-[0.7em] font-black overflow-hidden transition-all duration-700 hover:tracking-[0.9em] min-w-[300px]"
            >
              <span className="relative z-10 flex items-center justify-center gap-4">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : (isRTL ? "اشتراك" : "Establish Link")}
                {!isLoading && <ArrowRight className="h-3 w-3 -translate-x-4 opacity-0 group-hover/btn:translate-x-0 group-hover/btn:opacity-100 transition-all" />}
              </span>
              <div className="absolute inset-0 bg-primary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-700" />
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-24 flex items-center gap-8 text-[9px] uppercase tracking-[0.8em] text-white/10 font-black"
          >
            <div className="flex items-center gap-3">
               <ShieldCheck className="h-3 w-3" />
               SECURE DISPATCH
            </div>
            <div className="w-8 h-[1px] bg-white/5" />
            <div className="italic">VANTABLACK SERIES 2024</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
