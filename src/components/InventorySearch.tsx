import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Fuel, Calendar, DollarSign, Car, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Slider } from "@/components/ui/slider";

const InventorySearch = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const [keyword, setKeyword] = useState("");
  const [brand, setBrand] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [year, setYear] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data: brands } = useQuery({
    queryKey: ["brands-for-search"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name, name_ar")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear - i);

  const fuelTypes = [
    { value: "petrol", labelAr: "بنزين", labelEn: "Petrol" },
    { value: "diesel", labelAr: "ديزل", labelEn: "Diesel" },
    { value: "electric", labelAr: "كهربائي", labelEn: "Electric" },
    { value: "hybrid", labelAr: "هايبرد", labelEn: "Hybrid" },
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (brand) params.set("brand", brand);
    if (fuelType) params.set("fuel", fuelType);
    if (year) params.set("year", year);
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 1000000) params.set("maxPrice", priceRange[1].toString());

    navigate(`/cars?${params.toString()}`);
  };

  const clearFilters = () => {
    setKeyword("");
    setBrand("");
    setFuelType("");
    setYear("");
    setPriceRange([0, 1000000]);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="wp-inventory-search relative z-20 mb-12">
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isRTL ? "ابحث عن سيارتك المثالية" : "Find Your Perfect Car"}
                  </h3>
                  <p className="text-sm text-white/80">
                    {isRTL ? "اختر من بين مئات السيارات المتاحة" : "Choose from hundreds of available cars"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-white hover:bg-white/20"
              >
                <SlidersHorizontal className="h-4 w-4 me-2" />
                {isRTL ? "فلاتر متقدمة" : "Advanced Filters"}
              </Button>
            </div>
          </div>

          {/* Main Search Bar */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Keyword Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute top-1/2 -translate-y-1/2 start-4 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder={isRTL ? "ابحث بالاسم، الموديل..." : "Search by name, model..."}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="ps-12 h-12 bg-secondary/50 border-border/50"
                  />
                </div>
              </div>

              {/* Brand Select */}
              <div>
                <Select value={brand} onValueChange={setBrand}>
                  <SelectTrigger className="h-12 bg-secondary/50 border-border/50">
                    <Car className="h-4 w-4 me-2 text-muted-foreground" />
                    <SelectValue placeholder={isRTL ? "الماركة" : "Brand"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isRTL ? "جميع الماركات" : "All Brands"}</SelectItem>
                    {brands?.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {isRTL ? b.name_ar : b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fuel Type */}
              <div>
                <Select value={fuelType} onValueChange={setFuelType}>
                  <SelectTrigger className="h-12 bg-secondary/50 border-border/50">
                    <Fuel className="h-4 w-4 me-2 text-muted-foreground" />
                    <SelectValue placeholder={isRTL ? "نوع الوقود" : "Fuel Type"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isRTL ? "جميع الأنواع" : "All Types"}</SelectItem>
                    {fuelTypes.map((fuel) => (
                      <SelectItem key={fuel.value} value={fuel.value}>
                        {isRTL ? fuel.labelAr : fuel.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <div>
                <Button
                  variant="gold"
                  className="w-full h-12 gap-2 text-base font-bold"
                  onClick={handleSearch}
                >
                  <Search className="h-5 w-5" />
                  {isRTL ? "بحث" : "Search"}
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
              <div className="mt-6 pt-6 border-t border-border/50 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Calendar className="h-4 w-4 inline me-2" />
                      {isRTL ? "سنة الصنع" : "Year"}
                    </label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger className="h-11 bg-secondary/50 border-border/50">
                        <SelectValue placeholder={isRTL ? "اختر السنة" : "Select Year"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{isRTL ? "جميع السنوات" : "All Years"}</SelectItem>
                        {years.map((y) => (
                          <SelectItem key={y} value={y.toString()}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <DollarSign className="h-4 w-4 inline me-2" />
                      {isRTL ? "نطاق السعر" : "Price Range"}: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])} {isRTL ? "ر.س" : "SAR"}
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={0}
                      max={1000000}
                      step={10000}
                      className="mt-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>0</span>
                      <span>1,000,000</span>
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex justify-end mt-4">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                    <X className="h-4 w-4 me-2" />
                    {isRTL ? "مسح الفلاتر" : "Clear Filters"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventorySearch;
