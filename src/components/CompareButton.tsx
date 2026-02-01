import { GitCompare, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/contexts/CompareContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface CompareButtonProps {
  carId: string;
  variant?: "icon" | "full";
  className?: string;
}

const CompareButton = ({ carId, variant = "icon", className }: CompareButtonProps) => {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const inCompare = isInCompare(carId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(carId);
    } else {
      addToCompare(carId);
    }
  };

  if (variant === "icon") {
    return (
      <Button
        variant={inCompare ? "default" : "outline"}
        size="icon"
        onClick={handleClick}
        className={cn("h-9 w-9 hover-lift-3d", className)}
        title={inCompare ? (isRTL ? "إزالة من المقارنة" : "Remove from compare") : (isRTL ? "أضف للمقارنة" : "Add to compare")}
      >
        {inCompare ? <Check className="h-4 w-4" /> : <GitCompare className="h-4 w-4" />}
      </Button>
    );
  }

  return (
    <Button
      variant={inCompare ? "default" : "outline"}
      onClick={handleClick}
      className={cn("gap-2", className)}
    >
      {inCompare ? <Check className="h-4 w-4" /> : <GitCompare className="h-4 w-4" />}
      {inCompare ? (isRTL ? "في المقارنة" : "In Compare") : (isRTL ? "أضف للمقارنة" : "Add to Compare")}
    </Button>
  );
};

export default CompareButton;
