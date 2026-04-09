import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarCard, { mapCarToCardData } from "@/components/CarCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Loader2, Award, ShieldCheck, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

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
  const { language } = useLanguage();
  const isRTL = language === "ar";

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
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main>
        {/* Heritage Hero */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <motion.div 
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
          >
             <img src="https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80" className="w-full h-full object-cover grayscale" alt="" />
             <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
          </motion.div>
          
          <div className="container relative z-10 text-center space-y-8">
             <motion.div
               initial={{ y: 30, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
               className="space-y-4"
             >
                <div className="flex items-center justify-center gap-4 text-primary">
                   <Award className="h-6 w-6" />
                   <span className="text-[10px] uppercase tracking-[0.8em] font-black">Lineage</span>
                </div>
                <h1 className="text-8xl font-black tracking-tighter uppercase leading-none">
                  The <span className="text-primary">Curated</span> <br /> Heritage
                </h1>
                <p className="text-white/40 text-xl font-light italic max-w-2xl mx-auto">
                   Exploring the world's most prestigious automotive lineages, refined for the modern connoisseur.
                </p>
             </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-6 md:px-12 py-32">
          {isLoading ? (
            <div className="flex justify-center items-center py-40">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : data && data.length > 0 ? (
            <div className="space-y-40">
              {data.map(({ brand, cars }, sectionIndex) => (
                <section 
                  key={brand.id} 
                  className="space-y-16"
                >
                  <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10"
                  >
                    <div className="space-y-4">
                       <div className="flex items-center gap-6">
                          <img src={brand.logo_url} alt={brand.name} className="h-20 w-auto grayscale brightness-200" />
                          <div className="h-10 w-px bg-white/10" />
                          <h2 className="text-6xl font-black tracking-tighter uppercase text-white">{brand.name}</h2>
                       </div>
                       <p className="text-white/40 text-sm tracking-widest uppercase">
                          {cars.length} Masterpieces Available
                       </p>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-12">
                       <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/20">
                          <ShieldCheck className="h-4 w-4 text-primary" /> Verified Excellence
                       </div>
                       <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/20">
                          <Zap className="h-4 w-4 text-primary" /> Performance Ready
                       </div>
                    </div>
                  </motion.div>

                  {cars.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                      {cars.map((car: any, carIndex: number) => (
                        <CarCard key={car.id} car={mapCarToCardData(car)} />
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 bg-white/5 border border-white/5 text-center">
                       <p className="text-white/20 text-[11px] uppercase tracking-[0.5em] font-black">
                         {isRTL ? "لا توجد سيارات متاحة حالياً" : "Collection currently archived"}
                       </p>
                    </div>
                  )}
                </section>
              ))}
            </div>
          ) : (
            <div className="text-center py-40">
               <p className="text-white/20 text-[11px] uppercase tracking-[0.8em] font-black">Repository Empty</p>
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
