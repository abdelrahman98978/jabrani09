import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Fuel, Gauge, Calendar, Eye, ShoppingCart, Maximize2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import CompareButton from "@/components/CompareButton";
import WishlistButton from "@/components/WishlistButton";
import { useLanguage } from "@/contexts/LanguageContext";
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
  fuel_type: car.fuel_type,
  transmission: car.transmission,
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const fuelTypeAr: Record<string, string> = {
    petrol: "بنزين",
    diesel: "ديزل",
    electric: "كهربائي",
    hybrid: "هايبرد",
  };

  const fuelTypeEn: Record<string, string> = {
    petrol: "Petrol",
    diesel: "Diesel",
    electric: "Electric",
    hybrid: "Hybrid",
  };

  const transmissionAr: Record<string, string> = {
    automatic: "أوتوماتيك",
    manual: "عادي",
  };

  const transmissionEn: Record<string, string> = {
    automatic: "Automatic",
    manual: "Manual",
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

  const discountAmount = car.original_price ? car.original_price - car.price : 0;

  return (
    <>
      <Link to={`/cars/${car.id}`} className="block perspective-container">
        <Card className="car-card card-3d-tilt group overflow-hidden border-border/50 hover:border-primary/30 glow-3d">
          {/* Image Container */}
          <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
            <img
              src={car.main_image || "/placeholder.svg"}
              alt={car.name_ar}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/placeholder.svg";
              }}
              className="car-image h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Quick View Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleQuickView}
                className="gap-2 bg-white/90 text-foreground hover:bg-white shadow-lg"
              >
                <Maximize2 className="h-4 w-4" />
                {isRTL ? "عرض سريع" : "Quick View"}
              </Button>
            </div>
            
            {/* Badges */}
            <div className="absolute top-3 start-3 flex flex-col gap-2 items-start">
              {car.is_new && (
                <Badge className="bg-primary text-primary-foreground badge-3d-float shadow-lg">
                  {isRTL ? "جديدة" : "New"}
                </Badge>
              )}
            </div>
            
            {/* Discount Badge - WordPress Style */}
            {car.promotion_percent && car.promotion_percent > 0 && (
              <div className="wp-discount-badge">
                {isRTL ? `خصم ${car.promotion_percent}%` : `${car.promotion_percent}% OFF`}
              </div>
            )}
            {car.has_discount && !car.promotion_percent && (
              <div className="wp-discount-badge">
                {isRTL ? "خصم" : "Sale"}
              </div>
            )}
            
            {/* Views */}
            <div className="absolute bottom-3 start-3 flex items-center gap-1 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs shadow-md">
              <Eye className="h-3 w-3" />
              <span>{car.views_count}</span>
            </div>
            
            {/* Wishlist Button */}
            <div className="absolute top-3 end-3">
              <WishlistButton carId={car.id} variant="icon" />
            </div>
          </div>

          <CardContent className="p-4 space-y-4">
            {/* Title & Year */}
            <div>
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {car.name_ar}
              </h3>
              <p className="text-sm text-muted-foreground">{car.model} - {car.year}</p>
            </div>

            {/* Specs - Enhanced with icons */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                </div>
                <span>{car.year}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Fuel className="h-3.5 w-3.5 text-primary" />
                </div>
                <span>{isRTL ? fuelTypeAr[car.fuel_type] : fuelTypeEn[car.fuel_type]}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Gauge className="h-3.5 w-3.5 text-primary" />
                </div>
                <span>{isRTL ? transmissionAr[car.transmission] : transmissionEn[car.transmission]}</span>
              </div>
            </div>

            {/* Price Section - WordPress Style */}
            <div className="pt-3 border-t border-border/50">
              {car.has_discount && car.original_price ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(car.original_price)}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      {isRTL ? `وفر ${formatPrice(discountAmount)}` : `Save ${formatPrice(discountAmount)}`}
                    </Badge>
                  </div>
                  <div className="text-2xl font-black text-gradient-gold">
                    {formatPrice(car.price)}
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-black text-gradient-gold">
                  {formatPrice(car.price)}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <CompareButton carId={car.id} variant="icon" />
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleAddToCart}
                className="h-9 w-9 hover-lift-3d"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
              <Button variant="gold" size="sm" className="flex-1 btn-glow hover-lift-3d">
                {isRTL ? "التفاصيل" : "Details"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Quick View Dialog */}
      <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{car.name_ar}</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="aspect-video rounded-xl overflow-hidden bg-secondary">
              <img
                src={car.main_image || "/placeholder.svg"}
                alt={car.name_ar}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">{car.name_ar}</h3>
                <p className="text-muted-foreground">{car.model} - {car.year}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">{isRTL ? "الوقود" : "Fuel"}</p>
                  <p className="font-medium">{isRTL ? fuelTypeAr[car.fuel_type] : fuelTypeEn[car.fuel_type]}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">{isRTL ? "ناقل الحركة" : "Transmission"}</p>
                  <p className="font-medium">{isRTL ? transmissionAr[car.transmission] : transmissionEn[car.transmission]}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">{isRTL ? "السنة" : "Year"}</p>
                  <p className="font-medium">{car.year}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">{isRTL ? "المسافة" : "Mileage"}</p>
                  <p className="font-medium">{car.mileage.toLocaleString()} km</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                {car.has_discount && car.original_price ? (
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(car.original_price)}
                    </span>
                    <div className="text-2xl font-black text-gradient-gold">
                      {formatPrice(car.price)}
                    </div>
                  </div>
                ) : (
                  <div className="text-2xl font-black text-gradient-gold">
                    {formatPrice(car.price)}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
                <Link to={`/cars/${car.id}`} className="flex-1">
                  <Button variant="gold" className="w-full">
                    {isRTL ? "عرض التفاصيل الكاملة" : "View Full Details"}
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
