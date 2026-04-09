import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Mail, Lock, ArrowRight, UserPlus, Fingerprint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const isRTL = language === "ar";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(isRTL ? "تم تسجيل الدخول" : "Welcome Back");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        toast.success(isRTL ? "تم إنشاء الحساب، يرجى تفعيل البريد" : "Registration successful. Please verify email.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
         <img 
           src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80" 
           className="w-full h-full object-cover opacity-20 grayscale" 
           alt="" 
         />
         <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      </div>

      <div className="container relative z-10 flex items-center justify-center lg:justify-start px-6 md:px-24">
         <motion.div 
           initial={{ opacity: 0, x: -50 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
           className="w-full max-w-xl space-y-12"
         >
           {/* Header */}
           <div className="space-y-4">
              <div className="flex items-center gap-4 text-primary">
                 <Shield className="h-6 w-6" />
                 <span className="text-[10px] uppercase tracking-[0.8em] font-black">Secure Portal</span>
              </div>
              <h1 className="text-7xl font-bold tracking-tighter text-white uppercase leading-none">
                 {isLogin ? (isRTL ? "دخول" : "Access") : (isRTL ? "تسجيل" : "Identity")}
                 <span className="block text-primary">{isLogin ? (isRTL ? "المحترفين" : "Elite") : (isRTL ? "جديد" : "Genesis")}</span>
              </h1>
              <p className="text-white/40 text-lg font-light max-w-sm leading-relaxed">
                 {isLogin 
                   ? "Enter your credentials to manage your collection and exclusive alerts."
                   : "Join the apex of automotive excellence. Register for institutional access."}
              </p>
           </div>

           {/* Form */}
           <form onSubmit={handleAuth} className="space-y-6">
              <AnimatePresence mode="wait">
                 {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                       <label className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black">Nominal Identity</label>
                       <div className="relative">
                          <Input
                            placeholder="FULL LEGAL NAME"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="bg-white/5 border-white/10 rounded-none h-14 ps-12 text-white tracking-widest focus:border-primary transition-all"
                            required
                          />
                          <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>

              <div className="space-y-2">
                 <label className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black">Electronic Address</label>
                 <div className="relative">
                    <Input
                      type="email"
                      placeholder="EMAIL@SOVEREIGN.COM"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/5 border-white/10 rounded-none h-14 ps-12 text-white tracking-widest focus:border-primary transition-all"
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black">Secret Cipher</label>
                 <div className="relative">
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 border-white/10 rounded-none h-14 ps-12 text-white tracking-widest focus:border-primary transition-all"
                      required
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                 </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-16 bg-primary text-black text-[11px] font-black uppercase tracking-[0.5em] hover:bg-white transition-all duration-700 flex items-center justify-center gap-4"
              >
                 {isLoading ? "Validating..." : (isLogin ? "Authenticate" : "Register Identity")}
                 <ArrowRight className="h-4 w-4" />
              </button>
           </form>

           {/* Toggle */}
           <div className="pt-12 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-widest text-white/20">
                 {isLogin ? "No institutional account?" : "Existing operative?"}
              </span>
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-[11px] uppercase tracking-[0.3em] text-primary font-black hover:text-white transition-colors flex items-center gap-2"
              >
                 {isLogin ? "Register Now" : "Login Instead"}
                 <UserPlus className="h-4 w-4" />
              </button>
           </div>
         </motion.div>
      </div>

      {/* Aesthetic Side Overlay */}
      <div className="hidden lg:flex flex-1 items-end justify-end p-24">
         <div className="text-end">
            <h2 className="text-9xl font-bold tracking-tighter text-white/5 uppercase select-none">JABRANI</h2>
            <div className="text-[10px] uppercase tracking-[1em] text-white/10 font-black mt-4">Sovereign Automotive Authority</div>
         </div>
      </div>
    </div>
  );
};

export default AuthPage;
