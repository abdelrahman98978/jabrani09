import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Car, 
  Building2, 
  FileText, 
  ArrowRight, 
  Command, 
  X, 
  History, 
  TrendingUp, 
  Archive,
  ArrowUpRight,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const pages = [
  { path: "/", label: { ar: "الرئيسية", en: "Terminal Index" }, icon: Database },
  { path: "/cars", label: { ar: "السيارات", en: "Inventory Archive" }, icon: Car },
  { path: "/brands", label: { ar: "الماركات", en: "Institutional Partners" }, icon: Building2 },
  { path: "/about", label: { ar: "من نحن", en: "Institutional Heritage" }, icon: Archive },
  { path: "/contact", label: { ar: "اتصل بنا", en: "Concierge Protocol" }, icon: FileText },
  { path: "/faq", label: { ar: "الأسئلة الشائعة", en: "Knowledge Base" }, icon: FileText },
];

const GlobalSearch = ({ open, onOpenChange }: GlobalSearchProps) => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { data: settings } = useSettings();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: cars, isLoading: carsLoading } = useQuery({
    queryKey: ["global-search-cars", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const { data } = await supabase
        .from("cars")
        .select("id, name_ar, name, model, year, main_image, price")
        .or(`name_ar.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`)
        .limit(4);
      return data || [];
    },
    enabled: searchTerm.length >= 2,
  });

  const { data: brands, isLoading: brandsLoading } = useQuery({
    queryKey: ["global-search-brands", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const { data } = await supabase
        .from("brands")
        .select("id, name_ar, name, logo_url")
        .or(`name_ar.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
        .eq("is_active", true)
        .limit(4);
      return data || [];
    },
    enabled: searchTerm.length >= 2,
  });

  const filteredPages = pages.filter(page => {
    if (!searchTerm) return true;
    const label = page.label[isRTL ? "ar" : "en"];
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const allResults = [
    ...filteredPages.map(p => ({ type: "page" as const, ...p })),
    ...(cars?.map(c => ({ type: "car" as const, ...c })) || []),
    ...(brands?.map(b => ({ type: "brand" as const, ...b })) || []),
  ];

  const handleSelect = useCallback((result: typeof allResults[0]) => {
    if (result.type === "page") {
      navigate(result.path);
    } else if (result.type === "car") {
      navigate(`/cars/${result.id}`);
    } else if (result.type === "brand") {
      navigate(`/brands?brand=${result.id}`);
    }
    onOpenChange(false);
    setSearchTerm("");
  }, [navigate, onOpenChange]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat(isRTL ? "ar-SD" : "en-US", {
      maximumFractionDigits: 0,
    }).format(price);
    const symbol = (settings as any)?.currency_symbol || (isRTL ? "ج.س" : "SDG");
    return `${formatted} ${symbol}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[100vw] h-screen p-0 m-0 border-none bg-black/95 backdrop-blur-3xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 transition-all duration-700"
      >
        <DialogTitle className="sr-only">
          {isRTL ? "البحث السيادي" : "Sovereign Search Engine"}
        </DialogTitle>

        {/* Global Exit */}
        <button 
           onClick={() => onOpenChange(false)}
           className="absolute top-12 right-12 z-50 p-6 border border-white/10 rounded-full hover:bg-white/5 transition-all text-white/40 hover:text-white"
        >
           <X className="h-6 w-6" />
        </button>

        <div className="container mx-auto px-6 md:px-24 h-full flex flex-col pt-40">
           {/* Terminal Search Input */}
           <div className="relative mb-24 max-w-7xl mx-auto w-full group">
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex items-center gap-12"
              >
                  <Search className="h-16 w-16 text-primary/40 group-focus-within:text-primary transition-colors duration-700" />
                  <Input
                    ref={inputRef}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={isRTL ? "بحث في الأرشيف..." : "QUERY DATABASE..."}
                    className="border-none bg-transparent text-5xl md:text-[8rem] h-auto p-0 text-white font-black tracking-tighter placeholder:text-white/5 focus-visible:ring-0 uppercase truncate"
                    autoFocus
                  />
              </motion.div>
              <div className="h-[2px] bg-white/5 mt-12 overflow-hidden relative">
                 <motion.div 
                    className="absolute inset-y-0 left-0 bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: searchTerm.length > 0 ? "100%" : "0%" }}
                    transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
                 />
              </div>
           </div>

           {/* Results Matrix */}
           <div className="flex-1 overflow-y-auto pb-40 scrollbar-hide">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
                 
                 {/* Quick Access / Pages */}
                 <div className="lg:col-span-3 space-y-12">
                   <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.8em] text-white/20 font-black mb-8 border-l-2 border-primary pl-4">
                      {isRTL ? "البروتوكولات" : "PROTOCOLS"}
                   </div>
                   <div className="space-y-4">
                      {filteredPages.map((page, idx) => (
                        <motion.button
                          key={page.path}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => handleSelect({ type: "page", ...page })}
                          className="w-full text-start group flex items-center justify-between p-6 bg-surface-low border border-white/5 hover:border-primary/40 transition-all duration-700"
                        >
                          <div className="flex items-center gap-6">
                            <page.icon className="h-4 w-4 text-white/20 group-hover:text-primary transition-colors" />
                            <span className="text-[11px] uppercase tracking-[0.4em] text-white/40 group-hover:text-white transition-colors">
                               {page.label[isRTL ? "ar" : "en"]}
                            </span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-700" />
                        </motion.button>
                      ))}
                   </div>
                 </div>

                 {/* Major Findings / Inventory */}
                 <div className="lg:col-span-9 space-y-12">
                   <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.8em] text-white/20 font-black">
                        {isRTL ? "الأرشيف" : "INVENTORY ARCHIVE"}
                      </div>
                      {searchTerm.length < 2 && (
                         <div className="flex items-center gap-4 text-[9px] uppercase tracking-[0.4em] text-white/10 font-black italic">
                            READY FOR QUERY INPUT
                         </div>
                      )}
                   </div>

                   {searchTerm.length >= 2 && !carsLoading && cars?.length === 0 && brands?.length === 0 ? (
                      <div className="py-24 text-center border-t border-white/5">
                         <div className="text-white/5 font-black text-9xl tracking-[0.2em] mb-12 select-none uppercase">NO MATCH</div>
                         <p className="text-[11px] uppercase tracking-[0.6em] text-white/20">Zero institutional records found for your query.</p>
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                         {cars?.map((car, idx) => (
                            <motion.button
                              key={car.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 + idx * 0.1 }}
                              onClick={() => handleSelect({ type: "car", ...car })}
                              className="group relative flex gap-8 p-10 bg-surface-low border border-white/5 hover:border-primary/20 transition-all duration-700 overflow-hidden"
                            >
                               <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-1000" />
                               <div className="w-32 h-32 rounded bg-black overflow-hidden relative shrink-0 border border-white/5">
                                  <img 
                                    src={car.main_image || "/placeholder.svg"} 
                                    alt={car.name} 
                                    className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                                  />
                               </div>
                               <div className="flex-1 text-start space-y-4 pt-4">
                                  <div className="flex items-center gap-4">
                                     <span className="text-[9px] uppercase tracking-[0.4em] text-primary font-black">Record #{car.id.slice(0, 4)}</span>
                                     <div className="h-px flex-1 bg-white/5" />
                                  </div>
                                  <h4 className="text-2xl font-black uppercase text-white group-hover:text-primary transition-colors tracking-tighter">
                                     {isRTL ? car.name_ar : car.name} {car.model}
                                  </h4>
                                  <div className="flex items-center justify-between">
                                     <span className="text-[10px] uppercase tracking-[0.4em] text-white/20">{car.year} Portfolio</span>
                                     <span className="text-xs font-black text-primary">{formatPrice(car.price)}</span>
                                  </div>
                               </div>
                               <ArrowUpRight className="absolute top-6 right-6 h-4 w-4 text-white/10 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-700" />
                            </motion.button>
                         ))}

                         {brands?.map((brand, idx) => (
                            <motion.button
                              key={brand.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 + idx * 0.1 }}
                              onClick={() => handleSelect({ type: "brand", ...brand })}
                              className="group relative flex items-center gap-8 p-10 bg-surface-low border border-white/5 hover:border-primary/20 transition-all duration-700 overflow-hidden"
                            >
                               <div className="w-20 h-20 flex items-center justify-center bg-black border border-white/5 p-4">
                                  <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                               </div>
                               <div className="flex-1 text-start space-y-2">
                                  <span className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-black">Authorized Partner</span>
                                  <h4 className="text-xl font-black uppercase text-white tracking-tighter group-hover:text-primary transition-colors">{isRTL ? brand.name_ar : brand.name}</h4>
                               </div>
                               <ArrowUpRight className="h-4 w-4 text-white/10 group-hover:text-primary transition-all duration-700" />
                            </motion.button>
                         ))}
                      </div>
                   )}
                 </div>
              </div>
           </div>

           {/* Terminal Info Footer */}
           <div className="border-t border-white/5 py-12 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex items-center gap-12">
                 <div className="flex items-center gap-4">
                    <kbd className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] font-black text-white/40">ESC</kbd>
                    <span className="text-[10px] uppercase tracking-[0.4em] font-black text-white/10">CLOSE TERMINAL</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <kbd className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] font-black text-white/40">↵</kbd>
                    <span className="text-[10px] uppercase tracking-[0.4em] font-black text-white/10">EXECUTE QUERY</span>
                 </div>
              </div>
              <div className="flex items-center gap-8">
                 <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <span className="text-[9px] uppercase tracking-[0.4em] font-black text-white/20">System Online</span>
                 </div>
                 <span className="text-[9px] uppercase tracking-[0.4em] font-black text-white/10">v2.0.4 SOVEREIGN</span>
              </div>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearch;
