import { 
  ShieldCheck, 
  Award, 
  Headphones, 
  Wallet, 
  Clock, 
  ThumbsUp, 
  Zap, 
  Trophy, 
  Target, 
  Crown,
  ChevronRight
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const features = [
  {
    icon: Wallet,
    titleAr: "قيمة استثنائية",
    titleEn: "Exceptional Value",
    descriptionAr: "نجمع بين الأسعار التنافسية وأعلى مستويات الجودة والحرفية",
    descriptionEn: "We combine competitive indexing with the absolute zenith of automotive craftsmanship.",
  },
  {
    icon: ShieldCheck,
    titleAr: "ثقة مطلقة",
    titleEn: "Absolute Trust",
    descriptionAr: "ضمان شامل وراحة بال تامة مع كل عملية شراء",
    descriptionEn: "Comprehensive sovereign protection and total peace of mind with every acquisition.",
  },
  {
    icon: Headphones,
    titleAr: "خدمة شخصية",
    titleEn: "Private Concierge",
    descriptionAr: "فريقنا المتخصص معك في كل خطوة لضمان رضاك التام",
    descriptionEn: "Our dedicated elite team is with you for every milestone of your procurement.",
  },
  {
    icon: Award,
    titleAr: "معايير النخبة",
    titleEn: "Elite Standards",
    descriptionAr: "تخضع كل مركبة لفحص دقيق وصارم يتجاوز كل التوقعات",
    descriptionEn: "Every vehicle undergoes institutional-grade rigorous inspection protocols.",
  },
  {
    icon: Clock,
    titleAr: "كفاءة زمنية",
    titleEn: "Time Efficiency",
    descriptionAr: "نقدر وقتك، لذا نضمن سرعة وسلاسة كافة الإجراءات",
    descriptionEn: "We value the currency of time, ensuring all procedures are swift and institutional.",
  },
  {
    icon: Crown,
    titleAr: "إرث من الرضا",
    titleEn: "Legacy of Authority",
    descriptionAr: "نفخر بخدمة نخبة من العملاء الذين يثقون في تميزنا",
    descriptionEn: "We take pride in serving an elite global clientele who define automotive mastery.",
  },
];

const WhyUsSection = () => {
  const { data: settings } = useSettings();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  return (
    <section className="py-64 bg-black overflow-hidden border-t border-white/5 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(196,164,132,0.02)_0%,transparent_70%)]" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Editorial Header */}
        <div className="max-w-6xl mb-40">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="mb-12 flex items-center gap-6"
          >
            <div className="h-0.5 w-12 bg-primary" />
            <span className="text-[11px] uppercase tracking-[1em] text-primary font-black">
              {isRTL ? "فلسفة السيادة" : "The Sovereign Manifesto"}
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
            className="text-6xl md:text-[8rem] text-hero text-white leading-[0.85] uppercase"
          >
            {isRTL ? (
              <>
                لماذا <br /> <span className="font-bold">جبراني السيادية؟</span>
              </>
            ) : (
              <>
                Defining <br /> <span className="font-bold">Mastery.</span>
              </>
            )}
          </motion.h2>
        </div>

        {/* Features Grid - Sovereign Branding */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className="group relative bg-black p-16 overflow-hidden hover:bg-surface-low transition-all duration-1000"
            >
              {/* Animated Corner Hint */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -translate-y-full translate-x-full group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-1000 rounded-bl-3xl" />
              
              <div className="relative z-10 space-y-20">
                <div className="flex items-center justify-between">
                   <div className="p-5 border border-white/5 bg-white/[0.02] group-hover:border-primary/20 transition-all duration-1000">
                      <feature.icon className="h-4 w-4 text-primary group-hover:scale-125 transition-transform duration-1000" />
                   </div>
                   <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">0{index + 1}</span>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white group-hover:text-primary transition-colors duration-700">
                    {isRTL ? feature.titleAr : feature.titleEn}
                  </h3>
                  <p className="text-[11px] uppercase leading-relaxed tracking-[0.4em] text-white/20 group-hover:text-white/40 transition-colors duration-700 max-w-[80%] italic">
                    {isRTL ? feature.descriptionAr : feature.descriptionEn}
                  </p>
                </div>

                <div className="pt-8 flex items-center gap-4 text-primary/0 group-hover:text-primary transition-all duration-700">
                   <div className="w-0 h-[1px] bg-primary group-hover:w-12 transition-all duration-1000" />
                   <span className="text-[9px] uppercase tracking-[0.4em] font-black opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-1000">Institutional Protocol</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Support Link */}
        <motion.div 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           transition={{ delay: 1 }}
           className="mt-24 flex flex-col md:flex-row items-center justify-between gap-12"
        >
           <div className="flex items-center gap-8 text-[11px] uppercase tracking-[0.6em] text-white/10 font-black">
              <ShieldCheck className="h-4 w-4" />
              VERIFIED ATELIER 2024
           </div>
           
           <div className="inline-flex items-center gap-6 group cursor-pointer">
              <span className="text-[11px] uppercase tracking-[0.5em] text-white/40 group-hover:text-white transition-colors duration-700">Discover Our Heritage</span>
              <div className="w-16 h-12 bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-700">
                 <ChevronRight className="h-4 w-4 text-white group-hover:text-black transition-colors" />
              </div>
           </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyUsSection;
