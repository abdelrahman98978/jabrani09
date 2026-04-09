import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, Loader2, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const ContactPage = () => {
  const { toast } = useToast();
  const { data: settings } = useSettings();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        subject: formData.subject.trim() || null,
        message: formData.message.trim(),
        status: "new",
      });
      if (error) throw error;
      toast({
        title: isRTL ? "تم الإرسال بنجاح" : "Message sent successfully",
        description: isRTL ? "سنتواصل معك في أقرب وقت ممكن" : "We will contact you as soon as possible",
      });
      setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: isRTL ? "حدث خطأ" : "Error",
        description: isRTL ? "فشل إرسال الرسالة. حاول مرة أخرى" : "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    {
       icon: Phone,
       label: isRTL ? "الهاتف" : "Phone",
       value: settings?.phone || "+249 12 304 4745",
       href: `tel:${settings?.phone || "+249123044745"}`
    },
    {
       icon: Mail,
       label: isRTL ? "البريد الإلكتروني" : "Email",
       value: settings?.email || "info@jabrani.com",
       href: `mailto:${settings?.email || "info@jabrani.com"}`
    },
    {
       icon: MapPin,
       label: isRTL ? "العنوان" : "Address",
       value: isRTL ? "بورتسودان ، السودان" : "Port Sudan, Sudan",
       href: "#"
    },
    {
       icon: Clock,
       label: isRTL ? "ساعات العمل" : "Operation",
       value: isRTL ? "السبت - الخميس: 9ص - 10م" : "Sat - Thu: 9 AM - 10 PM",
       href: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-black selection:bg-primary/30 overflow-x-hidden">
      <Navbar />

      <main className="pt-40 pb-32">
        {/* Header Section */}
        <section className="container mx-auto px-6 md:px-12 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl space-y-12"
          >
            <div className="space-y-4">
              <div className="text-primary text-[11px] uppercase tracking-[0.6em] font-black">
                 {isRTL ? "تواصل مباشر" : "Direct Engagement"}
              </div>
              <h1 className="text-6xl md:text-9xl text-hero text-white tracking-tighter leading-[0.85]">
                 {isRTL ? "اتصل بنا" : "Contact Us"}
              </h1>
            </div>
            <p className="text-2xl md:text-3xl text-white/30 font-light tracking-tight italic">
               {isRTL 
                 ? "نحن هنا لخدمة تطلعاتكم ، لا تتردد في التواصل مع خبرائنا."
                 : "Our experts are ready to curate your ideal automotive acquisition."}
            </p>
          </motion.div>
        </section>

        {/* Interaction Grid */}
        <section className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-24">
             {/* Channels */}
             <div className="lg:col-span-5 space-y-20">
                <div className="space-y-12">
                   <h3 className="text-[11px] uppercase tracking-[0.6em] text-white/20 font-bold mb-8">
                      Primary Channels
                   </h3>
                   <div className="grid gap-px bg-white/5 border border-white/5">
                      {contactInfo.map((item, idx) => (
                        <a key={idx} href={item.href} className="bg-black p-8 group hover:bg-white/5 transition-colors">
                           <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                 <p className="text-[9px] uppercase tracking-[0.4em] text-white/20">{item.label}</p>
                                 <p className="text-xl font-medium text-white group-hover:text-primary transition-colors">{item.value}</p>
                              </div>
                              <item.icon className="h-4 w-4 text-white/10 group-hover:text-primary transition-colors" />
                           </div>
                        </a>
                      ))}
                   </div>
                </div>

                {/* WhatsApp Dispatch */}
                <div className="p-12 bg-surface-low border border-white/5 space-y-8">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-[#25D366]/10 flex items-center justify-center rounded-full">
                         <MessageCircle className="h-8 w-8 text-[#25D366]" />
                      </div>
                      <div>
                         <h4 className="text-xl font-bold text-white uppercase tracking-wider">Priority Support</h4>
                         <p className="text-white/30 text-sm italic">Direct encrypted communication for elite requests.</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => window.open(`https://wa.me/${settings?.whatsapp || '249123044745'}`, "_blank")}
                     className="w-full h-16 border border-[#25D366]/30 text-[#25D366] text-xs uppercase tracking-[0.5em] font-black hover:bg-[#25D366] hover:text-black transition-all"
                   >
                     Initiate WhatsApp
                   </button>
                </div>
             </div>

             {/* Form */}
             <div className="lg:col-span-7 space-y-12">
                <h3 className="text-[11px] uppercase tracking-[0.6em] text-white/20 font-bold">
                   Electronic Dispatch
                </h3>
                <form onSubmit={handleSubmit} className="space-y-12">
                   <div className="grid md:grid-cols-2 gap-12">
                      <div className="space-y-4">
                        <label className="text-[9px] uppercase tracking-[0.4em] text-white/40 block">Identity</label>
                        <input 
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your Name"
                          className="w-full bg-transparent border-b border-white/10 py-4 text-white focus:border-primary outline-none transition-colors placeholder:text-white/10"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[9px] uppercase tracking-[0.4em] text-white/40 block">Communication</label>
                        <input 
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Contact Number"
                          className="w-full bg-transparent border-b border-white/10 py-4 text-white focus:border-primary outline-none transition-colors placeholder:text-white/10"
                        />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[9px] uppercase tracking-[0.4em] text-white/40 block">Electronic Address</label>
                      <input 
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email (Optional)"
                        className="w-full bg-transparent border-b border-white/10 py-4 text-white focus:border-primary outline-none transition-colors placeholder:text-white/10"
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[9px] uppercase tracking-[0.4em] text-white/40 block">The Inquiry</label>
                      <textarea 
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Detail your request..."
                        className="w-full bg-transparent border-b border-white/10 py-4 text-white focus:border-primary outline-none transition-colors placeholder:text-white/10 resize-none"
                      />
                   </div>
                   <button 
                     disabled={isSubmitting}
                     className="min-w-[280px] h-20 bg-primary text-black text-[12px] uppercase tracking-[0.5em] font-black hover:bg-white transition-all duration-700 flex items-center justify-center gap-4"
                   >
                     {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                     Transmit Message
                   </button>
                </form>
             </div>
          </div>
        </section>

        {/* Ambient Map Placeholder */}
        <section className="mt-48 h-[60vh] bg-surface-low border-y border-white/5 flex items-center justify-center opacity-40">
           <div className="text-center space-y-4">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-8 opacity-20" />
              <div className="text-[11px] uppercase tracking-[1em] text-white font-black">Institutional Location</div>
              <p className="text-white/20 italic">Port Sudan HQ — Private Viewings by Appointment Only</p>
           </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default ContactPage;