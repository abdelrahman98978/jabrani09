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
    <section className="wp-testimonials py-20 bg-gradient-to-b from-background to-card/50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 start-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 end-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      {/* Large Quote Icons */}
      <div className="absolute top-20 start-10 opacity-5">
        <Quote className="h-48 w-48 text-primary" />
      </div>
      <div className="absolute bottom-20 end-10 opacity-5 rotate-180">
        <Quote className="h-48 w-48 text-primary" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {isRTL ? "آراء عملائنا" : "Customer Reviews"}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            {isRTL ? (
              <>
                ماذا يقول <span className="text-gradient-gold">عملاؤنا</span>
              </>
            ) : (
              <>
                What Our <span className="text-gradient-gold">Customers Say</span>
              </>
            )}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            {isRTL 
              ? "نفخر بثقة عملائنا الكرام ورضاهم عن خدماتنا" 
              : "We are proud of our valued customers' trust and satisfaction with our services"}
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div className={`testimonial-card bg-card rounded-2xl p-8 md:p-12 shadow-xl border border-border/50 transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            {/* Quote Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-primary/10">
                <Quote className="h-8 w-8 text-primary" />
              </div>
            </div>

            {/* Content */}
            <blockquote className="text-center text-lg md:text-xl text-foreground/90 leading-relaxed mb-8">
              "{isRTL ? currentTestimonial.content : currentTestimonial.contentEn}"
            </blockquote>

            {/* Rating */}
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < currentTestimonial.rating 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>

            {/* Author */}
            <div className="flex items-center justify-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-primary/20">
                <AvatarImage src={currentTestimonial.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {(isRTL ? currentTestimonial.name : currentTestimonial.nameEn).charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h4 className="font-bold text-foreground">
                  {isRTL ? currentTestimonial.name : currentTestimonial.nameEn}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? currentTestimonial.role : currentTestimonial.roleEn}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              className="h-12 w-12 rounded-full hover-lift-3d"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsAnimating(true);
                    setCurrentIndex(idx);
                    setTimeout(() => setIsAnimating(false), 500);
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentIndex 
                      ? "bg-primary w-8" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={next}
              className="h-12 w-12 rounded-full hover-lift-3d"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
