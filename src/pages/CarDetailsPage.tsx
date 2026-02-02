import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AIChatBot from "@/components/AIChatBot";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowRight,
  Phone,
  MessageCircle,
  Calendar,
  Fuel,
  Gauge,
  Palette,
  Eye,
  Share2,
  Heart,
  Loader2,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Camera,
  RotateCw,
  Download,
} from "lucide-react";
import { useState, lazy, Suspense, useRef } from "react";
import HeroVideoControls from "@/components/HeroVideoControls";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CarQuickOrderDialog } from "@/components/CarQuickOrderDialog";
import CompareButton from "@/components/CompareButton";
import ReviewsList from "@/components/ReviewsList";
import TestDriveBookingDialog from "@/components/TestDriveBookingDialog";

// Lazy load the 360 viewer for better performance
const Car360Viewer = lazy(() => import("@/components/Car360Viewer"));

const CarDetailsPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
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
        if (car.has_discount && !car.original_price) return car;

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

          if (promo.min_price && car.price < promo.min_price) continue;
          if (promo.max_price && car.price > promo.max_price) continue;

          if (!promo.discount_type || !promo.discount_value) continue;

          let discountedPrice = car.price;
          if (promo.discount_type === "percentage") {
            discountedPrice = car.price * (1 - promo.discount_value / 100);
          } else {
            discountedPrice = car.price - promo.discount_value;
          }

          discountedPrice = Math.max(discountedPrice, 0);
          const discountAmount = car.price - discountedPrice;

          if (discountAmount > bestDiscount) {
            bestDiscount = discountAmount;
            bestPromo = promo;
          }
        }

        if (!bestDiscount || !bestPromo) return car;

        const discountedPrice = car.price - bestDiscount;
        const percent = Math.round((bestDiscount / car.price) * 100);

        return {
          ...car,
          original_price: car.original_price ?? car.price,
          price: discountedPrice,
          has_discount: true,
          promotion_percent: percent,
          promotion_type: bestPromo.discount_type || undefined,
        };
      };

      const carWithPromo = applyPromotionsToCar(data, promotions || []);
      return carWithPromo;
    },
    enabled: !!id,
  });

  const { data: settings } = useSettings();

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat(language === "ar" ? "ar-SD" : "en-US", {
      maximumFractionDigits: 0,
    }).format(price);
    const symbol = settings?.currency_symbol || (language === "ar" ? "ج.س" : "SDG");
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
    const carName = language === "ar" ? car?.name_ar : car?.name;
    const brandName = language === "ar" ? car?.brands?.name_ar : car?.brands?.name;
    const fuelType = fuelTypes[language]?.[car?.fuel_type || ""] || car?.fuel_type;
    const transmission = transmissionTypes[language]?.[car?.transmission || ""] || car?.transmission;
    const color = language === "ar" ? car?.color_ar : car?.color;

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
        title: language === "ar" ? `${car?.name_ar} ${car?.model}` : `${car?.name} ${car?.model}`,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({ description: language === "ar" ? "تم نسخ الرابط" : "Link copied" });
    }
  };

  const allImages = [car?.main_image, ...(car?.images || [])].filter(Boolean) as string[];

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">{language === "ar" ? "جاري التحميل..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            {language === "ar" ? "السيارة غير موجودة" : "Car not found"}
          </h1>
          <Link to="/cars">
            <Button variant="outline" className="mt-4">
              {language === "ar" ? "العودة للسيارات" : "Back to Cars"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentImage = allImages[selectedImageIndex] || "/placeholder.svg";
  const fuelTypeLabel = fuelTypes[language]?.[car.fuel_type] || car.fuel_type;
  const transmissionLabel = transmissionTypes[language]?.[car.transmission] || car.transmission;

  // Check if car has hero video
  const hasHeroVideo = (car as any)?.video_url;
  const heroVideoUrl = (car as any)?.video_url;
  const heroVideoThumbnail = (car as any)?.video_thumbnail || car?.main_image;
  const heroOverlayOpacity = (car as any)?.video_overlay_opacity || "medium";

  const getHeroOverlayClass = () => {
    switch (heroOverlayOpacity) {
      case "light": return "bg-gradient-to-t from-black/40 via-black/20 to-transparent";
      case "dark": return "bg-gradient-to-t from-black/80 via-black/50 to-black/30";
      default: return "bg-gradient-to-t from-black/60 via-black/30 to-transparent";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Video Section */}
      {hasHeroVideo && (
        <section className="relative h-[70vh] md:h-[80vh] overflow-hidden perspective-container hero-video-container">
          {/* Video Background */}
          <video
            ref={heroVideoRef}
            autoPlay
            muted
            loop
            playsInline
            poster={heroVideoThumbnail}
            className="absolute inset-0 w-full h-full object-cover scale-105"
          >
            <source src={heroVideoUrl} type="video/mp4" />
          </video>

          {/* Video Controls */}
          <HeroVideoControls
            videoRef={heroVideoRef}
            isRTL={language === "ar"}
          />

          {/* Animated Overlay */}
          <div className={`absolute inset-0 ${getHeroOverlayClass()}`} />

          {/* Floating 3D Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full animate-float-3d"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${15 + (i % 4) * 20}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${3 + i * 0.3}s`,
                }}
              />
            ))}
          </div>

          {/* Content with 3D Animations */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-6 px-4 stagger-3d-entrance">
              {/* Brand Badge */}
              {car.brands && (
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 badge-3d-float">
                  {car.brands.logo_url && (
                    <img src={car.brands.logo_url} alt={car.brands.name} className="h-6 w-auto" />
                  )}
                  <span className="text-white/90 font-medium">
                    {language === "ar" ? car.brands.name_ar : car.brands.name}
                  </span>
                </div>
              )}

              {/* Car Name with 3D Effect */}
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white hero-text-shadow animate-slide-3d">
                {language === "ar" ? car.name_ar : car.name}
              </h1>

              {/* Model & Year */}
              <p className="text-xl md:text-2xl text-white/80 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                {car.model} • {car.year}
              </p>

              {/* Price with Glow */}
              <div className="space-y-2 animate-pop-3d" style={{ animationDelay: '0.5s' }}>
                {car.has_discount && car.original_price && (
                  <span className="text-lg text-white/60 line-through block">
                    {formatPrice(car.original_price)}
                  </span>
                )}
                <div className="text-4xl md:text-6xl font-black text-gradient-gold drop-shadow-lg animate-pulse-scale">
                  {formatPrice(car.price)}
                </div>
                {car.promotion_percent && (
                  <Badge className="bg-emerald-500/90 text-white text-sm px-4 py-1.5 badge-3d-float">
                    {language === "ar" ? `خصم ${car.promotion_percent}%` : `${car.promotion_percent}% OFF`}
                  </Badge>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 justify-center pt-4 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                <Button
                  variant="premium"
                  size="lg"
                  className="gap-2 hover-lift-3d btn-glow"
                  onClick={handleOrderViaWhatsApp}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {t.common.whatsappOrder}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 border-white/50 text-white hover:bg-white/10 hover-lift-3d"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="h-5 w-5" />
                  {language === "ar" ? "استفسار" : "Inquire"}
                </Button>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center pt-2 animate-bounce-3d">
              <div className="w-1 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          {/* Quick Specs Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm border-t border-white/10">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-center gap-6 md:gap-12 flex-wrap">
                {[
                  { icon: Calendar, value: car.year, label: t.common.year },
                  { icon: Fuel, value: fuelTypeLabel, label: t.common.fuel },
                  { icon: Gauge, value: transmissionLabel, label: t.common.transmission },
                  { icon: Eye, value: car.views_count, label: t.common.views },
                ].map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-white/90">
                    <spec.icon className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-bold">{spec.value}</div>
                      <div className="text-xs text-white/60">{spec.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <main className={hasHeroVideo ? "pb-12" : "pt-24 pb-12"}>
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className={`flex items-center gap-2 text-sm text-muted-foreground mb-6 ${hasHeroVideo ? 'pt-8' : ''}`}>
            <Link to="/" className="hover:text-primary transition-colors">{t.nav.home}</Link>
            <ArrowRight className="h-4 w-4 rotate-180" />
            <Link to="/cars" className="hover:text-primary transition-colors">{t.nav.cars}</Link>
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span className="text-foreground font-medium">{language === "ar" ? car.name_ar : car.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Images & 360 Section */}
            <div className="space-y-4">
              {/* Tabs for Gallery and 360 View */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="gallery" className="gap-2">
                    <Camera className="w-4 h-4" />
                    {language === "ar" ? "معرض الصور" : "Gallery"}
                  </TabsTrigger>
                  <TabsTrigger
                    value="360"
                    disabled={!((car as any).video_360_url || (car as any).view_360_url)}
                    className="gap-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    {language === "ar" ? "عرض 360°" : "360° View"}
                  </TabsTrigger>
                </TabsList>

                {/* Gallery Tab */}
                <TabsContent value="gallery" className="mt-0">
                  {/* Main Image */}
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-secondary group">
                    <img
                      src={currentImage}
                      alt={language === "ar" ? car.name_ar : car.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Image Navigation */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-lg opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-lg opacity-0 group-hover:opacity-100"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                      </>
                    )}

                    {/* Zoom Button */}
                    <button
                      onClick={() => setIsGalleryOpen(true)}
                      className="absolute bottom-4 left-4 h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-lg"
                    >
                      <ZoomIn className="h-5 w-5" />
                    </button>

                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      {car.is_new && (
                        <Badge className="bg-primary text-primary-foreground shadow-lg">{t.common.new}</Badge>
                      )}
                      {car.has_discount && (
                        <Badge className="bg-destructive shadow-lg">{t.common.discount}</Badge>
                      )}
                      {car.has_test_drive && (
                        <Badge variant="secondary" className="shadow-lg">{t.common.testDrive}</Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <button
                        onClick={handleShare}
                        className="h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-lg"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={`h-10 w-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all shadow-lg ${isFavorite ? "bg-primary text-primary-foreground" : "bg-background/90 hover:bg-primary hover:text-primary-foreground"
                          }`}
                      >
                        <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 px-4 py-2 rounded-full bg-background/90 backdrop-blur-sm text-sm font-medium shadow-lg">
                      {selectedImageIndex + 1} / {allImages.length}
                    </div>

                    {/* Views */}
                    <div className="absolute bottom-4 left-16 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-sm shadow-lg">
                      <Eye className="h-4 w-4 text-primary" />
                      <span>{car.views_count} {t.common.views}</span>
                    </div>
                  </div>

                  {/* Thumbnails */}
                  {allImages.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mt-4">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden border-3 transition-all duration-300 ${selectedImageIndex === idx
                            ? "border-primary shadow-primary ring-2 ring-primary/30"
                            : "border-transparent hover:border-primary/50"
                            }`}
                        >
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* 360 View Tab */}
                <TabsContent value="360" className="mt-0">
                  {(car as any).view_360_url ? (
                    <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-secondary border border-border">
                      <iframe
                        src={(car as any).view_360_url}
                        className="w-full h-full border-0"
                        title="360 View"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  ) : (car as any).video_360_url && (
                    <Suspense fallback={
                      <div className="aspect-[16/10] rounded-2xl bg-secondary flex items-center justify-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      </div>
                    }>
                      <Car360Viewer
                        videoUrl={(car as any).video_360_url}
                        thumbnailUrl={(car as any).video_360_thumbnail || car.main_image}
                        type={(car as any).video_360_type}
                        className="aspect-[16/10] rounded-2xl"
                      />
                    </Suspense>
                  )}

                  {/* 360 Info Card */}
                  <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/50 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <RotateCw className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">
                          {language === "ar" ? "عرض تفاعلي 360°" : "Interactive 360° View"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {language === "ar"
                            ? "اسحب للتدوير وتكبير للاستكشاف"
                            : "Drag to rotate and pinch to zoom"}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Title & Brand */}
              <div>
                {car.brands && (
                  <Link to={`/brands/${car.brands.id}`} className="inline-flex items-center gap-2 text-xs sm:text-sm text-primary font-semibold hover:underline">
                    {car.brands.logo_url && (
                      <img src={car.brands.logo_url} alt={car.brands.name} className="h-5 w-auto sm:h-6 object-contain" />
                    )}
                    {language === "ar" ? car.brands.name_ar : car.brands.name}
                  </Link>
                )}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground mt-2">
                  {language === "ar" ? car.name_ar : car.name}
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground mt-1">{car.model} - {car.year}</p>
              </div>

              {/* Price */}
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-secondary/30">
                <CardContent className="p-6 space-y-2">
                  <div className="flex items-end gap-4 flex-wrap">
                    {car.has_discount && car.original_price && (
                      <span className="text-xl text-muted-foreground line-through">
                        {formatPrice(car.original_price)}
                      </span>
                    )}
                    <span className="text-4xl font-black text-gradient-primary">
                      {formatPrice(car.price)}
                    </span>
                    {car.promotion_percent && (
                      <Badge className="bg-emerald-600 text-primary-foreground text-sm px-3 py-1 rounded-full">
                        %{car.promotion_percent} خصم عرض
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "* السعر شامل الضريبة" : "* Price includes VAT"}
                  </p>
                </CardContent>
              </Card>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Calendar, label: t.common.year, value: car.year },
                  { icon: Fuel, label: t.common.fuel, value: fuelTypeLabel },
                  { icon: Gauge, label: t.common.transmission, value: transmissionLabel },
                  { icon: Palette, label: t.common.color, value: (language === "ar" ? car.color_ar : car.color) || "-" },
                ].map((spec, idx) => (
                  <Card key={idx} className="border-border/50 hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <spec.icon className="h-6 w-6 text-primary mb-2" />
                      <span className="text-xs text-muted-foreground">{spec.label}</span>
                      <span className="font-bold text-lg">{spec.value}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Contact Buttons */}
              <div className="flex flex-col gap-3">
                <Button variant="premium" size="xl" className="gap-3 text-sm sm:text-base" onClick={handleOrderViaWhatsApp}>
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                  {t.common.whatsappOrder}
                </Button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <Button variant="whatsapp" size="lg" className="gap-2 text-sm sm:text-base" onClick={handleWhatsApp}>
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    {language === "ar" ? "استفسار" : "Inquire"}
                  </Button>
                  <Button variant="outline" size="lg" className="gap-2 text-sm sm:text-base" asChild>
                    <a href="tel:+966543389314">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                      {language === "ar" ? "اتصل" : "Call"}
                    </a>
                  </Button>
                  {/* Website order button */}
                  <Button
                    variant="default"
                    size="lg"
                    className="gap-2 text-sm sm:text-base sm:col-span-2"
                    onClick={() => setIsQuickOrderOpen(true)}
                  >
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                    {language === "ar" ? "طلب عبر الموقع" : "Order via website"}
                  </Button>
                  {/* Download Catalog Button */}
                  {(car as any).catalog_url && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 text-sm sm:text-base sm:col-span-2 border-primary/50 hover:bg-primary/10"
                      asChild
                    >
                      <a
                        href={(car as any).catalog_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                        {language === "ar" ? "تحميل الكاتالوج" : "Download Catalog"}
                      </a>
                    </Button>
                  )}
                </div>
                {/* Test Drive Booking Button */}
                <TestDriveBookingDialog
                  carId={car.id}
                  carName={language === "ar" ? `${car.name_ar} ${car.model} ${car.year}` : `${car.name} ${car.model} ${car.year}`}
                />
              </div>

              {/* Description */}
              {(language === "ar" ? car.description_ar : car.description) && (
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-foreground">
                    {language === "ar" ? "الوصف" : "Description"}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {language === "ar" ? car.description_ar : car.description}
                  </p>
                </div>
              )}

              {/* Additional Specs */}
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-foreground">
                  {language === "ar" ? "المواصفات" : "Specifications"}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t.common.brand, value: (language === "ar" ? car.brands?.name_ar : car.brands?.name) || "-" },
                    { label: t.common.model, value: car.model },
                    { label: t.common.mileage, value: `${car.mileage?.toLocaleString() || 0} ${language === "ar" ? "كم" : "km"}` },
                    ...(car.engine_size ? [{ label: language === "ar" ? "حجم المحرك" : "Engine Size", value: car.engine_size }] : []),
                  ].map((spec, idx) => (
                    <div key={idx} className="flex justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                      <span className="text-muted-foreground">{spec.label}</span>
                      <span className="font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compare Button */}
              <div className="pt-4 border-t border-border">
                <CompareButton carId={car.id} variant="full" className="w-full" />
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12 pt-8 border-t border-border">
            <ReviewsList carId={car.id} />
          </div>
        </div>
      </main>

      {/* Full Screen Gallery */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-7xl p-0 bg-background/95 backdrop-blur-xl border-0">
          <div className="relative aspect-video">
            <img
              src={currentImage}
              alt={language === "ar" ? car.name_ar : car.name}
              className="h-full w-full object-contain"
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-background/90 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-background/90 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-background/90 text-lg font-medium">
              {selectedImageIndex + 1} / {allImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CarQuickOrderDialog
        open={isQuickOrderOpen}
        onOpenChange={setIsQuickOrderOpen}
        car={car}
      />

      <Footer />
      <WhatsAppButton />
      <AIChatBot />
    </div>
  );
};

export default CarDetailsPage;
