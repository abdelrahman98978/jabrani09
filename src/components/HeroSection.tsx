import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Sparkles, Trophy, ShieldCheck, Zap } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HeroMarquee from "./HeroMarquee";
import heroVideo from "@/assets/hero-video.mp4";

const HeroSection = () => {
  const { data: settings } = useSettings();
  const { language, t } = useLanguage();
  const isRTL = language === "ar";

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

  const heroImage = settings?.hero_image_url || "https://images.unsplash.com/photo-1621007947382-bb34aa031024?q=80&w=2070";

  return (
    <section className="relative h-[100vh] flex items-center justify-center overflow-hidden bg-black select-none">
      {/* Cinematic Background Layer */}
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.5, ease: [0.19, 1, 0.22, 1] }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={heroImage}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        {/* Multilayered Overlays for Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
      </motion.div>

      {/* Editorial Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 text-center">
        <div className="max-w-6xl mx-auto">
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
            className="mb-12 inline-flex items-center"
          >
            <span className="text-[11px] uppercase tracking-[0.5em] text-primary font-bold">
              {isRTL ? "قمة السيادة الميكانيكية" : "The Apex of Automotive Sovereignty"}
            </span>
          </motion.div>

          {/* Master Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.7, ease: [0.19, 1, 0.22, 1] }}
            className="text-6xl sm:text-8xl md:text-[11rem] text-hero text-white mb-16"
          >
            {isRTL ? (
              <>
                الجوهرة <span className="font-bold">المصقولة</span>
                <br />
                بإتقان <span className="text-white/30 italic">عالمي</span>
              </>
            ) : (
              <>
                Refined <span className="font-bold">Power</span>
                <br />
                Defined by <span className="text-white/30 italic">Art</span>
              </>
            )}
          </motion.h1>

          {/* World-Class CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1, ease: [0.19, 1, 0.22, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-12"
          >
            <Link to="/cars">
              <button className="group relative px-12 py-5 bg-white text-black text-[12px] uppercase tracking-[0.4em] font-bold overflow-hidden transition-all duration-700 hover:tracking-[0.6em]">
                <span className="relative z-10">{isRTL ? "تصفح الأسطول" : "Explore Fleet"}</span>
                <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
              </button>
            </Link>
            <Link to="/contact">
              <button className="px-12 py-5 border border-white/20 text-white text-[12px] uppercase tracking-[0.4em] font-medium transition-all duration-700 hover:bg-white hover:text-black">
                {isRTL ? "طلب استشارة" : "Request Consult"}
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
          {/* Precision Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.5 }}
            className="mt-24 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            {[
              { label: isRTL ? "مركبة متاحة" : "Available Fleet", value: stats?.carsCount || "250+", icon: Zap },
              { label: isRTL ? "علامة تجارية" : "Elite Brands", value: stats?.brandsCount || "15+", icon: Trophy },
              { label: isRTL ? "عميل راضٍ" : "Happy Clients", value: stats?.customersCount || "1200+", icon: ShieldCheck },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-4 group">
                <div className="w-px h-8 bg-white/10 group-hover:bg-primary transition-colors duration-700" />
                <span className="text-3xl font-bold text-white tracking-tighter">
                  {item.value}
                </span>
                <span className="text-[9px] uppercase tracking-[0.4em] text-white/30 group-hover:text-white/60 transition-colors duration-700">
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>


      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent opacity-20" />
      </motion.div>

      {/* Marquee */}
      <div className="absolute bottom-0 left-0 w-full z-20">
        <HeroMarquee />
      </div>
    </section>
  );
};

export default HeroSection;
