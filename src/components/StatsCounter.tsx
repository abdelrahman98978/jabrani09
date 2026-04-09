import { useEffect, useState, useRef } from "react";
import { Car, Users, Award, Clock, Trophy, ShieldCheck, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

interface CounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

const AnimatedCounter = ({ end, duration = 2000, suffix = "", prefix = "" }: CounterProps) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number;
          const startValue = 0;

          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(startValue + (end - startValue) * easeOutQuart));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <div ref={counterRef} className="text-5xl md:text-8xl font-black tracking-tighter text-white tabular-nums">
      <span className="opacity-20 text-[0.5em] align-top mr-2">{prefix}</span>
      {count.toLocaleString()}
      <span className="text-primary italic ml-1">{suffix}</span>
    </div>
  );
};

const StatsCounter = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const { data: stats } = useQuery({
    queryKey: ["stats-counter"],
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

  const counters = [
    {
      icon: Car,
      value: stats?.carsCount || 250,
      suffix: "+",
      labelAr: "مركبة سيادية",
      labelEn: "Sovereign Fleet",
    },
    {
      icon: Trophy,
      value: stats?.brandsCount || 15,
      suffix: "",
      labelAr: "ماركة نخبوية",
      labelEn: "Elite Signatures",
    },
    {
      icon: ShieldCheck,
      value: stats?.customersCount || 1200,
      suffix: "+",
      labelAr: "مواطن راضٍ",
      labelEn: "Verified Owners",
    },
    {
      icon: Zap,
      value: 10,
      suffix: "Y",
      labelAr: "سنوات من الإرث",
      labelEn: "Years of Legacy",
    },
  ];

  return (
    <section className="py-48 bg-black overflow-hidden border-y border-white/5 relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />
         <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>

      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-24 md:gap-40">
          {counters.map((counter, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: idx * 0.1, ease: [0.19, 1, 0.22, 1] }}
              className="group flex flex-col items-start space-y-12"
            >
              <div className="flex items-center gap-4">
                 <div className="h-0.5 w-8 bg-primary/40 group-hover:w-16 transition-all duration-1000" />
                 <counter.icon className="h-4 w-4 text-primary opacity-20 group-hover:opacity-100 transition-all duration-700" />
              </div>
              
              <div className="space-y-6">
                <AnimatedCounter
                  end={counter.value}
                  suffix={counter.suffix}
                />
                
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.8em] font-black text-white/20 group-hover:text-white transition-colors duration-700">
                    {isRTL ? counter.labelAr : counter.labelEn}
                  </p>
                  <div className="w-12 h-[1px] bg-white/5 overflow-hidden">
                     <motion.div 
                       initial={{ x: "-100%" }}
                       whileInView={{ x: "0%" }}
                       transition={{ duration: 1.5, delay: 0.5 + (idx * 0.1) }}
                       className="w-full h-full bg-primary" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
