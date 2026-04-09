import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Youtube, Send, ArrowUp, Settings } from "lucide-react";
import showroomLogo from "@/assets/showroom-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Footer = () => {
  const { t, language } = useLanguage();
  const { data: settings } = useSettings();
  const isRTL = language === "ar";
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const siteName = language === "ar"
    ? (settings?.showroom_name || t.siteName)
    : (settings?.showroom_name_en || t.siteName);

  const workingHours = isRTL
    ? (settings?.working_hours_ar || "الأحد - الخميس: 9 ص - 9 م")
    : (settings?.working_hours || "Sun - Thu: 9 AM - 9 PM");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email });

      if (error) {
        if (error.code === "23505") {
          toast.info(isRTL ? "أنت مشترك بالفعل!" : "You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        toast.success(isRTL ? "تم الاشتراك بنجاح!" : "Successfully subscribed!");
        setEmail("");
      }
    } catch {
      toast.error(isRTL ? "حدث خطأ، حاول مرة أخرى" : "Error occurred, please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialLinks = [
    { icon: Facebook, url: settings?.facebook_url, label: "Facebook" },
    { icon: Twitter, url: settings?.twitter_url, label: "Twitter" },
    { icon: Instagram, url: settings?.instagram_url, label: "Instagram" },
    { icon: Youtube, url: settings?.tiktok_url, label: "TikTok" },
  ];

  const quickLinks = [
    { href: "/", label: t.nav.home },
    { href: "/cars", label: t.nav.cars },
    { href: "/brands", label: t.nav.brands },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  const legalLinks = [
    { href: "/faq", label: isRTL ? "الأسئلة الشائعة" : "FAQ" },
    { href: "/privacy", label: isRTL ? "سياسة الخصوصية" : "Privacy Policy" },
    { href: "/terms", label: isRTL ? "شروط الاستخدام" : "Terms of Service" },
  ];

  return (
    <footer className="bg-black text-white relative overflow-hidden border-t border-white/5">
      {/* Main Footer */}
      <div className="container mx-auto px-6 md:px-12 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-24 mb-24">
          {/* About Column */}
          <div className="space-y-12">
            <div className="flex flex-col gap-4">
              <h3 className="text-3xl font-light tracking-tighter uppercase">{siteName}</h3>
              <div className="h-[1px] w-12 bg-primary" />
            </div>
            <p className="text-xs text-white/40 leading-relaxed uppercase tracking-widest">
              {language === "ar"
                ? (settings?.about_text_ar || t.whyUs.qualityDesc)
                : (settings?.about_text || t.whyUs.qualityDesc)
              }
            </p>
            {/* Social Links */}
            <div className="flex gap-8">
              {socialLinks.map((link, idx) => link.url && (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/20 hover:text-primary transition-colors"
                >
                  <link.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-4">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.href}
                    className="text-xs text-foreground/40 hover:text-foreground transition-colors uppercase tracking-[0.2em] font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {legalLinks.map((link, idx) => (
                <li key={`legal-${idx}`}>
                  <Link
                    to={link.href}
                    className="text-sm text-accent-foreground/70 hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info Column */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">
              {t.footer.contactInfo}
            </h4>
            <ul className="space-y-6">
              <li className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-widest opacity-30 font-bold">{isRTL ? "اتصل بنا" : "Telephone"}</span>
                <span dir="ltr" className="text-xs font-medium">{settings?.phone || "+249 12 304 4745"}</span>
              </li>
              <li className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-widest opacity-30 font-bold">{isRTL ? "العنوان" : "Showroom"}</span>
                <span className="text-xs font-medium leading-relaxed max-w-[200px]">
                  {language === "ar"
                    ? (settings?.address_ar || t.common.address)
                    : (settings?.address || t.common.address)
                  }
                </span>
              </li>
              <li className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-widest opacity-30 font-bold">{isRTL ? "ساعات العمل" : "Operating Hours"}</span>
                <span className="text-xs font-medium">{workingHours}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">
              {isRTL ? "النشرة البريدية" : "Journal"}
            </h4>
            <p className="text-xs sm:text-sm text-accent-foreground/70">
              {isRTL
                ? "اشترك للحصول على أحدث العروض والأخبار"
                : "Subscribe to get the latest offers and news"}
            </p>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="relative group">
                <Input
                  type="email"
                  placeholder={isRTL ? "بريدك الإلكتروني" : "EMAIL ADDRESS"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-transparent border-0 border-b border-foreground/10 rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground transition-all uppercase text-[10px] tracking-widest"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute end-0 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Admin Link */}
            <Link to="/admin">
              <Button variant="outline" size="sm" className="gap-2 border-background/20 hover:bg-background/10 w-full justify-center">
                <Settings className="h-4 w-4" />
                {t.nav.dashboard}
              </Button>
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-background/10 mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="flex flex-col items-center gap-2 md:items-start text-xs sm:text-sm text-accent-foreground/60 text-center md:text-start">
              <p>© {new Date().getFullYear()} {siteName}. {t.footer.rights}.</p>
              <div className="flex items-center gap-2 mt-1 sm:mt-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Emblem_of_Sudan.svg/800px-Emblem_of_Sudan.svg.png" alt="Sudanese Ministry of Commerce" className="h-8 sm:h-10 opacity-90 hover:opacity-100 transition-opacity" />
                <span className="text-[10px] sm:text-xs font-semibold text-foreground/80">{isRTL ? "مسجل لدى وزارة التجارة السودانية" : "Registered with Ministry of Commerce"}</span>
              </div>
            </div>

            {/* Scroll to Top */}
            <Button
              variant="outline"
              size="icon"
              onClick={scrollToTop}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border-background/20 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
            >
              <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
