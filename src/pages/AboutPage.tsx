import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Shield, Award, Users, Clock, Target, Heart } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const AboutPage = () => {
  const { data: settings } = useSettings();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const siteName = isRTL
    ? settings?.showroom_name || "معرض السيارات"
    : settings?.showroom_name_en || "Car Showroom";

  const defaultAboutAr =
    "معرض جابراني للسيارات هو وجهتكم المثالية لشراء السيارات. نقدم لكم مجموعة واسعة من السيارات الجديدة والمستعملة من أشهر الماركات العالمية بأسعار تنافسية.";
  const defaultAboutEn =
    "Jabrani Car Showroom is your ideal destination for buying cars. We offer a wide selection of new and used vehicles from top global brands at competitive prices.";

  const aboutText = isRTL
    ? settings?.about_text_ar || defaultAboutAr
    : settings?.about_text || defaultAboutEn;

  const stats = [
    { value: "500+", label: isRTL ? "سيارة متوفرة" : "Available Cars" },
    { value: "10+", label: isRTL ? "ماركات عالمية" : "Global Brands" },
    { value: "1000+", label: isRTL ? "عميل سعيد" : "Happy Clients" },
    { value: "5+", label: isRTL ? "سنوات خبرة" : "Years Experience" },
  ];

  const values = [
    {
      icon: Target,
      title: isRTL ? "رؤيتنا" : "Our Vision",
      description: isRTL
        ? "أن نكون الوجهة الأولى للسيارات الفاخرة في السودان"
        : "To be the leading luxury automotive destination in Sudan",
    },
    {
      icon: Heart,
      title: isRTL ? "رسالتنا" : "Our Mission",
      description: isRTL
        ? "تقديم أفضل تجربة شراء سيارات مع الالتزام بالجودة والشفافية التامة"
        : "Delivering the ultimate automotive experience with uncompromising quality",
    },
    {
      icon: Shield,
      title: isRTL ? "التزامنا" : "Our Commitment",
      description: isRTL
        ? "ضمان رضا العملاء من خلال خدمات متميزة ومعايير عالمية"
        : "Ensuring excellence through premium services and global standards",
    },
  ];

  return (
    <div className="min-h-screen bg-black selection:bg-primary/30 overflow-x-hidden">
      <Navbar />

      <main className="pt-40 pb-32">
        {/* Editorial Header */}
        <section className="container mx-auto px-6 md:px-12 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="max-w-5xl space-y-12"
          >
            <div className="space-y-4">
              <div className="text-primary text-[11px] uppercase tracking-[0.6em] font-black">
                {isRTL ? "الإرث والتميز" : "Legacy & Excellence"}
              </div>
              <h1 className="text-6xl md:text-9xl text-hero text-white tracking-tighter leading-[0.85]">
                {isRTL ? "عن جابراني" : "About Jabrani"}
              </h1>
            </div>
            <p className="text-2xl md:text-4xl text-white/40 leading-relaxed font-light tracking-tight italic max-w-3xl">
              {aboutText}
            </p>
          </motion.div>
        </section>

        {/* Stats - Minimalist Precision */}
        <section className="container mx-auto px-6 md:px-12 mb-40">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-black p-12 space-y-2 text-center group hover:bg-white/5 transition-colors"
              >
                <div className="text-5xl font-bold text-white tracking-tighter group-hover:text-primary transition-colors">
                  {stat.value}
                </div>
                <div className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Ethics & Values - Editorial Grid */}
        <section className="container mx-auto px-6 md:px-12 mb-40">
           <div className="grid lg:grid-cols-12 gap-20">
              <div className="lg:col-span-4 space-y-6">
                <div className="text-primary text-[10px] uppercase tracking-[0.6em] font-black">
                  Core Values
                </div>
                <h2 className="text-4xl md:text-5xl text-white font-bold tracking-tighter leading-none">
                  The Pillars of <br /> Our Authority
                </h2>
              </div>
              <div className="lg:col-span-8 grid md:grid-cols-2 gap-12">
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    className="space-y-6 p-8 bg-surface-low border border-white/5 group hover:border-primary/20 transition-all"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-white/5 text-primary group-hover:bg-primary group-hover:text-black transition-all">
                      <value.icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-white uppercase tracking-wider">{value.title}</h3>
                      <p className="text-white/40 leading-relaxed font-light">{value.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
           </div>
        </section>

        {/* Cinematic Vision Quote */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden border-y border-white/5">
           <div className="absolute inset-0 bg-surface-low/50" />
           <div className="container mx-auto px-6 md:px-12 relative z-10 text-center space-y-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5 }}
                className="max-w-4xl mx-auto"
              >
                <span className="text-6xl text-primary font-serif italic mb-8 block leading-none opacity-20">"</span>
                <p className="text-3xl md:text-5xl font-light text-white leading-tight tracking-tight italic">
                   {isRTL 
                     ? "نحن لا نبيع السيارات فحسب ، بل نرعى الإرث والتميز في كل تفصيل."
                     : "We do not merely facilitate transactions; we curate legacies of automotive excellence."}
                </p>
                <div className="mt-12 text-[11px] uppercase tracking-[0.8em] text-white/20 font-black">
                   Jabrani Leadership
                </div>
              </motion.div>
           </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default AboutPage;