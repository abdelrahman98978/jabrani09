import { Phone, Mail, Clock, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";

const TopBar = () => {
  const { data: settings } = useSettings();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const workingHours = isRTL
    ? (settings?.working_hours_ar || "الأحد - الخميس: 9 ص - 9 م")
    : (settings?.working_hours || "Sun - Thu: 9 AM - 9 PM");

  return (
    <div className="w-full bg-primary text-primary-foreground py-2 border-b border-primary-foreground/10 relative z-[60]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between text-xs font-medium tracking-wide">
          {/* Contact Info */}
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
            <a
              href={`tel:${settings?.phone || "+966543389314"}`}
              className="flex items-center gap-2 hover:text-accent transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span dir="ltr" className="font-sans">{settings?.phone || "+966 54 338 9314"}</span>
            </a>
            <div className="hidden sm:flex items-center gap-2 opacity-90">
              <Clock className="h-4 w-4" />
              <span>{workingHours}</span>
            </div>
            <a
              href="mailto:contact@shathervan.com"
              className="hidden sm:flex items-center gap-2 hover:text-accent transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>contact@shathervan.com</span>
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4 mt-2 md:mt-0">
            {/* Icons sections... keeping logic but updating styles */}
            <div className="flex items-center gap-3">
              {[
                { url: settings?.facebook_url, icon: Facebook },
                { url: settings?.twitter_url, icon: Twitter },
                { url: settings?.instagram_url, icon: Instagram },
                { url: settings?.tiktok_url, icon: Youtube }, // Using Youtube icon for Tiktok/generic as per original
              ].map((social, idx) => (
                social.url && (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
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
