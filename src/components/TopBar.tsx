import { Phone, Mail, Clock, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";

const TopBar = () => {
  const { data: settings } = useSettings();
  const { language, t } = useLanguage();
  const isRTL = language === "ar";

  const workingHours = isRTL
    ? (settings?.working_hours_ar || "الأحد - الخميس: 9 ص - 9 م")
    : (settings?.working_hours || "Sun - Thu: 9 AM - 9 PM");

  return (
    <div className="w-full bg-[#0a0a0a] text-gray-300 py-2.5 border-b border-white/5 relative z-[60] text-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between font-medium tracking-wide">
          {/* Contact Info */}
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
            <a
              href={`tel:${settings?.phone || "+249123044745"}`}
              className="flex items-center gap-2 hover:text-primary transition-colors group"
            >
              <Phone className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              <span dir="ltr" className="font-sans font-bold">{settings?.phone || "+249 12 304 4745"}</span>
            </a>
            <div className="hidden sm:flex items-center gap-2 opacity-80">
              <Clock className="h-4 w-4 text-primary" />
              <span>{workingHours}</span>
            </div>
            <a
              href={`mailto:${settings?.email || "info@alfakhim.com"}`}
              className="hidden sm:flex items-center gap-2 hover:text-primary transition-colors group"
            >
              <Mail className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              <span>{settings?.email || "info@alfakhim.com"}</span>
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4 mt-2 md:mt-0">

            <div className="flex items-center gap-4">
              {[
                { url: settings?.facebook_url, icon: Facebook },
                { url: settings?.twitter_url, icon: Twitter },
                { url: settings?.instagram_url, icon: Instagram },
                { url: settings?.tiktok_url, icon: Youtube },
              ].map((social, idx) => (
                social.url && (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-all hover:-translate-y-1"
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
