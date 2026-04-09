import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CarCard, { mapCarToCardData } from "./CarCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Sparkles, Trophy } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useTenant } from "@/contexts/TenantContext";

interface Promotion {
  id: string;
  is_active: boolean | null;
  discount_type: string | null;
  discount_value: number | null;
  target_cars: string[] | null;
  target_brands: string[] | null;
  min_price: number | null;
  max_price: number | null;
  start_date: string | null;
  end_date: string | null;
}

const applyPromotions = (cars: any[], promotions: Promotion[]) => {
  const now = new Date();

  const activePromos = promotions.filter((p) => {
    if (!p.is_active) return false;
    if (p.start_date && new Date(p.start_date) > now) return false;
    if (p.end_date && new Date(p.end_date) < now) return false;
    return true;
  });

  return cars.map((car) => {
    let bestDiscount = 0;
    let bestPromo: Promotion | null = null;

    if (car.original_price && car.original_price > car.price) {
      bestDiscount = car.original_price - car.price;
    }

    for (const promo of activePromos) {
      const matchesCar =
        (promo.target_cars && promo.target_cars.includes(car.id)) ||
        (promo.target_brands && promo.target_brands.includes(car.brand_id)) ||
        (!promo.target_cars && !promo.target_brands);

      if (!matchesCar) continue;

      if (promo.min_price && car.price < promo.min_price) continue;
      if (promo.max_price && car.price > promo.max_price) continue;

      if (!promo.discount_type || !promo.discount_value) continue;

      let promoDiscount = 0;
      if (promo.discount_type === "percentage") {
        promoDiscount = car.price * (promo.discount_value / 100);
      } else {
        promoDiscount = promo.discount_value;
      }

      if (promoDiscount > bestDiscount) {
        bestDiscount = promoDiscount;
        bestPromo = promo;
      }
    }

    if (bestDiscount <= 0) return car;

    const discountedPrice = car.price - (bestPromo ? bestDiscount : 0);
    const originalPrice = car.original_price ?? car.price;
    const percent = Math.round((bestDiscount / originalPrice) * 100);

    return {
      ...car,
      original_price: originalPrice,
      price: bestPromo ? discountedPrice : car.price,
      has_discount: true,
      promotion_percent: percent,
      promotion_type: bestPromo?.discount_type || undefined,
    };
  });
};

const FeaturedCars = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { tenant, isLoading: isTenantLoading } = useTenant();

  const { data: cars, isLoading } = useQuery({
    queryKey: ["featured-cars", tenant?.id],
    enabled: !isTenantLoading && !!tenant,
    queryFn: async () => {
      const [{ data: carsData, error }, { data: promotions, error: promoError }] = await Promise.all([
        supabase
          .from("cars")
          .select("*")
          .eq("tenant_id", tenant?.id)
          .eq("is_featured", true)
          .eq("status", "available")
          .order("created_at", { ascending: false })
          .limit(12),
        supabase
          .from("promotions")
          .select("*")
          .eq("tenant_id", tenant?.id),
      ]);

      if (error) {
        console.error("Error fetching cars:", error);
        return [];
      }
      if (promoError) console.error("Error fetching promotions:", promoError);

      return applyPromotions(carsData || [], (promotions as Promotion[]) || []);
    },
  });

  return (
    <section className="py-64 bg-black overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="max-w-6xl mb-40 flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
              className="flex items-center gap-6"
            >
              <div className="h-0.5 w-12 bg-primary" />
              <span className="text-[11px] uppercase tracking-[1em] text-primary font-black">
                {isRTL ? "منصة السيادة" : "Sovereign Curation"}
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
              className="text-6xl md:text-[8rem] text-hero text-white leading-[0.85] uppercase"
            >
              {isRTL ? (
                <>
                  أيقونات <span className="font-bold">المجموعة</span>
                  <br />
                  في <span className="text-white/20 italic font-light">المقدمة</span>
                </>
              ) : (
                <>
                  The <span className="font-bold">Icons.</span>
                  <br />
                  Elite <span className="text-white/20 italic font-light">Edition.</span>
                </>
              )}
            </motion.h2>
          </div>

          <Link to="/cars" className="group mb-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-8 text-[11px] uppercase tracking-[0.6em] text-white/30 hover:text-white transition-all duration-700"
            >
              <div className="w-16 h-[0.5px] bg-white/10 group-hover:w-24 group-hover:bg-primary transition-all duration-700" />
              <span className="font-black italic">{isRTL ? "استعرض المجموعة الكاملة" : "Enter the Gallery"}</span>
              <ArrowRight className="h-4 w-4 -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
            </motion.div>
          </Link>
        </div>

        {/* Cars Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-24">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[600px] bg-surface-low/50 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : cars && cars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-24">
            {cars.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
              >
                <div className="group relative">
                  <div className="absolute -inset-4 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-2xl" />
                  <CarCard car={mapCarToCardData(car)} />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="relative py-64 border border-white/5 bg-surface-low/30 backdrop-blur-xl flex flex-col items-center justify-center text-center overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] grayscale contrast-150">
              <img 
                src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=2070" 
                alt="Empty state background" 
                className="w-full h-full object-cover"
              />
            </div>
            <Trophy className="h-32 w-32 text-primary/10 mb-16 relative z-10 animate-pulse" />
            <h3 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-8 relative z-10 italic">
              {isRTL ? "المجموعة قيد التحديث" : "Collection Under Refresh"}
            </h3>
            <p className="text-white/20 text-[11px] uppercase tracking-[0.8em] max-w-lg mb-16 relative z-10 leading-relaxed font-light">
              {isRTL
                ? "نحن ننتقي أيقونات جديدة لتنضم لمجموعتنا المميزة. ترقبوا الإطلاق قريباً."
                : "A world-class selection of new icons is being curated for our premier collection."}
            </p>
            <Link to="/cars" className="relative z-10">
              <button className="px-16 py-8 border border-white/10 text-white text-[12px] uppercase tracking-[0.6em] font-black hover:bg-white hover:text-black transition-all duration-1000">
                {isRTL ? "تصفح المتاح الآن" : "Browse Essentials"}
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCars;
