import { MessageCircle, ShieldCheck, Zap } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const WhatsAppButton = () => {
  const { data: settings } = useSettings();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [isHovered, setIsHovered] = useState(false);

  const phoneNumber = settings?.whatsapp || settings?.phone?.replace(/\D/g, '') || "249123044745";

  const handleClick = () => {
    const message = encodeURIComponent(
      isRTL 
        ? "مرحباً، أرغب في الاستفسار عن بروتوكولات السيارات المتوفرة لديكم" 
        : "Salutations. I wish to inquire about the current automotive protocols in your archive."
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <div className="fixed bottom-12 left-12 z-50 flex items-center gap-6">
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            className="hidden md:flex flex-col items-start gap-1 p-6 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-xl"
          >
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.6em] text-primary font-black">
               <ShieldCheck className="h-3 w-3" />
               {isRTL ? "اتصال مباشر" : "SECURED CONCIERGE"}
            </div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/40 font-medium">
               {isRTL ? "متاح للرد الفوري" : "AVAILABLE FOR URGENT QUERY"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative group flex h-16 w-16 items-center justify-center bg-black border border-white/10 text-white rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-700 hover:border-primary/40 overflow-hidden"
        aria-label={isRTL ? "تواصل معنا عبر واتساب" : "Institutional Contact"}
      >
        {/* Subtle Ambient Green Pulse */}
        <div className="absolute inset-0 bg-[#25D366]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Icon Animation */}
        <div className="relative z-10 flex flex-col items-center">
           <MessageCircle className="h-6 w-6 text-white/40 group-hover:text-[#25D366] transition-all duration-700" />
        </div>

        {/* Outer Ring Glow */}
        <div className="absolute inset-0 rounded-full border border-primary/0 group-hover:border-primary/20 transition-all duration-700" />
        
        <div className="absolute -bottom-4 -right-4 h-12 w-12 bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.button>
    </div>
  );
};

export default WhatsAppButton;
