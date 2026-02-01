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
    <div ref={counterRef} className="text-3xl md:text-4xl lg:text-5xl font-black text-gradient-gold">
      {prefix}{count.toLocaleString()}{suffix}
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
    <section className="wp-stats-counter py-16 bg-accent relative overflow-hidden">
      {/* Pattern Overlay */}
      <div className="absolute inset-0 pattern-overlay opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {counters.map((counter, idx) => (
            <div 
              key={idx} 
              className="text-center p-6 rounded-xl bg-background/5 backdrop-blur-sm border border-white/10 hover:bg-background/10 transition-all hover-lift-3d"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4 icon-float-3d">
                <counter.icon className="h-8 w-8 text-primary" />
              </div>
              <AnimatedCounter 
                end={counter.value} 
                suffix={counter.suffix}
              />
              <p className="text-accent-foreground/80 mt-2 text-sm md:text-base">
                {isRTL ? counter.labelAr : counter.labelEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
