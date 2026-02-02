import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Sparkles, Trophy, ShieldCheck, Zap } from "lucide-react";
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
  const secondLineText = isRTL ? "السيارات الفاخرة" : "Luxury Excellence";

  const handleFirstComplete = useCallback(() => {
    setShowSecondLine(true);
  }, []);

  const handleSecondComplete = useCallback(() => {
    setAllComplete(true);
  }, []);

  const { displayText: firstLine, isComplete: firstLineComplete } = useTypewriter(firstLineText, {
    speed: 60,
    delay: 500,
    onComplete: handleFirstComplete,
  });

  const { displayText: secondLine, isComplete: secondLineComplete } = useTypewriter(
    showSecondLine ? secondLineText : "",
    {
      speed: 60,
      delay: 200,
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
        carsCount: carsResult.count || 250,
        brandsCount: brandsResult.count || 15,
        customersCount: ordersResult.count || 1200,
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  const heroImage = settings?.hero_image_url || heroBanner;
  const heroType = (settings as any)?.hero_type || "image";
  // Default to a premium car video for the request
  const defaultVideo = "https://cdn.pixabay.com/video/2024/02/13/200508-913076114_large.mp4";
  const heroVideoUrl = (settings as any)?.hero_video_url || defaultVideo;

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden perspective-container bg-black">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={heroImage}
          className="absolute inset-0 w-full h-full object-cover scale-105"
        >
          <source src={heroVideoUrl} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
      </div>

      {/* Premium Decorative Orbs */}
      <div className="absolute top-1/4 -right-1/4 w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute -bottom-1/4 -left-1/4 w-[50%] h-[50%] bg-accent/20 rounded-full blur-[150px] animate-pulse delay-1000" />

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 pt-20">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          {/* Hand-Picked Selection Badge */}
          <div className={`transition-all duration-1000 transform ${allComplete ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl mb-12 group hover:bg-white/20 transition-all cursor-default">
              <Trophy className="h-5 w-5 text-gradient-gold animate-bounce" />
              <span className="text-sm font-black text-white uppercase tracking-[0.2em]">
                {isRTL ? "المعرض الأول في المملكة" : "The #1 Showroom in KSA"}
              </span>
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-center mb-10 leading-[1.1] tracking-tighter">
            <span className="block text-white drop-shadow-2xl">
              {firstLine}
              {!firstLineComplete && <span className="typewriter-cursor">|</span>}
            </span>
            {showSecondLine && (
              <span className="block mt-4 text-gradient-gold drop-shadow-2xl italic">
                {secondLine}
                {!secondLineComplete && <span className="typewriter-cursor">|</span>}
              </span>
            )}
          </h1>

          {/* Subtext */}
          <p className={`text-lg md:text-2xl text-white/70 text-center max-w-3xl mb-12 transition-all duration-1000 delay-300 transform ${allComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {isRTL
              ? "نحن لا نبيع السيارات فحسب ، بل نصنع لك أسلوب حياة استثنائي يجمع بين الفخامة المطلقة والأداء الجبار."
              : "Experience the pinnacle of automotive luxury where pure elegance meets uncompromising performance."}
          </p>

          {/* CTAs */}
          <div className={`flex flex-col sm:flex-row gap-6 mb-20 transition-all duration-1000 delay-500 transform ${allComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Link to="/cars" className="w-full sm:w-auto">
              <Button size="xl" variant="gold" className="w-full sm:w-80 h-16 text-xl font-black rounded-2xl shadow-[0_0_50px_rgba(255,165,0,0.3)] hover:shadow-[0_0_70px_rgba(255,165,0,0.5)] transition-all group overflow-hidden relative">
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <Search className="h-6 w-6 group-hover:scale-125 transition-transform" />
                  {isRTL ? "اكتشف الأسطول" : "Explore Fleet"}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Button>
            </Link>
            <Link to="/contact" className="w-full sm:w-auto">
              <Button size="xl" variant="outline" className="w-full sm:w-80 h-16 text-xl font-black rounded-2xl border-2 border-white/30 text-white hover:bg-white/10 hover:border-white transition-all group">
                {isRTL ? "طلب استشارة" : "Request Consultation"}
                <ArrowLeft className={`h-6 w-6 ms-2 transition-transform ${isRTL ? 'group-hover:translate-x-2' : 'group-hover:-translate-x-2'}`} />
              </Button>
            </Link>
          </div>

          {/* Trusted stats */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12 w-full transition-all duration-1000 delay-700 transform ${allComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {[
              { icon: ShieldCheck, val: stats?.carsCount, label: isRTL ? "سيارة معتمدة" : "Certified Cars" },
              { icon: Zap, val: stats?.brandsCount, label: isRTL ? "وكالة عالمية" : "Global Brands" },
              { icon: Trophy, val: "10+", label: isRTL ? "سنوات خبرة" : "Years Exp." },
              { icon: Sparkles, val: stats?.customersCount, label: isRTL ? "عميل سعيد" : "Happy Clients" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center p-6 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 group hover:bg-white/10 transition-colors">
                <item.icon className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-3xl font-black text-white mb-1">
                  {typeof item.val === 'number' ? `+${item.val}` : item.val}
                </span>
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest text-center">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 transition-opacity duration-1000 ${allComplete ? 'opacity-100' : 'opacity-0'}`}>
        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Scroll</span>
        <div className="w-1 h-12 bg-gradient-to-b from-primary to-transparent rounded-full animate-pulse" />
      </div>

      {/* Marquee */}
      <div className="absolute bottom-0 left-0 w-full z-20">
        <HeroMarquee />
      </div>
    </section>
  );
};

export default HeroSection;
