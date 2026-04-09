import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  HelpCircle, 
  Car, 
  CreditCard, 
  ShieldCheck, 
  Truck, 
  Zap, 
  ArrowRight,
  MessageCircle,
  Clock,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categoryIcons: Record<string, any> = {
  general: HelpCircle,
  purchase: Car,
  payment: CreditCard,
  warranty: ShieldCheck,
  delivery: Truck,
  "test-drive": Zap,
};

const categoryLabels: Record<string, { ar: string; en: string }> = {
  general: { ar: "عام", en: "General" },
  purchase: { ar: "الشراء", en: "Acquisition" },
  payment: { ar: "الدفع", en: "Capital Transfer" },
  warranty: { ar: "الضمان", en: "Sovereign Protection" },
  delivery: { ar: "التوصيل", en: "Logistics" },
  "test-drive": { ar: "تجربة القيادة", en: "Engagement" },
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
    <div className="min-h-screen bg-black selection:bg-primary/30 overflow-x-hidden">
      <Navbar />
      
      <main className="pt-40 pb-32">
        {/* Editorial Header */}
        <section className="container mx-auto px-6 md:px-12 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="max-w-5xl space-y-12"
          >
            <div className="space-y-4">
              <div className="text-primary text-[11px] uppercase tracking-[0.6em] font-black">
                {isRTL ? "موسوعة المعرفة" : "Institutional Knowledge Base"}
              </div>
              <h1 className="text-6xl md:text-9xl text-hero text-white tracking-tighter leading-[0.85] uppercase">
                {isRTL ? "الأسئلة الشائعة" : "Inquiry & Records"}
              </h1>
            </div>
            <p className="text-2xl md:text-3xl text-white/40 leading-relaxed font-light tracking-tight italic max-w-3xl">
              {isRTL 
                ? "دليلك الشامل لبروتوكولات الشراء والخدمات المتميزة لدينا."
                : "A comprehensive repository of protocols, acquisition standards, and institutional procedures."}
            </p>
          </motion.div>
        </section>

        <section className="container mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-12 gap-24">
                
                {/* Search & Navigation */}
                <div className="lg:col-span-4 space-y-12">
                    <div className="space-y-6">
                        <label className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold block">Terminal Search</label>
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-hover:text-primary transition-colors" />
                            <Input
                                placeholder={isRTL ? "بحث في السجلات..." : "Search Records..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-16 bg-surface-low border-white/5 pl-16 rounded-none text-white tracking-widest focus-visible:ring-primary focus-visible:ring-1"
                            />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold">Categories</p>
                        <nav className="flex flex-col gap-4">
                            <button 
                                onClick={() => setSelectedCategory(null)}
                                className={`text-left text-[11px] uppercase tracking-[0.4em] font-black transition-all duration-500 py-4 border-b border-white/5 ${selectedCategory === null ? 'text-primary' : 'text-white/20 hover:text-white'}`}
                            >
                                {isRTL ? "كافة السجلات" : "All Repositories"}
                            </button>
                            {categories.map((cat) => {
                                const Icon = categoryIcons[cat] || HelpCircle;
                                return (
                                    <button 
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`group flex items-center justify-between py-4 border-b border-white/5 transition-all duration-500 ${selectedCategory === cat ? 'text-primary' : 'text-white/20 hover:text-white'}`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <Icon className={`h-4 w-4 ${selectedCategory === cat ? 'text-primary' : 'text-white/10 group-hover:text-primary transition-colors'}`} />
                                            <span className="text-[11px] uppercase tracking-[0.3em] font-black">
                                                {categoryLabels[cat]?.[isRTL ? "ar" : "en"] || cat}
                                            </span>
                                        </div>
                                        <ArrowRight className={`h-3 w-3 -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all ${selectedCategory === cat ? 'translate-x-0 opacity-100' : ''}`} />
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Support Block */}
                    <div className="p-10 bg-surface-low border border-white/5 space-y-8">
                        <div className="space-y-4">
                            <h4 className="text-xl font-black text-white uppercase tracking-tighter italic">Still Seeking Clarification?</h4>
                            <p className="text-sm text-white/40 italic leading-relaxed">Direct lines remain open for institutional inquiries.</p>
                        </div>
                        <Link 
                            to="/contact"
                            className="w-full h-16 bg-white text-black text-[10px] uppercase tracking-[0.4em] font-black flex items-center justify-center gap-4 hover:bg-primary transition-all duration-700"
                        >
                            <MessageCircle className="h-4 w-4" />
                            Consult Agent
                        </Link>
                    </div>
                </div>

                {/* FAQ Entries */}
                <div className="lg:col-span-8">
                    <div className="bg-surface-low border border-white/5">
                        <Accordion type="single" collapsible className="w-full">
                            {isLoading ? (
                                Array(8).fill(0).map((_, i) => (
                                    <div key={i} className="h-24 border-b border-white/5 bg-surface-low/50 animate-pulse" />
                                ))
                            ) : filteredFaqs?.length === 0 ? (
                                <div className="py-32 text-center">
                                    <Search className="h-16 w-16 text-white/5 mx-auto mb-8" />
                                    <p className="text-[10px] uppercase tracking-[0.5em] text-white/20">No matching records found</p>
                                </div>
                            ) : (
                                filteredFaqs?.map((faq, index) => (
                                    <AccordionItem key={faq.id} value={faq.id} className="border-b border-white/5 last:border-0 px-8 py-4 group data-[state=open]:bg-black transition-all duration-700">
                                        <AccordionTrigger className="hover:no-underline text-left py-6">
                                            <div className="flex items-center gap-8">
                                                <span className="text-[10px] font-black text-primary/20 group-hover:text-primary transition-colors">
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </span>
                                                <span className="text-xl md:text-2xl font-bold text-white tracking-tighter uppercase text-left">
                                                    {isRTL ? faq.question_ar : faq.question}
                                                </span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-10 pt-4 pl-16">
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-lg text-white/40 font-light leading-relaxed tracking-tight italic max-w-3xl"
                                            >
                                                {isRTL ? faq.answer_ar : faq.answer}
                                            </motion.div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))
                            )}
                        </Accordion>
                    </div>
                    
                    {/* Security Badge */}
                    <div className="mt-12 flex items-center gap-4 text-white/10 uppercase text-[9px] tracking-[0.5em] font-black">
                        <ShieldCheck className="h-4 w-4" />
                        End-to-End Encrypted Knowledge Terminal
                    </div>
                </div>
            </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default FAQPage;
