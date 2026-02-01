import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, Chrome, Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft, Sparkles } from "lucide-react";
import alJabraniLogo from "@/assets/al-jabrani-logo.jpg";
import { Separator } from "@/components/ui/separator";

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
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
        toast({ title: language === "ar" ? "تم تسجيل الدخول بنجاح" : "Logged in successfully" });
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
        
        // Send welcome email
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
          title: language === "ar" ? "تم إنشاء الحساب بنجاح" : "Account created successfully",
          description: language === "ar" ? "تم إرسال بريد ترحيبي إليك" : "A welcome email has been sent to you",
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message || (language === "ar" ? "حدث خطأ ما" : "An error occurred"),
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
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message || (language === "ar" ? "فشل تسجيل الدخول بجوجل" : "Google login failed"),
      });
      setGoogleLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pattern-overlay opacity-30" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{language === "ar" ? "العودة للرئيسية" : "Back to Home"}</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <Card className="border-border/50 shadow-premium-lg backdrop-blur-sm bg-card/95">
              <CardHeader className="text-center pb-2">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <img 
                      src={alJabraniLogo} 
                      alt="AL JABRANI CARS" 
                      className="h-20 w-20 rounded-2xl object-cover shadow-premium"
                    />
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-black text-foreground mb-2">
                  {isLogin ? t.auth.login : t.auth.signup}
                </h1>
                <p className="text-muted-foreground">
                  {isLogin ? t.auth.dashboardAccess : t.auth.createAccount}
                </p>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Google Login */}
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full gap-3 h-14 text-base border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Chrome className="h-6 w-6" />
                      {t.auth.loginWithGoogle}
                    </>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-8">
                  <Separator className="bg-border" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-sm text-muted-foreground font-medium">
                    {language === "ar" ? "أو بالبريد الإلكتروني" : "or with email"}
                  </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          {t.auth.fullName}
                        </label>
                        <Input
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder={language === "ar" ? "أدخل اسمك الكامل" : "Enter your full name"}
                          required={!isLogin}
                          className="h-12 text-base border-2 focus:border-primary transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary" />
                          {t.auth.phone}
                        </label>
                        <Input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+966 5XX XXX XXXX"
                          dir="ltr"
                          className="h-12 text-base border-2 focus:border-primary transition-colors"
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      {t.auth.email}
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                      required
                      dir="ltr"
                      className="h-12 text-base border-2 focus:border-primary transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      {t.auth.password}
                    </label>
                    <div className="relative">
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={language === "ar" ? "أدخل كلمة المرور" : "Enter password"}
                        required
                        minLength={6}
                        className="h-12 text-base border-2 focus:border-primary transition-colors pe-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {isLogin && (
                    <div className="text-end">
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        {language === "ar" ? "نسيت كلمة المرور؟" : "Forgot password?"}
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    className="w-full h-14 text-lg font-bold shadow-premium hover:shadow-premium-lg transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isLogin ? (
                      t.auth.login
                    ) : (
                      t.auth.signup
                    )}
                  </Button>
                </form>

                {/* Toggle Form */}
                <div className="mt-8 text-center">
                  <p className="text-muted-foreground">
                    {isLogin ? t.auth.noAccount : t.auth.hasAccount}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary hover:underline font-bold text-lg mt-1"
                  >
                    {isLogin
                      ? language === "ar"
                        ? "إنشاء حساب جديد"
                        : "Create new account"
                      : language === "ar"
                      ? "تسجيل الدخول"
                      : "Sign in"}
                  </button>
                </div>

                {/* Terms */}
                <p className="text-xs text-muted-foreground text-center mt-6">
                  {language === "ar"
                    ? "بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية"
                    : "By continuing, you agree to our Terms of Use and Privacy Policy"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
