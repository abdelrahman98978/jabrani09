import { Shield, Award, Headphones, Wallet, Clock, ThumbsUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "@/hooks/useSettings";
import { useLanguage } from "@/contexts/LanguageContext";

const features = [
  {
    icon: Wallet,
    titleAr: "قيمة استثنائية",
    titleEn: "Exceptional Value",
    descriptionAr: "نجمع بين الأسعار التنافسية وأعلى مستويات الجودة والحرفية",
    descriptionEn: "We combine competitive pricing with the highest levels of quality and craftsmanship",
  },
  {
    icon: Shield,
    titleAr: "ثقة مطلقة",
    titleEn: "Absolute Trust",
    descriptionAr: "ضمان شامل وراحة بال تامة مع كل عملية شراء",
    descriptionEn: "Comprehensive warranty and total peace of mind with every purchase",
  },
  {
    icon: Headphones,
    titleAr: "خدمة شخصية",
    titleEn: "Personalized Service",
    descriptionAr: "فريقنا المتخصص معك في كل خطوة لضمان رضاك التام",
    descriptionEn: "Our dedicated team is with you every step of the way to ensure complete satisfaction",
  },
  {
    icon: Award,
    titleAr: "معايير النخبة",
    titleEn: "Elite Standards",
    descriptionAr: "تخضع كل مركبة لفحص دقيق وصارم يتجاوز كل التوقعات",
    descriptionEn: "Every vehicle undergoes a rigorous inspection exceeding all expectations",
  },
  {
    icon: Clock,
    titleAr: "كفاءة زمنية",
    titleEn: "Time Efficiency",
    descriptionAr: "نقدر وقتك، لذا نضمن سرعة وسلاسة كافة الإجراءات",
    descriptionEn: "We value your time, ensuring all procedures are swift and seamless",
  },
  {
    icon: ThumbsUp,
    titleAr: "إرث من الرضا",
    titleEn: "Legacy of Satisfaction",
    descriptionAr: "نفخر بخدمة نخبة من العملاء الذين يثقون في تميزنا",
    descriptionEn: "We take pride in serving an elite clientele who trust our excellence",
  },
];

const WhyUsSection = () => {
  const { data: settings } = useSettings();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const defaultSubtitleAr = "نلتزم بتقديم أفضل تجربة شراء سيارات في المملكة";
  const defaultSubtitleEn = "We are committed to offering the best car buying experience";

  const subtitle = isRTL
    ? settings?.about_text_ar || defaultSubtitleAr
    : settings?.about_text || defaultSubtitleEn;

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-24">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-0 py-0 text-foreground/40 text-[10px] font-bold uppercase tracking-[0.4em]">
              {isRTL ? "لماذا نحن" : "Philosophy / 02"}
            </div>
            <h2 className="text-4xl md:text-6xl font-light text-foreground leading-[1.1] tracking-tight">
              {isRTL ? "لماذا" : "Why"} <span className="font-bold">{isRTL ? "تختار تميزنا؟" : "Select Us?"}</span>
            </h2>
            <div className="w-20 h-[1px] bg-foreground/10" />
            <p className="text-muted-foreground/60 text-sm md:text-base uppercase tracking-widest leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-foreground/5 shadow-luxury">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-12 border-b border-e border-foreground/5 last:border-b-0 lg:[&:nth-child(3)]:border-e-0 lg:[&:nth-child(6)]:border-e-0 lg:last:border-b-0 last:border-e-0 transition-all duration-500 hover:bg-foreground/[0.02]"
            >
              <div className="flex flex-col space-y-8">
                {/* Icon */}
                <div className="w-12 h-12 flex items-center justify-center border border-foreground/10 group-hover:border-foreground/40 transition-all duration-500">
                  <feature.icon className="h-5 w-5 text-foreground/40 group-hover:text-foreground transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg uppercase tracking-widest text-foreground">
                    {isRTL ? feature.titleAr : feature.titleEn}
                  </h3>
                  <p className="text-xs text-foreground/40 leading-relaxed tracking-wider">
                    {isRTL ? feature.descriptionAr : feature.descriptionEn}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
