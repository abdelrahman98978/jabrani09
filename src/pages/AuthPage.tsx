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
    <div className="min-h-screen bg-background relative overflow-hidden font-cairo flex flex-col md:flex-row">
      {/* Visual Side (Left on LTR, Right on RTL) */}
      <div className="hidden md:flex md:w-1/2 bg-primary/5 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 group mb-12">
            <div className="bg-background rounded-full p-2 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
            </div>
            <span className="font-bold text-foreground group-hover:text-primary transition-colors">{isRTL ? "العودة للرئيسية" : "Back to Home"}</span>
          </Link>

          <h2 className="text-4xl font-black text-foreground mb-6 leading-tight">
            {isRTL ? "تجربة شراء سيارات" : "Car Buying Experience"} <br />
            <span className="text-primary">{isRTL ? "فاخرة وموثوقة" : "Luxury & Reliable"}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-md">
            {isRTL
              ? "انضم إلينا اليوم للحصول على أفضل العروض والخدمات الحصرية في عالم السيارات."
              : "Join us today to get the best offers and exclusive services in the automotive world."}
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4 bg-background/60 backdrop-blur-sm p-4 rounded-2xl border border-border/50">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">{isRTL ? "عروض حصرية" : "Exclusive Offers"}</h4>
              <p className="text-xs text-muted-foreground">{isRTL ? "خصومات خاصة للأعضاء المسجلين" : "Special discounts for registered members"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-background/60 backdrop-blur-sm p-4 rounded-2xl border border-border/50">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">{isRTL ? "أحدث الموديلات" : "Latest Models"}</h4>
              <p className="text-xs text-muted-foreground">{isRTL ? "تصفح أحدث السيارات فور وصولها" : "Browse the newest cars as they arrive"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-background/60 backdrop-blur-sm p-4 rounded-2xl border border-border/50">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">{isRTL ? "ضمان شامل" : "Comprehensive Warranty"}</h4>
              <p className="text-xs text-muted-foreground">{isRTL ? "جميع سياراتنا مضمونة ومفحوصة" : "All our cars are guaranteed and inspected"}</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-2 pt-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-1 flex-1 bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-full animate-progress origin-left" style={{ animationDelay: `${i * 0.5}s`, animationDuration: '3s' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <div className="absolute top-6 right-6 md:hidden">
          <Link
            to="/"
            className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300"
          >
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
              <ArrowLeft className={`h-4 w-4 ${isRTL ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
            </div>
            <span className="font-bold text-sm">{isRTL ? "العودة" : "Back"}</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative group cursor-pointer" onClick={() => navigate('/')}>
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <img
                  src={alJabraniLogo}
                  alt="SUDEX GROUP"
                  className="relative h-20 w-20 rounded-2xl object-cover shadow-2xl transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground mb-2">
              {isLogin ? (isRTL ? "تسجيل الدخول" : "Sign In") : (isRTL ? "إنشاء حساب" : "Create Account")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin ? (isRTL ? "مرحباً بعودتك! الرجاء إدخال بياناتك" : "Welcome back! Please enter your details") : (isRTL ? "أدخل بياناتك للتسجيل معنا مجاناً" : "Enter your details to sign up for free")}
            </p>
          </div>

          <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
              {/* Google Auth */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 gap-3 text-sm font-bold border hover:bg-secondary/50 transition-all"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Chrome className="h-5 w-5" />
                    {t.auth.loginWithGoogle}
                  </>
                )}
              </Button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">{isRTL ? "أو المتابعة عبر" : "Or continue with"}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground">
                        {t.auth.fullName}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder={isRTL ? "الاسم الكامل" : "John Doe"}
                          required={!isLogin}
                          className="pl-9 h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground">
                        {t.auth.phone}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+966"
                          dir="ltr"
                          className="pl-9 h-11 text-left"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">
                    {t.auth.email}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      required
                      dir="ltr"
                      className="pl-9 h-11 text-left"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-foreground">
                      {t.auth.password}
                    </label>
                    {isLogin && (
                      <Link to="#" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                        {isRTL ? "نسيت كلمة المرور؟" : "Forgot Password?"}
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="pl-9 pr-10 h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="text-xs text-muted-foreground flex gap-2 items-start">
                    <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                    <span>
                      {isRTL
                        ? "بإنشاء حساب فإنك توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا."
                        : "By creating an account, you agree to our Terms of Service and Privacy Policy."}
                    </span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-sm font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    isLogin ? t.auth.login : t.auth.signup
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center text-sm">
                <span className="text-muted-foreground">
                  {isLogin ? t.auth.noAccount : t.auth.hasAccount}{" "}
                </span>
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-bold text-primary hover:underline transition-all"
                >
                  {isLogin ? (isRTL ? "سجل الآن" : "Sign up") : (isRTL ? "سجل الدخول" : "Login")}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
