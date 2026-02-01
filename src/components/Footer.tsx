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
    <footer className="wp-footer bg-accent text-accent-foreground relative overflow-hidden">
      {/* Wave Top */}
      <div className="wp-section-wave-top" />

      {/* Main Footer */}
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* About Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={siteName}
                  className="h-14 w-14 object-contain rounded-xl bg-white/10 p-2"
                />
              ) : (
                <img
                  src={showroomLogo}
                  alt={siteName}
                  className="h-14 w-14 object-contain rounded-xl bg-white/10 p-2"
                />
              )}
              <div>
                <h3 className="text-xl font-bold text-gradient-gold">{siteName}</h3>
                <p className="text-xs text-accent-foreground/60">{t.siteSlogan}</p>
              </div>
            </div>
            <p className="text-sm text-accent-foreground/80 leading-relaxed">
              {language === "ar"
                ? (settings?.about_text_ar || t.whyUs.qualityDesc)
                : (settings?.about_text || t.whyUs.qualityDesc)
              }
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((link, idx) => link.url && (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="social-icon-3d flex h-10 w-10 items-center justify-center rounded-lg bg-background/10 hover:bg-primary/20 transition-all"
                >
                  <link.icon className="h-4 w-4" />
                </a>
              ))}
              {!socialLinks.some(l => l.url) && (
                <>
                  <a href="#" className="social-icon-3d flex h-10 w-10 items-center justify-center rounded-lg bg-background/10 hover:bg-primary/20 transition-all">
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a href="#" className="social-icon-3d flex h-10 w-10 items-center justify-center rounded-lg bg-background/10 hover:bg-primary/20 transition-all">
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a href="#" className="social-icon-3d flex h-10 w-10 items-center justify-center rounded-lg bg-background/10 hover:bg-primary/20 transition-all">
                    <Instagram className="h-4 w-4" />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-foreground relative inline-block">
              {t.footer.quickLinks}
              <span className="absolute -bottom-2 start-0 w-12 h-0.5 bg-primary rounded" />
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.href}
                    className="text-sm text-accent-foreground/70 hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
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
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-foreground relative inline-block">
              {t.footer.contactInfo}
              <span className="absolute -bottom-2 start-0 w-12 h-0.5 bg-primary rounded" />
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${settings?.phone || "+966543389314"}`}
                  className="flex items-start gap-3 text-sm text-accent-foreground/70 hover:text-primary transition-colors"
                >
                  <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-accent-foreground/50 mb-1">{isRTL ? "اتصل بنا" : "Call Us"}</p>
                    <span dir="ltr" className="font-medium">{settings?.phone || "+966 54 338 9314"}</span>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings?.email || "info@aljabrani.com"}`}
                  className="flex items-start gap-3 text-sm text-accent-foreground/70 hover:text-primary transition-colors"
                >
                  <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-accent-foreground/50 mb-1">{isRTL ? "البريد الإلكتروني" : "Email"}</p>
                    <span className="font-medium">{settings?.email || "info@aljabrani.com"}</span>
                  </div>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-accent-foreground/70">
                <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-accent-foreground/50 mb-1">{isRTL ? "العنوان" : "Address"}</p>
                  <span className="font-medium">
                    {language === "ar"
                      ? (settings?.address_ar || "المملكة العربية السعودية")
                      : (settings?.address || "Saudi Arabia")
                    }
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-accent-foreground/70">
                <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-accent-foreground/50 mb-1">{isRTL ? "ساعات العمل" : "Working Hours"}</p>
                  <span className="font-medium">{workingHours}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-foreground relative inline-block">
              {isRTL ? "النشرة البريدية" : "Newsletter"}
              <span className="absolute -bottom-2 start-0 w-12 h-0.5 bg-primary rounded" />
            </h4>
            <p className="text-sm text-accent-foreground/70">
              {isRTL
                ? "اشترك للحصول على أحدث العروض والأخبار"
                : "Subscribe to get the latest offers and news"}
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <Input
                  type="email"
                  placeholder={isRTL ? "بريدك الإلكتروني" : "Your email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-background/10 border-background/20 text-accent-foreground placeholder:text-accent-foreground/50 pe-12"
                  required
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading}
                  className="absolute end-1 top-1 h-10 w-10 bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
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
        <div className="border-t border-background/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center gap-2 md:items-start text-sm text-accent-foreground/60 text-center md:text-start">
              <p>© {new Date().getFullYear()} {siteName}. {t.footer.rights}.</p>
              <div className="flex items-center gap-2 mt-2">
                <img src="https://monshaat.gov.sa/sites/default/files/styles/logo_header/public/2022-09/logo.png" alt="Saudi Business Center" className="h-8 opacity-80 hover:opacity-100 transition-opacity bg-white/90 rounded px-1" />
                <span className="text-xs">موثق لدى المركز السعودي للأعمال</span>
              </div>
            </div>

            {/* Scroll to Top */}
            <Button
              variant="outline"
              size="icon"
              onClick={scrollToTop}
              className="h-10 w-10 rounded-full border-background/20 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
