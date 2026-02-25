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
  return (
    <section className="py-32 bg-background border-t border-foreground/5 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-24">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-0 py-0 text-foreground/40 text-[10px] font-bold uppercase tracking-[0.4em]">
              {isRTL ? "قالوا عنا" : "Voices / 03"}
            </div>
            <h2 className="text-4xl md:text-6xl font-light text-foreground leading-[1.1] tracking-tight">
              {isRTL ? "آراء" : "Client"} <span className="font-bold">{isRTL ? "عملائنا" : "Sentiments"}</span>
            </h2>
            <div className="w-20 h-[1px] bg-foreground/10" />
            <p className="text-muted-foreground/60 text-sm md:text-base uppercase tracking-widest leading-relaxed">
              {isRTL
                ? "قراءات في تجارب من اختاروا التميز معنا"
                : "A collection of experiences from those who chose excellence."}
            </p>
          </div>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-5xl mx-auto">
          <div className={`relative min-h-[400px] flex flex-col items-center justify-center text-center transition-all duration-1000 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <Quote className="h-12 w-12 text-foreground/5 mb-12" />

            <blockquote className="text-2xl md:text-4xl font-light leading-relaxed tracking-tight text-foreground mb-12 italic">
              "{isRTL ? currentTestimonial.content : currentTestimonial.contentEn}"
            </blockquote>

            <div className="space-y-4">
              <div className="flex justify-center gap-1 opacity-20">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < currentTestimonial.rating ? "fill-foreground text-foreground" : "text-foreground"}`}
                  />
                ))}
              </div>

              <div className="space-y-1">
                <h4 className="text-xs uppercase font-bold tracking-[0.3em] text-foreground">
                  {isRTL ? currentTestimonial.name : currentTestimonial.nameEn}
                </h4>
                <p className="text-[10px] uppercase tracking-widest text-foreground/30">
                  {isRTL ? currentTestimonial.role : currentTestimonial.roleEn}
                </p>
              </div>
            </div>
          </div>

          {/* New Navigation Design */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-24 pt-12 border-t border-foreground/5">
            <div className="flex gap-4">
              <button
                onClick={prev}
                className="w-12 h-12 flex items-center justify-center border border-foreground/10 hover:border-foreground/40 transition-all opacity-40 hover:opacity-100"
              >
                {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
              <button
                onClick={next}
                className="w-12 h-12 flex items-center justify-center border border-foreground/10 hover:border-foreground/40 transition-all opacity-40 hover:opacity-100"
              >
                {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex gap-3">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsAnimating(true);
                    setCurrentIndex(idx);
                    setTimeout(() => setIsAnimating(false), 500);
                  }}
                  className={`h-[2px] transition-all duration-700 ${idx === currentIndex
                    ? "w-12 bg-foreground"
                    : "w-4 bg-foreground/10 hover:bg-foreground/30"
                    }`}
                />
              ))}
            </div>

            <div className="hidden md:block text-[10px] uppercase font-bold tracking-[0.4em] opacity-20">
              {currentIndex + 1} / {testimonials.length}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
