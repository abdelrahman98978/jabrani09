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
  Share2,
  Phone,
  ArrowRight,
  MapPin,
  Settings,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useState, lazy, Suspense, useRef, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CarQuickOrderDialog } from "@/components/CarQuickOrderDialog";
import ReviewsList from "@/components/ReviewsList";
import TestDriveBookingDialog from "@/components/TestDriveBookingDialog";
import { motion, AnimatePresence } from "framer-motion";
import { useTenant } from "@/contexts/TenantContext";

// Lazy load the 360 viewer for better performance
const Car360Viewer = lazy(() => import("@/components/Car360Viewer"));

const CarDetailsPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const { tenant, isLoading: isTenantLoading } = useTenant();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("gallery");
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  const { data: car, isLoading } = useQuery({
    queryKey: ["car", id, tenant?.id],
    enabled: !!id && !isTenantLoading && !!tenant,
    queryFn: async () => {
      const [{ data, error }, { data: promotions, error: promoError }] = await Promise.all([
        supabase
          .from("cars")
          .select("*, brands(*)")
          .eq("id", id)
          .eq("tenant_id", tenant?.id)
          .maybeSingle(),
        supabase
          .from("promotions")
          .select("*")
          .eq("tenant_id", tenant?.id),
      ]);

      if (error) throw error;
      if (promoError) throw promoError;

      if (data) {
        await supabase
          .from("cars")
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq("id", id)
          .eq("tenant_id", tenant?.id);
      }
// ... [applyPromotionsToCar logic remains same]
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
  });

  const { data: settings } = useSettings();
  const whatsappNumber = (settings as any)?.phone || "966543389314";

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
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
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
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: isRTL ? `${car?.name_ar} ${car?.model}` : `${car?.name} ${car?.model}`,
          url: window.location.href,
        });
      } else {
        throw new Error("Share not supported");
      }
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({ description: isRTL ? "تم نسخ الرابط" : "Link copied" });
    }
  };

  const allImages = [car?.main_image, ...(car?.images || [])].filter(Boolean) as string[];
  const nextImage = () => setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-primary font-bold tracking-[0.8em] uppercase text-xs"
        >
          Analyzing Specification
        </motion.div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="container mx-auto px-6 pt-64 text-center">
          <h1 className="text-4xl font-light text-white italic tracking-tighter uppercase">Artifact Missing</h1>
          <Link to="/cars" className="mt-12 inline-block px-12 py-5 border border-primary text-primary uppercase tracking-[0.4em] text-[10px] font-black hover:bg-primary hover:text-black transition-all">
            Return to Fleet
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

      {/* Cinematic Over-sized Hero */}
      <section className="relative h-[85vh] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImageIndex}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 2, ease: [0.19, 1, 0.22, 1] }}
            className="absolute inset-0"
          >
            {hasHeroVideo && selectedImageIndex === 0 ? (
              <video
                ref={heroVideoRef}
                autoPlay
                muted
                loop
                playsInline
                poster={heroVideoThumbnail}
                className="w-full h-full object-cover grayscale opacity-60"
              >
                <source src={heroVideoUrl} type="video/mp4" />
              </video>
            ) : (
              <img src={currentImage} className="w-full h-full object-cover grayscale opacity-40 contrast-125" alt="" />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        {/* Editorial Floating Data */}
        <div className="absolute inset-0 flex flex-col justify-end pb-24">
           <div className="container mx-auto px-6 md:px-12">
              <div className="flex flex-col md:flex-row items-end justify-between gap-12">
                 <motion.div
                   initial={{ opacity: 0, x: -50 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                   className="max-w-5xl space-y-6"
                 >
                    <div className="flex items-center gap-6">
                       {car.brands?.logo_url && (
                          <div className="h-16 w-16 bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center p-3">
                             <img src={car.brands.logo_url} className="w-full h-full object-contain grayscale brightness-200" alt="" />
                          </div>
                       )}
                       <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-[0.6em] text-primary font-black">Institutional Record</p>
                          <p className="text-white/60 text-[11px] uppercase tracking-[0.4em]">
                             {isRTL ? car.brands?.name_ar : car.brands?.name} • Series {car.model}
                          </p>
                       </div>
                    </div>
                    <h1 className="text-7xl md:text-[10rem] text-hero text-white tracking-tighter leading-[0.85] uppercase">
                       {isRTL ? car.name_ar : car.name}
                    </h1>
                 </motion.div>

                 <motion.div
                   initial={{ opacity: 0, x: 50 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ duration: 1.5, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
                   className="text-right space-y-4"
                 >
                    <p className="text-[10px] uppercase tracking-[0.8em] text-white/20 mb-2">Acquisition Value</p>
                    <div className="flex flex-col items-end">
                       {car.has_discount && (
                          <span className="text-2xl text-white/10 line-through tracking-tighter mb-2 italic">
                            {formatPrice(car.original_price || car.price)}
                          </span>
                       )}
                       <span className="text-6xl md:text-8xl font-black text-white tracking-tighter">
                         {formatPrice(car.price)}
                       </span>
                    </div>
                 </motion.div>
              </div>
           </div>
        </div>
      </section>

      {/* Main Orchestration */}
      <main className="py-32">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-24">
            
            {/* Gallery Viewport */}
            <div className="lg:col-span-8 space-y-12">
               <div className="relative group overflow-hidden bg-surface-low border border-white/5 cursor-crosshair">
                  <motion.img
                    key={selectedImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    src={currentImage}
                    className="w-full aspect-[16/9] object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                     <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] uppercase tracking-[0.5em] text-white/40">Visual Specimen {selectedImageIndex + 1}/{allImages.length}</span>
                        <div className="flex gap-4">
                           <button onClick={prevImage} className="w-14 h-14 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                              <ChevronLeft className="h-4 w-4" />
                           </button>
                           <button onClick={nextImage} className="w-14 h-14 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                              <ChevronRight className="h-4 w-4" />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`aspect-square border transition-all duration-700 p-px ${
                        selectedImageIndex === idx ? 'border-primary opacity-100' : 'border-white/5 opacity-30 hover:opacity-60'
                      }`}
                    >
                       <img src={img} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                  {/* Digital 360 Entry if available */}
                  {(car as any)?.has_360 && (
                    <button className="aspect-square border border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-2 group hover:bg-primary hover:text-black transition-all">
                       <RotateCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-1000" />
                       <span className="text-[8px] uppercase tracking-widest font-black">VR Orbit</span>
                    </button>
                  )}
               </div>
            </div>

            {/* Procurement Sidebar */}
            <div className="lg:col-span-4 space-y-20">
               <div className="space-y-12 bg-surface-low border border-white/5 p-12">
                  <div className="space-y-4">
                     <p className="text-[10px] uppercase tracking-[0.6em] text-primary font-black">Engagement Terminal</p>
                     <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Secure Procurement</h3>
                  </div>

                  <div className="space-y-4">
                     <button
                        onClick={handleOrderViaWhatsApp}
                        className="w-full h-24 bg-primary text-black text-[12px] uppercase tracking-[0.6em] font-black flex items-center justify-center gap-6 group hover:bg-white transition-all duration-700"
                     >
                        <ShoppingCart className="h-4 w-4" />
                        Initiate Acquisition
                        <ArrowRight className="h-3 w-3 -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                     </button>
                     <div className="grid grid-cols-2 gap-4">
                        <button onClick={handleWhatsApp} className="h-16 border border-white/10 text-white text-[10px] uppercase tracking-[0.4em] font-black hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3">
                           <Phone className="h-3 w-3" /> Inquire
                        </button>
                        <button onClick={handleShare} className="h-16 border border-white/10 text-white text-[10px] uppercase tracking-[0.4em] font-black hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3">
                           <Share2 className="h-3 w-3" /> Dispatch
                        </button>
                     </div>
                  </div>

                  <div className="pt-8 border-t border-white/5 flex items-center gap-4">
                     <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                     <span className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-bold">Authorized Agent Available</span>
                  </div>
               </div>

               {/* Institutional Credentials */}
               <div className="space-y-8">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                     <p className="text-[10px] uppercase tracking-[0.6em] text-white/30 font-black">Technical Grid</p>
                     <Settings className="h-3 w-3 text-white/10" />
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5">
                     {[
                       { label: "Temporal", value: car.year, icon: Calendar },
                       { label: "Propulsion", value: fuelTypeLabel, icon: Fuel },
                       { label: "Sequence", value: transmissionLabel, icon: Gauge },
                       { label: "Tone", value: (isRTL ? car.color_ar : car.color) || "-", icon: Palette },
                       { label: "Engagement", value: `${car.mileage?.toLocaleString() || 0} KM`, icon: Zap },
                       { label: "Efficiency", value: car.engine_size || "Standard", icon: ShieldCheck }
                     ].map((spec, i) => (
                       <div key={i} className="bg-black p-10 space-y-4 group transition-all duration-700 hover:bg-surface-low">
                          <spec.icon className="h-4 w-4 text-white/5 group-hover:text-primary transition-colors" />
                          <div className="space-y-1">
                             <p className="text-[8px] uppercase tracking-[0.5em] text-white/20 font-black">{spec.label}</p>
                             <p className="text-[13px] uppercase tracking-[0.2em] text-white font-bold">{spec.value}</p>
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

          {/* Narrative Block */}
          <section className="mt-48 grid lg:grid-cols-12 gap-24 border-t border-white/5 pt-40">
             <div className="lg:col-span-4">
                <div className="sticky top-40 space-y-6">
                   <p className="text-[10px] uppercase tracking-[0.8em] text-primary font-black">Design Philosophy</p>
                   <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">The <br /> Collective <br /> Narrative</h2>
                   <div className="w-12 h-1 bg-primary/20" />
                </div>
             </div>
             <div className="lg:col-span-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2 }}
                  className="space-y-12"
                >
                   <p className="text-3xl md:text-5xl font-light text-white/60 leading-tight tracking-tight italic">
                      {isRTL ? car.description_ar : car.description || "Entering a realm of unprecedented mechanical authority, this curated specimen represents the horizontal zenith of its lineage."}
                   </p>
                   <div className="flex flex-wrap gap-4 pt-12">
                      {["Certified Heritage", "Hardware Verified", "Institutional Grade", "Global Series"].map((t, i) => (
                        <div key={i} className="px-6 py-2 border border-white/5 text-[9px] uppercase tracking-[0.4em] text-white/20 font-black">
                           {t}
                        </div>
                      ))}
                   </div>
                </motion.div>
             </div>
          </section>

          {/* Institutional Reviews */}
          <section className="mt-48 border-t border-white/5 pt-40">
             <div className="flex items-end justify-between mb-24">
                <div className="space-y-4">
                   <p className="text-[10px] uppercase tracking-[0.8em] text-white/20 font-black">Verification Feed</p>
                   <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Market Sentiments</h2>
                </div>
             </div>
             <ReviewsList carId={car.id} />
          </section>
        </div>
      </main>

      {/* Cinematic Overlays */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-[95vw] h-[95vh] p-0 bg-black/95 backdrop-blur-3xl border-none rounded-none">
          <div className="relative w-full h-full flex flex-col items-center justify-center p-12">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                src={currentImage}
                className="max-h-full max-w-full object-contain shadow-2xl"
              />
            </AnimatePresence>
            
            <div className="absolute inset-0 flex items-center justify-between px-12 pointer-events-none">
                <button onClick={prevImage} className="w-24 h-24 border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:border-white transition-all rounded-full pointer-events-auto">
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button onClick={nextImage} className="w-24 h-24 border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:border-white transition-all rounded-full pointer-events-auto">
                  <ChevronRight className="h-8 w-8" />
                </button>
            </div>
            
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto overflow-x-auto max-w-full p-4">
               {allImages.map((img, idx) => (
                 <button key={idx} onClick={() => setSelectedImageIndex(idx)} className={`w-16 h-16 border-2 transition-all ${selectedImageIndex === idx ? 'border-primary' : 'border-transparent opacity-40'}`}>
                    <img src={img} className="w-full h-full object-cover" alt="" />
                 </button>
               ))}
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
