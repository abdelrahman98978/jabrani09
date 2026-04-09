import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface BrandCardProps {
  brand: {
    id: string;
    name: string;
    name_ar: string;
    logo_url?: string | null;
  };
  carCount?: number;
}

const BrandCard = ({ brand, carCount }: BrandCardProps) => {
  const [logoError, setLogoError] = useState(false);
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const showLogo = brand.logo_url && !logoError;
  const displayName = isRTL ? brand.name_ar : brand.name;

  return (
    <Link to={`/cars?brand=${brand.id}`}>
      <motion.div 
        whileHover={{ y: -8 }}
        transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
        className="group relative flex flex-col items-center justify-center p-14 bg-surface-low border border-white/5 hover:border-primary/30 transition-all duration-1000 overflow-hidden"
      >
        {/* Mirror Ambient Backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,164,132,0.03)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        {showLogo ? (
          <div className="h-28 w-44 flex items-center justify-center px-6 relative z-10">
            <img
              src={brand.logo_url!}
              alt={displayName}
              loading="lazy"
              onError={() => setLogoError(true)}
              className="max-h-full max-w-full object-contain opacity-10 contrast-150 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000 scale-90 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="h-28 w-28 flex items-center justify-center text-5xl font-black text-white/5 opacity-40 group-hover:text-primary transition-colors duration-1000 italic uppercase relative z-10">
             {displayName.charAt(0)}
          </div>
        )}

        <div className="mt-12 text-center relative z-10 opacity-0 group-hover:opacity-100 transition-all duration-1000 translate-y-4 group-hover:translate-y-0">
          <div className="flex items-center justify-center gap-3 mb-3">
             <ShieldCheck className="h-3 w-3 text-primary opacity-40" />
             <h3 className="text-[11px] uppercase font-black tracking-[0.5em] text-white">
               {displayName}
             </h3>
          </div>
          {carCount !== undefined && carCount > 0 && (
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-bold italic">
               Archived: {carCount} {isRTL ? "مواصفة سيادية" : "Records"}
            </p>
          )}
        </div>

        {/* Tactical Indicators */}
        <div className="absolute bottom-4 right-4 text-[8px] font-black tracking-[0.4em] text-white/5 uppercase select-none group-hover:text-primary/10 transition-colors">
           Verified_Signature
        </div>

        {/* Sovereign Top Line */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left shadow-[0_0_15px_rgba(196,164,132,0.5)]" />
      </motion.div>
    </Link>
  );
};

export default BrandCard;
