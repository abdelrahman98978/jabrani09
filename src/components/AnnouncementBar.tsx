import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { X, Gift, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Promotion {
  id: string;
  name: string;
  name_ar: string;
  discount_value: number | null;
  discount_type: string | null;
  end_date: string | null;
  coupon_code: string | null;
}

const CountdownTimer = ({ endDate }: { endDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex items-center gap-1 text-xs font-mono bg-background/20 rounded px-2 py-1">
      <Clock className="h-3 w-3" />
      <span>{String(timeLeft.days).padStart(2, "0")}:</span>
      <span>{String(timeLeft.hours).padStart(2, "0")}:</span>
      <span>{String(timeLeft.minutes).padStart(2, "0")}:</span>
      <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
    </div>
  );
};

const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const { data: promotions } = useQuery({
    queryKey: ["active-promotions-bar"],
    queryFn: async () => {
      const { data } = await supabase
        .from("promotions")
        .select("id, name, name_ar, discount_value, discount_type, end_date, coupon_code")
        .eq("is_active", true)
        .gte("end_date", new Date().toISOString())
        .order("end_date", { ascending: true })
        .limit(5);
      return data as Promotion[] | null;
    },
  });

  // Auto rotate promotions
  useEffect(() => {
    if (!promotions || promotions.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [promotions]);

  // Check if dismissed in session
  useEffect(() => {
    const dismissed = sessionStorage.getItem("announcement-dismissed");
    if (dismissed) setIsVisible(false);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("announcement-dismissed", "true");
  };

  if (!isVisible || !promotions || promotions.length === 0) return null;

  const currentPromo = promotions[currentIndex];
  const promoName = isRTL ? currentPromo.name_ar : currentPromo.name;
  const discountText = currentPromo.discount_type === "percentage" 
    ? `${currentPromo.discount_value}%`
    : `${currentPromo.discount_value} ${isRTL ? "ر.س" : "SAR"}`;

  const nextPromo = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  };

  const prevPromo = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  return (
    <div className="announcement-bar fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-primary via-amber-500 to-primary text-primary-foreground py-2 px-4">
      <div className="container mx-auto flex items-center justify-between gap-4">
        {/* Navigation Arrows */}
        {promotions.length > 1 && (
          <button onClick={prevPromo} className="p-1 hover:bg-white/20 rounded transition-colors">
            {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          </button>
        )}

        {/* Content */}
        <div className="flex-1 flex items-center justify-center gap-3 flex-wrap">
          <Gift className="h-5 w-5 animate-bounce" />
          <span className="font-bold text-sm">
            {promoName}
          </span>
          {currentPromo.discount_value && (
            <span className="bg-background/30 px-2 py-0.5 rounded text-xs font-bold">
              {isRTL ? `خصم ${discountText}` : `${discountText} OFF`}
            </span>
          )}
          {currentPromo.coupon_code && (
            <span className="bg-background/50 px-2 py-0.5 rounded text-xs font-mono">
              {currentPromo.coupon_code}
            </span>
          )}
          {currentPromo.end_date && (
            <CountdownTimer endDate={currentPromo.end_date} />
          )}
          <Link to="/cars">
            <Button size="sm" variant="secondary" className="h-7 text-xs">
              {isRTL ? "تسوق الآن" : "Shop Now"}
            </Button>
          </Link>
        </div>

        {/* Navigation Arrows */}
        {promotions.length > 1 && (
          <button onClick={nextPromo} className="p-1 hover:bg-white/20 rounded transition-colors">
            {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress dots */}
      {promotions.length > 1 && (
        <div className="flex justify-center gap-1 mt-1">
          {promotions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                index === currentIndex ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementBar;
