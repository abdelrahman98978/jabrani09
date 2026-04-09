import { useEffect, useState, useRef } from "react";
import { Car, Users, Award, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

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
    <div ref={counterRef} className="text-4xl md:text-6xl font-light tracking-tighter">
      <span className="opacity-20">{prefix}</span>
      {count.toLocaleString()}
      <span className="opacity-20">{suffix}</span>
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
        carsCount: carsResult.count || 0,
        brandsCount: brandsResult.count || 0,
        customersCount: ordersResult.count || 0,
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  const counters = [
    {
      icon: Car,
      value: stats?.carsCount || 0,
      suffix: "+",
      labelAr: "سيارة متوفرة",
      labelEn: "Available Cars",
    },
    {
      icon: Award,
      value: stats?.brandsCount || 0,
      suffix: "+",
      labelAr: "ماركة عالمية",
      labelEn: "Global Brands",
    },
    {
      icon: Users,
      value: stats?.customersCount || 0,
      suffix: "+",
      labelAr: "عميل سعيد",
      labelEn: "Happy Customers",
    },
    {
      icon: Clock,
      value: 10,
      suffix: "+",
      labelAr: "سنوات خبرة",
      labelEn: "Years Experience",
    },
  ];

  return (
    <section className="py-40 bg-black overflow-hidden border-y border-white/5">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-24 md:gap-40">
          {counters.map((counter, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: idx * 0.1, ease: [0.19, 1, 0.22, 1] }}
              className="group flex flex-col items-start space-y-8"
            >
              <div className="text-primary group-hover:scale-110 transition-transform duration-1000">
                <counter.icon className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="space-y-4">
                <AnimatedCounter
                  end={counter.value}
                  suffix={counter.suffix}
                />
                
                <div className="space-y-4">
                  <p className="text-[11px] uppercase tracking-[0.6em] font-bold text-white/30 group-hover:text-primary transition-colors duration-700">
                    {isRTL ? counter.labelAr : counter.labelEn}
                  </p>
                  <div className="w-8 h-[1px] bg-primary/20 group-hover:w-full transition-all duration-1000" />
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
