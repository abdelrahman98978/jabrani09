import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCompare } from "@/contexts/CompareContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { X, GitCompare, Trash2 } from "lucide-react";

const CompareDrawer = () => {
  const { compareItems, removeFromCompare, clearCompare, compareCount } = useCompare();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const { data: cars } = useQuery({
    queryKey: ["compare-cars", compareItems],
    queryFn: async () => {
      if (compareItems.length === 0) return [];
      const { data } = await supabase
        .from("cars")
        .select("id, name_ar, name, main_image, price")
        .in("id", compareItems);
      return data || [];
    },
    enabled: compareItems.length > 0,
  });

  if (compareCount === 0) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(isRTL ? "ar-SA" : "en-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="compare-drawer fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg animate-slide-up">
      <div className="container mx-auto py-3 px-4">
        <div className="flex items-center gap-4">
          {/* Title */}
          <div className="flex items-center gap-2 shrink-0">
            <GitCompare className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">
              {isRTL ? `المقارنة (${compareCount}/4)` : `Compare (${compareCount}/4)`}
            </span>
          </div>

          {/* Cars Preview */}
          <div className="flex-1 flex items-center gap-3 overflow-x-auto pb-2">
            {cars?.map((car) => (
              <div
                key={car.id}
                className="relative flex items-center gap-2 bg-secondary/50 rounded-lg p-2 shrink-0"
              >
                <img
                  src={car.main_image || "/placeholder.svg"}
                  alt={isRTL ? car.name_ar : car.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="max-w-[120px]">
                  <p className="text-xs font-medium truncate">
                    {isRTL ? car.name_ar : car.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(car.price)}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCompare(car.id)}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: 4 - compareCount }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-[140px] h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center shrink-0"
              >
                <span className="text-xs text-muted-foreground">
                  {isRTL ? "أضف سيارة" : "Add car"}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCompare}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Link to="/compare">
              <Button variant="gold" size="sm" disabled={compareCount < 2}>
                {isRTL ? "قارن الآن" : "Compare Now"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareDrawer;
