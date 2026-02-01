import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { X, Cookie, Shield, BarChart3, Megaphone, Settings2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const COOKIE_CONSENT_KEY = "cookie_consent";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const translations = {
  ar: {
    title: "ملفات تعريف الارتباط 🍪",
    description: "نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتقديم محتوى مخصص لك.",
    acceptAll: "قبول الكل",
    acceptNecessary: "الضرورية فقط",
    customize: "تخصيص",
    save: "حفظ الإعدادات",
    necessary: "ملفات ضرورية",
    necessaryDesc: "مطلوبة لعمل الموقع بشكل صحيح",
    analytics: "ملفات تحليلية",
    analyticsDesc: "تساعدنا على فهم كيفية استخدامك للموقع",
    marketing: "ملفات تسويقية",
    marketingDesc: "تستخدم لعرض إعلانات مخصصة لك",
    functional: "ملفات وظيفية",
    functionalDesc: "تحسن تجربة المستخدم وتذكر تفضيلاتك",
    learnMore: "سياسة الخصوصية",
  },
  en: {
    title: "Cookie Consent 🍪",
    description: "We use cookies to enhance your experience and provide personalized content.",
    acceptAll: "Accept All",
    acceptNecessary: "Necessary Only",
    customize: "Customize",
    save: "Save Settings",
    necessary: "Necessary Cookies",
    necessaryDesc: "Required for the website to function properly",
    analytics: "Analytics Cookies",
    analyticsDesc: "Help us understand how you use our website",
    marketing: "Marketing Cookies",
    marketingDesc: "Used to show you personalized ads",
    functional: "Functional Cookies",
    functionalDesc: "Improve user experience and remember your preferences",
    learnMore: "Privacy Policy",
  },
  fr: {
    title: "Consentement aux cookies 🍪",
    description: "Nous utilisons des cookies pour améliorer votre expérience et fournir du contenu personnalisé.",
    acceptAll: "Tout accepter",
    acceptNecessary: "Nécessaires uniquement",
    customize: "Personnaliser",
    save: "Enregistrer",
    necessary: "Cookies nécessaires",
    necessaryDesc: "Requis pour le bon fonctionnement du site",
    analytics: "Cookies analytiques",
    analyticsDesc: "Nous aident à comprendre comment vous utilisez notre site",
    marketing: "Cookies marketing",
    marketingDesc: "Utilisés pour vous montrer des publicités personnalisées",
    functional: "Cookies fonctionnels",
    functionalDesc: "Améliorent l'expérience utilisateur et mémorisent vos préférences",
    learnMore: "Politique de confidentialité",
  },
  de: {
    title: "Cookie-Zustimmung 🍪",
    description: "Wir verwenden Cookies, um Ihre Erfahrung zu verbessern und personalisierte Inhalte bereitzustellen.",
    acceptAll: "Alle akzeptieren",
    acceptNecessary: "Nur notwendige",
    customize: "Anpassen",
    save: "Speichern",
    necessary: "Notwendige Cookies",
    necessaryDesc: "Erforderlich für die ordnungsgemäße Funktion der Website",
    analytics: "Analytische Cookies",
    analyticsDesc: "Helfen uns zu verstehen, wie Sie unsere Website nutzen",
    marketing: "Marketing-Cookies",
    marketingDesc: "Werden verwendet, um Ihnen personalisierte Werbung anzuzeigen",
    functional: "Funktionale Cookies",
    functionalDesc: "Verbessern das Benutzererlebnis und merken sich Ihre Präferenzen",
    learnMore: "Datenschutzrichtlinie",
  },
};

const CookieConsent = () => {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.ar;
  
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    setIsVisible(false);
    setShowCustomize(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
  };

  const handleAcceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Main Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 cookie-slide-up">
        <div className="max-w-4xl mx-auto bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-6 card-3d-tilt">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl icon-float-3d">
              <Cookie className="h-8 w-8 text-primary" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-2">{t.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{t.description}</p>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleAcceptAll}
                  className="btn-glow btn-ripple bg-primary hover:bg-primary/90"
                >
                  {t.acceptAll}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAcceptNecessary}
                  className="hover-lift-3d"
                >
                  {t.acceptNecessary}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowCustomize(true)}
                  className="hover-lift-3d"
                >
                  <Settings2 className="h-4 w-4 mr-2" />
                  {t.customize}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customize Dialog */}
      <Dialog open={showCustomize} onOpenChange={setShowCustomize}>
        <DialogContent className="max-w-md popup-zoom-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              {t.customize}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Necessary - Always On */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/30">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm">{t.necessary}</p>
                  <p className="text-xs text-muted-foreground">{t.necessaryDesc}</p>
                </div>
              </div>
              <Switch checked disabled className="opacity-50" />
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">{t.analytics}</p>
                  <p className="text-xs text-muted-foreground">{t.analyticsDesc}</p>
                </div>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) => 
                  setPreferences({ ...preferences, analytics: checked })
                }
              />
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Megaphone className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium text-sm">{t.marketing}</p>
                  <p className="text-xs text-muted-foreground">{t.marketingDesc}</p>
                </div>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) => 
                  setPreferences({ ...preferences, marketing: checked })
                }
              />
            </div>

            {/* Functional */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Settings2 className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium text-sm">{t.functional}</p>
                  <p className="text-xs text-muted-foreground">{t.functionalDesc}</p>
                </div>
              </div>
              <Switch
                checked={preferences.functional}
                onCheckedChange={(checked) => 
                  setPreferences({ ...preferences, functional: checked })
                }
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleSavePreferences}
              className="flex-1 btn-glow btn-ripple"
            >
              {t.save}
            </Button>
            <Button
              variant="outline"
              onClick={handleAcceptAll}
              className="flex-1"
            >
              {t.acceptAll}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;
