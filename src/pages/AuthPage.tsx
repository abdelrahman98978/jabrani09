import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Loader2,
  Chrome,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Zap,
  Gift,
  Car,
  CheckCircle2
} from "lucide-react";
import alJabraniLogo from "@/assets/sudex-logo.jpg";
import { Separator } from "@/components/ui/separator";

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
  });

  const ALLOWED_ADMIN_EMAIL = "abdo12uk@gmail.com";

  const checkUserRoleAndRedirect = async (userId: string, email?: string) => {
    // Check if it's the hardcoded admin email
    if (email === ALLOWED_ADMIN_EMAIL) {
      navigate("/admin");
      return;
    }

    // Check database role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleData) {
      navigate("/admin");
    } else {
      navigate("/profile");
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        checkUserRoleAndRedirect(session.user.id, session.user.email);
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;

        toast({ title: isRTL ? "تم تسجيل الدخول بنجاح" : "Logged in successfully" });
        if (data.user) {
          checkUserRoleAndRedirect(data.user.id, data.user.email);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: formData.fullName,
              phone: formData.phone,
            },
          },
        });
        if (error) throw error;

        if (data.user) {
          try {
            await supabase.functions.invoke('send-welcome-email', {
              body: {
                email: formData.email,
                fullName: formData.fullName || formData.email.split('@')[0],
                language: language,
              },
            });
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
          }
        }

        toast({
          title: isRTL ? "تم إنشاء الحساب بنجاح" : "Account created successfully",
          description: isRTL ? "تم إرسال بريد ترحيبي إليك" : "A welcome email has been sent to you",
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message || (isRTL ? "حدث خطأ ما" : "An error occurred"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message || (isRTL ? "فشل تسجيل الدخول بجوجل" : "Google login failed"),
      });
      setGoogleLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col md:flex-row">
      {/* Cinematic Visual Side */}
      <div className="hidden md:flex md:w-1/2 relative bg-black border-e border-white/5 p-20 flex-col justify-between overflow-hidden">
        {/* Background Depth */}
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=2070" 
            alt="Luxury Car Interior" 
            className="w-full h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-6 group">
            <div className="w-12 h-12 flex items-center justify-center border border-white/10 group-hover:border-primary transition-all duration-700">
              <ArrowLeft className={`h-4 w-4 text-white/40 group-hover:text-primary transition-all duration-700 ${isRTL ? 'rotate-180' : ''}`} />
            </div>
            <span className="text-[11px] uppercase tracking-[0.5em] text-white/40 group-hover:text-white transition-all duration-700">
              {isRTL ? "العودة للرئيسية" : "Home"}
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          >
            <span className="text-[11px] uppercase tracking-[0.6em] text-primary font-bold mb-8 block">
              {isRTL ? "مؤسسة جبراني" : "Jabrani Atelier"}
            </span>
            <h2 className="text-5xl md:text-7xl text-hero text-white mb-12">
              {isRTL ? (
                <>
                  أفق جديد <br />
                  <span className="font-bold">من السيادة</span>
                </>
              ) : (
                <>
                  New Horizon <br />
                  <span className="font-bold text-primary">of Sovereignty</span>
                </>
              )}
            </h2>
            <p className="text-white/40 text-lg leading-relaxed uppercase tracking-widest">
              {isRTL
                ? "انقر لفتح بوابة التميز في عالم السيارات الفاخرة."
                : "Entry point to the world's most curated automotive collection."}
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-8 pt-20 border-t border-white/5">
          {[
            { label: isRTL ? "تميز" : "Excellence", val: "01" },
            { label: isRTL ? "ثقة" : "Trust", val: "02" },
            { label: isRTL ? "سيادة" : "Sovereignty", val: "03" }
          ].map((item, i) => (
            <div key={i} className="space-y-4">
              <span className="text-[10px] text-primary font-bold tracking-[0.4em]">{item.val}</span>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.4em]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sovereign Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-24 bg-black relative">
        <div className="w-full max-w-sm">
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-light text-white tracking-tighter uppercase mb-4">
              {isLogin ? (isRTL ? "دخول المستشار" : "Consultant Login") : (isRTL ? "تأسيس هوية" : "Establish Identity")}
            </h1>
            <div className="w-12 h-[2px] bg-primary mb-8" />
            <p className="text-white/30 text-[11px] uppercase tracking-[0.4em]">
              {isLogin ? (isRTL ? "أدحل بيانات الوصول الخاصة بك" : "Enter access credentials") : (isRTL ? "سجل هويتك للوصول الكامل" : "Register identity for full access")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {!isLogin && (
              <div className="space-y-8">
                <div className="relative group">
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder={isRTL ? "الاسم الكامل" : "FULL NAME"}
                    required={!isLogin}
                    className="h-14 bg-transparent border-0 border-b border-white/10 rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all uppercase text-[11px] tracking-[0.3em] text-white placeholder:text-white/10 px-0"
                  />
                </div>
                <div className="relative group">
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={isRTL ? "رقم الجوال" : "PHONE"}
                    className="h-14 bg-transparent border-0 border-b border-white/10 rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all uppercase text-[11px] tracking-[0.3em] text-white placeholder:text-white/10 px-0"
                  />
                </div>
              </div>
            )}

            <div className="space-y-8">
              <div className="relative group">
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={isRTL ? "البريد الإلكتروني" : "SIGNATURE EMAIL"}
                  required
                  className="h-14 bg-transparent border-0 border-b border-white/10 rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all uppercase text-[11px] tracking-[0.3em] text-white placeholder:text-white/10 px-0"
                />
              </div>

              <div className="relative group">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isRTL ? "كلمة المرور" : "ACCESS KEY"}
                  required
                  minLength={6}
                  className="h-14 bg-transparent border-0 border-b border-white/10 rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all uppercase text-[11px] tracking-[0.3em] text-white placeholder:text-white/10 px-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full h-16 bg-white text-black text-[11px] uppercase tracking-[0.6em] font-bold overflow-hidden transition-all duration-700 hover:tracking-[0.8em]"
              >
                <span className="relative z-10">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto text-black" /> : (isLogin ? t.auth.login : t.auth.signup)}
                </span>
                <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full h-16 border border-white/10 text-white/40 text-[10px] uppercase tracking-[0.5em] hover:text-white hover:border-white transition-all duration-500"
              >
                {googleLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (isRTL ? "المتابعة عبر جوجل" : "Continue with Google")}
              </button>
            </div>
          </form>

          <div className="mt-16 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] uppercase tracking-[0.4em] text-white/20 hover:text-primary transition-all duration-500"
            >
              {isLogin ? (isRTL ? "ليس لديك حساب؟ تأسيس الآن" : "No Account? Establish One") : (isRTL ? "لديك حساب؟ دخول" : "Has Identity? Entry")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
