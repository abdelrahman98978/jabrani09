import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { 
  Sparkles, Loader2, Send, Copy, RefreshCw, TrendingUp, Users, 
  MessageSquare, Target, Lightbulb, Megaphone, PenTool, Zap,
  CheckCircle, BarChart3, Mail, Phone, MessageCircle, ImageIcon
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import BannerGeneratorDialog from "./BannerGeneratorDialog";

const MarketingAI = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { data: settings } = useSettings();

  const showroomName = isRTL 
    ? (settings?.showroom_name || "معرض الجبراني للسيارات") 
    : (settings?.showroom_name_en || "Al-Jibrani Car Showroom");

  const [activeTab, setActiveTab] = useState("content");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [showBannerDialog, setShowBannerDialog] = useState(false);

  // Content Generation State
  const [contentType, setContentType] = useState("social_post");
  const [contentTopic, setContentTopic] = useState("");
  const [contentTone, setContentTone] = useState("professional");

  // Campaign State
  const [campaignGoal, setCampaignGoal] = useState("awareness");
  const [campaignBudget, setCampaignBudget] = useState("");
  const [campaignDuration, setCampaignDuration] = useState("1_week");

  // SMS State
  const [smsMessage, setSmsMessage] = useState("");
  const [smsTarget, setSmsTarget] = useState("all");

  // Quick email send state
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [showCustomersDialog, setShowCustomersDialog] = useState(false);
  
  // Fetch customers with phone numbers
  const { data: customers } = useQuery({
    queryKey: ["customers-with-phones"],
    queryFn: async () => {
      const { data } = await supabase
        .from("customers")
        .select("id, name, phone, whatsapp")
        .order("name");
      return data || [];
    },
  });
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["marketing-stats"],
    queryFn: async () => {
      const [customersResult, messagesResult, ordersResult, campaignsResult] = await Promise.all([
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("email_campaigns").select("id", { count: "exact", head: true }),
      ]);
      return {
        customers: customersResult.count || 0,
        messages: messagesResult.count || 0,
        orders: ordersResult.count || 0,
        campaigns: campaignsResult.count || 0,
      };
    },
  });

  const generateContent = async () => {
    if (!contentTopic.trim()) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى إدخال موضوع المحتوى" : "Please enter the content topic",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");

    try {
      const contentTypeLabels: Record<string, string> = {
        social_post: isRTL ? "منشور وسائل التواصل" : "Social Media Post",
        ad_copy: isRTL ? "نص إعلاني" : "Ad Copy",
        email_subject: isRTL ? "عنوان بريد إلكتروني" : "Email Subject Lines",
        product_description: isRTL ? "وصف منتج" : "Product Description",
        sms_message: isRTL ? "رسالة SMS" : "SMS Message",
        blog_intro: isRTL ? "مقدمة مقال" : "Blog Introduction",
      };

      const toneLabels: Record<string, string> = {
        professional: isRTL ? "احترافي" : "Professional",
        friendly: isRTL ? "ودي" : "Friendly",
        urgent: isRTL ? "عاجل" : "Urgent",
        luxury: isRTL ? "فاخر" : "Luxury",
        casual: isRTL ? "عفوي" : "Casual",
      };

      const prompt = isRTL
        ? `أنت خبير تسويق لـ "${showroomName}". أنشئ ${contentTypeLabels[contentType]} بأسلوب ${toneLabels[contentTone]} عن: ${contentTopic}

المتطلبات:
- المحتوى باللغة العربية
- مناسب للسوق السعودي
- يتضمن دعوة للعمل
- جذاب ومقنع
- اذكر اسم المعرض "${showroomName}" في المحتوى
- إذا كان منشور سوشيال ميديا أضف هاشتاقات مناسبة
- إذا كان SMS اجعله قصيراً (160 حرف كحد أقصى)

أنشئ 3 خيارات مختلفة.`
        : `You are a marketing expert for "${showroomName}". Create ${contentTypeLabels[contentType]} in ${toneLabels[contentTone]} tone about: ${contentTopic}

Requirements:
- Content in English
- Suitable for Saudi market
- Include call-to-action
- Engaging and persuasive
- Mention the showroom name "${showroomName}" in the content
- If social post, add relevant hashtags
- If SMS, keep it short (max 160 characters)

Generate 3 different options.`;

      const { data, error } = await supabase.functions.invoke("generate-email-content", {
        body: {
          campaignType: "custom",
          targetAudience: "all",
          language: isRTL ? "ar" : "en",
          customPrompt: prompt,
        },
      });

      if (error) throw error;

      const content =
        data?.data?.content ||
        (typeof data?.data === "string" ? data.data : "") ||
        (typeof data === "string" ? data : "");

      setGeneratedContent(content);
      
      toast({
        title: isRTL ? "تم التوليد بنجاح" : "Content generated",
        description: isRTL ? "تم إنشاء المحتوى بنجاح" : "Content has been generated successfully",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل توليد المحتوى" : "Failed to generate content",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCampaignStrategy = async () => {
    setIsGenerating(true);
    setGeneratedContent("");

    try {
      const goalLabels: Record<string, string> = {
        awareness: isRTL ? "زيادة الوعي بالعلامة" : "Brand Awareness",
        leads: isRTL ? "جذب عملاء محتملين" : "Lead Generation",
        sales: isRTL ? "زيادة المبيعات" : "Increase Sales",
        retention: isRTL ? "الاحتفاظ بالعملاء" : "Customer Retention",
      };

      const prompt = isRTL
        ? `أنت خبير تسويق رقمي لـ "${showroomName}". أنشئ استراتيجية حملة تسويقية:

الهدف: ${goalLabels[campaignGoal]}
الميزانية: ${campaignBudget || "غير محددة"}
المدة: ${campaignDuration === "1_week" ? "أسبوع" : campaignDuration === "2_weeks" ? "أسبوعين" : "شهر"}
اسم المعرض: ${showroomName}

قدم:
1. استراتيجية القنوات (سوشيال ميديا، إعلانات، SMS، إيميل)
2. الجمهور المستهدف
3. الرسائل الرئيسية (تتضمن اسم المعرض)
4. جدول النشر المقترح
5. مؤشرات الأداء الرئيسية (KPIs)
6. أفكار للمحتوى

كن محدداً وعملياً.`
        : `You are a digital marketing expert for "${showroomName}". Create a marketing campaign strategy:

Goal: ${goalLabels[campaignGoal]}
Budget: ${campaignBudget || "Not specified"}
Duration: ${campaignDuration === "1_week" ? "1 week" : campaignDuration === "2_weeks" ? "2 weeks" : "1 month"}
Showroom Name: ${showroomName}

Provide:
1. Channel strategy (social media, ads, SMS, email)
2. Target audience
3. Key messages (include the showroom name)
4. Suggested posting schedule
5. Key Performance Indicators (KPIs)
6. Content ideas

Be specific and practical.`;

      const { data, error } = await supabase.functions.invoke("generate-email-content", {
        body: {
          campaignType: "custom",
          targetAudience: "all",
          language: isRTL ? "ar" : "en",
          customPrompt: prompt,
        },
      });

      if (error) throw error;

      const content =
        data?.data?.content ||
        (typeof data?.data === "string" ? data.data : "") ||
        (typeof data === "string" ? data : "");

      setGeneratedContent(content);
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل توليد الاستراتيجية" : "Failed to generate strategy",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSMSFromAI = async () => {
    setIsGenerating(true);

    try {
      const targetLabels: Record<string, string> = {
        all: isRTL ? "جميع العملاء" : "All customers",
        new: isRTL ? "العملاء الجدد" : "New customers",
        vip: isRTL ? "عملاء VIP" : "VIP customers",
      };

      const prompt = isRTL
        ? `أنشئ 5 رسائل SMS تسويقية قصيرة (أقل من 160 حرف) لـ "${showroomName}".
الجمهور: ${targetLabels[smsTarget]}
يجب أن تتضمن كل رسالة:
- اسم المعرض "${showroomName}"
- عرض جذاب
- دعوة للعمل
- شعور بالعاجلية`
        : `Create 5 short marketing SMS messages (under 160 characters) for "${showroomName}".
Audience: ${targetLabels[smsTarget]}
Each message should include:
- Showroom name "${showroomName}"
- Attractive offer
- Call-to-action
- Sense of urgency`;

      const { data, error } = await supabase.functions.invoke("generate-email-content", {
        body: {
          campaignType: "custom",
          targetAudience: smsTarget,
          language: isRTL ? "ar" : "en",
          customPrompt: prompt,
        },
      });

      if (error) throw error;

      const content =
        data?.data?.content ||
        (typeof data?.data === "string" ? data.data : "") ||
        (typeof data === "string" ? data : "");

      setSmsMessage(content);
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل توليد الرسالة" : "Failed to generate message",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: isRTL ? "تم النسخ" : "Copied",
      description: isRTL ? "تم نسخ المحتوى" : "Content copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.customers || 0}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? "عميل" : "Customers"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.messages || 0}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? "رسالة" : "Messages"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.orders || 0}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? "طلب" : "Orders"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.campaigns || 0}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? "حملة" : "Campaigns"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="gap-2">
            <PenTool className="h-4 w-4" />
            {isRTL ? "توليد المحتوى" : "Content Generation"}
          </TabsTrigger>
          <TabsTrigger value="banner" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            {isRTL ? "توليد البانر" : "Banner Generation"}
          </TabsTrigger>
          <TabsTrigger value="campaign" className="gap-2">
            <Megaphone className="h-4 w-4" />
            {isRTL ? "استراتيجية الحملات" : "Campaign Strategy"}
          </TabsTrigger>
          <TabsTrigger value="sms" className="gap-2">
            <Zap className="h-4 w-4" />
            {isRTL ? "رسائل SMS" : "SMS Messages"}
          </TabsTrigger>
        </TabsList>

        {/* Banner Generation Tab */}
        <TabsContent value="banner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                {isRTL ? "توليد بانرات بالذكاء الاصطناعي" : "AI Banner Generation"}
              </CardTitle>
              <CardDescription>
                {isRTL 
                  ? "أنشئ بانرات تسويقية احترافية واستخدمها في الصفحة الرئيسية" 
                  : "Create professional marketing banners and use them on the homepage"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {isRTL ? "ميزات التوليد" : "Generation Features"}
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {isRTL ? "أنماط متعددة: فاخر، عصري، كلاسيكي، رياضي" : "Multiple styles: Luxury, Modern, Classic, Sporty"}</li>
                  <li>• {isRTL ? "أحجام مختلفة: مربع، عريض، طويل" : "Different sizes: Square, Wide, Tall"}</li>
                  <li>• {isRTL ? "إمكانية استخدام البانر مباشرة كصورة هيرو" : "Option to use banner directly as hero image"}</li>
                  <li>• {isRTL ? "تحميل البانر للاستخدام في أي مكان" : "Download banner for use anywhere"}</li>
                </ul>
              </div>

              <Button 
                onClick={() => setShowBannerDialog(true)} 
                variant="gold"
                className="w-full gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {isRTL ? "فتح مولد البانرات" : "Open Banner Generator"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Generation Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {isRTL ? "توليد المحتوى بالذكاء الاصطناعي" : "AI Content Generation"}
              </CardTitle>
              <CardDescription>
                {isRTL 
                  ? "أنشئ محتوى تسويقي احترافي بضغطة زر" 
                  : "Generate professional marketing content with one click"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "نوع المحتوى" : "Content Type"}</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social_post">{isRTL ? "منشور سوشيال ميديا" : "Social Media Post"}</SelectItem>
                      <SelectItem value="ad_copy">{isRTL ? "نص إعلاني" : "Ad Copy"}</SelectItem>
                      <SelectItem value="email_subject">{isRTL ? "عناوين بريد إلكتروني" : "Email Subject Lines"}</SelectItem>
                      <SelectItem value="product_description">{isRTL ? "وصف منتج/سيارة" : "Product Description"}</SelectItem>
                      <SelectItem value="sms_message">{isRTL ? "رسالة SMS" : "SMS Message"}</SelectItem>
                      <SelectItem value="blog_intro">{isRTL ? "مقدمة مقال" : "Blog Introduction"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? "نبرة المحتوى" : "Content Tone"}</Label>
                  <Select value={contentTone} onValueChange={setContentTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">{isRTL ? "احترافي" : "Professional"}</SelectItem>
                      <SelectItem value="friendly">{isRTL ? "ودي" : "Friendly"}</SelectItem>
                      <SelectItem value="urgent">{isRTL ? "عاجل" : "Urgent"}</SelectItem>
                      <SelectItem value="luxury">{isRTL ? "فاخر" : "Luxury"}</SelectItem>
                      <SelectItem value="casual">{isRTL ? "عفوي" : "Casual"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "موضوع المحتوى" : "Content Topic"}</Label>
                <Input
                  value={contentTopic}
                  onChange={(e) => setContentTopic(e.target.value)}
                  placeholder={isRTL ? "مثال: عرض خاص على سيارات BMW..." : "Example: Special offer on BMW cars..."}
                />
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <Button onClick={generateContent} disabled={isGenerating} className="gap-2">
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isGenerating
                    ? (isRTL ? "جاري التوليد..." : "Generating...")
                    : (isRTL ? "توليد المحتوى" : "Generate Content")}
                </Button>

                {generatedContent && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        const firstLine = generatedContent.split(/\n|\./)[0].slice(0, 80).trim();
                        const content = generatedContent.trim();
                        window.dispatchEvent(
                          new CustomEvent("admin-use-ai-email", {
                            detail: {
                              language,
                              subject: firstLine,
                              content,
                            },
                          })
                        );
                      }}
                    >
                      <Mail className="h-4 w-4" />
                      {isRTL ? "استخدام في حملة بريد" : "Use in email campaign"}
                    </Button>

                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder={
                          isRTL
                            ? "بريد لاختبار الرسالة"
                            : "Email for test send"
                        }
                        className="w-48"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={!testEmail || isSendingTest}
                        onClick={async () => {
                          if (!generatedContent.trim()) return;
                          try {
                            setIsSendingTest(true);
                            const subject = generatedContent
                              .split(/\n|\./)[0]
                              .slice(0, 80)
                              .trim();

                            const { data: campaign, error } = await supabase
                              .from("email_campaigns")
                              .insert({
                                name: contentTopic || subject,
                                name_ar: contentTopic || subject,
                                subject: language === "ar" ? undefined : subject,
                                subject_ar: language === "ar" ? subject : undefined,
                                content: language === "ar" ? undefined : generatedContent,
                                content_ar: language === "ar" ? generatedContent : undefined,
                                target_audience: "all",
                                status: "draft",
                              })
                              .select("*")
                              .single();

                            if (error || !campaign) throw error || new Error("No campaign created");

                            const { data: sendResult, error: sendError } =
                              await supabase.functions.invoke("send-campaign-email", {
                                body: {
                                  campaignId: campaign.id,
                                  testEmail,
                                },
                              });

                            if (sendError) throw sendError;

                            if (sendResult && !sendResult.success) {
                              throw new Error(
                                (sendResult as any).error ||
                                  (isRTL ? "تعذر إرسال البريد التجريبي" : "Failed to send test email")
                              );
                            }

                            toast({
                              title: isRTL ? "تم إرسال البريد التجريبي" : "Test email sent",
                              description:
                                isRTL
                                  ? "تم إرسال البريد إلى البريد الذي أدخلته"
                                  : "Email sent to the test address you provided",
                            });
                          } catch (error) {
                            console.error("Error sending test email:", error);
                            toast({
                              variant: "destructive",
                              title: isRTL ? "فشل الإرسال" : "Send failed",
                              description:
                                isRTL
                                  ? "تعذر إرسال البريد التجريبي"
                                  : "Could not send test email",
                            });
                          } finally {
                            setIsSendingTest(false);
                          }
                        }}
                      >
                        {isSendingTest ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        {isRTL ? "إرسال تجريبي" : "Send test"}
                      </Button>

                      <Button
                        size="sm"
                        className="gap-2"
                        disabled={isSendingCampaign}
                        onClick={async () => {
                          if (!generatedContent.trim()) return;
                          try {
                            setIsSendingCampaign(true);
                            const subject = generatedContent
                              .split(/\n|\./)[0]
                              .slice(0, 80)
                              .trim();

                            const { data: campaign, error } = await supabase
                              .from("email_campaigns")
                              .insert({
                                name: contentTopic || subject,
                                name_ar: contentTopic || subject,
                                subject: language === "ar" ? undefined : subject,
                                subject_ar: language === "ar" ? subject : undefined,
                                content: language === "ar" ? undefined : generatedContent,
                                content_ar: language === "ar" ? generatedContent : undefined,
                                target_audience: "all",
                                status: "draft",
                              })
                              .select("*")
                              .single();

                            if (error || !campaign) throw error || new Error("No campaign created");

                            const { data: sendResult, error: sendError } =
                              await supabase.functions.invoke("send-campaign-email", {
                                body: {
                                  campaignId: campaign.id,
                                },
                              });

                            if (sendError) throw sendError;

                            if (sendResult && !sendResult.success) {
                              throw new Error(
                                (sendResult as any).error ||
                                  (isRTL ? "تعذر إرسال الحملة" : "Failed to send campaign")
                              );
                            }

                            toast({
                              title: isRTL ? "تم إرسال البريد للمشتركين" : "Campaign sent",
                              description:
                                isRTL
                                  ? "تم إرسال البريد إلى جميع المشتركين النشطين"
                                  : "Email sent to all active subscribers",
                            });
                          } catch (error) {
                            console.error("Error sending campaign:", error);
                            toast({
                              variant: "destructive",
                              title: isRTL ? "فشل الإرسال" : "Send failed",
                              description:
                                isRTL
                                  ? "تعذر إرسال البريد للمشتركين"
                                  : "Could not send campaign email",
                            });
                          } finally {
                            setIsSendingCampaign(false);
                          }
                        }}
                      >
                        {isSendingCampaign ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        {isRTL ? "إرسال للمشتركين" : "Send to subscribers"}
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {generatedContent && (
                <div className="mt-4 rounded-2xl border border-border/70 bg-card/95 shadow-card overflow-hidden">
                  {/* Email-like header */}
                  <div className="px-4 py-3 border-b border-border/60 bg-gradient-to-r from-secondary/60 via-card to-secondary/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {isRTL ? "م" : "M"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">
                          {isRTL ? "معرض السيارات" : "Showroom Marketing"}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {isRTL ? "رسالة تسويقية مولدة بالذكاء الاصطناعي" : "AI generated marketing email preview"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(generatedContent)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={generateContent}
                        disabled={isGenerating}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Email body */}
                  <div className="px-5 py-4 space-y-3 bg-background/95">
                    <div className="border-b border-border/60 pb-3">
                      <p className="text-[11px] text-muted-foreground mb-1">
                        {isRTL ? "الموضوع" : "Subject"}
                      </p>
                      <p className="text-sm font-semibold">
                        {generatedContent
                          .split(/\n|\./)[0]
                          .slice(0, 100)
                          .trim() || (isRTL ? "عنوان البريد المولد" : "Generated email subject")}
                      </p>
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                      {generatedContent}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign Strategy Tab */}
        <TabsContent value="campaign" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {isRTL ? "استراتيجية الحملة التسويقية" : "Marketing Campaign Strategy"}
              </CardTitle>
              <CardDescription>
                {isRTL 
                  ? "احصل على خطة تسويقية متكاملة بالذكاء الاصطناعي" 
                  : "Get a complete marketing plan powered by AI"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "هدف الحملة" : "Campaign Goal"}</Label>
                  <Select value={campaignGoal} onValueChange={setCampaignGoal}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awareness">{isRTL ? "زيادة الوعي" : "Brand Awareness"}</SelectItem>
                      <SelectItem value="leads">{isRTL ? "جذب عملاء" : "Lead Generation"}</SelectItem>
                      <SelectItem value="sales">{isRTL ? "زيادة المبيعات" : "Increase Sales"}</SelectItem>
                      <SelectItem value="retention">{isRTL ? "الاحتفاظ بالعملاء" : "Customer Retention"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? "الميزانية (اختياري)" : "Budget (optional)"}</Label>
                  <Input
                    value={campaignBudget}
                    onChange={(e) => setCampaignBudget(e.target.value)}
                    placeholder={isRTL ? "مثال: 5000 ريال" : "e.g. 5000 SAR"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? "مدة الحملة" : "Campaign Duration"}</Label>
                  <Select value={campaignDuration} onValueChange={setCampaignDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1_week">{isRTL ? "أسبوع" : "1 Week"}</SelectItem>
                      <SelectItem value="2_weeks">{isRTL ? "أسبوعين" : "2 Weeks"}</SelectItem>
                      <SelectItem value="1_month">{isRTL ? "شهر" : "1 Month"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={generateCampaignStrategy} disabled={isGenerating} className="gap-2">
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lightbulb className="h-4 w-4" />
                )}
                {isGenerating 
                  ? (isRTL ? "جاري إنشاء الاستراتيجية..." : "Creating strategy...") 
                  : (isRTL ? "إنشاء استراتيجية الحملة" : "Generate Campaign Strategy")}
              </Button>

              {generatedContent && activeTab === "campaign" && (
                <div className="p-4 rounded-lg bg-secondary/30 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{isRTL ? "استراتيجية الحملة" : "Campaign Strategy"}</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedContent)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="whitespace-pre-wrap text-sm">{generatedContent}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS Tab */}
        <TabsContent value="sms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {isRTL ? "رسائل SMS التسويقية" : "Marketing SMS Messages"}
              </CardTitle>
              <CardDescription>
                {isRTL 
                  ? "أنشئ رسائل SMS قصيرة وفعالة" 
                  : "Create short and effective SMS messages"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? "الجمهور المستهدف" : "Target Audience"}</Label>
                <Select value={smsTarget} onValueChange={setSmsTarget}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isRTL ? "جميع العملاء" : "All Customers"}</SelectItem>
                    <SelectItem value="new">{isRTL ? "العملاء الجدد" : "New Customers"}</SelectItem>
                    <SelectItem value="vip">{isRTL ? "عملاء VIP" : "VIP Customers"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={generateSMSFromAI} disabled={isGenerating} className="gap-2">
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isRTL ? "توليد رسائل SMS" : "Generate SMS Messages"}
              </Button>

              {smsMessage && (
                <>
                  <div className="p-4 rounded-lg bg-secondary/30 border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {isRTL ? "رسائل SMS المقترحة" : "Suggested SMS Messages"}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(smsMessage)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="whitespace-pre-wrap text-sm">{smsMessage}</div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const formattedMessage = encodeURIComponent(smsMessage);
                        window.open(`https://wa.me/?text=${formattedMessage}`, '_blank');
                      }}
                      className="gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {isRTL ? "إرسال عبر WhatsApp" : "Send via WhatsApp"}
                    </Button>
                    
                    <Dialog open={showCustomersDialog} onOpenChange={setShowCustomersDialog}>
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-2"
                          disabled={!customers || customers.length === 0}
                        >
                          <Users className="h-4 w-4" />
                          {isRTL ? `إرسال للعملاء (${customers?.length || 0})` : `Send to Customers (${customers?.length || 0})`}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md max-h-[80vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            {isRTL ? "إرسال للعملاء" : "Send to Customers"}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 mt-4">
                          <p className="text-sm text-muted-foreground mb-4">
                            {isRTL 
                              ? "اختر العميل لفتح WhatsApp مع الرسالة المولدة" 
                              : "Select a customer to open WhatsApp with the generated message"}
                          </p>
                          {customers?.map((customer) => {
                            const phone = customer.whatsapp || customer.phone;
                            if (!phone) return null;
                            
                            let formattedPhone = phone.replace(/[\s\-\(\)]/g, "");
                            if (formattedPhone.startsWith("0")) {
                              formattedPhone = "966" + formattedPhone.slice(1);
                            }
                            if (!formattedPhone.startsWith("+") && !formattedPhone.startsWith("966")) {
                              formattedPhone = "966" + formattedPhone;
                            }
                            
                            return (
                              <Button
                                key={customer.id}
                                variant="outline"
                                className="w-full justify-between"
                                onClick={() => {
                                  const msg = encodeURIComponent(smsMessage);
                                  window.open(`https://wa.me/${formattedPhone}?text=${msg}`, '_blank');
                                }}
                              >
                                <span className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  {customer.name}
                                </span>
                                <span className="text-xs text-muted-foreground">{phone}</span>
                              </Button>
                            );
                          })}
                          {(!customers || customers.length === 0) && (
                            <p className="text-center text-muted-foreground py-4">
                              {isRTL ? "لا يوجد عملاء بأرقام هواتف" : "No customers with phone numbers"}
                            </p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}

              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">
                      {isRTL ? "كيفية الإرسال" : "How to Send"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isRTL
                        ? "1. ولّد رسالة SMS بالذكاء الاصطناعي\n2. اضغط 'إرسال للعملاء' لاختيار عميل\n3. سيتم فتح WhatsApp مع الرسالة جاهزة للإرسال"
                        : "1. Generate an SMS message with AI\n2. Click 'Send to Customers' to select a customer\n3. WhatsApp will open with the message ready to send"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Banner Generator Dialog */}
      <BannerGeneratorDialog
        open={showBannerDialog}
        onOpenChange={setShowBannerDialog}
        onUseAsHero={(url) => {
          toast({
            title: isRTL ? "تم تحديث صورة الهيرو" : "Hero image updated",
            description: isRTL ? "تم تحديث صورة الهيرو بنجاح" : "Hero image has been updated successfully",
          });
        }}
      />
    </div>
  );
};

export default MarketingAI;
