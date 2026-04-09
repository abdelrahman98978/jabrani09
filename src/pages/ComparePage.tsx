import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCompare } from "@/contexts/CompareContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Trash2, ArrowRight, ArrowLeft, GitCompare, Car, Calendar, Fuel, Gauge, Palette, Settings, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ComparePage = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { data: settings } = useSettings();

  const { data: cars, isLoading } = useQuery({
    queryKey: ["compare-cars-full", compareItems],
    queryFn: async () => {
      if (compareItems.length === 0) return [];
      const { data } = await supabase
        .from("cars")
        .select("*, brands(name, name_ar)")
        .in("id", compareItems);
      return data || [];
    },
    enabled: compareItems.length > 0,
  });

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat(isRTL ? "ar-SD" : "en-US", {
      maximumFractionDigits: 0,
    }).format(price);
    const symbol = (settings as any)?.currency_symbol || (isRTL ? "ج.س" : "SDG");
    return `${formatted} ${symbol}`;
  };

  const fuelTypeLabels: any = {
    ar: { petrol: "بنزين", diesel: "ديزل", electric: "كهربائي", hybrid: "هايبرد" },
    en: { petrol: "Petrol", diesel: "Diesel", electric: "Electric", hybrid: "Hybrid" }
  };

  const transmissionLabels: any = {
    ar: { automatic: "أوتوماتيك", manual: "عادي" },
    en: { automatic: "Automatic", manual: "Manual" }
  };

  const specs = [
    { key: "price", label: isRTL ? "السعر الاستثماري" : "Investment Value", icon: ShieldCheck, format: (v: number) => formatPrice(v) },
    { key: "year", label: isRTL ? "سنة الإصدار" : "Temporal Release", icon: Calendar },
    { key: "mileage", label: isRTL ? "المسافة المقطوعة" : "Engagement Distance", icon: Gauge, format: (v: number) => `${v?.toLocaleString()} ${isRTL ? "كم" : "KM"}` },
    { key: "fuel_type", label: isRTL ? "منظومة الطاقة" : "Propulsion System", icon: Fuel, format: (v: string) => fuelTypeLabels[language]?.[v] || v },
    { key: "transmission", label: isRTL ? "ناقل الحركة" : "Transmission Matrix", icon: Settings, format: (v: string) => transmissionLabels[language]?.[v] || v },
    { key: "engine_size", label: isRTL ? "السعة الحركية" : "Kinetic Volume", icon: Zap },
    { key: "color", label: isRTL ? "السمة اللونية" : "Chromatic Identity", icon: Palette, format: (v: string, car: any) => isRTL ? car.color_ar || v : v },
  ];

  const getBestValue = (key: string) => {
    if (!cars || cars.length === 0) return null;
    if (key === "price") return Math.min(...cars.map((c: any) => c.price || Infinity));
    if (key === "year") return Math.max(...cars.map((c: any) => c.year || 0));
    if (key === "mileage") return Math.min(...cars.map((c: any) => c.mileage || Infinity));
    return null;
  };

  const isBestValue = (key: string, value: any) => {
    const best = getBestValue(key);
    if (best === null) return false;
    return value === best;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12">
          {/* Sovereign Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24 border-b border-white/5 pb-10"
          >
            <div className="space-y-4">
               <div className="flex items-center gap-4 text-primary">
                  <GitCompare className="h-6 w-6" />
                  <span className="text-[10px] uppercase tracking-[0.8em] font-black">Matrix Analysis</span>
               </div>
               <h1 className="text-7xl font-black tracking-tighter uppercase leading-none">
                 The <span className="text-primary">Comparative</span> <br /> Ledger
               </h1>
            </div>
            {compareItems.length > 0 && (
              <button 
                onClick={clearCompare} 
                className="text-[10px] uppercase tracking-[0.4em] text-white/20 hover:text-destructive transition-colors flex items-center gap-3 font-black"
              >
                <Trash2 className="h-4 w-4" />
                {isRTL ? "تطهير السجل" : "Purge Matrix"}
              </button>
            )}
          </motion.div>

          {compareItems.length === 0 ? (
            <div className="py-40 border border-white/5 bg-surface-low text-center space-y-8">
              <GitCompare className="h-16 w-16 mx-auto text-white/5" />
              <div className="space-y-2">
                 <h2 className="text-2xl font-bold tracking-tighter uppercase">{isRTL ? "المصفوفة فارغة" : "Matrix Void"}</h2>
                 <p className="text-white/40 text-[11px] uppercase tracking-[0.4em]">{isRTL ? "يرجى إضافة سيارات للتحليل" : "Select masterpieces for deep analysis"}</p>
              </div>
              <Link to="/cars" className="inline-block px-12 py-5 bg-primary text-black text-[11px] font-black uppercase tracking-[0.5em] hover:bg-white transition-all duration-700">
                 {isRTL ? "تصفح الأسطول" : "Browse Fleet"}
              </Link>
            </div>
          ) : compareItems.length === 1 ? (
            <div className="py-40 border border-white/5 bg-surface-low text-center space-y-8">
              <h2 className="text-2xl font-bold tracking-tighter uppercase">{isRTL ? "نقص في البيانات" : "Incomplete Dataset"}</h2>
              <p className="text-white/40 text-[11px] uppercase tracking-[0.4em]">{isRTL ? "تحتاج سيارتين للبدء" : "Require at least 2 entities for valid comparison"}</p>
              <Link to="/cars" className="inline-block px-12 py-5 border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.5em] hover:bg-white/5 transition-all">
                 {isRTL ? "إضافة عنصر" : "Add Entity"}
              </Link>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-40">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="p-8 text-start bg-surface-low border border-white/5 text-[10px] uppercase tracking-[0.4em] text-white/20 font-black min-w-[200px]">
                      {isRTL ? "المعاملات" : "Parameters"}
                    </th>
                    {cars?.map((car: any) => (
                      <th key={car.id} className="p-0 border-y border-r border-white/5 min-w-[300px] relative group">
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <img
                            src={car.main_image || "/placeholder.svg"}
                            alt={isRTL ? car.name_ar : car.name}
                            className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                          <button
                            onClick={() => removeFromCompare(car.id)}
                            className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white/40 hover:text-destructive p-2 border border-white/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="p-6 bg-surface-low text-start">
                           <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black mb-1">
                              {car.brands ? (isRTL ? car.brands.name_ar : car.brands.name) : car.model}
                           </p>
                           <h3 className="text-xl font-bold tracking-tighter uppercase">{isRTL ? car.name_ar : car.name}</h3>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {specs.map((spec) => (
                    <tr key={spec.key} className="group">
                      <td className="p-8 bg-surface-low border-x border-b border-white/5 group-hover:bg-black transition-colors">
                        <div className="flex items-center gap-4">
                          {spec.icon && <spec.icon className="h-4 w-4 text-primary" />}
                          <span className="text-[11px] uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">{spec.label}</span>
                        </div>
                      </td>
                      {cars?.map((car) => {
                        const value = (car as Record<string, unknown>)[spec.key];
                        const displayValue = spec.format ? spec.format(value as never, car) : value;
                        const isBest = isBestValue(spec.key, value);

                        return (
                          <td key={car.id} className={`p-8 border-r border-b border-white/5 text-center transition-all ${isBest ? "bg-primary/5" : "bg-black"}`}>
                            <span className={`text-lg tracking-tight ${isBest ? "text-primary font-bold" : "text-white/60"}`}>
                              {(displayValue as React.ReactNode) || "—"}
                            </span>
                            {isBest && (
                               <div className="mt-2 text-[8px] uppercase tracking-[0.4em] text-primary font-black">
                                  {spec.key === "price" ? (isRTL ? "أفضل قيمة" : "Apex Value") : (isRTL ? "الأمثل" : "Optimum")}
                               </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
);

export default ComparePage;
