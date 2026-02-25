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
      <div className="group relative flex flex-col items-center justify-center p-8 border border-foreground/5 hover:border-foreground/20 transition-all duration-700 aspect-square bg-foreground/[0.01] hover:bg-foreground/[0.03] shadow-luxury overflow-hidden">
        {showLogo ? (
          <div className="h-20 w-32 flex items-center justify-center">
            <img
              src={brand.logo_url!}
              alt={displayName}
              loading="lazy"
              onError={() => setLogoError(true)}
              className="max-h-full max-w-full object-contain opacity-20 group-hover:opacity-100 transition-all duration-700 grayscale group-hover:grayscale-0 scale-90 group-hover:scale-110"
            />
          </div>
        ) : (
          <div className="h-20 w-20 flex items-center justify-center text-3xl font-light text-foreground/10 group-hover:text-foreground transition-colors duration-700 border border-foreground/5 group-hover:border-foreground/20 italic">
            {displayName.charAt(0)}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 text-center">
          <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] text-foreground">
            {displayName}
          </h3>
          {carCount !== undefined && carCount > 0 && (
            <p className="text-[8px] uppercase tracking-widest text-foreground/40 mt-1">
              {carCount} {isRTL ? "مركبة متاحة" : "Models Available"}
            </p>
          )}
        </div>

        {/* Subtle Accent Line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-foreground transition-all duration-700 group-hover:w-full" />
      </div>
    </Link>
  );
};

export default BrandCard;
