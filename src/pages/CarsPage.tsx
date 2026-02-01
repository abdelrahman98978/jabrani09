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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-foreground">
              جميع <span className="text-gradient-gold">السيارات</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              تصفح مجموعتنا الواسعة من السيارات
            </p>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-xl border border-border p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن سيارة..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
              </div>

              {/* Brand Filter */}
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="الماركة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الماركات</SelectItem>
                  {brands?.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Fuel Type */}
              <Select value={fuelType} onValueChange={setFuelType}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع الوقود" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="petrol">بنزين</SelectItem>
                  <SelectItem value="diesel">ديزل</SelectItem>
                  <SelectItem value="electric">كهربائي</SelectItem>
                  <SelectItem value="hybrid">هايبرد</SelectItem>
                </SelectContent>
              </Select>

              {/* Price Range */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="نطاق السعر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأسعار</SelectItem>
                  <SelectItem value="0-50000">أقل من 50,000</SelectItem>
                  <SelectItem value="50000-100000">50,000 - 100,000</SelectItem>
                  <SelectItem value="100000-200000">100,000 - 200,000</SelectItem>
                  <SelectItem value="200000-500000">200,000 - 500,000</SelectItem>
                  <SelectItem value="500000-">أكثر من 500,000</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="الترتيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="price_asc">السعر: الأقل أولاً</SelectItem>
                  <SelectItem value="price_desc">السعر: الأعلى أولاً</SelectItem>
                  <SelectItem value="year_desc">الموديل: الأحدث</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end mt-4">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  مسح الفلاتر
                </Button>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center gap-2 mb-6">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              {cars?.length || 0} سيارة
            </span>
          </div>

          {/* Cars Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cars && cars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-3d-entrance">
              {cars.map((car, index) => (
                <div 
                  key={car.id} 
                  style={{ animationDelay: `${index * 0.08}s` }}
                  className="opacity-0 animate-fade-in"
                >
                  <CarCard car={mapCarToCardData(car)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">لا توجد سيارات متطابقة مع البحث</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                مسح الفلاتر
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default CarsPage;
