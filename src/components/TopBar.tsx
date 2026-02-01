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
    <div className="wp-topbar bg-accent text-accent-foreground py-2 border-b border-border/30 relative z-[60]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between text-xs md:text-sm gap-2 md:gap-0">
          {/* Contact Info */}
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-6 w-full md:w-auto">
            <a
              href={`tel:${settings?.phone || "+966543389314"}`}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Phone className="h-3 md:h-3.5 w-3 md:w-3.5" />
              <span dir="ltr">{settings?.phone || "+966 54 338 9314"}</span>
            </a>
            <div className="hidden sm:flex items-center gap-2 text-accent-foreground/80">
              <Clock className="h-3 md:h-3.5 w-3 md:w-3.5" />
              <span>{workingHours}</span>
            </div>
          </div>

          {/* Social Links - Language/Theme moved to Navbar only to save space */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:text-primary transition-colors"
                >
                  <Facebook className="h-3 md:h-3.5 w-3 md:w-3.5" />
                </a>
              )}
              {settings?.twitter_url && (
                <a
                  href={settings.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:text-primary transition-colors"
                >
                  <Twitter className="h-3 md:h-3.5 w-3 md:w-3.5" />
                </a>
              )}
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:text-primary transition-colors"
                >
                  <Instagram className="h-3 md:h-3.5 w-3 md:w-3.5" />
                </a>
              )}
              {settings?.tiktok_url && (
                <a
                  href={settings.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:text-primary transition-colors"
                >
                  <Youtube className="h-3 md:h-3.5 w-3 md:w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
