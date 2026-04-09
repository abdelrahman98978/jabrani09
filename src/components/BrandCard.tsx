import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

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
        whileHover={{ y: -5 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className="group relative flex flex-col items-center justify-center p-12 bg-surface-low overflow-hidden transition-all duration-1000"
      >
        {showLogo ? (
          <div className="h-24 w-40 flex items-center justify-center px-4">
            <img
              src={brand.logo_url!}
              alt={displayName}
              loading="lazy"
              onError={() => setLogoError(true)}
              className="max-h-full max-w-full object-contain opacity-20 contrast-125 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000 scale-90 group-hover:scale-100"
            />
          </div>
        ) : (
          <div className="h-24 w-24 flex items-center justify-center text-4xl font-light text-foreground/5 opacity-40 group-hover:text-primary transition-colors duration-700 italic">
            {displayName.charAt(0)}
          </div>
        )}

        <div className="mt-8 text-center opacity-0 group-hover:opacity-100 transition-all duration-1000 translate-y-2 group-hover:translate-y-0">
          <h3 className="text-[10px] uppercase font-bold tracking-[0.4em] text-foreground">
            {displayName}
          </h3>
          {carCount !== undefined && carCount > 0 && (
            <p className="text-[8px] uppercase tracking-[0.3em] text-primary/60 mt-2">
              {carCount} {isRTL ? "قطعة ميكانيكية" : "Exquisite Models"}
            </p>
          )}
        </div>

        {/* Global Sovereign Accent */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left" />
      </motion.div>
    </Link>
  );
};

export default BrandCard;
