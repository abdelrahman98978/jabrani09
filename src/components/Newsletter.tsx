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
    <section className="py-32 bg-background border-t border-foreground/5 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-0 py-0 text-foreground/40 text-[10px] font-bold uppercase tracking-[0.4em]">
              {isRTL ? "النشرة البريدية" : "Connect / 05"}
            </div>
            <h2 className="text-4xl md:text-6xl font-light text-foreground leading-tight tracking-tight">
              {isRTL ? "ابق" : "Stay"} <span className="font-bold">{isRTL ? "على اطلاع" : "Informed"}</span>
            </h2>
            <div className="w-20 h-[1px] bg-foreground/10 mx-auto" />
            <p className="text-muted-foreground/60 text-sm md:text-base uppercase tracking-widest leading-relaxed max-w-xl mx-auto">
              {t.newsletter.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-xl mx-auto border border-foreground/10 shadow-luxury group focus-within:border-foreground/30 transition-all duration-500">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.newsletter.placeholder}
              className="h-16 bg-transparent border-0 rounded-none text-foreground placeholder:text-foreground/20 focus-visible:ring-0 focus-visible:ring-offset-0 px-8 text-xs uppercase tracking-widest flex-1"
              required
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="h-16 px-12 bg-foreground text-background rounded-none uppercase text-[10px] tracking-[0.4em] font-bold hover:bg-foreground/90 transition-all min-w-[180px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t.newsletter.subscribe
              )}
            </Button>
          </form>

          <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/20 italic">
            {isRTL ? "انضم إلى نخبة مشتركينا" : "Join our elite circle."}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
