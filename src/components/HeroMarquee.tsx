import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { Car, Sparkles, Tag, Star } from "lucide-react";

const HeroMarquee = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { data: settings } = useSettings();

  // Fetch latest cars and promotions for marquee
  const { data: latestCars } = useQuery({
    queryKey: ["marquee-cars"],
    queryFn: async () => {
      const { data } = await supabase
        .from("cars")
        .select("id, name, name_ar, price, is_new, has_discount, brand:brands(name, name_ar)")
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: activePromotions } = useQuery({
    queryKey: ["marquee-promotions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("promotions")
        .select("id, name, name_ar, discount_value, discount_type")
        .eq("is_active", true)
        .limit(3);
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Build marquee items
  const marqueeItems = [];

  // Add custom marquee text if available
  const customText = isRTL
    ? (settings as any)?.marquee_text_ar
    : (settings as any)?.marquee_text;

  if (customText) {
    marqueeItems.push({
      icon: Sparkles,
      text: customText,
      type: "custom",
    });
  }

  // Add latest cars
  latestCars?.forEach((car) => {
    const carName = isRTL ? car.name_ar : car.name;
    const brandName = isRTL ? (car.brand as any)?.name_ar : (car.brand as any)?.name;
    const priceFormatted = new Intl.NumberFormat(isRTL ? "ar-SD" : "en-US", {
      maximumFractionDigits: 0,
    }).format(car.price) + " " + (settings?.currency_symbol || (isRTL ? "ج.س" : "SDG"));

    let label = "";
    if (car.is_new) {
      label = isRTL ? "🆕 جديد: " : "🆕 New: ";
    } else if (car.has_discount) {
      label = isRTL ? "🔥 عرض: " : "🔥 Sale: ";
    } else {
      label = isRTL ? "⭐ متوفر: " : "⭐ Available: ";
    }

    marqueeItems.push({
      icon: car.is_new ? Star : Car,
      text: `${label}${brandName} ${carName} - ${priceFormatted}`,
      type: "car",
    });
  });

  // Add promotions
  activePromotions?.forEach((promo) => {
    const promoName = isRTL ? promo.name_ar : promo.name;
    const discount = promo.discount_type === "percentage"
      ? `${promo.discount_value}%`
      : `${promo.discount_value} ${settings?.currency_symbol || (isRTL ? "ج.س" : "SDG")}`;

    marqueeItems.push({
      icon: Tag,
      text: `🎉 ${promoName} - ${isRTL ? "خصم" : "Discount"} ${discount}`,
      type: "promo",
    });
  });

  // Default items if empty
  if (marqueeItems.length === 0) {
    marqueeItems.push(
      {
        icon: Star,
        text: isRTL ? "⭐ أفضل الأسعار في معرض الفخيم للسيارات" : "⭐ Best Prices at Al-Fakhim Car Showroom",
        type: "default",
      },
      {
        icon: Car,
        text: isRTL ? "🚗 تشكيلة واسعة من الماركات العالمية" : "🚗 Wide Selection of Global Brands",
        type: "default",
      },
      {
        icon: Sparkles,
        text: isRTL ? "✨ ضمان شامل وخدمات متميزة" : "✨ Comprehensive Warranty & Premium Services",
        type: "default",
      }
    );
  }

  // Check if marquee is enabled
  if ((settings as any)?.marquee_enabled === false) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden bg-black/30 backdrop-blur-sm border-t border-white/10">
      <div className="py-2 md:py-3">
        <div className="marquee-container">
          <div className="marquee-content">
            {/* First set */}
            {marqueeItems.map((item, index) => (
              <div
                key={`first-${index}`}
                className="inline-flex items-center gap-2 mx-4 md:mx-8"
              >
                <item.icon className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                <span className="text-white text-sm md:text-base font-medium whitespace-nowrap">
                  {item.text}
                </span>
                <span className="text-primary/50 mx-2 md:mx-4">|</span>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {marqueeItems.map((item, index) => (
              <div
                key={`second-${index}`}
                className="inline-flex items-center gap-2 mx-4 md:mx-8"
              >
                <item.icon className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                <span className="text-white text-sm md:text-base font-medium whitespace-nowrap">
                  {item.text}
                </span>
                <span className="text-primary/50 mx-2 md:mx-4">|</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroMarquee;
