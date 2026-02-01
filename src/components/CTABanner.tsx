import { Link } from "react-router-dom";
import { Phone, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";

const CTABanner = () => {
  const { language } = useLanguage();
  const { data: settings } = useSettings();
  const isRTL = language === "ar";

  const whatsappNumber = settings?.whatsapp || settings?.phone || "+966543389314";
  const cleanNumber = whatsappNumber.replace(/\D/g, "");
  const whatsappLink = `https://wa.me/${cleanNumber}`;

  return (
    <section className="wp-cta-banner py-16 bg-gradient-to-r from-primary to-primary/80 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='rgba(255,255,255,0.03)'/%3E%3C/svg%3E\")" }} />
      <div className="absolute top-0 start-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 end-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Text Content */}
          <div className="text-center lg:text-start">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-4">
              {isRTL 
                ? "هل تبحث عن سيارة أحلامك؟" 
                : "Looking for Your Dream Car?"}
            </h2>
            <p className="text-white/90 text-lg max-w-xl">
              {isRTL 
                ? "فريقنا جاهز لمساعدتك في اختيار السيارة المثالية. تواصل معنا الآن!"
                : "Our team is ready to help you choose the perfect car. Contact us now!"}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a href={`tel:${settings?.phone || "+966543389314"}`}>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 gap-2 text-base font-bold hover-lift-3d"
              >
                <Phone className="h-5 w-5" />
                {isRTL ? "اتصل الآن" : "Call Now"}
              </Button>
            </a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white/10 gap-2 text-base font-bold hover-lift-3d"
              >
                <MessageCircle className="h-5 w-5" />
                {isRTL ? "واتساب" : "WhatsApp"}
              </Button>
            </a>
            <Link to="/cars">
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white/10 gap-2 text-base font-bold hover-lift-3d"
              >
                {isRTL ? "تصفح السيارات" : "Browse Cars"}
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
