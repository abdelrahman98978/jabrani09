import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Search, HelpCircle, Car, CreditCard, Shield, Truck } from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  general: <HelpCircle className="h-5 w-5" />,
  purchase: <Car className="h-5 w-5" />,
  payment: <CreditCard className="h-5 w-5" />,
  warranty: <Shield className="h-5 w-5" />,
  delivery: <Truck className="h-5 w-5" />,
  "test-drive": <Car className="h-5 w-5" />,
};

const categoryLabels: Record<string, { ar: string; en: string }> = {
  general: { ar: "عام", en: "General" },
  purchase: { ar: "الشراء", en: "Purchase" },
  payment: { ar: "الدفع", en: "Payment" },
  warranty: { ar: "الضمان", en: "Warranty" },
  delivery: { ar: "التوصيل", en: "Delivery" },
  "test-drive": { ar: "تجربة القيادة", en: "Test Drive" },
};

const FAQPage = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const categories = [...new Set(faqs?.map(faq => faq.category) || [])];

  const filteredFaqs = faqs?.filter(faq => {
    const question = isRTL ? faq.question_ar : faq.question;
    const answer = isRTL ? faq.answer_ar : faq.answer;
    const matchesSearch = !searchTerm || 
      question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-28">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {isRTL ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isRTL 
              ? "ابحث عن إجابات لأسئلتك أو تصفح الأقسام أدناه"
              : "Find answers to your questions or browse the categories below"}
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto mb-8">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={isRTL ? "ابحث في الأسئلة..." : "Search questions..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-12 h-12 text-lg"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-sm"
            onClick={() => setSelectedCategory(null)}
          >
            {isRTL ? "الكل" : "All"}
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm flex items-center gap-2"
              onClick={() => setSelectedCategory(category)}
            >
              {categoryIcons[category]}
              {categoryLabels[category]?.[isRTL ? "ar" : "en"] || category}
            </Badge>
          ))}
        </div>

        {/* FAQ List */}
        {isLoading ? (
          <div className="max-w-3xl mx-auto space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredFaqs?.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              {isRTL ? "لم يتم العثور على نتائج" : "No results found"}
            </p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="max-w-3xl mx-auto">
            {filteredFaqs?.map((faq, index) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-start hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-lg">
                      {isRTL ? faq.question_ar : faq.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="ps-11 text-muted-foreground">
                  {isRTL ? faq.answer_ar : faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* Contact CTA */}
        <div className="text-center mt-16 p-8 bg-muted/50 rounded-2xl max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-2">
            {isRTL ? "لم تجد إجابة لسؤالك؟" : "Didn't find your answer?"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {isRTL 
              ? "تواصل معنا وسنساعدك في أقرب وقت"
              : "Contact us and we'll help you as soon as possible"}
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            {isRTL ? "تواصل معنا" : "Contact Us"}
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;
