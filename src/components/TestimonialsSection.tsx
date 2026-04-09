import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote, Star, UserCheck, ShieldCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

interface Testimonial {
  id: number;
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  content: string;
  contentEn: string;
  rating: number;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "أحمد محمد الشهري",
    nameEn: "Ahmed Al-Shahri",
    role: "عميل منذ 2023",
    roleEn: "Patron since 2023",
    content: "تجربة رائعة! اشتريت سيارة تويوتا من المعرض وكانت الخدمة ممتازة من البداية للنهاية. فريق العمل محترف جداً وساعدوني في اختيار السيارة المناسبة لي.",
    contentEn: "A profound experience. The procurement of my Toyota was handled with absolute professionalism. The team functions more like a private concierge than a dealership.",
    rating: 5,
  },
  {
    id: 2,
    name: "خالد عبدالله العتيبي",
    nameEn: "Khalid Al-Otaibi",
    role: "عميل منذ 2022",
    roleEn: "Patron since 2022",
    content: "أفضل معرض سيارات تعاملت معه. الأسعار منافسة والضمان شامل. أنصح الجميع بالتعامل معهم. شكراً لكم على الخدمة المميزة.",
    contentEn: "The premier destination for automotive excellence. Competitive indexing and comprehensive sovereign protection. I recommend this institution without reservation.",
    rating: 5,
  },
  {
    id: 3,
    name: "فهد سعد الدوسري",
    nameEn: "Fahad Al-Dosari",
    role: "عميل منذ 2024",
    roleEn: "Patron since 2024",
    content: "حصلت على سيارة أحلامي بسعر ممتاز وبضمان 5 سنوات. الفريق كان متعاوناً جداً في إجراءات التمويل. تجربة لا تُنسى!",
    contentEn: "Secured a rare icon at exceptional value. The financing protocols were seamless and institutional. An unforgettable transition into luxury.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const next = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const prev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 800);
  };

  useEffect(() => {
    const interval = setInterval(next, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-64 bg-black overflow-hidden border-t border-white/5 relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_top_right,rgba(196,164,132,0.03)_0%,transparent_70%)]" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="max-w-6xl mb-40">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="mb-12 flex items-center gap-6"
          >
            <div className="h-0.5 w-12 bg-primary" />
            <span className="text-[11px] uppercase tracking-[1em] text-primary font-black">
              {isRTL ? "أصوات السيادة" : "Verified Sentiments"}
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
            className="text-6xl md:text-[10rem] text-hero text-white leading-[0.85] uppercase"
          >
            {isRTL ? (
              <>
                آراء <br /> <span className="font-bold">شركائنا.</span>
              </>
            ) : (
              <>
                Institutional <br /> <span className="font-bold">Trust.</span>
              </>
            )}
          </motion.h2>
        </div>

        {/* Testimonial Core */}
        <div className="max-w-7xl">
          <div className="relative flex flex-col items-start min-h-[600px]">
            <Quote className="h-32 w-32 text-primary/5 mb-20 -ml-10" />

            <div className={`transition-all duration-1000 ease-[0.19, 1, 0.22, 1] ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <blockquote className="text-3xl md:text-7xl font-light leading-[1.1] text-white tracking-tighter mb-24 italic max-w-5xl uppercase">
                "{isRTL ? currentTestimonial.content : currentTestimonial.contentEn}"
              </blockquote>

              <div className="flex items-center gap-16">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 rounded-full bg-surface-low border border-white/5 flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-primary opacity-40" />
                   </div>
                   <div className="space-y-3">
                      <h4 className="text-2xl font-black uppercase tracking-tighter text-white">
                        {isRTL ? currentTestimonial.name : currentTestimonial.nameEn}
                      </h4>
                      <div className="flex items-center gap-4">
                         <Trophy className="h-3 w-3 text-primary/40" />
                         <p className="text-[10px] uppercase tracking-[0.6em] text-white/20">
                            {isRTL ? currentTestimonial.role : currentTestimonial.roleEn}
                         </p>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Navigation Array */}
            <div className="absolute bottom-0 inset-x-0 flex flex-col md:flex-row items-end md:items-center justify-between gap-16 pt-20 border-t border-white/5">
              <div className="flex items-center gap-16">
                <div className="flex gap-4">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (idx === currentIndex) return;
                        setIsAnimating(true);
                        setTimeout(() => {
                          setCurrentIndex(idx);
                          setIsAnimating(false);
                        }, 500);
                      }}
                      className={`h-[2px] transition-all duration-1000 ${idx === currentIndex
                        ? "w-24 bg-primary shadow-[0_0_15px_rgba(196,164,132,0.5)]"
                        : "w-8 bg-white/5 hover:bg-white/10"
                        }`}
                    />
                  ))}
                </div>
                <div className="text-[11px] uppercase font-black tracking-[0.8em] text-white/10 italic">
                  Inventory Record {currentIndex + 1} // {testimonials.length}
                </div>
              </div>

              <div className="flex gap-16">
                <button
                  onClick={prev}
                  className="group flex items-center gap-6 text-[11px] uppercase tracking-[0.6em] text-white/20 hover:text-white transition-all duration-700"
                >
                  <ChevronLeft className={`h-4 w-4 text-white/10 group-hover:text-primary ${isRTL ? 'rotate-180' : ''}`} />
                  <span className="font-black">{isRTL ? "السابق" : "RETRIEVE"}</span>
                </button>
                <div className="w-[1px] h-4 bg-white/5" />
                <button
                  onClick={next}
                  className="group flex items-center gap-6 text-[11px] uppercase tracking-[0.6em] text-white/20 hover:text-white transition-all duration-700"
                >
                  <span className="font-black">{isRTL ? "التالي" : "ADVANCE"}</span>
                  <ChevronRight className={`h-4 w-4 text-white/10 group-hover:text-primary ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 p-12 opacity-[0.02] select-none pointer-events-none">
         <ShieldCheck className="h-64 w-64 text-white" />
      </div>
    </section>
  );
};

export default TestimonialsSection;
