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
    <section className="relative py-40 bg-black overflow-hidden border-t border-white/5">
      {/* Background Media Depth */}
      <div className="absolute inset-0 opacity-40">
        <img 
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2083" 
          alt="Luxury background" 
          className="w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-4xl">
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="mb-12 inline-flex items-center"
          >
            <span className="text-[11px] uppercase tracking-[0.5em] text-primary font-bold">
              {isRTL ? "بداية رحلة السيادة" : "The Beginning of Sovereignty"}
            </span>
          </motion.div>

          {/* Master Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
            className="text-5xl md:text-8xl text-hero text-white mb-16"
          >
            {isRTL ? (
              <>
                تملّك <span className="font-bold">التجربة</span>
                <br />
                بكل <span className="text-white/30 italic">تفاصيلها</span>
              </>
            ) : (
              <>
                Own the <span className="font-bold">Moment</span>
                <br />
                Master the <span className="text-white/30 italic">Road</span>
              </>
            )}
          </motion.h2>

          {/* High-Fidelity CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.19, 1, 0.22, 1] }}
            className="flex flex-col sm:flex-row gap-12"
          >
            <a href={`tel:${settings?.phone || "+966543389314"}`} className="group">
              <button className="relative px-12 py-5 bg-white text-black text-[12px] uppercase tracking-[0.4em] font-bold overflow-hidden transition-all duration-700 hover:tracking-[0.6em]">
                <span className="relative z-10 font-bold">{isRTL ? "اتصل بالمستشار" : "Consult Specialist"}</span>
                <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
              </button>
            </a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <button className="px-12 py-5 border border-white/20 text-white text-[12px] uppercase tracking-[0.4em] font-medium transition-all duration-700 hover:bg-white hover:text-black">
                {isRTL ? "تواصل فوراً" : "Instant Inquire"}
              </button>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
