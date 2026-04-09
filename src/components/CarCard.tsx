import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Fuel, Gauge, Calendar, ShoppingCart, Info, Activity, ShieldCheck, Zap, ArrowUpRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import CompareButton from "@/components/CompareButton";
import WishlistButton from "@/components/WishlistButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export interface CarCardData {
  id: string;
  name: string;
  name_ar: string;
  model: string;
  year: number;
  price: number;
  original_price?: number;
  main_image?: string;
  fuel_type: string;
  transmission: string;
  mileage: number;
  is_new: boolean;
  has_discount: boolean;
  views_count: number;
  promotion_percent?: number;
}

interface CarCardProps {
  car: CarCardData;
}

export const mapCarToCardData = (car: any): CarCardData => ({
  id: car.id,
  name: car.name,
  name_ar: car.name_ar,
  model: car.model,
  year: car.year,
  price: Number(car.price) || 0,
  original_price: car.original_price ?? undefined,
  main_image: car.main_image ?? undefined,
  fuel_type: car.fuel_type || "petrol",
  transmission: car.transmission || "automatic",
  mileage: Number(car.mileage) || 0,
  is_new: !!car.is_new,
  has_discount: !!car.has_discount,
  views_count: Number(car.views_count) || 0,
  promotion_percent: car.promotion_percent,
});

const CarCard = ({ car }: CarCardProps) => {
  const { addToCart } = useCart();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { data: settings } = useSettings();

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat(isRTL ? "ar-SD" : "en-US", {
      maximumFractionDigits: 0,
    }).format(price);
    const symbol = (settings as any)?.currency_symbol || (isRTL ? "ج.س" : "SDG");
    return `${formatted} ${symbol}`;
  };

  const fuelTypeLabels: any = {
    ar: { petrol: "بنزين", diesel: "ديزل", electric: "كهربائي", hybrid: "هايبريد" },
    en: { petrol: "Petrol", diesel: "Diesel", electric: "Electric", hybrid: "Hybrid" }
  };

  const transmissionLabels: any = {
    ar: { automatic: "أوتوماتيك", manual: "عادي" },
    en: { automatic: "Automatic", manual: "Manual" }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(car.id);
  };

  const carName = isRTL ? car.name_ar : car.name;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group relative h-full flex flex-col bg-black border border-white/5 hover:border-primary/30 transition-all duration-1000 overflow-hidden shadow-2xl"
      >
        {/* Media Block with Ken Burns */}
        <Link to={`/cars/${car.id}`} className="block relative aspect-[14/9] overflow-hidden">
          <motion.img
            src={car.main_image || "/placeholder.svg"}
            alt={carName}
            animate={{ 
              scale: isHovered ? 1.15 : 1,
              x: isHovered ? -10 : 0
            }}
            transition={{ duration: 4, ease: "linear" }}
            className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-1000" />
          
          {/* Branded Status Protocol */}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            {car.is_new && (
              <div className="px-3 py-1 bg-primary text-black text-[9px] font-black tracking-[0.3em] flex items-center gap-2">
                 <ShieldCheck className="h-3 w-3" />
                 NEW_ENTRY
              </div>
            )}
            {car.has_discount && (
              <div className="px-3 py-1 bg-white text-black text-[9px] font-black tracking-[0.3em] flex items-center gap-2">
                 <Zap className="h-3 w-3 fill-current" />
                 PRIORITY_OFFER
              </div>
            )}
          </div>

          {/* Rapid Tactical Interface */}
          <div className="absolute top-6 right-6 flex flex-col gap-3 translate-x-16 group-hover:translate-x-0 transition-transform duration-700 delay-75">
             <WishlistButton carId={car.id} variant="icon" />
             <CompareButton carId={car.id} variant="icon" />
             <button 
               onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewOpen(true); }}
               className="w-12 h-12 bg-black/40 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all duration-500"
             >
                <Info className="h-4 w-4" />
             </button>
          </div>

          {/* Bottom Metatags */}
          <div className="absolute bottom-6 left-6 flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/5">
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-white/60 tracking-widest">LIVE_ASSET</span>
             </div>
          </div>
        </Link>

        {/* Cinematic Data Grid */}
        <div className="p-10 flex-1 flex flex-col space-y-8">
           <div className="space-y-2">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] uppercase tracking-[0.6em] text-white/20 font-black">Archive Ref: {car.id.slice(0, 6)}</span>
                 <span className="text-[10px] uppercase tracking-[0.2em] text-primary/60 font-medium italic">{car.year} Model Production</span>
              </div>
              <h3 className="text-3xl font-black tracking-tighter text-white group-hover:text-primary transition-all duration-700 leading-none">
                {carName}
              </h3>
           </div>

           <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/10">
              <div className="bg-black/40 p-5 flex flex-col gap-2 group/spec">
                 <span className="text-[8px] uppercase tracking-[0.4em] text-white/20 group-hover/spec:text-primary transition-colors">Distance Trace</span>
                 <div className="flex items-center gap-3">
                    <Activity className="h-3 w-3 text-white/10" />
                    <span className="text-[11px] font-black tracking-widest text-white/60">{car.mileage.toLocaleString()} KM</span>
                 </div>
              </div>
              <div className="bg-black/40 p-5 flex flex-col gap-2 group/spec">
                 <span className="text-[8px] uppercase tracking-[0.4em] text-white/20 group-hover/spec:text-primary transition-colors">Fuel Protocol</span>
                 <div className="flex items-center gap-3">
                    <Fuel className="h-3 w-3 text-white/10" />
                    <span className="text-[11px] font-black tracking-widest text-white/60">{fuelTypeLabels[language]?.[car.fuel_type] || car.fuel_type}</span>
                 </div>
              </div>
           </div>

           <div className="pt-8 border-t border-white/5 flex items-end justify-between mt-auto">
              <div className="flex flex-col">
                 <span className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black mb-1">Acquisition Appraisal</span>
                 <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black tracking-tighter text-white">
                       {formatPrice(car.price)}
                    </span>
                    {car.has_discount && car.original_price && (
                       <span className="text-xs text-white/20 line-through tracking-tighter font-medium">
                          {formatPrice(car.original_price)}
                       </span>
                    )}
                 </div>
              </div>
              <button 
                onClick={handleAddToCart}
                className="w-16 h-16 bg-white/[0.03] border border-white/5 flex items-center justify-center text-white hover:bg-white hover:text-black hover:border-white transition-all duration-700 group/cart"
              >
                 <ShoppingCart className="h-5 w-5 group-hover/cart:scale-110 transition-transform" />
              </button>
           </div>
        </div>
      </motion.div>

      {/* Sovereign Asset Deep View */}
      <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <DialogContent className="max-w-6xl p-0 bg-black border border-white/10 rounded-none overflow-hidden outline-none">
          <div className="grid md:grid-cols-12 min-h-[600px]">
             <div className="md:col-span-8 relative">
                <img src={car.main_image || "/placeholder.svg"} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-16">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="h-px w-12 bg-primary" />
                      <span className="text-[11px] uppercase tracking-[0.8em] text-primary font-black">Asset Profile</span>
                   </div>
                   <h2 className="text-7xl font-black tracking-tighter text-white leading-none mb-6 italic">{carName}</h2>
                   <div className="flex gap-8">
                      <div className="flex flex-col">
                         <span className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-black">MANUFACTURER</span>
                         <span className="text-sm font-black tracking-widest text-white">{car.model}</span>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-black">PRODUCTION_EPOCH</span>
                         <span className="text-sm font-black tracking-widest text-white">{car.year}</span>
                      </div>
                   </div>
                </div>
             </div>
             <div className="md:col-span-4 p-16 flex flex-col bg-surface-low border-l border-white/5">
                <div className="flex-1 space-y-16">
                   <div className="space-y-6">
                      <div className="text-[10px] uppercase tracking-[0.8em] text-white/20 font-black">Technicals</div>
                      <div className="grid gap-px bg-white/5 border border-white/5 shadow-2xl">
                         {[
                           { icon: Calendar, label: "TEMPORAL", val: car.year },
                           { icon: Fuel, label: "PROPULSION", val: fuelTypeLabels[language]?.[car.fuel_type] || car.fuel_type },
                           { icon: Gauge, label: "PROTOCOL", val: transmissionLabels[language]?.[car.transmission] || car.transmission },
                           { icon: Activity, label: "ENGAGEMENT", val: `${car.mileage.toLocaleString()} KM` }
                         ].map((spec, i) => (
                           <div key={i} className="bg-black p-6 flex items-center justify-between group transition-all duration-700 hover:bg-white/[0.02]">
                              <div className="flex items-center gap-4">
                                 <spec.icon className="h-3.5 w-3.5 text-white/10 group-hover:text-primary transition-colors" />
                                 <span className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-black">{spec.label}</span>
                              </div>
                              <span className="text-xs font-black text-white uppercase tracking-widest">{spec.val}</span>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                       <span className="text-[10px] uppercase tracking-[0.8em] text-white/20 font-black">Institutional Appraisal</span>
                       <div className="flex flex-col gap-1">
                          <div className="text-6xl font-black tracking-tighter text-white italic">{formatPrice(car.price)}</div>
                          <div className="text-[9px] uppercase tracking-[0.4em] text-primary font-black opacity-40">Guaranteed Asset Valuation</div>
                       </div>
                   </div>
                </div>

                <div className="mt-16 flex flex-col gap-4">
                   <button onClick={handleAddToCart} className="h-20 bg-primary text-black text-[12px] font-black uppercase tracking-[0.6em] hover:bg-white transition-all duration-1000">
                      Initiate Acquisition
                   </button>
                   <Link to={`/cars/${car.id}`} className="block">
                      <button className="w-full h-20 border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.6em] hover:bg-white/5 transition-all duration-1000 flex items-center justify-center gap-4 group">
                        Full Documentation
                        <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </button>
                   </Link>
                </div>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CarCard;
