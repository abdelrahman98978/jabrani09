import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Sparkles, Trophy, ShieldCheck, Zap } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HeroMarquee from "./HeroMarquee";

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

  const heroImage = settings?.hero_image_url || "https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=2071";

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden perspective-container bg-black">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat ken-burns"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 pt-40">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Subtle Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-8"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-medium">
              {isRTL ? "التميز في عالم السيارات" : "Excellence in Motion"}
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: 0.4 }}
            className="text-5xl sm:text-7xl md:text-9xl font-light text-center mb-12 text-white leading-[1.05] tracking-tight"
          >
            {isRTL ? (
              <>
                اكتشف <span className="font-bold">الفخامة</span>
                <br />
                في كل <span className="text-white/40 italic">تفصيل</span>
              </>
            ) : (
              <>
                Driven by <span className="font-bold">Precision</span>
                <br />
                Defined by <span className="text-white/40 italic">Luxury</span>
              </>
            )}
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-sm md:text-lg text-white/50 text-center max-w-xl mb-16 uppercase tracking-[0.2em] font-light leading-relaxed"
          >
            {isRTL
              ? "نخبة من أكثر السيارات فخامة وأداءً في السوق العالمي ، منتقاة بعناية لترتقي بتوقعاتك."
              : "Discover a curated collection of the world's most prestigious automobiles, where performance meets artistry."}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-8 mb-24"
          >
            <Link to="/cars" className="w-full sm:w-auto">
              <Button size="xl" className="w-full sm:w-72 h-14 text-[13px] uppercase tracking-[0.3em] font-medium rounded-none bg-white text-black hover:bg-white/90 border border-white/50 shadow-2xl transition-all group">
                {isRTL ? "تصفح المجموعة" : "Explore Fleet"}
                <ArrowLeft className={`h-4 w-4 ms-3 transition-transform ${isRTL ? 'group-hover:translate-x-2' : 'group-hover:-translate-x-2'}`} />
              </Button>
            </Link>
            <Link to="/contact" className="w-full sm:w-auto">
              <Button size="xl" variant="outline" className="w-full sm:w-72 h-14 text-[13px] uppercase tracking-[0.3em] font-medium rounded-none border-white/20 text-white hover:bg-white/10 transition-all">
                {isRTL ? "تواصل معنا" : "Contact Us"}
              </Button>
            </Link>
          </motion.div>

          {/* Trusted stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12 w-full`}
          >
            {[
              { icon: ShieldCheck, val: stats?.carsCount, label: isRTL ? "سيارة معتمدة" : "Certified Cars" },
              { icon: Zap, val: stats?.brandsCount, label: isRTL ? "وكالة عالمية" : "Global Brands" },
              { icon: Trophy, val: "10+", label: isRTL ? "سنوات خبرة" : "Years Exp." },
              { icon: Sparkles, val: stats?.customersCount, label: isRTL ? "عميل سعيد" : "Happy Clients" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center p-6 rounded-none border border-white/5 bg-white/[0.02] backdrop-blur-sm group hover:bg-white/[0.05] transition-colors">
                <item.icon className="h-6 w-6 text-white/40 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-2xl font-light text-white mb-1">
                  {typeof item.val === 'number' ? `+${item.val}` : item.val}
                </span>
                <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest text-center">
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

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
