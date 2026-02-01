import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroBanner from "@/assets/hero-banner.jpg";
import HeroMarquee from "./HeroMarquee";
import useTypewriter from "@/hooks/useTypewriter";

const HeroSection = () => {
  const { data: settings } = useSettings();
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const [showSecondLine, setShowSecondLine] = useState(false);
  const [allComplete, setAllComplete] = useState(false);

  // Typewriter text
  const firstLineText = isRTL ? "اكتشف عالم" : "Discover the World of";
  const secondLineText = isRTL ? "السيارات الفاخرة" : "Luxury Cars";

  const handleFirstComplete = useCallback(() => {
    setShowSecondLine(true);
  }, []);

  const handleSecondComplete = useCallback(() => {
    setAllComplete(true);
  }, []);

  const { displayText: firstLine, isComplete: firstLineComplete } = useTypewriter(firstLineText, {
    speed: 80,
    delay: 800,
    onComplete: handleFirstComplete,
  });

  const { displayText: secondLine, isComplete: secondLineComplete } = useTypewriter(
    showSecondLine ? secondLineText : "",
    { 
      speed: 80, 
      delay: 300,
      onComplete: handleSecondComplete,
    }
  );

  // Fetch dynamic stats
  const { data: stats } = useQuery({
    queryKey: ["hero-stats"],
    queryFn: async () => {
      const [carsResult, brandsResult, ordersResult] = await Promise.all([
        supabase.from("cars").select("id", { count: "exact", head: true }).eq("status", "available"),
        supabase.from("brands").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "completed"),
      ]);
      
      return {
        carsCount: carsResult.count || 0,
        brandsCount: brandsResult.count || 0,
        customersCount: ordersResult.count || 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const heroImage = settings?.hero_image_url || heroBanner;
  const heroType = (settings as any)?.hero_type || "image";
  const heroVideoUrl = (settings as any)?.hero_video_url;
  const overlayOpacity = (settings as any)?.hero_overlay_opacity || "medium";
  const siteName = isRTL 
    ? (settings?.showroom_name || t.siteName)
    : (settings?.showroom_name_en || t.siteName);

  // Get overlay class based on opacity setting
  const getOverlayClass = () => {
    switch (overlayOpacity) {
      case "light":
        return "hero-overlay-light";
      case "dark":
        return "hero-overlay-dark";
      default:
        return "hero-overlay";
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden perspective-container">
      {/* Background - Video or Image with Parallax */}
      <div className="absolute inset-0 parallax-layer-1">
        {heroType === "video" && heroVideoUrl ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-110"
          >
            <source src={heroVideoUrl} type="video/mp4" />
            {/* Fallback to image if video fails */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${heroImage})` }}
            />
          </video>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 transition-transform duration-1000"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        )}
      </div>
      
      {/* Overlay - Dynamic opacity */}
      <div className={`absolute inset-0 ${getOverlayClass()}`} />
      
      {/* Animated 3D Gradient Orbs */}
      <div className="absolute top-10 right-10 w-48 md:w-96 h-48 md:h-96 bg-primary/15 rounded-full blur-3xl animate-float-3d" />
      <div className="absolute bottom-20 left-10 w-40 md:w-80 h-40 md:h-80 bg-accent/10 rounded-full blur-3xl animate-float-3d" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/4 w-32 md:w-64 h-32 md:h-64 bg-primary/10 rounded-full blur-3xl animate-float-3d" style={{ animationDelay: '2.5s' }} />
      
      {/* Floating 3D Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full animate-float-3d"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>
      
      {/* Content with 3D Effects */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-20 pb-24 md:pb-32">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 stagger-3d-entrance">
          {/* Badge with 3D Float */}
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-black/40 backdrop-blur-sm border border-primary/50 badge-3d-float shadow-lg">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs md:text-sm font-medium text-white">
              {isRTL ? "موزع معتمد لأشهر الماركات" : "Authorized Dealer for Premium Brands"}
            </span>
          </div>
          
          {/* Heading with typewriter effect and 3D text */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-tight hero-text-shadow min-h-[120px] md:min-h-[180px]">
            <span className="text-white drop-shadow-lg block animate-slide-3d" style={{ animationDelay: '0.2s' }}>
              {firstLine}
              {!firstLineComplete && (
                <span className="typewriter-cursor">|</span>
              )}
            </span>
            {showSecondLine && (
              <span className="text-gradient-gold drop-shadow-lg block mt-2 animate-slide-3d" style={{ animationDelay: '0.4s' }}>
                {secondLine}
                {!secondLineComplete && (
                  <span className="typewriter-cursor">|</span>
                )}
              </span>
            )}
          </h1>
          
          {/* Description - fade in with 3D effect */}
          <p className={`text-base md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed drop-shadow-md px-4 transition-all duration-700 ${
            allComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {isRTL 
              ? (settings?.about_text_ar || "نقدم لكم أفضل السيارات الجديدة والمستعملة بأسعار منافسة، مع ضمان شامل وخدمات ما بعد البيع المتميزة")
              : (settings?.about_text || "We offer the best new and used cars at competitive prices, with comprehensive warranty and excellent after-sales services")
            }
          </p>
          
          {/* CTA Buttons with 3D hover effects */}
          <div className={`flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4 transition-all duration-700 delay-200 ${
            allComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Link to="/cars" className="w-full sm:w-auto">
              <Button variant="gold" size="lg" className="gap-2 md:gap-3 w-full sm:w-auto text-sm md:text-base hover-lift-3d btn-glow">
                <Search className="h-4 w-4 md:h-5 md:w-5" />
                {isRTL ? "تصفح السيارات" : "Browse Cars"}
              </Button>
            </Link>
            <Link to="/contact" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="gap-2 md:gap-3 border-white/50 text-white hover:bg-white/10 hover:text-white w-full sm:w-auto text-sm md:text-base hover-lift-3d">
                {isRTL ? "تواصل معنا" : "Contact Us"}
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
          </div>
          
          {/* Stats with 3D card effects */}
          <div className={`grid grid-cols-3 gap-4 md:gap-8 pt-8 md:pt-12 transition-all duration-700 delay-500 ${
            allComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {[
              { count: stats?.carsCount || 0, label: isRTL ? "سيارة متوفرة" : "Available Cars" },
              { count: stats?.brandsCount || 0, label: isRTL ? "ماركات عالمية" : "Global Brands" },
              { count: stats?.customersCount || 0, label: isRTL ? "عميل سعيد" : "Happy Customers" },
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="text-center p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 card-3d-tilt hover:border-primary/30 transition-all"
                style={{ animationDelay: `${0.6 + idx * 0.1}s` }}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-gradient-gold drop-shadow-lg animate-pulse-scale">
                  +{stat.count}
                </div>
                <div className="text-xs md:text-sm text-white/70 mt-1 drop-shadow">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator with 3D bounce */}
      <div className={`absolute bottom-20 md:bottom-16 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-500 ${
        allComplete ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="w-5 h-8 md:w-6 md:h-10 rounded-full border-2 border-primary/50 flex justify-center pt-2 animate-bounce-3d">
          <div className="w-1 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>

      {/* Marquee */}
      <HeroMarquee />
    </section>
  );
};

export default HeroSection;
