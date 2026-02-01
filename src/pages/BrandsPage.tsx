import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BrandCard from "@/components/BrandCard";
import CarCard, { mapCarToCardData } from "@/components/CarCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Loader2 } from "lucide-react";

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

const BrandsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["brands-with-cars"],
    queryFn: async () => {
      const [{ data: brands, error: brandsError }, { data: cars, error: carsError }, { data: promotions, error: promoError }] =
        await Promise.all([
          supabase
            .from("brands")
            .select("*")
            .eq("is_active", true)
            .order("sort_order"),
          supabase
            .from("cars")
            .select("*")
            .eq("status", "available"),
          supabase.from("promotions").select("*"),
        ]);

      if (brandsError) throw brandsError;
      if (carsError) throw carsError;
      if (promoError) throw promoError;

      const now = new Date();
      const activePromos = (promotions as Promotion[] | null)?.filter((p) => {
        if (!p.is_active) return false;
        if (p.start_date && new Date(p.start_date) > now) return false;
        if (p.end_date && new Date(p.end_date) < now) return false;
        return true;
      }) || [];

      const applyPromotions = (brandCars: any[]) => {
        return brandCars.map((car) => {
          if (car.has_discount && !car.original_price) return car;

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

          if (!bestDiscount || !bestPromo) return car;

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

      const carsByBrand = (brands || []).map((brand) => {
        const brandCars = (cars || []).filter((car) => car.brand_id === brand.id);
        return {
          brand,
          cars: applyPromotions(brandCars),
        };
      });

      return carsByBrand;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-foreground">
              الماركات <span className="text-gradient-gold">المتوفرة</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              موزع معتمد لأشهر الماركات العالمية
            </p>
          </div>

          {/* Brands with Cars */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : data && data.length > 0 ? (
            <div className="space-y-12 stagger-3d-entrance">
              {data.map(({ brand, cars }, sectionIndex) => (
                <section 
                  key={brand.id} 
                  className="border border-border rounded-2xl p-6 bg-card/40 hover:shadow-lg transition-all duration-300 opacity-0 animate-fade-in"
                  style={{ animationDelay: `${sectionIndex * 0.15}s` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 brand-logo-float">
                      <BrandCard brand={brand} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {cars.length} سيارة متاحة لهذه الماركة
                    </p>
                  </div>
                  {cars.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cars.map((car: any, carIndex: number) => (
                        <div 
                          key={car.id}
                          className="opacity-0 animate-fade-in"
                          style={{ animationDelay: `${(sectionIndex * 0.15) + (carIndex * 0.08)}s` }}
                        >
                          <CarCard car={mapCarToCardData(car)} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">لا توجد سيارات متاحة حالياً لهذه الماركة</p>
                  )}
                </section>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">لا توجد ماركات متاحة</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default BrandsPage;
