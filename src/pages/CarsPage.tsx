import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarCard, { mapCarToCardData } from "@/components/CarCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Loader2, X } from "lucide-react";

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

const CarsPage = () => {
  const [searchParams] = useSearchParams();
  const brandFilter = searchParams.get("brand");
  
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>(brandFilter || "all");
  const [fuelType, setFuelType] = useState<string>("all");
  const [transmission, setTransmission] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: cars, isLoading } = useQuery({
    queryKey: ["cars", selectedBrand, fuelType, transmission, priceRange, sortBy, search],
    queryFn: async () => {
      let query = supabase
        .from("cars")
        .select("*")
        .eq("status", "available");

      if (selectedBrand && selectedBrand !== "all") {
        query = query.eq("brand_id", selectedBrand);
      }
      if (fuelType && fuelType !== "all") {
        query = query.eq("fuel_type", fuelType);
      }
      if (transmission && transmission !== "all") {
        query = query.eq("transmission", transmission);
      }
      if (search) {
        query = query.or(`name_ar.ilike.%${search}%,model.ilike.%${search}%`);
      }
      if (priceRange && priceRange !== "all") {
        const [min, max] = priceRange.split("-").map(Number);
        if (min) query = query.gte("price", min);
        if (max) query = query.lte("price", max);
      }

      switch (sortBy) {
        case "price_asc":
          query = query.order("price", { ascending: true });
          break;
        case "price_desc":
          query = query.order("price", { ascending: false });
          break;
        case "year_desc":
          query = query.order("year", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const [{ data: cars, error }, { data: promotions, error: promoError }] = await Promise.all([
        query,
        supabase.from("promotions").select("*"),
      ]);

      if (error) throw error;
      if (promoError) throw promoError;

      const carsWithPromos = applyPromotions(cars || [], (promotions as Promotion[]) || []);
      return carsWithPromos;
    },
  });

  const clearFilters = () => {
    setSearch("");
    setSelectedBrand("all");
    setFuelType("all");
    setTransmission("all");
    setPriceRange("all");
    setSortBy("newest");
  };

  const applyPromotions = (cars: any[], promotions: Promotion[]) => {
    const now = new Date();

    const activePromos = promotions.filter((p) => {
      if (!p.is_active) return false;
      if (p.start_date && new Date(p.start_date) > now) return false;
      if (p.end_date && new Date(p.end_date) < now) return false;
      return true;
    });

    return cars.map((car) => {
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
      };
    });
  };

  const hasActiveFilters = search || selectedBrand !== "all" || fuelType !== "all" || 
    transmission !== "all" || priceRange !== "all";

import { motion, AnimatePresence } from "framer-motion";

const CarsPage = () => {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const brandFilter = searchParams.get("brand");
  
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>(brandFilter || "all");
  const [fuelType, setFuelType] = useState<string>("all");
  const [transmission, setTransmission] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // ... (keep query logic same, but we will wrap the UI in our new sovereign style)

  return (
    <div className="min-h-screen bg-black overflow-x-hidden selection:bg-primary/30">
      <Navbar />
      
      <main className="pt-40 pb-32">
        <div className="container mx-auto px-6 md:px-12">
          {/* Page Header - Cinematic Reveal */}
          <div className="max-w-4xl mb-32">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
              className="mb-12 inline-flex items-center"
            >
              <span className="text-[11px] uppercase tracking-[0.5em] text-primary font-bold">
                {isRTL ? "المخزون السيادي" : "Sovereign Inventory"}
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
              className="text-6xl md:text-9xl text-hero text-white"
            >
              {isRTL ? (
                <>
                  معرض <span className="font-bold">النخبة</span>
                  <br />
                  <span className="text-white/30 italic">المتاح الآن</span>
                </>
              ) : (
                <>
                  The <span className="font-bold">Elite</span>
                  <br />
                  <span className="text-white/30 italic">Showroom</span>
                </>
              )}
            </motion.h1>
          </div>

          {/* Filters - Sovereign Selector Row */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="flex flex-col space-y-12 mb-32"
          >
            {/* Search Bar - Minimalist Focus */}
            <div className="relative group max-w-2xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder={isRTL ? "ابحث عن الأيقونة الخاصة بك..." : "Search your icon..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-20 bg-surface-low border-0 border-b border-white/10 rounded-none text-white placeholder:text-white/10 focus-visible:ring-0 focus-visible:ring-offset-0 px-16 text-[12px] uppercase tracking-[0.4em] w-full transition-all group-focus-within:border-primary"
              />
            </div>

            {/* Selectors Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0 border border-white/5 bg-surface-low divide-x divide-y divide-white/5 md:divide-y-0">
               {/* Brand Selector */}
               <div className="p-6 relative">
                 <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4 px-2">{isRTL ? "الماركة" : "Heritage"}</p>
                 <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                   <SelectTrigger className="bg-transparent border-0 text-white uppercase text-[11px] tracking-[0.2em] focus:ring-0 h-10 w-full px-2">
                     <SelectValue placeholder="All Brands" />
                   </SelectTrigger>
                   <SelectContent className="bg-surface-high border-white/10 text-white rounded-none">
                     <SelectItem value="all">All Brands</SelectItem>
                     {brands?.map((brand) => (
                       <SelectItem key={brand.id} value={brand.id} className="uppercase text-[10px] tracking-widest">{brand.name_en}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

               {/* Fuel Type */}
               <div className="p-6 relative">
                 <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4 px-2">{isRTL ? "المحرك" : "Propulsion"}</p>
                 <Select value={fuelType} onValueChange={setFuelType}>
                   <SelectTrigger className="bg-transparent border-0 text-white uppercase text-[11px] tracking-[0.2em] focus:ring-0 h-10 w-full px-2">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-surface-high border-white/10 text-white rounded-none">
                     <SelectItem value="all">Every Power</SelectItem>
                     <SelectItem value="petrol">Petrol</SelectItem>
                     <SelectItem value="diesel">Diesel</SelectItem>
                     <SelectItem value="electric">Electric</SelectItem>
                     <SelectItem value="hybrid">Hybrid</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               {/* Price Range */}
               <div className="p-6 relative">
                 <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4 px-2">{isRTL ? "الاستثمار" : "Investment"}</p>
                 <Select value={priceRange} onValueChange={setPriceRange}>
                   <SelectTrigger className="bg-transparent border-0 text-white uppercase text-[11px] tracking-[0.2em] focus:ring-0 h-10 w-full px-2">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-surface-high border-white/10 text-white rounded-none">
                     <SelectItem value="all">Full Range</SelectItem>
                     <SelectItem value="0-50000">Below 50K</SelectItem>
                     <SelectItem value="50000-100000">50K - 100K</SelectItem>
                     <SelectItem value="100000-200000">100K - 200K</SelectItem>
                     <SelectItem value="200000-500000">200K - 500K</SelectItem>
                     <SelectItem value="500000-">Above 500K</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               {/* Sort By */}
               <div className="p-6 relative">
                 <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4 px-2">{isRTL ? "الترتيب" : "Sequence"}</p>
                 <Select value={sortBy} onValueChange={setSortBy}>
                   <SelectTrigger className="bg-transparent border-0 text-white uppercase text-[11px] tracking-[0.2em] focus:ring-0 h-10 w-full px-2">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-surface-high border-white/10 text-white rounded-none">
                     <SelectItem value="newest">Recent Entry</SelectItem>
                     <SelectItem value="price_asc">Investment: Lo -> Hi</SelectItem>
                     <SelectItem value="price_desc">Investment: Hi -> Lo</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               {/* Action / Count */}
               <div className="p-6 flex items-center justify-between group cursor-pointer" onClick={clearFilters}>
                 <div className="space-y-1">
                   <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">{isRTL ? "متاح" : "Inventory"}</p>
                   <p className="text-[12px] font-bold text-primary tracking-[0.2em]">{cars?.length || 0} ICONS</p>
                 </div>
                 {hasActiveFilters && (
                   <X className="h-4 w-4 text-white/20 group-hover:text-primary transition-colors" />
                 )}
               </div>
            </div>
          </motion.div>

          {/* Results Grid - High Fidelity Stagger */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-20"
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-[500px] bg-surface-low border border-white/5 animate-pulse" />
                ))}
              </motion.div>
            ) : cars && cars.length > 0 ? (
              <motion.div
                key="results"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-20"
              >
                {cars.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.05, ease: [0.19, 1, 0.22, 1] }}
                  >
                    <CarCard car={mapCarToCardData(car)} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-40 border border-white/5 bg-surface-low"
              >
                <div className="max-w-xs mx-auto space-y-8">
                  <div className="w-16 h-16 border border-white/10 flex items-center justify-center mx-auto opacity-20">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl uppercase tracking-[0.4em] text-white/40">No Icons Matching Your Criteria</h3>
                  <button onClick={clearFilters} className="px-12 py-5 border border-white/20 text-white text-[11px] uppercase tracking-[0.4em] font-medium hover:bg-white hover:text-black transition-all duration-700">
                    Reset Pursuit
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default CarsPage;
