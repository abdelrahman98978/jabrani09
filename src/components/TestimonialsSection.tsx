import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    roleEn: "Customer since 2023",
    content: "تجربة رائعة! اشتريت سيارة تويوتا من المعرض وكانت الخدمة ممتازة من البداية للنهاية. فريق العمل محترف جداً وساعدوني في اختيار السيارة المناسبة لي.",
    contentEn: "Amazing experience! I bought a Toyota from the showroom and the service was excellent from start to finish. The team is very professional and helped me choose the right car.",
    rating: 5,
  },
  {
    id: 2,
    name: "خالد عبدالله العتيبي",
    nameEn: "Khalid Al-Otaibi",
    role: "عميل منذ 2022",
    roleEn: "Customer since 2022",
    content: "أفضل معرض سيارات تعاملت معه. الأسعار منافسة والضمان شامل. أنصح الجميع بالتعامل معهم. شكراً لكم على الخدمة المميزة.",
    contentEn: "Best car showroom I've dealt with. Competitive prices and comprehensive warranty. I recommend everyone to deal with them. Thank you for the excellent service.",
    rating: 5,
  },
  {
    id: 3,
    name: "فهد سعد الدوسري",
    nameEn: "Fahad Al-Dosari",
    role: "عميل منذ 2024",
    roleEn: "Customer since 2024",
    content: "حصلت على سيارة أحلامي بسعر ممتاز وبضمان 5 سنوات. الفريق كان متعاوناً جداً في إجراءات التمويل. تجربة لا تُنسى!",
    contentEn: "Got my dream car at an excellent price with a 5-year warranty. The team was very cooperative with financing procedures. An unforgettable experience!",
    rating: 5,
  },
  {
    id: 4,
    name: "محمد علي الغامدي",
    nameEn: "Mohammed Al-Ghamdi",
    role: "عميل منذ 2023",
    roleEn: "Customer since 2023",
    content: "خدمة ما بعد البيع ممتازة. لم أواجه أي مشاكل منذ شرائي للسيارة. شكراً للفريق على المتابعة المستمرة والاهتمام.",
    contentEn: "Excellent after-sales service. I haven't faced any problems since buying the car. Thanks to the team for continuous follow-up and care.",
    rating: 4,
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
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, []);

  const currentTestimonial = testimonials[currentIndex];

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
              {isRTL ? "أصوات السيادة" : "Voices of Sovereignty"}
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
                آراء <span className="font-bold">شركائنا</span>
                <br />
                في <span className="text-white/30 italic">النجاح</span>
              </>
            ) : (
              <>
                Verified <span className="font-bold">Sentiments</span>
                <br />
                Defined by <span className="text-white/30 italic">Trust</span>
              </>
            )}
          </motion.h2>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-6xl">
          <div className="relative flex flex-col items-start min-h-[500px]">
            <Quote className="h-16 w-16 text-primary/10 mb-16" />

            <div className={`transition-all duration-1000 ease-[0.19, 1, 0.22, 1] ${isAnimating ? 'opacity-0 -translate-y-8' : 'opacity-100 translate-y-0'}`}>
              <blockquote className="text-2xl md:text-5xl font-light leading-[1.3] text-white tracking-tighter mb-16 italic">
                "{isRTL ? currentTestimonial.content : currentTestimonial.contentEn}"
              </blockquote>

              <div className="flex items-center gap-12">
                <div className="w-12 h-[1px] bg-primary" />
                <div className="space-y-2">
                  <h4 className="text-sm uppercase font-bold tracking-[0.4em] text-white">
                    {isRTL ? currentTestimonial.name : currentTestimonial.nameEn}
                  </h4>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-primary/60">
                    {isRTL ? currentTestimonial.role : currentTestimonial.roleEn}
                  </p>
                </div>
              </div>
            </div>

            {/* Luxurious Navigation Controls */}
            <div className="absolute bottom-0 inset-x-0 flex flex-col md:flex-row items-end md:items-center justify-between gap-12 pt-12">
              <div className="flex items-center gap-12">
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
                      className={`h-[1px] transition-all duration-1000 ${idx === currentIndex
                        ? "w-16 bg-primary"
                        : "w-6 bg-white/20 hover:bg-white/40"
                        }`}
                    />
                  ))}
                </div>
                <div className="text-[11px] uppercase font-bold tracking-[0.4em] text-white/20">
                  {currentIndex + 1} / {testimonials.length}
                </div>
              </div>

              <div className="flex gap-12">
                <button
                  onClick={prev}
                  className="group relative flex items-center gap-4 text-[11px] uppercase tracking-[0.4em] text-white/40 hover:text-white transition-all duration-500"
                >
                  <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                  <span>{isRTL ? "السابق" : "Prev"}</span>
                </button>
                <div className="w-[1px] h-4 bg-white/10" />
                <button
                  onClick={next}
                  className="group relative flex items-center gap-4 text-[11px] uppercase tracking-[0.4em] text-white/40 hover:text-white transition-all duration-500"
                >
                  <span>{isRTL ? "التالي" : "Next"}</span>
                  <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
