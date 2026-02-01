import { Shield, Award, Headphones, Wallet, Clock, ThumbsUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "@/hooks/useSettings";
import { useLanguage } from "@/contexts/LanguageContext";

const features = [
  {
    icon: Wallet,
    titleAr: "أفضل الأسعار",
    titleEn: "Best Prices",
    descriptionAr: "نقدم لكم أسعاراً تنافسية لا تُضاهى مع خيارات تمويل متعددة",
    descriptionEn: "We offer unbeatable competitive prices with multiple financing options",
    color: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Shield,
    titleAr: "ضمان شامل",
    titleEn: "Comprehensive Warranty",
    descriptionAr: "ضمان ممتد يصل إلى 5 سنوات على جميع سياراتنا",
    descriptionEn: "Extended warranty up to 5 years on all our cars",
    color: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Headphones,
    titleAr: "خدمة 24/7",
    titleEn: "24/7 Support",
    descriptionAr: "فريق دعم متخصص جاهز لمساعدتكم على مدار الساعة",
    descriptionEn: "A dedicated support team ready to assist you around the clock",
    color: "from-purple-500/20 to-purple-600/10",
    iconColor: "text-purple-500",
  },
  {
    icon: Award,
    titleAr: "جودة مضمونة",
    titleEn: "Guaranteed Quality",
    descriptionAr: "جميع سياراتنا تخضع لفحص شامل ودقيق قبل العرض",
    descriptionEn: "All our cars undergo thorough inspection before display",
    color: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-500",
  },
  {
    icon: Clock,
    titleAr: "إجراءات سريعة",
    titleEn: "Fast Processing",
    descriptionAr: "إتمام جميع معاملات الشراء والتمويل في وقت قياسي",
    descriptionEn: "Complete all purchase and finance procedures in record time",
    color: "from-cyan-500/20 to-cyan-600/10",
    iconColor: "text-cyan-500",
  },
  {
    icon: ThumbsUp,
    titleAr: "رضا العملاء",
    titleEn: "Customer Satisfaction",
    descriptionAr: "أكثر من 1000 عميل سعيد يثقون بخدماتنا",
    descriptionEn: "Over 1000 happy customers trust our services",
    color: "from-rose-500/20 to-rose-600/10",
    iconColor: "text-rose-500",
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
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-overlay opacity-30" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 start-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 end-20 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {isRTL ? "مميزاتنا" : "Our Features"}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            {isRTL ? (
              <>
                لماذا <span className="text-gradient-gold">تختارنا؟</span>
              </>
            ) : (
              <>
                Why <span className="text-gradient-gold">Choose Us?</span>
              </>
            )}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Features Grid with Stagger Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-3d-entrance">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group border-border/50 hover:border-primary/30 transition-all duration-300 wp-card-hover bg-card/80 backdrop-blur-sm overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 relative z-10">
                {/* Icon */}
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform icon-float-3d`}>
                  <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                </div>
                
                {/* Content */}
                <h3 className="font-bold text-xl text-foreground mb-3 group-hover:text-primary transition-colors">
                  {isRTL ? feature.titleAr : feature.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isRTL ? feature.descriptionAr : feature.descriptionEn}
                </p>

                {/* Decorative Corner */}
                <div className="absolute top-0 end-0 w-20 h-20 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
