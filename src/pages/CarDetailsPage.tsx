import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AIChatBot from "@/components/AIChatBot";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Calendar,
  Fuel,
  Gauge,
  Palette,
  Eye,
  Camera,
  RotateCw,
} from "lucide-react";
import { useState, lazy, Suspense, useRef } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CarQuickOrderDialog } from "@/components/CarQuickOrderDialog";
import ReviewsList from "@/components/ReviewsList";
import TestDriveBookingDialog from "@/components/TestDriveBookingDialog";
import { motion, AnimatePresence } from "framer-motion";

// Lazy load the 360 viewer for better performance
const Car360Viewer = lazy(() => import("@/components/Car360Viewer"));

const CarDetailsPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("gallery");
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  const { data: car, isLoading } = useQuery({
    queryKey: ["car", id],
    queryFn: async () => {
      const [{ data, error }, { data: promotions, error: promoError }] = await Promise.all([
        supabase
          .from("cars")
          .select("*, brands(*)")
          .eq("id", id)
          .maybeSingle(),
        supabase.from("promotions").select("*"),
      ]);

      if (error) throw error;
      if (promoError) throw promoError;

      if (data) {
        await supabase
          .from("cars")
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq("id", id);
      }

      const applyPromotionsToCar = (car: any, promotionsList: any[]) => {
        if (!car) return car;
        const now = new Date();
        const activePromos = promotionsList.filter((p) => {
          if (!p.is_active) return false;
          if (p.start_date && new Date(p.start_date) > now) return false;
          if (p.end_date && new Date(p.end_date) < now) return false;
          return true;
        });

        let bestDiscount = 0;
        let bestPromo: any = null;

        for (const promo of activePromos) {
          const matchesCar =
            (promo.target_cars && promo.target_cars.includes(car.id)) ||
            (promo.target_brands && promo.target_brands.includes(car.brand_id)) ||
            (!promo.target_cars && !promo.target_brands);

          if (!matchesCar) continue;
          let discountedPrice = car.price;
          if (promo.discount_type === "percentage") {
            discountedPrice = car.price * (1 - promo.discount_value / 100);
          } else {
            discountedPrice = car.price - promo.discount_value;
          }
          const discountAmount = car.price - Math.max(discountedPrice, 0);
          if (discountAmount > bestDiscount) {
            bestDiscount = discountAmount;
            bestPromo = promo;
          }
        }

        if (!bestDiscount || !bestPromo) return car;
        return {
          ...car,
          original_price: car.original_price ?? car.price,
          price: car.price - bestDiscount,
          has_discount: true,
          promotion_percent: Math.round((bestDiscount / car.price) * 100),
        };
      };

      return applyPromotionsToCar(data, promotions || []);
    },
    enabled: !!id,
  });

  const { data: settings } = useSettings();

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat(isRTL ? "ar-SD" : "en-US", {
      maximumFractionDigits: 0,
    }).format(price);
    const symbol = (settings as any)?.currency_symbol || (isRTL ? "ج.س" : "SDG");
    return `${formatted} ${symbol}`;
  };

  const fuelTypes: Record<string, Record<string, string>> = {
    ar: { petrol: "بنزين", diesel: "ديزل", electric: "كهربائي", hybrid: "هايبرد" },
    en: { petrol: "Petrol", diesel: "Diesel", electric: "Electric", hybrid: "Hybrid" },
  };

  const transmissionTypes: Record<string, Record<string, string>> = {
    ar: { automatic: "أوتوماتيك", manual: "عادي" },
    en: { automatic: "Automatic", manual: "Manual" },
  };

  const handleWhatsApp = () => {
    const messages: Record<string, string> = {
      ar: `مرحباً، أرغب في الاستفسار عن سيارة ${car?.name_ar} ${car?.model} ${car?.year}`,
      en: `Hello, I'm interested in the ${car?.name} ${car?.model} ${car?.year}`,
    };
    const message = encodeURIComponent(messages[language] || messages.ar);
    window.open(`https://wa.me/966543389314?text=${message}`, "_blank");
  };

  const handleOrderViaWhatsApp = () => {
    const carName = isRTL ? car?.name_ar : car?.name;
    const brandName = isRTL ? car?.brands?.name_ar : car?.brands?.name;
    const fuelType = fuelTypes[language]?.[car?.fuel_type || ""] || car?.fuel_type;
    const transmission = transmissionTypes[language]?.[car?.transmission || ""] || car?.transmission;
    const color = isRTL ? car?.color_ar : car?.color;

    const orderMessages: Record<string, string> = {
      ar: `🚗 *طلب شراء سيارة*\n\n📋 *تفاصيل السيارة:*\n━━━━━━━━━━━━━━━━\n🏷️ الاسم: ${carName}\n🏭 الماركة: ${brandName}\n📅 الموديل: ${car?.model} - ${car?.year}\n💰 السعر: ${formatPrice(car?.price || 0)}\n⛽ الوقود: ${fuelType}\n⚙️ ناقل الحركة: ${transmission}\n🎨 اللون: ${color || "-"}\n📏 المسافة: ${car?.mileage?.toLocaleString() || 0} كم\n━━━━━━━━━━━━━━━━\n\nأرغب في شراء هذه السيارة.`,
      en: `🚗 *Car Purchase Request*\n\n📋 *Car Details:*\n━━━━━━━━━━━━━━━━\n🏷️ Name: ${carName}\n🏭 Brand: ${brandName}\n📅 Model: ${car?.model} - ${car?.year}\n💰 Price: ${formatPrice(car?.price || 0)}\n⛽ Fuel: ${fuelType}\n⚙️ Transmission: ${transmission}\n🎨 Color: ${color || "-"}\n📏 Mileage: ${car?.mileage?.toLocaleString() || 0} km\n━━━━━━━━━━━━━━━━\n\nI would like to purchase this car.`,
    };

    const message = encodeURIComponent(orderMessages[language] || orderMessages.ar);
    window.open(`https://wa.me/966543389314?text=${message}`, "_blank");
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: isRTL ? `${car?.name_ar} ${car?.model}` : `${car?.name} ${car?.model}`,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({ description: isRTL ? "تم نسخ الرابط" : "Link copied" });
    }
  };

  const allImages = [car?.main_image, ...(car?.images || [])].filter(Boolean) as string[];
  const nextImage = () => setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-primary font-bold tracking-[0.5em] uppercase text-xs"
        >
          Sovereign Loading
        </motion.div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="container mx-auto px-6 pt-40 text-center">
          <h1 className="text-4xl font-light text-white italic">Car not found.</h1>
          <Link to="/cars" className="mt-8 inline-block text-primary uppercase tracking-[0.3em] text-xs">
            Return to Gallery
          </Link>
        </div>
      </div>
    );
  }

  const currentImage = allImages[selectedImageIndex] || "/placeholder.svg";
  const fuelTypeLabel = fuelTypes[language]?.[car.fuel_type] || car.fuel_type;
  const transmissionLabel = transmissionTypes[language]?.[car.transmission] || car.transmission;
  const hasHeroVideo = !!(car as any)?.video_url;
  const heroVideoUrl = (car as any)?.video_url;
  const heroVideoThumbnail = (car as any)?.video_thumbnail || car?.main_image;

  return (
    <div className="min-h-screen bg-black selection:bg-primary/30 overflow-x-hidden">
      <Navbar />

      {/* Cinematic Hero */}
      {hasHeroVideo ? (
        <section className="relative h-[85vh] overflow-hidden">
          <video
            ref={heroVideoRef}
            autoPlay
            muted
            loop
            playsInline
            poster={heroVideoThumbnail}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={heroVideoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute inset-0 flex items-end pb-32">
            <div className="container mx-auto px-6 md:px-12">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
                className="max-w-4xl space-y-8"
              >
                {car.brands && (
                  <div className="inline-flex items-center gap-4 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
                    {car.brands.logo_url && <img src={car.brands.logo_url} alt="" className="h-6 w-auto grayscale brightness-200" />}
                    <span className="text-white/60 text-[11px] uppercase tracking-[0.4em]">
                       {isRTL ? car.brands.name_ar : car.brands.name}
                    </span>
                  </div>
                )}
                <h1 className="text-6xl md:text-9xl text-hero text-white tracking-tighter">
                  {isRTL ? car.name_ar : car.name}
                  <span className="block text-white/20 italic font-light text-4xl md:text-6xl mt-4">
                    {car.model} — {car.year}
                  </span>
                </h1>
              </motion.div>
            </div>
          </div>
        </section>
      ) : (
        <div className="pt-48 pb-20 container mx-auto px-6 md:px-12">
           <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl space-y-4"
              >
                <div className="text-primary text-[11px] uppercase tracking-[0.5em] font-black">
                  Exquisite Selection
                </div>
                <h1 className="text-6xl md:text-9xl text-hero text-white tracking-tighter leading-none">
                  {isRTL ? car.name_ar : car.name}
                </h1>
              </motion.div>
        </div>
      )}

      <main className="pb-32">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-20">
            {/* Visuals */}
            <div className="lg:col-span-12 xl:col-span-8 space-y-12">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative aspect-[16/9] bg-surface-low border border-white/5 overflow-hidden group cursor-pointer"
                onClick={() => setIsGalleryOpen(true)}
              >
                <img
                  src={currentImage}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="absolute bottom-8 right-8 flex items-center gap-6 z-10">
                   <span className="text-[11px] text-white/40 tracking-[0.4em] uppercase">Visual Selection</span>
                   <div className="flex gap-2">
                     <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="w-12 h-12 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                       <ChevronLeft className="h-4 w-4" />
                     </button>
                     <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="w-12 h-12 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                       <ChevronRight className="h-4 w-4" />
                     </button>
                   </div>
                </div>

                <div className="absolute top-8 left-8 flex gap-4">
                  <Badge className="bg-primary text-black text-[10px] tracking-[0.3em] font-black rounded-none px-4 py-2">
                    {car.year} EDITION
                  </Badge>
                  {car.has_discount && (
                     <Badge className="bg-white text-black text-[10px] tracking-[0.3em] font-black rounded-none px-4 py-2">
                       OFFER ACTIVE
                     </Badge>
                  )}
                </div>
              </motion.div>

              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-square border transition-all duration-500 overflow-hidden ${
                      selectedImageIndex === idx ? "border-primary p-px" : "border-white/5 opacity-40 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Acquisition & Details */}
            <div className="lg:col-span-12 xl:col-span-4 space-y-20">
              <div className="space-y-12">
                <div className="space-y-4">
                  <div className="text-[11px] uppercase tracking-[0.6em] text-primary font-bold">
                    {isRTL ? "الاستثمار" : "The Investment"}
                  </div>
                  <div className="flex flex-col">
                    {car.has_discount && car.original_price && (
                      <span className="text-xl text-white/20 line-through tracking-tighter">
                        {formatPrice(car.original_price)}
                      </span>
                    )}
                    <span className="text-6xl md:text-7xl font-bold text-white tracking-tighter">
                      {formatPrice(car.price)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleOrderViaWhatsApp}
                    className="w-full h-20 bg-primary text-black text-[12px] uppercase tracking-[0.5em] font-black hover:bg-white transition-all duration-700 flex items-center justify-center gap-4 group"
                  >
                    <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    {t.common.whatsappOrder}
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleWhatsApp} className="h-16 border border-white/10 text-white text-[11px] uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all">
                      Inquire
                    </button>
                    <button onClick={handleShare} className="h-16 border border-white/10 text-white text-[11px] uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all">
                      Dispatch
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-[11px] uppercase tracking-[0.6em] text-white/30 font-bold px-4">
                   Specifications
                </h3>
                <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5">
                   {[
                     { label: "Temporal", value: car.year, icon: Calendar },
                     { label: "Propulsion", value: fuelTypeLabel, icon: Fuel },
                     { label: "Sequence", value: transmissionLabel, icon: Gauge },
                     { label: "Shade", value: (isRTL ? car.color_ar : car.color) || "-", icon: Palette },
                     { label: "Engagement", value: `${car.mileage?.toLocaleString() || 0} km`, icon: Eye },
                     { label: "Velocity", value: car.engine_size || "N/A", icon: Gauge }
                   ].map((spec, idx) => (
                     <div key={idx} className="bg-black p-8 space-y-4 transition-colors hover:bg-surface-low group">
                        <spec.icon className="h-4 w-4 text-white/10 group-hover:text-primary transition-colors" />
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase tracking-[0.4em] text-white/20">{spec.label}</p>
                          <p className="text-[14px] uppercase tracking-[0.1em] text-white font-bold">{spec.value}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              <TestDriveBookingDialog
                carId={car.id}
                carName={isRTL ? `${car.name_ar} ${car.model}` : `${car.name} ${car.model}`}
              />
            </div>
          </div>

          <div className="mt-48 max-w-4xl border-t border-white/5 pt-20">
             <h3 className="text-[10px] uppercase tracking-[0.8em] text-primary font-bold mb-12">
               The Narrative
             </h3>
             <p className="text-3xl md:text-4xl font-light text-white/60 leading-relaxed tracking-tight italic">
                {isRTL ? car.description_ar : car.description}
             </p>
          </div>

          <div className="mt-48 border-t border-white/5 pt-20">
            <ReviewsList carId={car.id} />
          </div>
        </div>
      </main>

      {/* 360 & Gallery Dialogs */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-7xl p-0 bg-black/95 backdrop-blur-xl border-white/10 rounded-none">
          <div className="relative aspect-video flex items-center justify-center">
            <img src={currentImage} alt="" className="h-full w-full object-contain" />
            <div className="absolute inset-0 flex items-center justify-between px-8">
                <button onClick={prevImage} className="w-16 h-16 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black rounded-full transition-all">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={nextImage} className="w-16 h-16 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black rounded-full transition-all">
                  <ChevronRight className="h-6 w-6" />
                </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CarQuickOrderDialog open={isQuickOrderOpen} onOpenChange={setIsQuickOrderOpen} car={car} />
      <Footer />
      <WhatsAppButton />
      <AIChatBot />
    </div>
  );
};

export default CarDetailsPage;
