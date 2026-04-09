import { Link } from "react-router-dom";
import { Phone, MessageCircle, ArrowRight, ShieldCheck, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { motion } from "framer-motion";

const CTABanner = () => {
  const { language } = useLanguage();
  const { data: settings } = useSettings();
  const isRTL = language === "ar";

  const whatsappNumber = settings?.whatsapp || settings?.phone || "+966543389314";
  const cleanNumber = whatsappNumber.replace(/\D/g, "");
  const whatsappLink = `https://wa.me/${cleanNumber}`;

  return (
    <section className="relative py-64 bg-black overflow-hidden border-t border-white/5">
      {/* Background Media Depth - Sovereign Layering */}
      <div className="absolute inset-0">
        <motion.img 
          initial={{ scale: 1.2, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 3, ease: [0.19, 1, 0.22, 1] }}
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2083" 
          alt="Luxury background" 
          className="w-full h-full object-cover grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-6xl">
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="mb-12 flex items-center gap-6"
          >
            <div className="h-0.5 w-12 bg-primary" />
            <span className="text-[11px] uppercase tracking-[1em] text-primary font-black">
              {isRTL ? "بداية رحلة السيادة" : "Initiate Sovereignty"}
            </span>
          </motion.div>

          {/* Master Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
            className="text-6xl md:text-[11rem] text-hero text-white mb-20 leading-[0.85] uppercase"
          >
            {isRTL ? (
              <>
                تملّك <span className="font-bold">التجربة</span>
                <br />
                بكل <span className="text-white/20 italic font-light">سلطة</span>
              </>
            ) : (
              <>
                Own the <br /> <span className="font-bold">Moment.</span>
                <br />
                Master the <span className="text-white/20 italic font-light">Void.</span>
              </>
            )}
          </motion.h2>

          {/* High-Fidelity CTAs */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.19, 1, 0.22, 1] }}
            >
              <a href={`tel:${settings?.phone || "+966543389314"}`} className="group">
                <button className="relative px-16 py-8 bg-white text-black text-[12px] uppercase tracking-[0.6em] font-black overflow-hidden transition-all duration-700 hover:bg-primary shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                  <span className="relative z-10 flex items-center gap-4">
                    {isRTL ? "اتصل بالمستشار" : "Consult Specialist"}
                    <ArrowRight className="h-4 w-4 -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                  </span>
                </button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.19, 1, 0.22, 1] }}
            >
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="group">
                <button className="px-16 py-8 border border-white/10 text-white text-[12px] uppercase tracking-[0.6em] font-bold transition-all duration-700 hover:border-white flex items-center gap-4">
                  <MessageCircle className="h-4 w-4 opacity-40 group-hover:opacity-100" />
                  {isRTL ? "تواصل فوراً" : "Instant Inquire"}
                </button>
              </a>
            </motion.div>

            {/* Quality Indicators */}
            <motion.div 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               transition={{ duration: 2, delay: 1 }}
               className="flex items-center gap-8 mt-12 md:mt-0 md:ml-auto"
            >
               {[ShieldCheck, Trophy, Sparkles].map((Icon, idx) => (
                 <Icon key={idx} className="h-6 w-6 text-white/5" />
               ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
