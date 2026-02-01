import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Settings, Loader2, Save, Upload, Globe, Phone, Mail, MapPin, Clock, Share2, AlertTriangle, Sparkles, Video, Image as ImageIcon, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import BannerGeneratorDialog from "./BannerGeneratorDialog";

const SettingsSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [showBannerDialog, setShowBannerDialog] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("settings").select("*").limit(1).maybeSingle();
      return data;
    },
  });

  const saveSettings = useMutation({
    mutationFn: async (settingsData: any) => {
      if (settings?.id) {
        const { error } = await supabase.from("settings").update(settingsData).eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("settings").insert(settingsData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast({ title: isRTL ? "تم حفظ الإعدادات" : "Settings saved" });
    },
  });

  const handleImageUpload = async (file: File, type: "logo" | "hero") => {
    const setUploading = type === "logo" ? setUploadingLogo : setUploadingHero;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `settings/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('car-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('car-images')
        .getPublicUrl(filePath);

      const fieldName = type === "logo" ? "logo_url" : "hero_image_url";
      const updateData: any = { [fieldName]: publicUrl };
      if (type === "hero") {
        updateData.hero_type = "image";
      }
      await saveSettings.mutateAsync(updateData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: isRTL ? "فشل رفع الصورة" : "Image upload failed",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: isRTL ? "الملف كبير جداً" : "File too large",
        description: isRTL ? "الحد الأقصى 50MB" : "Maximum size is 50MB",
      });
      return;
    }

    setUploadingVideo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-video-${Date.now()}.${fileExt}`;
      const filePath = `settings/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('car-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('car-images')
        .getPublicUrl(filePath);

      await saveSettings.mutateAsync({ 
        hero_video_url: publicUrl,
        hero_type: "video"
      });
      
      toast({
        title: isRTL ? "تم رفع الفيديو بنجاح" : "Video uploaded successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: isRTL ? "فشل رفع الفيديو" : "Video upload failed",
      });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleHeroTypeChange = async (value: string) => {
    await saveSettings.mutateAsync({ hero_type: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    saveSettings.mutate({
      showroom_name: formData.get("showroom_name"),
      showroom_name_en: formData.get("showroom_name_en"),
      phone: formData.get("phone"),
      whatsapp: formData.get("whatsapp"),
      email: formData.get("email"),
      address: formData.get("address"),
      address_ar: formData.get("address_ar"),
      working_hours: formData.get("working_hours"),
      working_hours_ar: formData.get("working_hours_ar"),
      about_text: formData.get("about_text"),
      about_text_ar: formData.get("about_text_ar"),
      facebook_url: formData.get("facebook_url"),
      twitter_url: formData.get("twitter_url"),
      instagram_url: formData.get("instagram_url"),
      tiktok_url: formData.get("tiktok_url"),
      primary_color: formData.get("primary_color") || null,
      secondary_color: formData.get("secondary_color") || null,
      accent_color: formData.get("accent_color") || null,
    });
  };

  // Check for missing critical settings
  const missingSettings = [];
  if (!settings?.showroom_name) missingSettings.push(isRTL ? "اسم المعرض" : "Showroom Name");
  if (!settings?.phone) missingSettings.push(isRTL ? "رقم الهاتف" : "Phone");
  if (!settings?.whatsapp) missingSettings.push(isRTL ? "واتساب" : "WhatsApp");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Settings className="h-6 w-6" />
        {isRTL ? "إعدادات الموقع" : "Site Settings"}
      </h2>

      {missingSettings.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{isRTL ? "إعدادات ناقصة!" : "Missing Settings!"}</AlertTitle>
          <AlertDescription>
            {isRTL 
              ? `يرجى إكمال: ${missingSettings.join("، ")} - هذه البيانات مطلوبة للفواتير والرسائل`
              : `Please complete: ${missingSettings.join(", ")} - Required for invoices and messages`}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-5">
          <TabsTrigger value="general">{isRTL ? "عام" : "General"}</TabsTrigger>
          <TabsTrigger value="contact">{isRTL ? "التواصل" : "Contact"}</TabsTrigger>
          <TabsTrigger value="about">{isRTL ? "من نحن" : "About"}</TabsTrigger>
          <TabsTrigger value="social">{isRTL ? "التواصل الاجتماعي" : "Social"}</TabsTrigger>
          <TabsTrigger value="theme">{isRTL ? "ألوان الثيم" : "Theme"}</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {isRTL ? "معلومات المعرض" : "Showroom Info"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? "هذه البيانات تُستخدم تلقائياً في الفواتير، الحملات التسويقية، والتوليد بالذكاء الاصطناعي"
                    : "This data is automatically used in invoices, marketing campaigns, and AI generation"}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 mb-4">
                  <p className="text-sm font-medium text-primary">
                    {isRTL 
                      ? "💡 أدخل اسم معرضك هنا (مثل: معرض الجبراني للسيارات) ليظهر في جميع الفواتير والحملات البريدية"
                      : "💡 Enter your showroom name here (e.g., Al-Jibrani Car Showroom) to appear in all invoices and email campaigns"}
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>{isRTL ? "اسم المعرض بالعربي *" : "Showroom Name (Arabic) *"}</Label>
                    <Input 
                      name="showroom_name" 
                      defaultValue={settings?.showroom_name || ""} 
                      placeholder={isRTL ? "معرض الجبراني للسيارات" : "معرض الجبراني للسيارات"}
                      className="text-right"
                    />
                  </div>
                  <div>
                    <Label>{isRTL ? "اسم المعرض بالإنجليزي *" : "Showroom Name (English) *"}</Label>
                    <Input 
                      name="showroom_name_en" 
                      defaultValue={settings?.showroom_name_en || ""} 
                      placeholder="Al-Jibrani Car Showroom"
                    />
                  </div>
                </div>

                {/* Logo */}
                <div className="space-y-2">
                  <Label>{isRTL ? "شعار المعرض" : "Showroom Logo"}</Label>
                  <div className="flex items-center gap-4">
                    {settings?.logo_url ? (
                      <div className="relative group">
                        <img src={settings.logo_url} alt="Logo" className="h-16 w-16 object-contain rounded-lg bg-secondary" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => saveSettings.mutate({ logo_url: null })}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center">
                        <Globe className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="logo-upload"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "logo")}
                      />
                      <Button type="button" variant="outline" size="sm" asChild>
                        <label htmlFor="logo-upload" className="cursor-pointer">
                          {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 ml-1" />}
                          {isRTL ? "رفع شعار" : "Upload Logo"}
                        </label>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Hero Section */}
                <div className="space-y-4 border-t pt-4">
                  <Label className="text-base font-semibold">{isRTL ? "خلفية الهيرو" : "Hero Background"}</Label>
                  
                  {/* Hero Type Selection */}
                  <RadioGroup
                    value={(settings as any)?.hero_type || "image"}
                    onValueChange={handleHeroTypeChange}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="image" id="hero-image" />
                      <Label htmlFor="hero-image" className="flex items-center gap-2 cursor-pointer">
                        <ImageIcon className="h-4 w-4" />
                        {isRTL ? "صورة" : "Image"}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="video" id="hero-video" />
                      <Label htmlFor="hero-video" className="flex items-center gap-2 cursor-pointer">
                        <Video className="h-4 w-4" />
                        {isRTL ? "فيديو" : "Video"}
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Hero Image */}
                  <div className="space-y-2">
                    <Label>{isRTL ? "صورة الهيرو" : "Hero Image"}</Label>
                    <div className="space-y-2">
                      {settings?.hero_image_url && (
                        <div className="relative group">
                          <img src={settings.hero_image_url} alt="Hero" className="w-full h-40 object-cover rounded-lg" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => saveSettings.mutate({ hero_image_url: null })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="hero-upload"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "hero")}
                        />
                        <Button type="button" variant="outline" size="sm" asChild>
                          <label htmlFor="hero-upload" className="cursor-pointer">
                            {uploadingHero ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 ml-1" />}
                            {isRTL ? "رفع صورة" : "Upload Image"}
                          </label>
                        </Button>
                        <Button 
                          type="button" 
                          variant="gold" 
                          size="sm" 
                          onClick={() => setShowBannerDialog(true)}
                          className="gap-2"
                        >
                          <Sparkles className="h-4 w-4" />
                          {isRTL ? "توليد بالذكاء الاصطناعي" : "Generate with AI"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Hero Video */}
                  <div className="space-y-2">
                    <Label>{isRTL ? "فيديو الهيرو" : "Hero Video"}</Label>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? "الحد الأقصى 50MB - يفضل MP4" : "Maximum 50MB - MP4 recommended"}
                    </p>
                    <div className="space-y-2">
                      {(settings as any)?.hero_video_url && (
                        <div className="relative group">
                          <video 
                            src={(settings as any).hero_video_url} 
                            className="w-full h-40 object-cover rounded-lg" 
                            controls 
                            muted
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => saveSettings.mutate({ hero_video_url: null })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          className="hidden"
                          id="video-upload"
                          onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                        />
                        <Button type="button" variant="outline" size="sm" asChild>
                          <label htmlFor="video-upload" className="cursor-pointer">
                            {uploadingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4 ml-1" />}
                            {isRTL ? "رفع فيديو" : "Upload Video"}
                          </label>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Hero Overlay Opacity */}
                  <div className="space-y-3 border-t pt-4">
                    <Label className="text-base font-semibold">{isRTL ? "شفافية الطبقة المعتمة" : "Overlay Opacity"}</Label>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? "تحكم في مستوى الإظلام على خلفية الهيرو" : "Control the darkness level on hero background"}
                    </p>
                    <RadioGroup
                      value={(settings as any)?.hero_overlay_opacity || "medium"}
                      onValueChange={(value) => saveSettings.mutate({ hero_overlay_opacity: value })}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="light" id="overlay-light" />
                        <Label htmlFor="overlay-light" className="cursor-pointer">
                          {isRTL ? "خفيف" : "Light"}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="medium" id="overlay-medium" />
                        <Label htmlFor="overlay-medium" className="cursor-pointer">
                          {isRTL ? "متوسط" : "Medium"}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="dark" id="overlay-dark" />
                        <Label htmlFor="overlay-dark" className="cursor-pointer">
                          {isRTL ? "داكن" : "Dark"}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Marquee Settings */}
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">{isRTL ? "شريط الأخبار المتحرك" : "News Marquee"}</Label>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="marquee-toggle" className="text-sm text-muted-foreground">
                          {(settings as any)?.marquee_enabled !== false ? (isRTL ? "مفعّل" : "Enabled") : (isRTL ? "معطّل" : "Disabled")}
                        </Label>
                        <input
                          type="checkbox"
                          id="marquee-toggle"
                          checked={(settings as any)?.marquee_enabled !== false}
                          onChange={(e) => saveSettings.mutate({ marquee_enabled: e.target.checked })}
                          className="h-4 w-4 accent-primary"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isRTL 
                        ? "يعرض الشريط آخر السيارات والعروض تلقائياً، أو يمكنك إضافة نص مخصص" 
                        : "The marquee shows latest cars and offers automatically, or you can add custom text"}
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>{isRTL ? "نص مخصص (عربي)" : "Custom Text (Arabic)"}</Label>
                        <Input
                          placeholder={isRTL ? "عروض خاصة لفترة محدودة!" : "عروض خاصة لفترة محدودة!"}
                          defaultValue={(settings as any)?.marquee_text_ar || ""}
                          onChange={(e) => saveSettings.mutate({ marquee_text_ar: e.target.value })}
                          className="text-right"
                        />
                      </div>
                      <div>
                        <Label>{isRTL ? "نص مخصص (إنجليزي)" : "Custom Text (English)"}</Label>
                        <Input
                          placeholder="Special offers for limited time!"
                          defaultValue={(settings as any)?.marquee_text || ""}
                          onChange={(e) => saveSettings.mutate({ marquee_text: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Settings */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  {isRTL ? "معلومات التواصل" : "Contact Info"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? "هذه البيانات تظهر في الفواتير وتُستخدم للتواصل مع العملاء"
                    : "This data appears in invoices and is used for customer communication"}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {isRTL ? "رقم الهاتف *" : "Phone *"}
                    </Label>
                    <Input name="phone" defaultValue={settings?.phone || ""} placeholder="+966500000000" dir="ltr" />
                  </div>
                  <div>
                    <Label>{isRTL ? "واتساب *" : "WhatsApp *"}</Label>
                    <Input name="whatsapp" defaultValue={settings?.whatsapp || ""} placeholder="+966500000000" dir="ltr" />
                  </div>
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {isRTL ? "البريد الإلكتروني" : "Email"}
                  </Label>
                  <Input name="email" type="email" defaultValue={settings?.email || ""} placeholder="info@showroom.com" dir="ltr" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {isRTL ? "العنوان بالعربي" : "Address (Arabic)"}
                    </Label>
                    <Input name="address_ar" defaultValue={settings?.address_ar || ""} />
                  </div>
                  <div>
                    <Label>{isRTL ? "العنوان بالإنجليزي" : "Address (English)"}</Label>
                    <Input name="address" defaultValue={settings?.address || ""} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {isRTL ? "ساعات العمل بالعربي" : "Working Hours (Arabic)"}
                    </Label>
                    <Input name="working_hours_ar" defaultValue={settings?.working_hours_ar || ""} placeholder={isRTL ? "السبت - الخميس: 9 صباحاً - 10 مساءً" : ""} />
                  </div>
                  <div>
                    <Label>{isRTL ? "ساعات العمل بالإنجليزي" : "Working Hours (English)"}</Label>
                    <Input name="working_hours" defaultValue={settings?.working_hours || ""} placeholder="Sat - Thu: 9 AM - 10 PM" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Settings */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? "نص من نحن" : "About Text"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{isRTL ? "النص بالعربي" : "Text (Arabic)"}</Label>
                  <Textarea name="about_text_ar" defaultValue={settings?.about_text_ar || ""} rows={6} />
                </div>
                <div>
                  <Label>{isRTL ? "النص بالإنجليزي" : "Text (English)"}</Label>
                  <Textarea name="about_text" defaultValue={settings?.about_text || ""} rows={6} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Settings */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  {isRTL ? "روابط التواصل الاجتماعي" : "Social Media Links"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Facebook</Label>
                    <Input name="facebook_url" defaultValue={settings?.facebook_url || ""} placeholder="https://facebook.com/..." />
                  </div>
                  <div>
                    <Label>Instagram</Label>
                    <Input name="instagram_url" defaultValue={settings?.instagram_url || ""} placeholder="https://instagram.com/..." />
                  </div>
                  <div>
                    <Label>Twitter / X</Label>
                    <Input name="twitter_url" defaultValue={settings?.twitter_url || ""} placeholder="https://twitter.com/..." />
                  </div>
                  <div>
                    <Label>TikTok</Label>
                    <Input name="tiktok_url" defaultValue={settings?.tiktok_url || ""} placeholder="https://tiktok.com/@..." />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button type="submit" variant="gold" disabled={saveSettings.isPending}>
              {saveSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
              {isRTL ? "حفظ الإعدادات" : "Save Settings"}
            </Button>
          </div>
        </form>
      </Tabs>

      {/* Banner Generator Dialog */}
      <BannerGeneratorDialog
        open={showBannerDialog}
        onOpenChange={setShowBannerDialog}
        onUseAsHero={(url) => {
          queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
        }}
      />
    </div>
  );
};

export default SettingsSection;
