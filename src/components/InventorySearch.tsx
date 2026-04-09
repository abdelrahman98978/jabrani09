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
    <div className="relative z-20 -mt-24 mb-32">
      <div className="container mx-auto px-6 md:px-12">
        <div className="bg-surface-low p-12 md:p-16 border-t-[3px] border-primary">
          <div className="flex flex-col gap-16">
            <div className="flex flex-col md:flex-row justify-between items-end gap-12">
              <div className="space-y-4">
                <span className="text-[11px] uppercase font-bold tracking-[0.5em] text-primary">
                  {isRTL ? "محدد السيادة" : "The Sovereign Selector"}
                </span>
                <h3 className="text-4xl md:text-5xl font-light tracking-tighter text-white uppercase">
                  {isRTL ? "ابحث عن" : "Find Your"} <span className="font-bold">{isRTL ? "المحرك المثالي" : "Mastery"}</span>
                </h3>
              </div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-[11px] uppercase tracking-[0.4em] font-bold text-white/40 hover:text-white transition-all flex items-center gap-4 mb-2 group"
              >
                <SlidersHorizontal className="h-4 w-4 group-hover:rotate-180 transition-transform duration-700" />
                {isRTL ? "تخصيص البحث" : "Refine Selection"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
              {/* Keyword Search */}
              <div className="lg:col-span-2">
                <div className="relative group">
                  <Search className="absolute top-1/2 -translate-y-1/2 start-0 h-5 w-5 text-white/20 group-hover:text-primary transition-colors duration-500" />
                  <Input
                    placeholder={isRTL ? "اسم الطراز أو العلامة..." : "MODEL OR SIGNATURE..."}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="ps-10 h-16 bg-transparent border-0 border-b border-white/10 rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all uppercase text-[12px] tracking-[0.3em] font-medium text-white placeholder:text-white/20"
                  />
                </div>
              </div>

              {/* Brand Select */}
              <div className="relative group">
                <Select value={brand} onValueChange={setBrand}>
                  <SelectTrigger className="h-16 bg-transparent border-0 border-b border-white/10 rounded-none px-0 focus:ring-0 focus:border-primary transition-all text-white uppercase text-[12px] tracking-[0.3em] font-medium">
                    <SelectValue placeholder={isRTL ? "العلامة التجارية" : "SIGNATURE"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-white/10 bg-black text-white">
                    <SelectItem value="all" className="uppercase text-[11px] tracking-widest">{isRTL ? "الكل" : "All Signatures"}</SelectItem>
                    {brands?.map((b) => (
                      <SelectItem key={b.id} value={b.id} className="uppercase text-[11px] tracking-widest">
                        {isRTL ? b.name_ar : b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fuel Type */}
              <div className="relative group">
                <Select value={fuelType} onValueChange={setFuelType}>
                  <SelectTrigger className="h-16 bg-transparent border-0 border-b border-white/10 rounded-none px-0 focus:ring-0 focus:border-primary transition-all text-white uppercase text-[12px] tracking-[0.3em] font-medium">
                    <SelectValue placeholder={isRTL ? "مصدر الطاقة" : "ENERGY SOURCE"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-white/10 bg-black text-white">
                    <SelectItem value="all" className="uppercase text-[11px] tracking-widest">{isRTL ? "الجميع" : "All Energy"}</SelectItem>
                    {fuelTypes.map((fuel) => (
                      <SelectItem key={fuel.value} value={fuel.value} className="uppercase text-[11px] tracking-widest">
                        {isRTL ? fuel.labelAr : fuel.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Launch Button */}
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="group relative w-full h-16 bg-white text-black uppercase text-[11px] tracking-[0.5em] font-bold overflow-hidden transition-all duration-700 hover:tracking-[0.7em]"
                >
                  <span className="relative z-10">{isRTL ? "إطلاق البحث" : "Launch"}</span>
                  <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
              <div className="pt-8 border-t border-foreground/5 animate-lux-fade-up">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Year */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                      {isRTL ? "سنة الصنع" : "Production Year"}
                    </label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger className="h-10 bg-transparent border-0 border-b border-foreground/10 rounded-none px-0 focus:ring-0 focus:border-foreground transition-all">
                        <SelectValue placeholder={isRTL ? "اختر السنة" : "SELECT YEAR"} className="uppercase text-[9px] tracking-widest" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-foreground/10">
                        <SelectItem value="all" className="uppercase text-[9px] tracking-widest">{isRTL ? "جميع السنوات" : "All Years"}</SelectItem>
                        {years.map((y) => (
                          <SelectItem key={y} value={y.toString()} className="uppercase text-[9px] tracking-widest">
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                        {isRTL ? "نطاق السعر" : "Price Range"}
                      </label>
                      <span className="text-[10px] font-medium opacity-60">
                        {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])} {isRTL ? "ج.س" : "SDG"}
                      </span>
                    </div>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={0}
                      max={1000000}
                      step={10000}
                      className="mt-6"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex justify-end mt-8">
                  <button
                    onClick={clearFilters}
                    className="text-[9px] uppercase tracking-widest font-bold opacity-30 hover:opacity-100 transition-opacity flex items-center gap-2"
                  >
                    <X className="h-3 w-3" />
                    {isRTL ? "إعادة تعيين" : "Reset Filters"}
                  </button>
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
