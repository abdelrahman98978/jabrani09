import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BrandCard from "./BrandCard";
import { Loader2, ChevronLeft, ChevronRight, Trophy, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTenant } from "@/contexts/TenantContext";

const BrandsSection = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { tenant, isLoading: isTenantLoading } = useTenant();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { data: brands, isLoading } = useQuery({
    queryKey: ["brands", tenant?.id],
    enabled: !isTenantLoading && !!tenant,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("tenant_id", tenant?.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: carCounts } = useQuery({
    queryKey: ["brand-car-counts", tenant?.id],
    enabled: !isTenantLoading && !!tenant,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("brand_id")
        .eq("tenant_id", tenant?.id)
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
      const scrollAmount = 350;
      scrollRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollButtons, 500);
    }
  };

  return (
    <section className="py-48 bg-black overflow-hidden relative border-t border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,164,132,0.02)_0%,transparent_70%)]" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-16 mb-32">
          <div className="max-w-4xl space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="flex items-center gap-6"
            >
              <Trophy className="h-4 w-4 text-primary opacity-40" />
              <span className="text-[11px] uppercase tracking-[1em] text-primary font-black">
                {isRTL ? "موزعون سياديون" : "Institutional Signatures"}
              </span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.1 }}
              className="text-5xl md:text-8xl text-hero text-white leading-[0.85] uppercase"
            >
              {isRTL ? (
                <>
                  معتمد <br /><span className="font-bold">حصرياً</span>
                </>
              ) : (
                <>
                  Authorized <br /><span className="font-bold">Signatures.</span>
                </>
              )}
            </motion.h2>

            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: 120 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="h-[1px] bg-primary/20" 
            />
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="text-white/20 text-[11px] uppercase tracking-[0.6em] leading-relaxed max-w-xl italic"
            >
              {isRTL
                ? "مجموعتنا المختارة من أرقى صانعي السيارات في العالم."
                : "A categorized archive of the world's most prestigious automotive makers."}
            </motion.p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4 mb-2">
            <button
               onClick={() => scroll("left")}
               className="group p-5 border border-white/5 rounded-full hover:border-primary transition-all duration-700"
            >
               <ChevronLeft className="h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
            </button>
            <button
               onClick={() => scroll("right")}
               className="group p-5 border border-white/5 rounded-full hover:border-primary transition-all duration-700"
            >
               <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
            </button>
          </div>
        </div>

        {/* Brands Scrollable Exhibition */}
        {isLoading ? (
          <div className="flex gap-12 overflow-hidden py-12">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[240px] h-[320px] bg-surface-low border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : brands && brands.length > 0 ? (
          <div className="relative group">
            {/* Scrollable Container */}
            <div
              ref={scrollRef}
              onScroll={checkScrollButtons}
              className="flex gap-12 overflow-x-auto scrollbar-hide pb-20 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {brands.map((brand, index) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
                  className="flex-shrink-0 w-[220px] md:w-[280px] snap-start"
                >
                  <BrandCard brand={brand} carCount={carCounts?.[brand.id] || 0} />
                </motion.div>
              ))}
            </div>
            
            {/* Ambient Background Badge */}
            <div className="absolute -bottom-10 left-0 text-[15rem] font-black text-white/[0.02] tracking-tighter select-none pointer-events-none uppercase">
                Archive
            </div>
          </div>
        ) : (
          <div className="py-32 border border-white/5 bg-surface-low flex flex-col items-center justify-center text-center">
             <ShieldCheck className="h-16 w-16 text-white/5 mb-8" />
             <p className="text-[10px] uppercase tracking-[0.5em] text-white/20">
              {isRTL ? "لا توجد علامات متاحة حالياً" : "Institutional records empty"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BrandsSection;
