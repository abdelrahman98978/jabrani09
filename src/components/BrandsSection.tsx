import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BrandCard from "./BrandCard";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";

const BrandsSection = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { data: brands, isLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Fetch car counts per brand
  const { data: carCounts } = useQuery({
    queryKey: ["brand-car-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("brand_id")
        .eq("status", "available");

      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach((car) => {
        if (car.brand_id) {
          counts[car.brand_id] = (counts[car.brand_id] || 0) + 1;
        }
      });
      return counts;
    },
  });

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  return (
    <section className="py-20 bg-card/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-overlay opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fade-in">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {isRTL ? "شركاؤنا" : "Our Partners"}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            {isRTL ? (
              <>
                موزع معتمد <span className="text-gradient-gold">للماركات العالمية</span>
              </>
            ) : (
              <>
                Authorized Dealer for <span className="text-gradient-gold">Global Brands</span>
              </>
            )}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            {isRTL 
              ? "نوفر لكم أشهر الماركات العالمية مع ضمان الجودة والأصالة"
              : "We offer the most famous global brands with guaranteed quality and authenticity"}
          </p>
        </div>

        {/* Brands Carousel */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : brands && brands.length > 0 ? (
          <div className="relative">
            {/* Navigation Buttons */}
            {canScrollRight && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full shadow-lg bg-card hover:bg-primary hover:text-primary-foreground hidden md:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            {canScrollLeft && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full shadow-lg bg-card hover:bg-primary hover:text-primary-foreground hidden md:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}

            {/* Scrollable Container */}
            <div
              ref={scrollRef}
              onScroll={checkScrollButtons}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {brands.map((brand, index) => (
                <div 
                  key={brand.id} 
                  className="flex-shrink-0 w-[160px] md:w-[200px] snap-start brand-logo-float wp-brand-card" 
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <BrandCard brand={brand} carCount={carCounts?.[brand.id] || 0} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {isRTL ? "لا توجد ماركات متاحة" : "No brands available"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BrandsSection;
