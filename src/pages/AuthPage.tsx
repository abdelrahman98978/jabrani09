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
  Zap
} from "lucide-react";
import alJabraniLogo from "@/assets/al-jabrani-logo.jpg";
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/admin");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/admin");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        toast({ title: isRTL ? "تم تسجيل الدخول بنجاح" : "Logged in successfully" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/profile`,
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
          redirectTo: `${window.location.origin}/admin`,
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
    <div className="min-h-screen bg-background relative overflow-hidden font-cairo">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute inset-0 pattern-overlay opacity-20" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <div className="p-6 flex justify-between items-center">
          <Link
            to="/"
            className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300"
          >
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
              <ArrowLeft className={`h-5 w-5 transition-transform duration-300 ${isRTL ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
            </div>
            <span className="font-bold">{isRTL ? "العودة للرئيسية" : "Back to Home"}</span>
          </Link>
          <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-primary" /> SECURE</span>
            <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-primary" /> FAST</span>
          </div>
        </div>

        {/* Auth Container */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-xl">
            <div className="text-center mb-8 stagger-fade-in">
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <img
                    src={alJabraniLogo}
                    alt="AL JABRANI CARS"
                    className="relative h-24 w-24 rounded-2xl object-cover shadow-2xl transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1.5 shadow-lg">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                </div>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-foreground mb-3 text-gradient-gold">
                {isLogin ? t.auth.login : t.auth.signup}
              </h1>
              <p className="text-muted-foreground max-w-xs mx-auto text-sm leading-relaxed">
                {isLogin ? (isRTL ? "أهلاً بك مجدداً في الجبراني للسيارات" : "Welcome back to Al Jabrani Cars") : (isRTL ? "انضم إلينا للحصول على عروض حصرية" : "Join us for exclusive showroom offers")}
              </p>
            </div>

            <Card className="border-border/40 shadow-2xl backdrop-blur-md bg-card/80 overflow-hidden car-card">
              <CardContent className="p-8">
                {/* Google Auth */}
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full gap-3 h-14 text-base font-bold border-2 hover:border-primary hover:bg-primary/5 transition-all duration-500 group"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Chrome className="h-6 w-6 transition-transform group-hover:rotate-12" />
                      {t.auth.loginWithGoogle}
                    </>
                  )}
                </Button>

                {/* Separator */}
                <div className="relative my-10">
                  <Separator className="bg-border/60" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm px-6 text-xs text-muted-foreground font-black uppercase tracking-widest">
                    {isRTL ? "أو" : "OR"}
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {!isLogin && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <User className="h-3 w-3 text-primary" />
                          {t.auth.fullName}
                        </label>
                        <Input
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder={isRTL ? "الاسم الكامل" : "Full Name"}
                          required={!isLogin}
                          className="h-12 bg-background/50 border-2 focus:border-primary transition-all duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <Phone className="h-3 w-3 text-primary" />
                          {t.auth.phone}
                        </label>
                        <Input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+966"
                          dir="ltr"
                          className="h-12 bg-background/50 border-2 focus:border-primary transition-all duration-300"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Mail className="h-3 w-3 text-primary" />
                      {t.auth.email}
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      required
                      dir="ltr"
                      className="h-12 bg-background/50 border-2 focus:border-primary transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Lock className="h-3 w-3 text-primary" />
                        {t.auth.password}
                      </label>
                      {isLogin && (
                        <button type="button" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter">
                          {isRTL ? "نسيت؟" : "Forgot?"}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="h-12 bg-background/50 border-2 focus:border-primary transition-all duration-300 pe-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    className="w-full h-14 text-lg font-black shadow-xl hover:shadow-primary/20 hover:-translate-y-1 bg-gradient-to-r from-primary to-accent transition-all duration-300 active:scale-95 group"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        {isLogin ? t.auth.login : t.auth.signup}
                        <Zap className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    )}
                  </Button>
                </form>

                <div className="mt-10 pt-6 border-t border-border/40 text-center">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {isLogin ? t.auth.noAccount : t.auth.hasAccount}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-foreground font-black text-lg hover:text-primary transition-colors relative group"
                  >
                    {isLogin ? (isRTL ? "إنشاء حساب جديد" : "Create Now") : (isRTL ? "تسجيل الدخول" : "Sign In")}
                    <span className="absolute -bottom-1 left-0 w-0 h-1 bg-primary transition-all duration-300 group-hover:w-full" />
                  </button>
                </div>
              </CardContent>
            </Card>

            <p className="text-[10px] text-muted-foreground/50 text-center mt-8 uppercase tracking-[0.2em]">
              {isRTL ? "جميع الحقوق محفوظة © الجبراني للسيارات" : "All rights reserved © Al Jabrani Cars"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
