import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, X, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const PUSH_DISMISSED_KEY = "push_notification_dismissed";
const PUSH_ENABLED_KEY = "push_notification_enabled";

const translations = {
  ar: {
    title: "تفعيل الإشعارات 🔔",
    description: "احصل على إشعارات فورية عند توفر عروض جديدة وسيارات حصرية!",
    benefits: [
      "عروض حصرية قبل الجميع",
      "تنبيهات السيارات الجديدة",
      "تخفيضات خاصة للمشتركين",
    ],
    enable: "تفعيل الإشعارات",
    later: "لاحقاً",
    enabled: "تم تفعيل الإشعارات بنجاح!",
    denied: "تم رفض الإذن. يمكنك تفعيله من إعدادات المتصفح.",
    notSupported: "متصفحك لا يدعم الإشعارات",
  },
  en: {
    title: "Enable Notifications 🔔",
    description: "Get instant notifications when new offers and exclusive cars are available!",
    benefits: [
      "Exclusive offers before anyone",
      "New car alerts",
      "Special discounts for subscribers",
    ],
    enable: "Enable Notifications",
    later: "Later",
    enabled: "Notifications enabled successfully!",
    denied: "Permission denied. You can enable it from browser settings.",
    notSupported: "Your browser doesn't support notifications",
  },
  fr: {
    title: "Activer les Notifications 🔔",
    description: "Recevez des notifications instantanées pour les nouvelles offres!",
    benefits: [
      "Offres exclusives en premier",
      "Alertes nouvelles voitures",
      "Réductions spéciales",
    ],
    enable: "Activer",
    later: "Plus tard",
    enabled: "Notifications activées avec succès!",
    denied: "Permission refusée. Activez depuis les paramètres du navigateur.",
    notSupported: "Votre navigateur ne supporte pas les notifications",
  },
  de: {
    title: "Benachrichtigungen aktivieren 🔔",
    description: "Erhalten Sie sofortige Benachrichtigungen über neue Angebote!",
    benefits: [
      "Exklusive Angebote zuerst",
      "Neue Auto-Benachrichtigungen",
      "Spezielle Rabatte",
    ],
    enable: "Aktivieren",
    later: "Später",
    enabled: "Benachrichtigungen erfolgreich aktiviert!",
    denied: "Berechtigung verweigert. Aktivieren Sie in den Browsereinstellungen.",
    notSupported: "Ihr Browser unterstützt keine Benachrichtigungen",
  },
};

const PushNotificationManager = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language as keyof typeof translations] || translations.ar;
  
  const [isVisible, setIsVisible] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const supported = "Notification" in window;
    setIsSupported(supported);

    if (!supported) return;

    // Check if already enabled or dismissed
    const dismissed = localStorage.getItem(PUSH_DISMISSED_KEY);
    const enabled = localStorage.getItem(PUSH_ENABLED_KEY);
    const permission = Notification.permission;

    if (!dismissed && !enabled && permission === "default") {
      // Show prompt after 10 seconds
      const timer = setTimeout(() => setIsVisible(true), 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnable = async () => {
    if (!isSupported) {
      toast({
        title: t.notSupported,
        variant: "destructive",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        localStorage.setItem(PUSH_ENABLED_KEY, "true");
        setIsVisible(false);
        
        // Show success notification
        new Notification("🎉 " + t.enabled, {
          body: t.benefits[0],
          icon: "/favicon.ico",
        });

        toast({
          title: t.enabled,
        });
      } else if (permission === "denied") {
        toast({
          title: t.denied,
          variant: "destructive",
        });
        localStorage.setItem(PUSH_DISMISSED_KEY, "true");
        setIsVisible(false);
      }
    } catch (error) {
      console.error("Notification error:", error);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(PUSH_DISMISSED_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible || !isSupported) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm push-notification-slide">
      <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-5 card-3d-tilt">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-gradient-to-br from-primary to-accent rounded-xl icon-float-3d">
            <Bell className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">{t.title}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4">{t.description}</p>

        {/* Benefits */}
        <ul className="space-y-2 mb-4">
          {t.benefits.map((benefit, index) => (
            <li 
              key={index}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {benefit}
            </li>
          ))}
        </ul>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleEnable}
            className="flex-1 btn-glow btn-ripple bg-primary hover:bg-primary/90"
          >
            <Bell className="h-4 w-4 mr-2" />
            {t.enable}
          </Button>
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="text-muted-foreground"
          >
            {t.later}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PushNotificationManager;
