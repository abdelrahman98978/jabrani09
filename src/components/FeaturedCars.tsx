import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CarCard, { mapCarToCardData } from "./CarCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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

    // Manual discount check
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

  const { data: cars, isLoading } = useQuery({
    queryKey: ["featured-cars"],
    queryFn: async () => {
      const [{ data: carsData, error }, { data: promotions, error: promoError }] = await Promise.all([
        supabase
          .from("cars")
          .select("*")
          .eq("is_featured", true)
          .eq("status", "available")
          .order("created_at", { ascending: false })
          .limit(12),
        supabase.from("promotions").select("*"),
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
    <section className="py-40 bg-black overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="max-w-4xl mb-32 flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            >
              <span className="text-[11px] uppercase tracking-[0.5em] text-primary font-bold">
                {isRTL ? "منصة السيادة" : "Sovereign Curation"}
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
              className="text-5xl md:text-8xl text-hero text-white"
            >
              {isRTL ? (
                <>
                  أيقونات <span className="font-bold">المجموعة</span>
                  <br />
                  في <span className="text-white/30 italic">المقدمة</span>
                </>
              ) : (
                <>
                  The <span className="font-bold">Icons</span>
                  <br />
                  Of our <span className="text-white/30 italic">Fleet</span>
                </>
              )}
            </motion.h2>
          </div>

          <Link to="/cars" className="group mb-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-6 text-[11px] uppercase tracking-[0.4em] text-white/40 hover:text-white transition-all duration-700"
            >
              <div className="w-12 h-[1px] bg-white/10 group-hover:w-20 group-hover:bg-primary transition-all duration-700" />
              <span>{isRTL ? "استعرض المجموعة الكاملة" : "View Entire Fleet"}</span>
            </motion.div>
          </Link>
        </div>

        {/* Cars Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[500px] bg-surface-low border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : cars && cars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-20">
            {cars.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
              >
                <CarCard car={mapCarToCardData(car)} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="relative py-40 border border-white/5 bg-surface-low flex flex-col items-center justify-center text-center overflow-hidden">
            <div className="absolute inset-0 opacity-5 grayscale">
              <img 
                src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=2070" 
                alt="Empty state background" 
                className="w-full h-full object-cover"
              />
            </div>
            <Sparkles className="h-20 w-20 text-primary/20 mb-12 relative z-10" />
            <h3 className="text-3xl font-light text-white uppercase tracking-tighter mb-6 relative z-10">
              {isRTL ? "المجموعة قيد التحديث" : "Collection Under Refresh"}
            </h3>
            <p className="text-white/30 text-[11px] uppercase tracking-[0.3em] max-w-sm mb-12 relative z-10">
              {isRTL
                ? "نحن ننتقي أيقونات جديدة لتنضم لمجموعتنا المميزة. ترقبوا الإطلاق."
                : "New icons are being curated for our premier collection."}
            </p>
            <Link to="/cars" className="relative z-10">
              <button className="px-12 py-5 border border-white/20 text-white text-[11px] uppercase tracking-[0.4em] font-medium hover:bg-white hover:text-black transition-all duration-700">
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
