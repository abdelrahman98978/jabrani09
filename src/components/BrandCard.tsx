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
      <Card className="group p-6 flex flex-col items-center justify-center gap-3 border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 aspect-square relative overflow-hidden wp-card-hover">
        {showLogo ? (
          <div className="h-16 w-28 rounded-xl bg-secondary/40 flex items-center justify-center">
            <img
              src={brand.logo_url!}
              alt={displayName}
              loading="lazy"
              onError={() => setLogoError(true)}
              className="max-h-12 max-w-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </div>
        ) : (
          <div className="h-16 w-28 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl font-bold text-primary">
            {displayName.charAt(0)}
          </div>
        )}
        <div className="text-center">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {displayName}
          </h3>
          <p className="text-xs text-muted-foreground">{isRTL ? brand.name : brand.name_ar}</p>
        </div>

        {/* Car Count Badge */}
        {carCount !== undefined && carCount > 0 && (
          <div className="absolute bottom-2 end-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
            {carCount} {isRTL ? "سيارة" : "cars"}
          </div>
        )}
      </Card>
    </Link>
  );
};

export default BrandCard;
