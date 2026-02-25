import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Gift, X, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { z } from "zod";

const POPUP_SHOWN_KEY = "newsletter_popup_shown";
const POPUP_SUBSCRIBED_KEY = "newsletter_subscribed";

const emailSchema = z.string().email();

const translations = {
  ar: {
    title: "احصل على خصم 10%! 🎉",
    subtitle: "اشترك في نشرتنا البريدية",
    offer: "احصل على خصم حصري على طلبك الأول عند الاشتراك في نشرتنا البريدية",
    emailPlaceholder: "بريدك الإلكتروني",
    subscribe: "اشترك الآن",
    noThanks: "لا شكراً",
    privacyAgree: "أوافق على سياسة الخصوصية والشروط والأحكام",
    success: "تم الاشتراك بنجاح! سيصلك كود الخصم على بريدك",
    error: "حدث خطأ، يرجى المحاولة مرة أخرى",
    invalidEmail: "يرجى إدخال بريد إلكتروني صحيح",
    privacyRequired: "يجب الموافقة على سياسة الخصوصية",
    benefits: [
      "عروض حصرية أسبوعية",
      "أول من يعرف عن السيارات الجديدة",
      "نصائح ومقالات متخصصة",
    ],
  },
  en: {
    title: "Get 10% OFF! 🎉",
    subtitle: "Subscribe to our newsletter",
    offer: "Get an exclusive discount on your first order when you subscribe to our newsletter",
    emailPlaceholder: "Your email",
    subscribe: "Subscribe Now",
    noThanks: "No Thanks",
    privacyAgree: "I agree to the privacy policy and terms",
    success: "Subscribed successfully! Your discount code will be sent to your email",
    error: "An error occurred, please try again",
    invalidEmail: "Please enter a valid email",
    privacyRequired: "You must agree to the privacy policy",
    benefits: [
      "Weekly exclusive offers",
      "First to know about new cars",
      "Expert tips and articles",
    ],
  },
  fr: {
    title: "Obtenez 10% de réduction! 🎉",
    subtitle: "Abonnez-vous à notre newsletter",
    offer: "Obtenez une réduction exclusive sur votre première commande en vous abonnant",
    emailPlaceholder: "Votre email",
    subscribe: "S'abonner",
    noThanks: "Non merci",
    privacyAgree: "J'accepte la politique de confidentialité",
    success: "Abonné avec succès! Votre code sera envoyé par email",
    error: "Une erreur s'est produite, veuillez réessayer",
    invalidEmail: "Veuillez entrer un email valide",
    privacyRequired: "Vous devez accepter la politique de confidentialité",
    benefits: [
      "Offres exclusives hebdomadaires",
      "Premier informé des nouvelles voitures",
      "Conseils et articles d'experts",
    ],
  },
  de: {
    title: "Erhalten Sie 10% Rabatt! 🎉",
    subtitle: "Abonnieren Sie unseren Newsletter",
    offer: "Erhalten Sie einen exklusiven Rabatt auf Ihre erste Bestellung",
    emailPlaceholder: "Ihre E-Mail",
    subscribe: "Jetzt abonnieren",
    noThanks: "Nein danke",
    privacyAgree: "Ich stimme der Datenschutzrichtlinie zu",
    success: "Erfolgreich abonniert! Ihr Rabattcode wird per E-Mail gesendet",
    error: "Ein Fehler ist aufgetreten, bitte versuchen Sie es erneut",
    invalidEmail: "Bitte geben Sie eine gültige E-Mail ein",
    privacyRequired: "Sie müssen der Datenschutzrichtlinie zustimmen",
    benefits: [
      "Wöchentliche exklusive Angebote",
      "Als Erster über neue Autos informiert",
      "Expertentipps und Artikel",
    ],
  },
};

const NewsletterPopup = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language as keyof typeof translations] || translations.ar;

  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const hasShown = localStorage.getItem(POPUP_SHOWN_KEY);
    const hasSubscribed = localStorage.getItem(POPUP_SUBSCRIBED_KEY);

    if (!hasShown && !hasSubscribed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem(POPUP_SHOWN_KEY, "true");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubscribe = async () => {
    // Validate email
    const emailResult = emailSchema.safeParse(email.trim());
    if (!emailResult.success) {
      toast({
        title: t.invalidEmail,
        variant: "destructive",
      });
      return;
    }

    if (!agreePrivacy) {
      toast({
        title: t.privacyRequired,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim() });

      if (error) {
        if (error.code === "23505") {
          // Already subscribed
          toast({
            title: t.success,
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: t.success,
        });
      }

      localStorage.setItem(POPUP_SUBSCRIBED_KEY, "true");
      setIsOpen(false);
    } catch (error) {
      toast({
        title: t.error,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden popup-zoom-in border-0">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-accent p-6 text-primary-foreground">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-white/20 rounded-xl icon-float-3d">
              <Gift className="h-8 w-8" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">{t.title}</DialogTitle>
              <p className="text-primary-foreground/80 text-sm">{t.subtitle}</p>
            </div>
          </div>

          {/* Decorative sparkles */}
          <Sparkles className="absolute top-4 left-1/4 h-4 w-4 opacity-50 animate-pulse" />
          <Sparkles className="absolute bottom-6 right-1/4 h-3 w-3 opacity-40 animate-pulse delay-300" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-muted-foreground text-sm text-center">{t.offer}</p>

          {/* Benefits */}
          <ul className="space-y-2">
            {t.benefits.map((benefit, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm text-foreground"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                  ✓
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 input-focus-3d"
              dir="ltr"
            />
          </div>

          {/* Privacy Checkbox */}
          <div className="flex items-start gap-2">
            <Checkbox
              id="privacy"
              checked={agreePrivacy}
              onCheckedChange={(checked) => setAgreePrivacy(checked as boolean)}
              className="mt-0.5"
            />
            <label
              htmlFor="privacy"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              {t.privacyAgree}
            </label>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full btn-glow btn-ripple bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  {t.subscribe}
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleClose}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              {t.noThanks}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterPopup;
