import { Link } from "react-router-dom";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Send, 
  ArrowUp,
  ShieldCheck,
  Globe,
  Database,
  ArrowUpRight,
  Zap,
  Target
} from "lucide-react";
import showroomLogo from "@/assets/sudex-logo.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Footer = () => {
  const { t, language } = useLanguage();
  const { data: settings } = useSettings();
  const isRTL = language === "ar";
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const siteName = language === "ar"
    ? (settings?.showroom_name || t.siteName)
    : (settings?.showroom_name_en || t.siteName);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({ email });
      if (error) {
        if (error.code === "23505") {
          toast.info(isRTL ? "أنت مشترك بالفعل!" : "Already subscribed!");
        } else throw error;
      } else {
        toast.success(isRTL ? "تم الاشتراك!" : "Subscribed!");
        setEmail("");
      }
    } catch {
      toast.error(isRTL ? "فشل الاشتراك" : "Subscription failed");
    } finally {
      setIsLoading(false);
    }
  };

  const socialLinks = [
    { icon: Facebook, url: settings?.facebook_url, label: "META" },
    { icon: Twitter, url: settings?.twitter_url, label: "X_ARCHIVE" },
    { icon: Instagram, url: settings?.instagram_url, label: "VISUALS" },
    { icon: Youtube, url: settings?.tiktok_url, label: "BROADCAST" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-black text-white border-t border-white/5 pt-48 pb-20 relative overflow-hidden">
      {/* Structural Ambient Elements */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 bg-primary/5 blur-[120px] rounded-full" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-24 mb-48">
          {/* Section 01: The Identity */}
          <div className="lg:col-span-4 space-y-16">
            <div className="space-y-10">
              <Link to="/" className="inline-block relative group">
                <div className="p-4 border border-white/10 bg-white/5 grayscale group-hover:grayscale-0 transition-all duration-1000 overflow-hidden">
                   <img src={showroomLogo} alt={siteName} className="h-12 w-auto" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-primary" />
              </Link>
              
              <div className="space-y-4">
                 <h3 className="text-4xl font-black tracking-tighter uppercase text-white leading-none">
                   {siteName}
                 </h3>
                 <div className="flex items-center gap-4">
                    <ShieldCheck className="h-3 w-3 text-primary opacity-40" />
                    <span className="text-[10px] tracking-[0.8em] text-white/20 uppercase font-black uppercase">Institutional Authority</span>
                 </div>
              </div>
            </div>

            <p className="text-white/30 leading-relaxed font-light italic text-xl max-w-sm uppercase tracking-tight">
               {isRTL 
                 ? "نحن لا نبيع السيارات فحسب ، بل نرعى الإرث والتميز في كل تفصيل سيادي."
                 : "Facilitating the transition of legendary automotive assets into the private collections of the world's most discerning individuals."}
            </p>

            <div className="flex flex-wrap gap-8">
              {socialLinks.map((link, idx) => link.url && (
                <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="group flex flex-col items-start gap-3">
                   <div className="p-4 border border-white/5 bg-white/[0.02] text-white/20 group-hover:text-primary group-hover:border-primary/40 transition-all duration-700">
                      <link.icon className="h-4 w-4" />
                   </div>
                   <span className="text-[8px] tracking-[0.4em] font-black text-white/10 group-hover:text-white transition-colors">{link.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Section 02: Navigational Matrix */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-12">
            <div className="space-y-12">
              <div className="flex items-center gap-4">
                 <div className="h-px w-8 bg-primary/40" />
                 <h4 className="text-[11px] uppercase tracking-[0.8em] text-primary font-black">Archive</h4>
              </div>
              <ul className="space-y-8">
                {[
                  { path: "/", name: isRTL ? "الرئيسية" : "INDEX_PORTAL" },
                  { path: "/cars", name: isRTL ? "كتالوج السيارات" : "INVENTORY_ARCHIVE" },
                  { path: "/brands", name: isRTL ? "الماركات" : "INSTITUTIONAL_PARTNERS" },
                  { path: "/about", name: isRTL ? "قصتنا" : "HERITAGE_RECORDS" },
                  { path: "/contact", name: isRTL ? "تواصل معنا" : "CONCIERGE_INTERFACE" }
                ].map((item, idx) => (
                  <li key={idx}>
                    <Link to={item.path} className="text-[10px] text-white/30 hover:text-white transition-all duration-500 uppercase tracking-[0.4em] font-black flex items-center gap-4 group">
                       <span className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500 text-primary">0{idx + 1}</span>
                       {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-12">
              <div className="flex items-center gap-4">
                 <div className="h-px w-8 bg-white/10" />
                 <h4 className="text-[11px] uppercase tracking-[0.8em] text-white/20 font-black">Protocols</h4>
              </div>
              <ul className="space-y-8">
                {[
                  { path: "/faq", name: isRTL ? "الأسئلة الشائعة" : "KNOWLEDGE_BASE" },
                  { path: "/privacy", name: isRTL ? "الخصوصية" : "DATA_SOVEREIGNTY" },
                  { path: "/terms", name: isRTL ? "الشروط" : "SERVICE_MANIFEST" }
                ].map((item, idx) => (
                  <li key={idx}>
                    <Link to={item.path} className="text-[10px] text-white/30 hover:text-white transition-all duration-500 uppercase tracking-[0.4em] font-black flex items-center gap-4 group">
                       <span className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500 text-primary">0{idx + 1 + 5}</span>
                       {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 03: The Sovereign Dispatch */}
          <div className="lg:col-span-3 space-y-16">
             <div className="space-y-8">
               <div className="flex items-center gap-4">
                  <Zap className="h-4 w-4 text-primary" />
                  <h4 className="text-[11px] uppercase tracking-[0.8em] text-primary font-black">The Dispatch</h4>
               </div>
               <p className="text-white/30 text-xs uppercase tracking-[0.3em] leading-relaxed font-medium italic">
                 {isRTL 
                   ? "اشترك في نشرتنا الرسمية لتلقي آخر تحديثات الأسطول."
                   : "Electronic correspondence regarding prioritized collection opportunities and institutional shifts."}
               </p>
             </div>
             
             <form onSubmit={handleSubscribe} className="relative group">
               <div className="absolute -inset-x-2 -bottom-2 h-0.5 bg-white/5 transition-all group-focus-within:bg-primary" />
               <input
                 type="email"
                 placeholder="CORRESPONDENCE@DOMAIN.COM"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full bg-transparent border-none py-6 text-[11px] tracking-[0.5em] outline-none text-white font-black placeholder:text-white/5 uppercase"
                 required
               />
               <button type="submit" disabled={isLoading} className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 hover:text-primary transition-all p-2 group-hover:translate-x-2 duration-700">
                  <ArrowUpRight className="h-5 w-5" />
               </button>
             </form>

             <div className="pt-12">
                <div className="flex items-center gap-6">
                   <div className="h-12 w-12 rounded-full border border-white/5 flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-crosshair">
                      <Globe className="h-4 w-4 text-white/20" />
                   </div>
                   <span className="text-[9px] uppercase tracking-[0.4em] text-white/10 font-black">Global Access Protocol // SDv2.4</span>
                </div>
             </div>
          </div>
        </div>

        {/* Global Footer Trace */}
        <div className="pt-20 border-t border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-16 relative">
           {/* Big Ambient Text */}
           <div className="absolute -top-20 right-0 text-[12rem] font-black text-white/[0.01] tracking-tighter uppercase select-none pointer-events-none">
              Institutional
           </div>

           <div className="space-y-12 relative z-10">
              <div className="flex items-center gap-10">
                 <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Emblem_of_Sudan.svg/800px-Emblem_of_Sudan.svg.png" 
                    alt="Emblem" 
                    className="h-16 w-auto grayscale invert opacity-20" 
                 />
                 <div className="h-12 w-px bg-white/5" />
                 <div className="text-[10px] uppercase tracking-[0.5em] leading-relaxed text-white/20 font-black">
                    OFFICIALLY REGISTERED <br /> <span className="text-white/40">MINISTRY OF COMMERCE — REB. SUDAN</span>
                 </div>
              </div>
              <p className="text-[11px] uppercase tracking-[0.8em] text-white/10 font-black">
                © {new Date().getFullYear()} {siteName} // THE SOVEREIGN ATELIER
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-20 text-start lg:text-end relative z-10">
              <div className="space-y-4">
                 <div className="flex items-center lg:justify-end gap-3 text-primary/40">
                    <MapPin className="h-3 w-3" />
                    <span className="text-[9px] uppercase tracking-[0.6em] font-black">Command Center</span>
                 </div>
                 <p className="text-lg font-black tracking-tighter text-white uppercase italic">{settings?.address || "PORT SUDAN CENTRAL, SUDAN"}</p>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center lg:justify-end gap-3 text-primary/40">
                    <Phone className="h-3 w-3" />
                    <span className="text-[9px] uppercase tracking-[0.6em] font-black">Sovereign Direct</span>
                 </div>
                 <p className="text-3xl font-black tracking-tighter text-white uppercase">{settings?.phone || "+249.12.304.4745"}</p>
              </div>
           </div>

           <button 
             onClick={scrollToTop}
             className="absolute bottom-0 right-1/2 translate-x-1/2 p-6 border border-white/5 bg-white/[0.02] text-white/20 hover:text-primary hover:border-primary/40 transition-all duration-700 group md:flex items-center gap-6 hidden"
           >
              <span className="text-[9px] font-black tracking-[0.5em]">RETURN TO TOP</span>
              <ArrowUp className="h-4 w-4 group-hover:-translate-y-2 transition-transform duration-700" />
           </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
