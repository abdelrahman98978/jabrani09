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
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -12 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="h-full"
      >
        <Link to={`/cars/${car.id}`} className="block h-full group">
          <Card className="relative h-full flex flex-col overflow-hidden border-border/40 transition-all duration-700 bg-background hover:shadow-luxury border-none rounded-none">
            {/* Image Section */}
            <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-secondary">
              <motion.img
                src={car.main_image || "/placeholder.svg"}
                alt={car.name_ar}
                className="w-full h-full object-cover car-image transition-all duration-700"
                loading="lazy"
              />

              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

              {/* Status Badges */}
              <div className="absolute top-4 start-4 flex flex-col gap-2 z-10">
                {car.is_new && (
                  <div className="bg-foreground text-background text-[10px] font-medium px-3 py-1 uppercase tracking-widest">
                    {isRTL ? "جديدة" : "New"}
                  </div>
                )}
                {car.has_discount && (
                  <div className="bg-accent text-white text-[10px] font-medium px-3 py-1 uppercase tracking-widest">
                    {isRTL ? "عرض خاص" : "Special"}
                  </div>
                )}
              </div>

              {/* Quick Actions Overlay */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 backdrop-blur-[2px]"
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleQuickView}
                      className="rounded-full font-bold shadow-2xl h-10 px-6 gap-2"
                    >
                      <Maximize2 className="h-4 w-4" />
                      {isRTL ? "نظرة سريعة" : "Quick View"}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* View Count */}
              <div className="absolute bottom-4 start-4 text-white/80 text-xs font-bold flex items-center gap-1.5 drop-shadow-md">
                <Eye className="h-4 w-4" />
                {car.views_count.toLocaleString()} {isRTL ? "مشاهدة" : "Views"}
              </div>

              {/* Wishlist */}
              <div className="absolute top-4 end-4">
                <WishlistButton carId={car.id} variant="icon" />
              </div>
            </div>

            {/* Content Section */}
            <CardContent className="p-6 flex-1 flex flex-col bg-background">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1 group-hover:tracking-wider transition-all duration-500">
                    {car.name_ar}
                  </h3>
                  <div className="flex gap-2 items-center opacity-40">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium">{car.model}</span>
                    <span className="w-1 h-1 rounded-full bg-foreground" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium">{car.year}</span>
                  </div>
                </div>
              </div>

              {/* Specs Line */}
              <div className="flex gap-4 mb-8 opacity-60">
                <div className="flex items-center gap-1.5">
                  <Gauge className="h-3 w-3" />
                  <span className="text-[10px] uppercase tracking-widest font-medium">
                    {car.mileage.toLocaleString()} KM
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Fuel className="h-3 w-3" />
                  <span className="text-[10px] uppercase tracking-widest font-medium">
                    {isRTL ? fuelTypeAr[car.fuel_type] : car.fuel_type}
                  </span>
                </div>
              </div>

              {/* Price & Cart */}
              <div className="mt-auto flex items-end justify-between pt-6 border-t border-border/10">
                <div className="flex flex-col">
                  {car.original_price && car.original_price > car.price && (
                    <span className="text-[10px] text-muted-foreground line-through font-medium mb-1">
                      {formatPrice(car.original_price)}
                    </span>
                  )}
                  <span className="text-xl font-bold tracking-tight">
                    {formatPrice(car.price)}
                  </span>
                </div>
                <div className="flex gap-4">
                  <CompareButton carId={car.id} variant="icon" />
                  <button
                    onClick={handleAddToCart}
                    className="text-[10px] uppercase tracking-[0.2em] font-medium border-b border-foreground/20 hover:border-foreground transition-all pb-0.5"
                  >
                    {isRTL ? "أضف للسلة" : "Add to Cart"}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
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
