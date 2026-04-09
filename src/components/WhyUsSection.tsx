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
    <section className="py-40 bg-black overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="max-w-4xl mb-32">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="mb-12 inline-flex items-center"
          >
            <span className="text-[11px] uppercase tracking-[0.5em] text-primary font-bold">
              {isRTL ? "فلسفة السيادة" : "Sovereign Philosophy"}
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
            className="text-5xl md:text-8xl text-hero text-white"
          >
            {isRTL ? (
              <>
                لماذا <span className="font-bold">مؤسسة</span>
                <br />
                <span className="text-white/30 italic">جبراني؟</span>
              </>
            ) : (
              <>
                Defining <span className="font-bold">Exceptional</span>
                <br />
                The <span className="text-white/30 italic">Atelier</span>
              </>
            )}
          </motion.h2>
        </div>

        {/* Features Grid - Editorial Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
              className="group relative"
            >
              <div className="flex flex-col space-y-12 p-12 bg-surface-low border border-white/5 transition-all duration-700 hover:border-primary/20">
                {/* Icon with Ambient Glow */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <feature.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-700" />
                </div>

                {/* Content */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold uppercase tracking-[0.3em] text-white">
                    {isRTL ? feature.titleAr : feature.titleEn}
                  </h3>
                  <p className="text-[11px] uppercase leading-relaxed tracking-[0.2em] text-white/30 group-hover:text-white/60 transition-colors duration-700">
                    {isRTL ? feature.descriptionAr : feature.descriptionEn}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
