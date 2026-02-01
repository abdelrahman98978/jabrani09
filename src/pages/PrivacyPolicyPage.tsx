import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Lock, Eye, Database, Cookie, Mail, UserCheck, RefreshCw } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

const translations = {
  ar: {
    title: "سياسة الخصوصية",
    lastUpdated: "آخر تحديث:",
    intro: "نحن نقدر خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك.",
    sections: [
      {
        icon: Database,
        title: "المعلومات التي نجمعها",
        content: [
          "معلومات الاتصال: الاسم، البريد الإلكتروني، رقم الهاتف",
          "معلومات الحساب: بيانات التسجيل وتفضيلات المستخدم",
          "معلومات التصفح: الصفحات التي تزورها، الوقت المستغرق",
          "معلومات الجهاز: نوع المتصفح، نظام التشغيل، عنوان IP",
        ],
      },
      {
        icon: Eye,
        title: "كيف نستخدم معلوماتك",
        content: [
          "تقديم وتحسين خدماتنا",
          "التواصل معك بشأن الطلبات والعروض",
          "تخصيص تجربتك على موقعنا",
          "تحليل الاستخدام لتحسين الأداء",
          "الامتثال للمتطلبات القانونية",
        ],
      },
      {
        icon: Lock,
        title: "حماية البيانات",
        content: [
          "نستخدم تشفير SSL لحماية البيانات المنقولة",
          "نخزن البيانات في خوادم آمنة ومحمية",
          "نحد من الوصول إلى البيانات للموظفين المصرح لهم فقط",
          "نراجع ونحدث إجراءات الأمان بانتظام",
        ],
      },
      {
        icon: Cookie,
        title: "ملفات تعريف الارتباط",
        content: [
          "نستخدم ملفات تعريف الارتباط لتحسين تجربتك",
          "ملفات ضرورية: مطلوبة لعمل الموقع",
          "ملفات تحليلية: تساعدنا على فهم استخدام الموقع",
          "ملفات تسويقية: لعرض إعلانات مخصصة",
          "يمكنك إدارة تفضيلات ملفات تعريف الارتباط في أي وقت",
        ],
      },
      {
        icon: UserCheck,
        title: "حقوقك",
        content: [
          "الوصول إلى بياناتك الشخصية",
          "تصحيح البيانات غير الدقيقة",
          "طلب حذف بياناتك",
          "الاعتراض على معالجة بياناتك",
          "سحب موافقتك في أي وقت",
        ],
      },
      {
        icon: RefreshCw,
        title: "تحديثات السياسة",
        content: [
          "قد نقوم بتحديث هذه السياسة من وقت لآخر",
          "سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني",
          "ننصحك بمراجعة هذه الصفحة بشكل دوري",
        ],
      },
    ],
    contact: "للاستفسارات حول سياسة الخصوصية، تواصل معنا عبر:",
  },
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last Updated:",
    intro: "We value your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and protect your information.",
    sections: [
      {
        icon: Database,
        title: "Information We Collect",
        content: [
          "Contact information: Name, email, phone number",
          "Account information: Registration data and user preferences",
          "Browsing information: Pages visited, time spent",
          "Device information: Browser type, OS, IP address",
        ],
      },
      {
        icon: Eye,
        title: "How We Use Your Information",
        content: [
          "Provide and improve our services",
          "Communicate with you about orders and offers",
          "Personalize your experience on our site",
          "Analyze usage to improve performance",
          "Comply with legal requirements",
        ],
      },
      {
        icon: Lock,
        title: "Data Protection",
        content: [
          "We use SSL encryption to protect transferred data",
          "We store data on secure and protected servers",
          "We limit data access to authorized employees only",
          "We regularly review and update security procedures",
        ],
      },
      {
        icon: Cookie,
        title: "Cookies",
        content: [
          "We use cookies to enhance your experience",
          "Necessary cookies: Required for site functionality",
          "Analytics cookies: Help us understand site usage",
          "Marketing cookies: Display personalized ads",
          "You can manage cookie preferences at any time",
        ],
      },
      {
        icon: UserCheck,
        title: "Your Rights",
        content: [
          "Access your personal data",
          "Correct inaccurate data",
          "Request deletion of your data",
          "Object to data processing",
          "Withdraw your consent at any time",
        ],
      },
      {
        icon: RefreshCw,
        title: "Policy Updates",
        content: [
          "We may update this policy from time to time",
          "We will notify you of significant changes via email",
          "We recommend reviewing this page periodically",
        ],
      },
    ],
    contact: "For privacy policy inquiries, contact us at:",
  },
  fr: {
    title: "Politique de Confidentialité",
    lastUpdated: "Dernière mise à jour:",
    intro: "Nous valorisons votre vie privée et nous nous engageons à protéger vos données personnelles.",
    sections: [
      {
        icon: Database,
        title: "Informations collectées",
        content: [
          "Coordonnées: Nom, email, téléphone",
          "Informations de compte: Données d'inscription",
          "Informations de navigation: Pages visitées",
          "Informations sur l'appareil: Navigateur, OS, IP",
        ],
      },
      {
        icon: Eye,
        title: "Utilisation des informations",
        content: [
          "Fournir et améliorer nos services",
          "Communiquer sur les commandes et offres",
          "Personnaliser votre expérience",
          "Analyser l'utilisation pour améliorer les performances",
        ],
      },
      {
        icon: Lock,
        title: "Protection des données",
        content: [
          "Chiffrement SSL pour les données transférées",
          "Stockage sur serveurs sécurisés",
          "Accès limité aux employés autorisés",
        ],
      },
      {
        icon: Cookie,
        title: "Cookies",
        content: [
          "Cookies nécessaires au fonctionnement",
          "Cookies analytiques",
          "Cookies marketing",
        ],
      },
      {
        icon: UserCheck,
        title: "Vos droits",
        content: [
          "Accéder à vos données",
          "Corriger les données inexactes",
          "Demander la suppression",
        ],
      },
      {
        icon: RefreshCw,
        title: "Mises à jour",
        content: [
          "Cette politique peut être mise à jour",
          "Consultez régulièrement cette page",
        ],
      },
    ],
    contact: "Pour toute question, contactez-nous:",
  },
  de: {
    title: "Datenschutzrichtlinie",
    lastUpdated: "Zuletzt aktualisiert:",
    intro: "Wir schätzen Ihre Privatsphäre und verpflichten uns, Ihre persönlichen Daten zu schützen.",
    sections: [
      {
        icon: Database,
        title: "Gesammelte Informationen",
        content: [
          "Kontaktdaten: Name, E-Mail, Telefon",
          "Kontoinformationen: Registrierungsdaten",
          "Browsing-Informationen: Besuchte Seiten",
          "Geräteinformationen: Browser, OS, IP",
        ],
      },
      {
        icon: Eye,
        title: "Verwendung der Informationen",
        content: [
          "Bereitstellung und Verbesserung unserer Dienste",
          "Kommunikation über Bestellungen und Angebote",
          "Personalisierung Ihrer Erfahrung",
        ],
      },
      {
        icon: Lock,
        title: "Datenschutz",
        content: [
          "SSL-Verschlüsselung für übertragene Daten",
          "Speicherung auf sicheren Servern",
          "Zugriff nur für autorisierte Mitarbeiter",
        ],
      },
      {
        icon: Cookie,
        title: "Cookies",
        content: [
          "Notwendige Cookies",
          "Analytische Cookies",
          "Marketing-Cookies",
        ],
      },
      {
        icon: UserCheck,
        title: "Ihre Rechte",
        content: [
          "Zugriff auf Ihre Daten",
          "Korrektur ungenauer Daten",
          "Löschung beantragen",
        ],
      },
      {
        icon: RefreshCw,
        title: "Aktualisierungen",
        content: [
          "Diese Richtlinie kann aktualisiert werden",
          "Überprüfen Sie diese Seite regelmäßig",
        ],
      },
    ],
    contact: "Für Fragen kontaktieren Sie uns:",
  },
};

const PrivacyPolicyPage = () => {
  const { language } = useLanguage();
  const { data: settings } = useSettings();
  const t = translations[language as keyof typeof translations] || translations.ar;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-4 icon-float-3d">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">{t.title}</h1>
            <p className="text-muted-foreground">
              {t.lastUpdated} {new Date().toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-card rounded-2xl p-6 mb-8 border border-border/50 card-3d-tilt">
            <p className="text-muted-foreground leading-relaxed">{t.intro}</p>
          </div>

          {/* Sections */}
          <div className="space-y-6 stagger-3d-entrance">
            {t.sections.map((section, index) => (
              <div 
                key={index}
                className="bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <section.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                </div>
                <ul className="space-y-2">
                  {section.content.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 text-center">
            <p className="text-muted-foreground mb-2">{t.contact}</p>
            <a 
              href={`mailto:${settings?.email || "privacy@example.com"}`}
              className="text-primary font-medium hover:underline"
            >
              {settings?.email || "privacy@example.com"}
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
