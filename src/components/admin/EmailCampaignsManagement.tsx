import { useState, useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import EmailPreviewDialog from "./EmailPreviewDialog";
import {
  Mail,
  Send,
  Sparkles,
  FileText,
  Image,
  Lightbulb,
  Loader2,
  Copy,
  Trash2,
  Eye,
  Bot,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  History,
  Layout,
  Plus,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  name_ar: string;
  subject: string;
  subject_ar: string;
  content: string;
  content_ar: string;
  status: string;
  target_audience: string;
  scheduled_at: string | null;
  sent_at: string | null;
  total_recipients: number;
  total_sent: number;
  total_opened: number;
  created_at: string;
}

const EmailCampaignsManagement = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const { tenant } = useTenant();
  const isRTL = language === "ar";

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");

  // Form states for AI generation
  const [topic, setTopic] = useState("");
  const [campaignType, setCampaignType] = useState("promotional");
  const [targetAudience, setTargetAudience] = useState("all");
  const [autoSend, setAutoSend] = useState(false);
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState({ subject: "", content: "" });
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const campaignTypes = [
    { value: "promotional", label: isRTL ? "ترويجي" : "Promotional", icon: "🎯" },
    { value: "seasonal", label: isRTL ? "موسمي" : "Seasonal", icon: "🌟" },
    { value: "new_arrivals", label: isRTL ? "وصول جديد" : "New Arrivals", icon: "🚗" },
    { value: "newsletter", label: isRTL ? "نشرة إخبارية" : "Newsletter", icon: "📰" },
    { value: "reminder", label: isRTL ? "تذكير" : "Reminder", icon: "⏰" },
    { value: "test_drive", label: isRTL ? "تجربة قيادة" : "Test Drive", icon: "🏎️" },
    { value: "loyalty", label: isRTL ? "برنامج الولاء" : "Loyalty", icon: "⭐" },
  ];

  const audienceTypes = [
    { value: "all", label: isRTL ? "جميع المشتركين" : "All Subscribers" },
    { value: "new", label: isRTL ? "المشتركين الجدد" : "New Subscribers" },
    { value: "active", label: isRTL ? "العملاء النشطين" : "Active Customers" },
    { value: "vip", label: isRTL ? "عملاء VIP" : "VIP Customers" },
  ];

  // القوالب الجاهزة للمناسبات
  const presetTemplates = [
    {
      id: "ramadan", name: isRTL ? "🌙 رمضان كريم" : "🌙 Ramadan Kareem",
      subject: isRTL ? "عروض رمضانية حصرية من معرضنا" : "Exclusive Ramadan Offers",
      content: isRTL ? "بمناسبة شهر رمضان المبارك، نقدم لكم عروضاً استثنائية على جميع السيارات.\n\n✨ خصومات تصل إلى 15%\n🎁 هدايا مجانية مع كل عملية شراء\n📅 تقسيط ميسر بدون فوائد\n\nزورونا وحققوا حلمكم بسيارة جديدة!\n\nرمضان مبارك 🌙" : "On the occasion of Ramadan, we offer exclusive deals on all cars."
    },
    {
      id: "eid", name: isRTL ? "🎉 تهنئة العيد" : "🎉 Eid Greetings",
      subject: isRTL ? "كل عام وأنتم بخير - عروض العيد الحصرية" : "Eid Mubarak - Exclusive Eid Offers",
      content: isRTL ? "عيد مبارك! 🎉\n\nبهذه المناسبة السعيدة، نتقدم لكم بأحر التهاني.\n\nعروض العيد الخاصة:\n🚗 خصم 20% على سيارات مختارة\n🎁 باقة صيانة مجانية لمدة سنة\n💰 أسعار تنافسية لن تتكرر\n\nزورونا في معرضنا واحتفلوا بالعيد بسيارة أحلامكم!" : "Eid Mubarak! We wish you a happy Eid and offer exclusive deals."
    },
    {
      id: "national_day", name: isRTL ? "🇸🇦 اليوم الوطني" : "🇸🇦 National Day",
      subject: isRTL ? "احتفالية اليوم الوطني السعودي - عروض استثنائية" : "Saudi National Day Celebration - Special Offers",
      content: isRTL ? "🇸🇦 نحتفل معكم باليوم الوطني السعودي المجيد!\n\nبهذه المناسبة الغالية على قلوبنا جميعاً، نقدم:\n\n🎯 خصومات وطنية حصرية\n🏆 أسعار تاريخية لن تتكرر\n🚗 تشكيلة واسعة من أفخم السيارات\n\nكل عام والوطن بخير! 🇸🇦" : "We celebrate Saudi National Day with exclusive offers!"
    },
    {
      id: "weekend_sale", name: isRTL ? "🔥 عروض نهاية الأسبوع" : "🔥 Weekend Sale",
      subject: isRTL ? "عروض نهاية الأسبوع الحصرية - لا تفوتوها!" : "Exclusive Weekend Offers - Don't Miss Out!",
      content: isRTL ? "عروض حصرية لنهاية الأسبوع فقط! 🔥\n\n⏰ العرض ساري ليومين فقط\n💰 خصومات فورية على جميع السيارات\n🎁 هدايا وإكسسوارات مجانية\n📞 استشارة مجانية من خبرائنا\n\nسارعوا واحجزوا سيارتكم الآن!" : "Exclusive weekend offers! Limited time only!"
    },
    {
      id: "welcome", name: isRTL ? "👋 ترحيب بالعميل" : "👋 Welcome Customer",
      subject: isRTL ? "مرحباً بك في عائلتنا" : "Welcome to Our Family",
      content: isRTL ? "مرحباً بك! 👋\n\nيسعدنا انضمامك إلى عائلة عملائنا الكرام.\n\nنحن هنا لمساعدتك في إيجاد سيارة أحلامك:\n\n✅ تشكيلة واسعة من السيارات\n✅ أسعار تنافسية\n✅ خدمة عملاء متميزة\n✅ ضمان شامل\n\nتواصل معنا في أي وقت!" : "Welcome! We're glad to have you as part of our family."
    },
    {
      id: "test_drive_invite", name: isRTL ? "🏎️ دعوة تجربة قيادة" : "🏎️ Test Drive Invitation",
      subject: isRTL ? "دعوة خاصة لتجربة قيادة مميزة" : "Special Test Drive Invitation",
      content: isRTL ? "ندعوك لتجربة قيادة لا تُنسى! 🏎️\n\n✨ جرب سيارتك المفضلة قبل الشراء\n📅 احجز موعدك المناسب\n👨‍💼 مستشار مخصص لخدمتك\n☕ ضيافة مميزة في انتظارك\n\nاحجز تجربتك الآن وعش التجربة الحقيقية!" : "We invite you for an unforgettable test drive experience!"
    },
  ];

  useEffect(() => {
    if (tenant) {
      fetchCampaigns();
    }
  }, [tenant]);

  const fetchCampaigns = async () => {
    try {
      if (!tenant) return;
      const { data, error } = await supabase
        .from("email_campaigns")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const suggestTitles = async () => {
    if (!topic.trim()) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى إدخال موضوع البريد أولاً" : "Please enter the email topic first",
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-email-content", {
        body: {
          mode: "suggest_titles",
          topic,
          campaignType,
          targetAudience,
          language: isRTL ? "ar" : "en",
        },
      });

      if (error) throw error;

      if (data?.success && data?.titles) {
        setSuggestedTitles(data.titles);
        toast({
          title: isRTL ? "تم بنجاح" : "Success",
          description: isRTL ? "تم اقتراح العناوين بنجاح!" : "Titles suggested successfully!",
        });
      }
    } catch (error: any) {
      console.error("Error suggesting titles:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ في التوليد" : "Generation Error",
        description: error.message,
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateSimpleTemplate = async () => {
    if (!topic.trim()) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى إدخال موضوع البريد أولاً" : "Please enter the email topic first",
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-email-content", {
        body: {
          mode: "simple_template",
          topic,
          campaignType,
          targetAudience,
          language: isRTL ? "ar" : "en",
        },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        setGeneratedContent({ subject: data.data.subject || "", content: data.data.content || "" });
        toast({
          title: isRTL ? "تم بنجاح" : "Success",
          description: isRTL ? "تم توليد القالب البسيط بنجاح!" : "Simple template generated successfully!",
        });

        if (autoSend) {
          await saveAndSendCampaign(data.data.subject, data.data.content);
        }
      }
    } catch (error: any) {
      console.error("Error generating simple template:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ في التوليد" : "Generation Error",
        description: error.message,
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateProfessionalTemplate = async () => {
    if (!topic.trim()) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى إدخال موضوع البريد أولاً" : "Please enter the email topic first",
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-email-content", {
        body: {
          mode: "professional_template",
          topic,
          campaignType,
          targetAudience,
          language: isRTL ? "ar" : "en",
        },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        setGeneratedContent({ subject: data.data.subject || "", content: data.data.content || "" });
        toast({
          title: isRTL ? "تم بنجاح" : "Success",
          description: isRTL ? "تم توليد القالب الاحترافي بنجاح!" : "Professional template generated successfully!",
        });

        if (autoSend) {
          await saveAndSendCampaign(data.data.subject, data.data.content);
        }
      }
    } catch (error: any) {
      console.error("Error generating professional template:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ في التوليد" : "Generation Error",
        description: error.message,
      });
    } finally {
      setGenerating(false);
    }
  };

  const saveAndSendCampaign = async (subject: string, content: string) => {
    setSendingCampaign(true);
    try {
      // Save campaign
      const { data: campaign, error: saveError } = await supabase
        .from("email_campaigns")
        .insert({
          name: subject,
          name_ar: subject,
          subject: subject,
          subject_ar: subject,
          content: content,
          content_ar: content,
          target_audience: targetAudience,
          status: "draft",
          tenant_id: tenant?.id,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Send campaign
      const { data: sendData, error: sendError } = await supabase.functions.invoke("send-campaign-email", {
        body: { campaignId: campaign.id },
      });

      if (sendError) throw sendError;

      if (sendData?.success) {
        toast({
          title: isRTL ? "تم بنجاح" : "Success",
          description: isRTL ? "تم إنشاء وإرسال الحملة بنجاح!" : "Campaign created and sent successfully!",
        });
      } else {
        toast({
          variant: "destructive",
          title: isRTL ? "تنبيه" : "Warning",
          description: sendData?.error || (isRTL ? "تم الحفظ لكن فشل الإرسال" : "Saved but sending failed"),
        });
      }

      fetchCampaigns();
      resetForm();
    } catch (error: any) {
      console.error("Error saving/sending campaign:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
      });
    } finally {
      setSendingCampaign(false);
    }
  };

  const saveCampaignAsDraft = async () => {
    if (!generatedContent.subject || !generatedContent.content) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى توليد محتوى أولاً" : "Please generate content first",
      });
      return;
    }

    try {
      const { error } = await supabase.from("email_campaigns").insert({
        name: generatedContent.subject,
        name_ar: generatedContent.subject,
        subject: generatedContent.subject,
        subject_ar: generatedContent.subject,
        content: generatedContent.content,
        content_ar: generatedContent.content,
        target_audience: targetAudience,
        status: "draft",
        tenant_id: tenant?.id,
      });

      if (error) throw error;

      toast({
        title: isRTL ? "تم الحفظ" : "Saved",
        description: isRTL ? "تم حفظ الحملة كمسودة!" : "Campaign saved as draft!",
      });
      fetchCampaigns();
      resetForm();
    } catch (error: any) {
      console.error("Error saving draft:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
      });
    }
  };

  const sendCampaign = async (campaignId: string) => {
    setSendingCampaign(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-campaign-email", {
        body: { campaignId },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: isRTL ? "تم الإرسال" : "Sent",
          description: isRTL ? "تم إرسال الحملة بنجاح!" : "Campaign sent successfully!",
        });
      } else {
        toast({
          variant: "destructive",
          title: isRTL ? "فشل الإرسال" : "Send Failed",
          description: data?.error || (isRTL ? "حدث خطأ" : "An error occurred"),
        });
      }

      fetchCampaigns();
    } catch (error: any) {
      console.error("Error sending campaign:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
      });
    } finally {
      setSendingCampaign(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      const { error } = await supabase.from("email_campaigns").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: isRTL ? "تم الحذف" : "Deleted",
        description: isRTL ? "تم حذف الحملة بنجاح" : "Campaign deleted successfully",
      });
      fetchCampaigns();
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
      });
    }
  };

  const resetForm = () => {
    setTopic("");
    setSuggestedTitles([]);
    setGeneratedContent({ subject: "", content: "" });
  };

  const selectTitle = (title: string) => {
    setGeneratedContent((prev) => ({ ...prev, subject: title }));
    toast({
      title: isRTL ? "تم الاختيار" : "Selected",
      description: isRTL ? "تم اختيار العنوان" : "Title selected",
    });
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: isRTL ? "تم النسخ" : "Copied",
      description: isRTL ? "تم نسخ المحتوى" : "Content copied",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            {isRTL ? "مرسل" : "Sent"}
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="secondary">
            <FileText className="w-3 h-3 ml-1" />
            {isRTL ? "مسودة" : "Draft"}
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 ml-1" />
            {isRTL ? "فشل" : "Failed"}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    totalCampaigns: campaigns.length,
    sentCampaigns: campaigns.filter((c) => c.status === "sent").length,
    draftCampaigns: campaigns.filter((c) => c.status === "draft").length,
    totalRecipients: campaigns.reduce((sum, c) => sum + (c.total_recipients || 0), 0),
  };

  const emailLogs = campaigns.filter((c) => c.status === "sent").slice(0, 20);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" />
            {isRTL ? "إدارة البريد الذكي" : "Smart Email Management"}
          </h2>
          <p className="text-muted-foreground">
            {isRTL ? "إنشاء وإدارة حملات البريد بالذكاء الاصطناعي" : "Create and manage AI-powered email campaigns"}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? "إجمالي الحملات" : "Total Campaigns"}</p>
                <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Layout className="w-6 h-6 text-cyan-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? "رسائل مرسلة" : "Sent Emails"}</p>
                <p className="text-2xl font-bold">{stats.sentCampaigns}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Send className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? "المسودات" : "Drafts"}</p>
                <p className="text-2xl font-bold">{stats.draftCampaigns}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? "مساعد AI" : "AI Assistant"}</p>
                <p className="text-lg font-bold text-green-500">{isRTL ? "جاهز" : "Ready"}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="generate" className="gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">{isRTL ? "توليد AI" : "AI Generate"}</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2">
            <Layout className="w-4 h-4" />
            <span className="hidden sm:inline">{isRTL ? "الحملات" : "Campaigns"}</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">{isRTL ? "السجلات" : "Logs"}</span>
          </TabsTrigger>
          <TabsTrigger value="tools" className="gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">{isRTL ? "أدوات AI" : "AI Tools"}</span>
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-4">
          {/* Quick Templates Section */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-primary" />
                {isRTL ? "قوالب جاهزة للمناسبات" : "Ready-Made Templates"}
              </CardTitle>
              <CardDescription>
                {isRTL ? "اختر قالباً جاهزاً وقم بتخصيصه حسب احتياجك" : "Choose a ready template and customize it"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {presetTemplates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="h-auto py-3 px-4 flex flex-col items-center gap-1 hover:border-primary hover:bg-primary/5 transition-all"
                    onClick={() => {
                      setGeneratedContent({ subject: template.subject, content: template.content });
                      toast({
                        title: isRTL ? "تم تحميل القالب" : "Template Loaded",
                        description: isRTL ? "يمكنك تعديله ثم معاينته أو إرساله" : "You can edit, preview or send it",
                      });
                    }}
                  >
                    <span className="text-xl">{template.name.split(' ')[0]}</span>
                    <span className="text-xs text-muted-foreground text-center leading-tight">
                      {template.name.split(' ').slice(1).join(' ')}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {isRTL ? "توليد قالب بريد إلكتروني بالذكاء الاصطناعي" : "AI Email Template Generator"}
              </CardTitle>
              <CardDescription>
                {isRTL
                  ? "استخدم الذكاء الاصطناعي لإنشاء قوالب بريد احترافية"
                  : "Use AI to create professional email templates"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "نوع البريد" : "Email Type"}</Label>
                  <Select value={campaignType} onValueChange={setCampaignType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? "الجمهور المستهدف" : "Target Audience"}</Label>
                  <Select value={targetAudience} onValueChange={setTargetAudience}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {audienceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "الغرض / الموضوع" : "Purpose / Topic"}</Label>
                <Input
                  placeholder={
                    isRTL
                      ? "مثال: خصم 20% على جميع السيارات الجديدة..."
                      : "Example: 20% discount on all new cars..."
                  }
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-3">
                  <Switch id="auto-send" checked={autoSend} onCheckedChange={setAutoSend} />
                  <div>
                    <Label htmlFor="auto-send" className="cursor-pointer font-medium">
                      {isRTL ? "الإرسال التلقائي بعد التوليد" : "Auto-send after generation"}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isRTL
                        ? "سيتم إنشاء القالب وإرسال الحملة تلقائياً للجميع"
                        : "Template will be created and campaign sent automatically to all"}
                    </p>
                  </div>
                </div>
                {autoSend && <Send className="w-5 h-5 text-green-500" />}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={suggestTitles} disabled={generating} className="gap-2">
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
                  {isRTL ? "اقتراح عناوين" : "Suggest Titles"}
                </Button>
                <Button variant="outline" onClick={generateSimpleTemplate} disabled={generating} className="gap-2">
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  {isRTL ? "توليد قالب بسيط" : "Generate Simple"}
                </Button>
                <Button
                  onClick={generateProfessionalTemplate}
                  disabled={generating}
                  className="gap-2 bg-gradient-to-r from-primary to-purple-600"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                  {isRTL ? "قالب احترافي مع صورة" : "Professional Template"}
                </Button>
              </div>

              {/* Suggested Titles */}
              {suggestedTitles.length > 0 && (
                <div className="space-y-2 p-4 rounded-lg bg-muted/50 border">
                  <Label className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    {isRTL ? "العناوين المقترحة" : "Suggested Titles"}
                  </Label>
                  <div className="space-y-2">
                    {suggestedTitles.map((title, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-background border hover:border-primary cursor-pointer transition-colors"
                        onClick={() => selectTitle(title)}
                      >
                        <span>{title}</span>
                        <Button variant="ghost" size="sm">
                          {isRTL ? "اختيار" : "Select"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Content */}
              {(generatedContent.subject || generatedContent.content) && (
                <div className="space-y-4 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      {isRTL ? "المحتوى المُولَّد" : "Generated Content"}
                    </Label>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => copyContent(generatedContent.content)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{isRTL ? "العنوان" : "Subject"}</Label>
                    <Input
                      value={generatedContent.subject}
                      onChange={(e) => setGeneratedContent((prev) => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{isRTL ? "المحتوى" : "Content"}</Label>
                    <Textarea
                      value={generatedContent.content}
                      onChange={(e) => setGeneratedContent((prev) => ({ ...prev, content: e.target.value }))}
                      rows={6}
                    />
                  </div>

                  {/* Schedule Section */}
                  <div className="p-4 rounded-lg bg-muted/30 border space-y-3">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      {isRTL ? "جدولة الإرسال (اختياري)" : "Schedule Send (Optional)"}
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <Input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowPreviewDialog(true)}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {isRTL ? "معاينة وتحرير" : "Preview & Edit"}
                    </Button>
                    <Button variant="outline" onClick={saveCampaignAsDraft}>
                      <FileText className="w-4 h-4 ml-2" />
                      {isRTL ? "حفظ كمسودة" : "Save as Draft"}
                    </Button>
                    {scheduledDate && scheduledTime ? (
                      <Button
                        onClick={async () => {
                          const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
                          try {
                            const { error } = await supabase.from("email_campaigns").insert({
                              name: generatedContent.subject,
                              name_ar: generatedContent.subject,
                              subject: generatedContent.subject,
                              subject_ar: generatedContent.subject,
                              content: generatedContent.content,
                              content_ar: generatedContent.content,
                              target_audience: targetAudience,
                              status: "scheduled",
                              scheduled_at: scheduledAt,
                            });
                            if (error) throw error;
                            toast({
                              title: isRTL ? "تمت الجدولة" : "Scheduled",
                              description: isRTL ? "سيتم إرسال الحملة في الموعد المحدد" : "Campaign will be sent at the scheduled time",
                            });
                            fetchCampaigns();
                            resetForm();
                            setScheduledDate("");
                            setScheduledTime("");
                          } catch (error: any) {
                            toast({ variant: "destructive", title: isRTL ? "خطأ" : "Error", description: error.message });
                          }
                        }}
                        className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500"
                      >
                        <Clock className="w-4 h-4" />
                        {isRTL ? "جدولة الإرسال" : "Schedule Send"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => saveAndSendCampaign(generatedContent.subject, generatedContent.content)}
                        disabled={sendingCampaign}
                        className="bg-gradient-to-r from-primary to-purple-600"
                      >
                        {sendingCampaign ? (
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 ml-2" />
                        )}
                        {isRTL ? "حفظ وإرسال" : "Save & Send"}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Email Preview Dialog */}
              <EmailPreviewDialog
                open={showPreviewDialog}
                onOpenChange={setShowPreviewDialog}
                subject={generatedContent.subject}
                content={generatedContent.content}
                onSubjectChange={(subject) => setGeneratedContent((prev) => ({ ...prev, subject }))}
                onContentChange={(content) => setGeneratedContent((prev) => ({ ...prev, content }))}
                onSave={() => {
                  saveCampaignAsDraft();
                  setShowPreviewDialog(false);
                }}
                onSend={() => {
                  saveAndSendCampaign(generatedContent.subject, generatedContent.content);
                  setShowPreviewDialog(false);
                }}
                sending={sendingCampaign}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                {isRTL ? `الحملات (${campaigns.length})` : `Campaigns (${campaigns.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{isRTL ? "لا توجد حملات بعد" : "No campaigns yet"}</p>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab("generate")}>
                    <Plus className="w-4 h-4 ml-2" />
                    {isRTL ? "إنشاء حملة جديدة" : "Create New Campaign"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{campaign.subject_ar || campaign.subject || campaign.name}</h4>
                          {getStatusBadge(campaign.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(campaign.created_at).toLocaleDateString(isRTL ? "ar" : "en")}
                          </span>
                          {campaign.total_recipients > 0 && (
                            <span>
                              {campaign.total_recipients} {isRTL ? "مستلم" : "recipients"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedCampaign(campaign)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>{campaign.subject_ar || campaign.subject}</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-[60vh]">
                              <div
                                className="prose prose-sm dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: campaign.content_ar || campaign.content }}
                              />
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                        {campaign.status === "draft" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendCampaign(campaign.id)}
                            disabled={sendingCampaign}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyContent(campaign.content_ar || campaign.content)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => deleteCampaign(campaign.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                {isRTL ? "سجل الإرسال" : "Send History"}
              </CardTitle>
              <CardDescription>
                {isRTL ? "تاريخ جميع الرسائل المرسلة" : "History of all sent emails"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{isRTL ? "لا توجد رسائل مرسلة بعد" : "No sent emails yet"}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {emailLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <h4 className="font-medium">{log.subject_ar || log.subject}</h4>
                          <p className="text-sm text-muted-foreground">
                            {log.total_recipients} {isRTL ? "مستلم" : "recipients"} •{" "}
                            {new Date(log.sent_at || log.created_at).toLocaleDateString(isRTL ? "ar" : "en")}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{log.target_audience || "all"}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tools Tab */}
        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-500" />
                  {isRTL ? "مساعد AI" : "AI Assistant"}
                </CardTitle>
                <CardDescription>
                  {isRTL ? "مساعدك الذكي لكتابة المحتوى" : "Your smart assistant for content writing"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-purple-500/50" />
                  <p className="text-muted-foreground mb-4">
                    {isRTL ? "المساعد جاهز للمساعدة في كتابة محتوى البريد" : "Assistant ready to help write email content"}
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("generate")}>
                    <Sparkles className="w-4 h-4 ml-2" />
                    {isRTL ? "ابدأ التوليد" : "Start Generating"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-500" />
                  {isRTL ? "تحليل الأداء" : "Performance Analysis"}
                </CardTitle>
                <CardDescription>
                  {isRTL ? "إحصائيات حملاتك السابقة" : "Statistics of your previous campaigns"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{isRTL ? "إجمالي المستلمين" : "Total Recipients"}</span>
                    <span className="font-bold text-lg">{stats.totalRecipients}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{isRTL ? "معدل النجاح" : "Success Rate"}</span>
                    <span className="font-bold text-lg text-green-500">
                      {stats.totalCampaigns > 0 ? Math.round((stats.sentCampaigns / stats.totalCampaigns) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{isRTL ? "الحملات هذا الشهر" : "Campaigns This Month"}</span>
                    <span className="font-bold text-lg">{stats.totalCampaigns}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailCampaignsManagement;
