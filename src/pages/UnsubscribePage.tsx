import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, CheckCircle2, XCircle, Loader2, ArrowLeft, MailX } from "lucide-react";

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const [status, setStatus] = useState<"loading" | "success" | "error" | "already" | "not_found">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (email) {
      handleUnsubscribe();
    } else {
      setStatus("error");
      setMessage(isRTL ? "البريد الإلكتروني غير موجود في الرابط" : "Email not found in the link");
    }
  }, [email]);

  const handleUnsubscribe = async () => {
    if (!email) return;

    try {
      // Check if subscriber exists
      const { data: subscriber, error: fetchError } = await supabase
        .from("newsletter_subscribers")
        .select("id, is_active")
        .eq("email", email)
        .single();

      if (fetchError || !subscriber) {
        setStatus("not_found");
        setMessage(isRTL ? "البريد الإلكتروني غير مسجل في قائمتنا البريدية" : "Email not found in our mailing list");
        return;
      }

      if (!subscriber.is_active) {
        setStatus("already");
        setMessage(isRTL ? "لقد تم إلغاء اشتراكك مسبقاً" : "You have already unsubscribed");
        return;
      }

      // Update subscriber status
      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({ is_active: false })
        .eq("email", email);

      if (updateError) throw updateError;

      setStatus("success");
      setMessage(isRTL ? "تم إلغاء اشتراكك بنجاح. لن تتلقى المزيد من رسائلنا البريدية." : "You have been successfully unsubscribed. You will no longer receive our emails.");
    } catch (error: any) {
      console.error("Unsubscribe error:", error);
      setStatus("error");
      setMessage(isRTL ? "حدث خطأ أثناء إلغاء الاشتراك. يرجى المحاولة مرة أخرى." : "An error occurred while unsubscribing. Please try again.");
    }
  };

  const getIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="w-16 h-16 text-primary animate-spin" />;
      case "success":
        return <CheckCircle2 className="w-16 h-16 text-green-500" />;
      case "already":
        return <MailX className="w-16 h-16 text-amber-500" />;
      case "not_found":
        return <XCircle className="w-16 h-16 text-muted-foreground" />;
      case "error":
        return <XCircle className="w-16 h-16 text-destructive" />;
      default:
        return <Mail className="w-16 h-16 text-primary" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case "loading":
        return isRTL ? "جاري إلغاء الاشتراك..." : "Unsubscribing...";
      case "success":
        return isRTL ? "تم إلغاء الاشتراك بنجاح" : "Successfully Unsubscribed";
      case "already":
        return isRTL ? "تم إلغاء الاشتراك مسبقاً" : "Already Unsubscribed";
      case "not_found":
        return isRTL ? "البريد غير موجود" : "Email Not Found";
      case "error":
        return isRTL ? "حدث خطأ" : "Error Occurred";
      default:
        return isRTL ? "إلغاء الاشتراك" : "Unsubscribe";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4" dir={isRTL ? "rtl" : "ltr"}>
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
          <CardDescription className="text-base mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {email && (
            <div className="text-center p-3 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground mb-1">
                {isRTL ? "البريد الإلكتروني" : "Email Address"}
              </p>
              <p className="font-medium">{email}</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-muted-foreground">
                {isRTL 
                  ? "نأسف لرؤيتك تذهب! إذا غيرت رأيك، يمكنك دائماً الاشتراك مرة أخرى من موقعنا."
                  : "We're sorry to see you go! If you change your mind, you can always subscribe again from our website."}
              </p>
            </div>
          )}

          {status === "error" && (
            <Button onClick={handleUnsubscribe} className="w-full gap-2">
              <Mail className="w-4 h-4" />
              {isRTL ? "إعادة المحاولة" : "Try Again"}
            </Button>
          )}

          <Link to="/">
            <Button variant="outline" className="w-full gap-2 mt-4">
              <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
              {isRTL ? "العودة للصفحة الرئيسية" : "Back to Home"}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnsubscribePage;
