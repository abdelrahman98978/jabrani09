import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2 } from "lucide-react";
import { z } from "zod";

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
        title: t.newsletter.error,
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
          // Duplicate email
          toast({
            title: t.newsletter.success,
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: t.newsletter.success,
        });
      }
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast({
        variant: "destructive",
        title: t.newsletter.error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-40 bg-black overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          {/* Section Header */}
          <div className="max-w-3xl mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              className="mb-12"
            >
              <span className="text-[11px] uppercase tracking-[0.6em] text-primary font-bold">
                {isRTL ? "بريد السيادة" : "Sovereign Dispatch"}
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
              className="text-4xl md:text-7xl text-hero text-white mb-8"
            >
              {isRTL ? (
                <>
                  كن في <span className="font-bold">الطليعة</span>
                </>
              ) : (
                <>
                  Enter the <span className="font-bold">Circle</span>
                </>
              )}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-white/30 text-[11px] uppercase tracking-[0.4em] leading-relaxed max-w-xl mx-auto"
            >
              {t.newsletter.subtitle}
            </motion.p>
          </div>

          {/* Precision Input Form */}
          <motion.form
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
            onSubmit={handleSubmit}
            className="w-full max-w-2xl flex flex-col md:flex-row gap-0 group"
          >
            <div className="flex-1 relative">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.newsletter.placeholder}
                className="h-20 bg-surface-low border-0 border-b border-white/10 rounded-none text-white placeholder:text-white/10 focus-visible:ring-0 focus-visible:ring-offset-0 px-12 text-[12px] uppercase tracking-[0.4em] w-full transition-all group-focus-within:border-primary"
                required
                disabled={isLoading}
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 group-focus-within:text-primary transition-colors" />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="group/btn relative h-20 px-16 bg-white text-black text-[12px] uppercase tracking-[0.5em] font-bold overflow-hidden transition-all duration-700 hover:tracking-[0.7em] min-w-[220px]"
            >
              <span className="relative z-10">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto text-black" /> : t.newsletter.subscribe}
              </span>
              <div className="absolute inset-0 bg-primary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-700" />
            </button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-[10px] uppercase tracking-[0.5em] text-white/10 hover:text-white/20 transition-colors"
          >
            {isRTL ? "أرقى التحديثات في عالم السيارات" : "Defined by excellence. Defined by you."}
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
