import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

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
      console.error("Error sending message:", error);
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

  const whatsappNumber = settings?.whatsapp || settings?.phone?.replace(/\D/g, "") || "249123044745";

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      isRTL
        ? "مرحباً، أرغب في الاستفسار عن السيارات المتوفرة لديكم"
        : "Hello, I would like to inquire about your available cars"
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  const contactInfo = [
    {
      icon: Phone,
      title: isRTL ? "الهاتف" : "Phone",
      value: settings?.phone || "+249 12 304 4745",
      href: `tel:${settings?.phone || "+249123044745"}`,
    },
    {
      icon: Mail,
      title: isRTL ? "البريد الإلكتروني" : "Email",
      value: settings?.email || "info@alfakhim.com",
      href: `mailto:${settings?.email || "info@alfakhim.com"}`,
    },
    {
      icon: MapPin,
      title: isRTL ? "العنوان" : "Address",
      value: isRTL
        ? (settings?.address_ar || "بورتسودان، السودان")
        : (settings?.address || "Port Sudan, Sudan"),
      href: "#",
    },
    {
      icon: Clock,
      title: isRTL ? "ساعات العمل" : "Working Hours",
      value: isRTL
        ? (settings?.working_hours_ar || "السبت - الخميس: 9 صباحاً - 10 مساءً")
        : (settings?.working_hours || "Sat - Thu: 9 AM - 10 PM"),
      href: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Page Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl font-black text-foreground">
              {isRTL ? "اتصل" : "Contact"} <span className="text-gradient-gold">{isRTL ? "بنا" : "Us"}</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              {isRTL
                ? "نحن هنا لمساعدتك. تواصل معنا بأي طريقة تفضلها"
                : "We're here to help. Contact us in any way you prefer"}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              {/* Contact Cards */}
              <div className="grid sm:grid-cols-2 gap-4 stagger-3d-entrance">
                {contactInfo.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Card className="h-full border-border/50 hover:border-primary/30 transition-all card-3d-tilt hover-lift-3d">
                      <CardContent className="p-6 relative z-10">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 icon-float-3d">
                            <item.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{item.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{item.value}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <Card className="whatsapp-glow-card border-[#25D366]/30 bg-[#25D366]/5 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-[#25D366] flex items-center justify-center icon-float-3d">
                      <MessageCircle className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">
                        {isRTL ? "تواصل معنا عبر واتساب" : "Contact us via WhatsApp"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? "أسرع طريقة للتواصل معنا" : "The fastest way to reach us"}
                      </p>
                    </div>
                    <Button variant="whatsapp" onClick={handleWhatsApp} className="btn-ripple">
                      {isRTL ? "ابدأ المحادثة" : "Start Chat"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="border-border/50 card-3d-tilt glow-3d animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <CardContent className="p-6 relative z-10">
                <h2 className="text-xl font-bold text-foreground mb-6">
                  {isRTL ? "أرسل لنا رسالة" : "Send us a message"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "الاسم" : "Name"} *
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={isRTL ? "أدخل اسمك" : "Enter your name"}
                        required
                        maxLength={100}
                        className="input-focus-3d"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "رقم الجوال" : "Phone"} *
                      </label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="05xxxxxxxx"
                        required
                        maxLength={20}
                        className="input-focus-3d"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {isRTL ? "البريد الإلكتروني" : "Email"}
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                      maxLength={255}
                      className="input-focus-3d"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {isRTL ? "الموضوع" : "Subject"}
                    </label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder={isRTL ? "موضوع الرسالة" : "Message subject"}
                      maxLength={200}
                      className="input-focus-3d"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {isRTL ? "الرسالة" : "Message"} *
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={isRTL ? "اكتب رسالتك هنا..." : "Write your message here..."}
                      rows={4}
                      required
                      maxLength={1000}
                      className="input-focus-3d"
                    />
                  </div>
                  <Button type="submit" variant="gold" size="lg" className="w-full gap-2 btn-glow btn-ripple" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isRTL ? "جاري الإرسال..." : "Sending..."}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {isRTL ? "إرسال الرسالة" : "Send Message"}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default ContactPage;