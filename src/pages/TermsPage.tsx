import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, CheckCircle, AlertTriangle, Scale, CreditCard, Truck, Ban, HelpCircle } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

const translations = {
  ar: {
    title: "شروط الاستخدام",
    lastUpdated: "آخر تحديث:",
    intro: "باستخدامك لموقعنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية.",
    sections: [
      {
        icon: CheckCircle,
        title: "القبول بالشروط",
        content: [
          "باستخدام هذا الموقع، فإنك توافق على هذه الشروط",
          "إذا كنت لا توافق على أي جزء من الشروط، لا تستخدم الموقع",
          "نحتفظ بحق تعديل هذه الشروط في أي وقت",
          "استمرارك في استخدام الموقع يعني موافقتك على التغييرات",
        ],
      },
      {
        icon: Scale,
        title: "استخدام الموقع",
        content: [
          "يجب أن يكون عمرك 18 عاماً أو أكثر لاستخدام خدماتنا",
          "أنت مسؤول عن الحفاظ على سرية حسابك",
          "يحظر استخدام الموقع لأي غرض غير قانوني",
          "لا يجوز نسخ أو توزيع محتوى الموقع بدون إذن",
        ],
      },
      {
        icon: CreditCard,
        title: "الأسعار والدفع",
        content: [
          "جميع الأسعار المعروضة بالريال السعودي ما لم يُذكر خلاف ذلك",
          "نحتفظ بحق تعديل الأسعار دون إشعار مسبق",
          "الأسعار لا تشمل رسوم الشحن والتوصيل ما لم يُذكر",
          "يتم تأكيد السعر النهائي قبل إتمام الطلب",
        ],
      },
      {
        icon: Truck,
        title: "التسليم والشحن",
        content: [
          "نسعى لتسليم السيارات في الوقت المحدد",
          "أوقات التسليم المقدرة قد تختلف حسب الموقع",
          "المشتري مسؤول عن التحقق من حالة السيارة عند الاستلام",
          "يجب الإبلاغ عن أي مشكلات خلال 24 ساعة من الاستلام",
        ],
      },
      {
        icon: AlertTriangle,
        title: "الضمان والإرجاع",
        content: [
          "تخضع السيارات لشروط الضمان المحددة لكل سيارة",
          "لا يشمل الضمان الأضرار الناتجة عن سوء الاستخدام",
          "سياسة الإرجاع تختلف حسب نوع السيارة وحالتها",
          "يجب الاحتفاظ بجميع المستندات والفواتير",
        ],
      },
      {
        icon: Ban,
        title: "حدود المسؤولية",
        content: [
          "لا نتحمل مسؤولية الأضرار غير المباشرة أو التبعية",
          "المعلومات المقدمة للأغراض الإعلامية فقط",
          "نحن غير مسؤولين عن محتوى المواقع الخارجية المرتبطة",
          "مسؤوليتنا القصوى لا تتجاوز قيمة المعاملة",
        ],
      },
      {
        icon: Scale,
        title: "القانون الحاكم",
        content: [
          "تخضع هذه الشروط لقوانين المملكة العربية السعودية",
          "أي نزاع يخضع للمحاكم المختصة في المملكة",
          "يتم تفسير هذه الشروط وفقاً للأنظمة السعودية",
        ],
      },
    ],
    contact: "للاستفسارات حول شروط الاستخدام، تواصل معنا عبر:",
  },
  en: {
    title: "Terms of Service",
    lastUpdated: "Last Updated:",
    intro: "By using our website, you agree to comply with these terms and conditions. Please read them carefully.",
    sections: [
      {
        icon: CheckCircle,
        title: "Acceptance of Terms",
        content: [
          "By using this website, you agree to these terms",
          "If you disagree with any part, do not use the site",
          "We reserve the right to modify these terms at any time",
          "Continued use means acceptance of changes",
        ],
      },
      {
        icon: Scale,
        title: "Use of Website",
        content: [
          "You must be 18 years or older to use our services",
          "You are responsible for maintaining account confidentiality",
          "Using the site for illegal purposes is prohibited",
          "Copying or distributing content without permission is not allowed",
        ],
      },
      {
        icon: CreditCard,
        title: "Prices and Payment",
        content: [
          "All prices are in Saudi Riyals unless stated otherwise",
          "We reserve the right to modify prices without notice",
          "Prices do not include shipping unless stated",
          "Final price is confirmed before order completion",
        ],
      },
      {
        icon: Truck,
        title: "Delivery and Shipping",
        content: [
          "We strive to deliver vehicles on time",
          "Estimated delivery times may vary by location",
          "Buyer is responsible for verifying condition upon receipt",
          "Report any issues within 24 hours of receipt",
        ],
      },
      {
        icon: AlertTriangle,
        title: "Warranty and Returns",
        content: [
          "Vehicles are subject to specific warranty terms",
          "Warranty does not cover damage from misuse",
          "Return policy varies by vehicle type and condition",
          "Keep all documents and invoices",
        ],
      },
      {
        icon: Ban,
        title: "Limitation of Liability",
        content: [
          "We are not liable for indirect or consequential damages",
          "Information provided is for informational purposes only",
          "We are not responsible for linked external content",
          "Our maximum liability does not exceed transaction value",
        ],
      },
      {
        icon: Scale,
        title: "Governing Law",
        content: [
          "These terms are governed by Saudi Arabian law",
          "Disputes are subject to Saudi Arabian courts",
          "Terms are interpreted according to Saudi regulations",
        ],
      },
    ],
    contact: "For terms of service inquiries, contact us at:",
  },
  fr: {
    title: "Conditions d'Utilisation",
    lastUpdated: "Dernière mise à jour:",
    intro: "En utilisant notre site, vous acceptez de respecter ces conditions. Veuillez les lire attentivement.",
    sections: [
      {
        icon: CheckCircle,
        title: "Acceptation des Conditions",
        content: [
          "En utilisant ce site, vous acceptez ces conditions",
          "Si vous n'êtes pas d'accord, n'utilisez pas le site",
          "Nous nous réservons le droit de modifier ces conditions",
        ],
      },
      {
        icon: Scale,
        title: "Utilisation du Site",
        content: [
          "Vous devez avoir 18 ans ou plus",
          "Vous êtes responsable de la confidentialité de votre compte",
          "L'utilisation illégale est interdite",
        ],
      },
      {
        icon: CreditCard,
        title: "Prix et Paiement",
        content: [
          "Tous les prix sont en Riyals Saoudiens",
          "Nous nous réservons le droit de modifier les prix",
        ],
      },
      {
        icon: Truck,
        title: "Livraison",
        content: [
          "Nous nous efforçons de livrer à temps",
          "Les délais peuvent varier selon l'emplacement",
        ],
      },
      {
        icon: AlertTriangle,
        title: "Garantie et Retours",
        content: [
          "Les véhicules sont soumis à des conditions de garantie",
          "La garantie ne couvre pas les dommages dus à une mauvaise utilisation",
        ],
      },
      {
        icon: Ban,
        title: "Limitation de Responsabilité",
        content: [
          "Nous ne sommes pas responsables des dommages indirects",
          "Les informations sont fournies à titre informatif",
        ],
      },
      {
        icon: Scale,
        title: "Loi Applicable",
        content: [
          "Ces conditions sont régies par la loi saoudienne",
        ],
      },
    ],
    contact: "Pour toute question, contactez-nous:",
  },
  de: {
    title: "Nutzungsbedingungen",
    lastUpdated: "Zuletzt aktualisiert:",
    intro: "Durch die Nutzung unserer Website stimmen Sie diesen Bedingungen zu. Bitte lesen Sie sie sorgfältig.",
    sections: [
      {
        icon: CheckCircle,
        title: "Annahme der Bedingungen",
        content: [
          "Durch die Nutzung dieser Website stimmen Sie zu",
          "Bei Nichteinverständnis nutzen Sie die Seite nicht",
          "Wir behalten uns das Recht vor, diese Bedingungen zu ändern",
        ],
      },
      {
        icon: Scale,
        title: "Nutzung der Website",
        content: [
          "Sie müssen 18 Jahre oder älter sein",
          "Sie sind für die Geheimhaltung Ihres Kontos verantwortlich",
          "Illegale Nutzung ist verboten",
        ],
      },
      {
        icon: CreditCard,
        title: "Preise und Zahlung",
        content: [
          "Alle Preise sind in Saudi-Rial",
          "Wir behalten uns Preisänderungen vor",
        ],
      },
      {
        icon: Truck,
        title: "Lieferung",
        content: [
          "Wir bemühen uns um pünktliche Lieferung",
          "Lieferzeiten können variieren",
        ],
      },
      {
        icon: AlertTriangle,
        title: "Garantie und Rückgabe",
        content: [
          "Fahrzeuge unterliegen spezifischen Garantiebedingungen",
          "Garantie deckt keine Missbrauchsschäden",
        ],
      },
      {
        icon: Ban,
        title: "Haftungsbeschränkung",
        content: [
          "Wir haften nicht für indirekte Schäden",
          "Informationen dienen nur zu Informationszwecken",
        ],
      },
      {
        icon: Scale,
        title: "Anwendbares Recht",
        content: [
          "Diese Bedingungen unterliegen saudischem Recht",
        ],
      },
    ],
    contact: "Für Fragen kontaktieren Sie uns:",
  },
};

const TermsPage = () => {
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
              <FileText className="h-12 w-12 text-primary" />
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
              href={`mailto:${settings?.email || "legal@example.com"}`}
              className="text-primary font-medium hover:underline"
            >
              {settings?.email || "legal@example.com"}
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;
