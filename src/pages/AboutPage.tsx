import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Shield, Award, Users, Clock, Target, Heart } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useLanguage } from "@/contexts/LanguageContext";

const AboutPage = () => {
  const { data: settings } = useSettings();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const siteName = isRTL
    ? settings?.showroom_name || "معرض السيارات"
    : settings?.showroom_name_en || "Car Showroom";

  const defaultAboutAr =
    "معرض الفخيم للسيارات هو وجهتكم المثالية لشراء السيارات. نقدم لكم مجموعة واسعة من السيارات الجديدة والمستعملة من أشهر الماركات العالمية بأسعار تنافسية.";
  const defaultAboutEn =
    "Al-Fakhim Car Showroom is your ideal destination for buying cars. We offer a wide selection of new and used vehicles from top global brands at competitive prices.";

  const aboutText = isRTL
    ? settings?.about_text_ar || defaultAboutAr
    : settings?.about_text || defaultAboutEn;

  const stats = [
    { value: "+500", label: isRTL ? "سيارة متوفرة" : "Available Cars" },
    { value: "+10", label: isRTL ? "ماركات عالمية" : "Global Brands" },
    { value: "+1000", label: isRTL ? "عميل سعيد" : "Happy Clients" },
    { value: "+5", label: isRTL ? "سنوات خبرة" : "Years Experience" },
  ];

  const values = [
    {
      icon: Target,
      title: isRTL ? "رؤيتنا" : "Our Vision",
      description: isRTL
        ? "أن نكون الوجهة الأولى للسيارات في السودان"
        : "To be the leading car destination in Sudan",
    },
    {
      icon: Heart,
      title: isRTL ? "رسالتنا" : "Our Mission",
      description: isRTL
        ? "تقديم أفضل تجربة شراء سيارات مع الالتزام بالجودة والشفافية"
        : "Delivering the best car buying experience with quality and transparency",
    },
    {
      icon: Shield,
      title: isRTL ? "التزامنا" : "Our Commitment",
      description: isRTL
        ? "ضمان رضا العملاء من خلال خدمات متميزة وأسعار منافسة"
        : "Ensuring customer satisfaction through excellent service and competitive prices",
    },
  ];

  const whyChooseUs = [
    {
      icon: Award,
      title: isRTL ? "موزع معتمد" : "Authorized Dealer",
      description: isRTL
        ? "نوفر لكم سيارات أصلية من أشهر الماركات العالمية"
        : "We provide genuine cars from top global brands",
    },
    {
      icon: Users,
      title: isRTL ? "فريق متخصص" : "Expert Team",
      description: isRTL
        ? "فريق من الخبراء جاهز لمساعدتكم في اختيار السيارة المناسبة"
        : "A team of experts ready to help you choose the right car",
    },
    {
      icon: Clock,
      title: isRTL ? "خدمة سريعة" : "Fast Service",
      description: isRTL
        ? "إتمام جميع إجراءات الشراء والتمويل في وقت قياسي"
        : "Complete all purchase and financing procedures in record time",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-card/50 to-background relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 animate-fade-in">
              {isRTL ? "من" : "About"} <span className="text-gradient-gold">{isRTL ? "نحن" : "Us"}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
              {aboutText}
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 relative">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 stagger-3d-entrance">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl bg-card border border-border card-3d-tilt glow-3d"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-4xl font-black text-gradient-gold">{stat.value}</div>
                  <div className="text-muted-foreground mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-card/30 relative overflow-hidden">
          <div className="absolute inset-0 pattern-overlay opacity-20" />

          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl font-black text-center text-foreground mb-12 animate-fade-in">
              {isRTL ? "قيمنا" : "Our Values"} <span className="text-gradient-gold">{isRTL ? "ومبادئنا" : "& Principles"}</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8 stagger-3d-entrance">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="text-center p-8 rounded-xl bg-card border border-border card-3d-tilt glow-3d"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 mb-4 icon-float-3d">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in">
                <h2 className="text-3xl font-black text-foreground mb-6">
                  {isRTL ? "لماذا" : "Why"} <span className="text-gradient-gold">{isRTL ? "تختارنا؟" : "Choose Us?"}</span>
                </h2>
                <div className="space-y-4 stagger-3d-entrance">
                  {whyChooseUs.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all hover-lift-3d"
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center icon-float-3d">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{item.title}</h4>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center card-3d-tilt glow-3d">
                  <div className="text-center">
                    <div className="text-6xl font-black text-gradient-gold">+5</div>
                    <div className="text-xl text-foreground mt-2">
                      {isRTL ? "سنوات من الخبرة" : "Years of Experience"}
                    </div>
                  </div>
                </div>
                {/* Floating decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-float" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-full blur-2xl animate-float" style={{ animationDelay: "1s" }} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default AboutPage;