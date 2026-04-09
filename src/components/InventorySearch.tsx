import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Fuel, Calendar, DollarSign, Car, SlidersHorizontal, X, ArrowRight, Zap, Trophy, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";

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
    if (brand && brand !== "all") params.set("brand", brand);
    if (fuelType && fuelType !== "all") params.set("fuel", fuelType);
    if (year && year !== "all") params.set("year", year);
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
    return new Intl.NumberFormat(isRTL ? "ar-SD" : "en-US", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="relative z-20 -mt-24 mb-48">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
          className="bg-surface-low p-12 md:p-20 border border-white/5 relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
        >
          {/* Subtle Ambient Depth */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(196,164,132,0.03)_0%,transparent_50%)]" />

          <div className="flex flex-col gap-20">
            {/* Search Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-12 border-b border-white/5 pb-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <ShieldCheck className="h-4 w-4 text-primary opacity-40" />
                   <span className="text-[11px] uppercase font-black tracking-[0.8em] text-primary">
                    {isRTL ? "محرر البحث السيادي" : "Sovereign Search Engine"}
                  </span>
                </div>
                <h3 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-none">
                  {isRTL ? "قم بتحرير" : "Curate Your"} <span className="text-white/20 italic font-light">{isRTL ? "رحلتك" : "Fleet"}</span>
                </h3>
              </div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-[11px] uppercase tracking-[0.6em] font-black text-white/30 hover:text-white transition-all flex items-center gap-6 mb-2 group/btn"
              >
                <div className={`p-3 border border-white/5 rounded-full transition-all duration-700 ${showAdvanced ? 'bg-primary border-primary rotate-180' : 'group-hover/btn:border-primary'}`}>
                   <SlidersHorizontal className={`h-4 w-4 ${showAdvanced ? 'text-black' : 'text-white/40 group-hover/btn:text-primary transition-colors'}`} />
                </div>
                {isRTL ? "تخصيص السجلات" : "Filter Records"}
              </button>
            </div>

            {/* Main Search Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16">
              {/* Keyword Search */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                   <label className="text-[10px] uppercase tracking-[0.4em] text-white/10 font-black block">Keyword Analysis</label>
                   <div className="relative group/input">
                      <Search className="absolute top-1/2 -translate-y-1/2 left-0 h-5 w-5 text-white/10 group-focus-within/input:text-primary transition-colors duration-500" />
                      <Input
                        placeholder={isRTL ? "اسم الطراز أو العلامة..." : "MODEL SELECTION..."}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="ps-12 h-20 bg-transparent border-0 border-b border-white/5 rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all uppercase text-[13px] tracking-[0.4em] font-black text-white placeholder:text-white/5"
                      />
                   </div>
                </div>
              </div>

              {/* Brand Select */}
              <div className="space-y-4">
                 <label className="text-[10px] uppercase tracking-[0.4em] text-white/10 font-black block">Manufacturer</label>
                 <Select value={brand} onValueChange={setBrand}>
                   <SelectTrigger className="h-20 bg-transparent border-0 border-b border-white/5 rounded-none px-0 focus:ring-0 focus:border-primary transition-all text-white uppercase text-[12px] tracking-[0.4em] font-black">
                     <SelectValue placeholder={isRTL ? "العلامة السيادية" : "SIGNATURE"} />
                   </SelectTrigger>
                   <SelectContent className="rounded-none border-white/10 bg-black text-white shadow-2xl">
                     <SelectItem value="all" className="uppercase text-[11px] tracking-widest">{isRTL ? "الكل" : "All Signatures"}</SelectItem>
                     {brands?.map((b) => (
                       <SelectItem key={b.id} value={b.id} className="uppercase text-[11px] tracking-widest font-bold">
                         {isRTL ? b.name_ar : b.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>

              {/* Fuel Type */}
              <div className="space-y-4">
                 <label className="text-[10px] uppercase tracking-[0.4em] text-white/10 font-black block">Propulsion</label>
                 <Select value={fuelType} onValueChange={setFuelType}>
                   <SelectTrigger className="h-20 bg-transparent border-0 border-b border-white/5 rounded-none px-0 focus:ring-0 focus:border-primary transition-all text-white uppercase text-[12px] tracking-[0.4em] font-black">
                     <SelectValue placeholder={isRTL ? "نظام الطاقة" : "ENERGY"} />
                   </SelectTrigger>
                   <SelectContent className="rounded-none border-white/10 bg-black text-white shadow-2xl">
                     <SelectItem value="all" className="uppercase text-[11px] tracking-widest">{isRTL ? "التحويل الكامل" : "All Propulsion"}</SelectItem>
                     {fuelTypes.map((fuel) => (
                       <SelectItem key={fuel.value} value={fuel.value} className="uppercase text-[11px] tracking-widest font-bold">
                         {isRTL ? fuel.labelAr : fuel.labelEn}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>

              {/* Execution Button */}
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="group relative w-full h-20 bg-white text-black uppercase text-[12px] tracking-[0.8em] font-black overflow-hidden transition-all duration-1000 hover:tracking-[1em] hover:bg-primary shadow-xl"
                >
                  <span className="relative z-10 flex items-center justify-center gap-4">
                    {isRTL ? "تنفيذ" : "Launch"}
                    <ArrowRight className="h-4 w-4 -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                  </span>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10 group-hover:bg-black/20" />
                </button>
              </div>
            </div>

            {/* Advanced Filters Drawer */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pt-20 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
                      {/* Year Selection */}
                      <div className="space-y-8">
                        <div className="flex items-center gap-4">
                           <Calendar className="h-4 w-4 text-primary/40" />
                           <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">
                            {isRTL ? "سنة الإصدار" : "Era of Release"}
                           </label>
                        </div>
                        <Select value={year} onValueChange={setYear}>
                          <SelectTrigger className="h-16 bg-transparent border-0 border-b border-white/5 rounded-none px-0 focus:ring-0 focus:border-primary transition-all text-white font-black uppercase tracking-widest">
                            <SelectValue placeholder={isRTL ? "اختر الحقبة" : "CHOOSE ERA"} />
                          </SelectTrigger>
                          <SelectContent className="rounded-none border-white/10 bg-black text-white shadow-2xl">
                            <SelectItem value="all" className="uppercase text-[11px] tracking-widest font-black">{isRTL ? "جميع الحقب" : "All Eras"}</SelectItem>
                            {years.map((y) => (
                              <SelectItem key={y} value={y.toString()} className="uppercase text-[11px] tracking-widest font-black">
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Financial Scope */}
                      <div className="md:col-span-2 space-y-8">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                             <Trophy className="h-4 w-4 text-primary/40" />
                             <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">
                              {isRTL ? "النطاق المالي" : "Financial Sphere"}
                             </label>
                          </div>
                          <span className="text-[13px] font-black text-primary tracking-widest tabular-nums italic">
                            {formatPrice(priceRange[0])} — {formatPrice(priceRange[1])} <span className="opacity-40">{isRTL ? "ج.س" : "SDG"}</span>
                          </span>
                        </div>
                        <div className="px-2 pt-4">
                           <Slider
                             value={priceRange}
                             onValueChange={setPriceRange}
                             min={0}
                             max={1000000}
                             step={25000}
                             className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_.relative]:bg-white/5"
                           />
                        </div>
                      </div>
                    </div>

                    {/* Controls Footer */}
                    <div className="flex justify-between items-center mt-20 pt-10 border-t border-white/5">
                       <div className="flex items-center gap-6 text-[9px] uppercase tracking-[0.3em] text-white/10 italic">
                          <Zap className="h-3 w-3" />
                          Real-time Index Analysis
                       </div>
                       <button
                         onClick={clearFilters}
                         className="text-[10px] uppercase tracking-[0.5em] font-black text-white/20 hover:text-white transition-all flex items-center gap-4 group/reset"
                       >
                         <X className="h-3 w-3 group-hover:rotate-90 transition-transform duration-500" />
                         {isRTL ? "تصفير المدي" : "Purge Selection"}
                       </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InventorySearch;
