import { Link } from "react-router-dom";
import { Phone, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";

const CTABanner = () => {
  const { language } = useLanguage();
  const { data: settings } = useSettings();
  const isRTL = language === "ar";

  const whatsappNumber = settings?.whatsapp || settings?.phone || "+966543389314";
  const cleanNumber = whatsappNumber.replace(/\D/g, "");
  const whatsappLink = `https://wa.me/${cleanNumber}`;

  return (
    <section className="py-24 bg-background border-t border-foreground/5 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 p-12 md:p-24 bg-foreground relative overflow-hidden group shadow-luxury">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-1000"
            style={{ backgroundImage: "linear-gradient(45deg, #ffffff 1px, transparent 1px), linear-gradient(-45deg, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

          {/* Text Content */}
          <div className="text-center lg:text-start relative z-10 space-y-6">
            <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-background/40">
              {isRTL ? "مستقبلك يبدأ هنا" : "Next Chapter / 04"}
            </span>
            <h2 className="text-4xl md:text-6xl font-light text-background leading-tight tracking-tight">
              {isRTL
                ? "ابدأ رحلة"
                : "Own the"} <span className="font-bold">{isRTL ? "الفخامة اليوم" : "Experience"}</span>
            </h2>
            <p className="text-background/50 text-base md:text-lg max-w-xl uppercase tracking-widest leading-relaxed">
              {isRTL
                ? "فريقنا المتخصص في انتظارك لتقديم استشارة تليق بطلعاتك."
                : "A world of performance and elegance awaits. Reach out to our specialist team."}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 relative z-10">
            <a href={`tel:${settings?.phone || "+966543389314"}`}>
              <Button
                className="h-16 px-10 bg-background text-foreground rounded-none uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-background/90 transition-all shadow-luxury"
              >
                <Phone className="h-4 w-4 me-3" />
                {isRTL ? "اتصل بنا" : "Telephone"}
              </Button>
            </a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="h-16 px-10 border-background/20 text-background rounded-none uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-background/10 hover:border-background transition-all"
              >
                <MessageCircle className="h-4 w-4 me-3" />
                {isRTL ? "واتساب" : "WhatsApp"}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
