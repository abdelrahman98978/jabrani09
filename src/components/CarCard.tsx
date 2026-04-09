import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Fuel, Gauge, Calendar, Eye, ShoppingCart, Maximize2, Sparkles, Star, ShieldCheck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import CompareButton from "@/components/CompareButton";
import WishlistButton from "@/components/WishlistButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface CarCardData {
  id: string;
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
    const symbol = settings?.currency_symbol || (isRTL ? "ج.س" : "SDG");
    return `${formatted} ${symbol}`;
  };

  const fuelTypeAr: Record<string, string> = {
    petrol: "بنزين",
    diesel: "ديزل",
    electric: "كهربائي",
    hybrid: "هايبرد",
  };

  const transmissionAr: Record<string, string> = {
    automatic: "أوتوماتيك",
    manual: "عادي",
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(car.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="h-full"
      >
        <Link to={`/cars/${car.id}`} className="block h-full group">
          <div className="relative h-full flex flex-col bg-surface-low transition-all duration-1000 overflow-hidden">
            {/* Gallery Image */}
            <div className="relative aspect-[16/10] overflow-hidden">
              <motion.img
                src={car.main_image || "/placeholder.svg"}
                alt={car.name_ar}
                initial={{ scale: 1 }}
                animate={{ scale: isHovered ? 1.05 : 1 }}
                transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000"
                loading="lazy"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

              {/* Status Indicator */}
              {car.is_new && (
                <div className="absolute top-6 start-6">
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white bg-primary px-3 py-1">
                    {isRTL ? "إصدار جديد" : "New Release"}
                  </span>
                </div>
              )}
            </div>

            {/* Editorial Content Section */}
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-baseline mb-4">
                <h3 className="text-xl font-light tracking-tighter uppercase group-hover:text-primary transition-colors duration-500">
                  {car.name_ar}
                </h3>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {car.year}
                </span>
              </div>

              <div className="flex gap-4 items-center mb-8">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.2em]">
                  {car.model}
                </span>
                <div className="w-1 h-1 rounded-full bg-primary/40" />
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.2em]">
                  {car.fuel_type}
                </span>
              </div>

              {/* Price & Action */}
              <div className="mt-auto pt-8 border-t border-white/5 flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-light tracking-tighter">
                    {formatPrice(car.price)}
                  </span>
                </div>
                
                <div className="flex items-center gap-6">
                  <CompareButton carId={car.id} variant="icon" />
                  <button 
                    onClick={handleAddToCart}
                    className="text-[10px] font-bold uppercase tracking-[0.3em] overflow-hidden group/btn"
                  >
                    <span className="relative inline-block transition-transform duration-500 group-hover/btn:-translate-y-full">
                      {isRTL ? "أضف للسلة" : "Add to Cart"}
                    </span>
                    <span className="absolute left-0 translate-y-full text-primary transition-transform duration-500 group-hover/btn:translate-y-0">
                      {isRTL ? "أضف للسلة" : "Add to Cart"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Quick View Dialog */}
      <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-card/95 backdrop-blur-xl">
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-square md:aspect-auto">
              <img
                src={car.main_image || "/placeholder.svg"}
                alt={car.name_ar}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 start-6">
                <h2 className="text-3xl font-black text-white mb-2">{car.name_ar}</h2>
                <div className="flex gap-2">
                  <Badge className="bg-primary text-white border-none">{car.year}</Badge>
                  <Badge variant="outline" className="text-white border-white/50">{car.model}</Badge>
                </div>
              </div>
            </div>
            <div className="p-8 flex flex-col">
              <div className="flex-1 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">{isRTL ? "المواصفات الأساسية" : "Key Specifications"}</span>
                  <WishlistButton carId={car.id} variant="icon" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: isRTL ? "المسافة" : "Mileage", val: `${car.mileage.toLocaleString()} km`, icon: Gauge },
                    { label: isRTL ? "الوقود" : "Fuel", val: isRTL ? fuelTypeAr[car.fuel_type] : car.fuel_type, icon: Fuel },
                    { label: isRTL ? "الحالة" : "Condition", val: car.is_new ? (isRTL ? "جديدة" : "New") : (isRTL ? "مستعملة" : "Used"), icon: Sparkles },
                    { label: isRTL ? "التاريخ" : "History", val: isRTL ? "بدون حوادث" : "Clean History", icon: ShieldCheck }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/50 border border-border/40">
                      <item.icon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.label}</p>
                        <p className="text-sm font-black">{item.val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                  <p className="text-xs text-primary font-bold mb-2 uppercase tracking-tighter">{isRTL ? "السعر الحصري" : "Exclusive Price"}</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-gradient-gold">{formatPrice(car.price)}</span>
                    {car.original_price && (
                      <span className="text-sm text-muted-foreground line-through font-bold">{formatPrice(car.original_price)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleAddToCart}
                  className="h-14 px-8 font-black border-2"
                >
                  <ShoppingCart className="h-5 w-5 me-2" />
                  {isRTL ? "إضافة للسلة" : "Add to Cart"}
                </Button>
                <Link to={`/cars/${car.id}`} className="flex-1">
                  <Button variant="gold" size="lg" className="w-full h-14 font-black shadow-xl">
                    {isRTL ? "عرض كامل المواصفات" : "Full Specifications"}
                  </Button>
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
