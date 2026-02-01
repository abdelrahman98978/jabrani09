import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CarCard, { mapCarToCardData } from "./CarCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

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
    if (car.has_discount && !car.original_price) return car; // خصم يدوي

    let bestDiscount = 0;
    let bestPromo: Promotion | null = null;

    for (const promo of activePromos) {
      const matchesCar =
        (promo.target_cars && promo.target_cars.includes(car.id)) ||
        (promo.target_brands && promo.target_brands.includes(car.brand_id)) ||
        (!promo.target_cars && !promo.target_brands);

      if (!matchesCar) continue;

      if (promo.min_price && car.price < promo.min_price) continue;
      if (promo.max_price && car.price > promo.max_price) continue;

      if (!promo.discount_type || !promo.discount_value) continue;

      let discountedPrice = car.price;
      if (promo.discount_type === "percentage") {
        discountedPrice = car.price * (1 - promo.discount_value / 100);
      } else {
        discountedPrice = car.price - promo.discount_value;
      }

      discountedPrice = Math.max(discountedPrice, 0);
      const discountAmount = car.price - discountedPrice;

      if (discountAmount > bestDiscount) {
        bestDiscount = discountAmount;
        bestPromo = promo;
      }
    }

      if (!bestPromo) return car;

      const discountedPrice = car.price - bestDiscount;
      const percent = Math.round((bestDiscount / car.price) * 100);

      return {
        ...car,
        original_price: car.original_price ?? car.price,
        price: discountedPrice,
        has_discount: true,
        promotion_percent: percent,
        promotion_type: bestPromo.discount_type || undefined,
      };
    });
};

const FeaturedCars = () => {
  const { data: cars, isLoading } = useQuery({
    queryKey: ["featured-cars"],
    queryFn: async () => {
      const [{ data: cars, error }, { data: promotions, error: promoError }] = await Promise.all([
        supabase
          .from("cars")
          .select("*")
          .eq("is_featured", true)
          .eq("status", "available")
          .order("created_at", { ascending: false })
          .limit(12),
        supabase.from("promotions").select("*"),
      ]);

      if (error) throw error;
      if (promoError) throw promoError;

      const carsWithPromos = applyPromotions(cars || [], (promotions as Promotion[]) || []);

      // إظهار السيارات التي عليها عروض أو خصومات فقط
      const discountedCars = carsWithPromos.filter(
        (car: any) => car.has_discount || (car.promotion_percent && car.promotion_percent > 0)
      );

      return discountedCars;
    },
  });

  return (
    <section className="py-20 bg-gradient-to-b from-background to-card/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 animate-fade-in">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">
              السيارات <span className="text-gradient-gold">المميزة</span>
            </h2>
            <p className="text-muted-foreground mt-2">اكتشف أفضل العروض المتاحة لدينا</p>
          </div>
          <Link to="/cars">
            <Button variant="outline" className="gap-2 hover-lift-3d">
              عرض الكل
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Cars Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : cars && cars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-3d-entrance">
            {cars.map((car, index) => (
              <div key={car.id} style={{ animationDelay: `${index * 0.08}s` }}>
                <CarCard car={mapCarToCardData(car)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">لا توجد سيارات مميزة حالياً</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCars;
