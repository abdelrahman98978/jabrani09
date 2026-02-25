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
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-24">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-0 py-0 text-foreground/40 text-[10px] font-bold uppercase tracking-[0.4em]">
              {isRTL ? "مختاراتنا المختارة" : "Curation / 01"}
            </div>
            <h2 className="text-4xl md:text-6xl font-light text-foreground leading-[1.1] tracking-tight">
              {isRTL ? "السيارات" : "The"} <span className="font-bold">{isRTL ? "المميزة" : "Collection"}</span>
            </h2>
            <div className="w-20 h-[1px] bg-foreground/10" />
            <p className="text-muted-foreground/60 text-sm md:text-base uppercase tracking-widest leading-relaxed">
              {isRTL
                ? "انطلق في رحلة الفخامة مع مجموعتنا الاستثنائية من أحدث موديلات السيارات العالمية"
                : "A meticulously selected ensemble of performance and elegance."}
            </p>
          </div>
          <Link to="/cars" className="group">
            <button className="text-[11px] uppercase tracking-[0.3em] font-medium border-b border-foreground/20 hover:border-foreground transition-all pb-1 mb-2">
              {isRTL ? "استكشف كامل المخزون" : "View Entire Fleet"}
            </button>
          </Link>
        </div>

        {/* Cars Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[400px] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : cars && cars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car, index) => (
              <div
                key={car.id}
                className="stagger-item animate-in fade-in slide-in-from-bottom-10"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              >
                <CarCard car={mapCarToCardData(car)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 rounded-3xl border-2 border-dashed border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="h-20 w-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {isRTL ? "لا توجد سيارات مميزة حالياً" : "No Featured Cars Yet"}
            </h3>
            <p className="text-muted-foreground max-w-xs mx-auto mb-8">
              {isRTL
                ? "نحن بصدد تحديث مجموعتنا المميزة بآخر الموديلات. ترقبوا قريباً!"
                : "We are updating our premium collection with the latest models. Stay tuned!"}
            </p>
            <Link to="/cars">
              <Button variant="outline" size="lg">
                {isRTL ? "تصفح جميع السيارات" : "Browse All Cars"}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCars;
