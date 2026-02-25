import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import {
  Eye,
  Send,
  Save,
  Loader2,
  Smartphone,
  Monitor,
  Car,
  RefreshCw,
  Mail,
  Moon,
  Sun,
  Copy,
  Download,
  Upload,
  Image,
  X,
} from "lucide-react";

interface Car {
  id: string;
  name: string;
  name_ar: string;
  model: string;
  year: number;
  price: number;
  main_image: string | null;
}

interface EmailPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  content: string;
  onSubjectChange: (subject: string) => void;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onSend: () => void;
  sending?: boolean;
}

const EmailPreviewDialog = ({
  open,
  onOpenChange,
  subject,
  content,
  onSubjectChange,
  onContentChange,
  onSave,
  onSend,
  sending = false,
}: EmailPreviewDialogProps) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { data: settings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCars, setSelectedCars] = useState<string[]>([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [darkMode, setDarkMode] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [customImages, setCustomImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    if (open) {
      fetchFeaturedCars();
    }
  }, [open]);

  // Auto-refresh preview when content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewKey(prev => prev + 1);
    }, 500);
    return () => clearTimeout(timer);
  }, [subject, content, selectedCars, customImages]);

  const fetchFeaturedCars = async () => {
    setLoadingCars(true);
    try {
      const { data, error } = await supabase
        .from("cars")
        .select("id, name, name_ar, model, year, price, main_image")
        .eq("is_featured", true)
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      setCars(data || []);
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setLoadingCars(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى اختيار ملف صورة" : "Please select an image file",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "حجم الملف كبير جداً (الحد الأقصى 5MB)" : "File size too large (max 5MB)",
      });
      return;
    }

    setUploadingImage(true);
    try {
      const fileName = `email-assets/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("car-images")
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("car-images")
        .getPublicUrl(fileName);

      setCustomImages(prev => [...prev, urlData.publicUrl]);
      toast({
        title: isRTL ? "تم الرفع" : "Uploaded",
        description: isRTL ? "تم رفع الصورة بنجاح" : "Image uploaded successfully",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeCustomImage = (index: number) => {
    setCustomImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleCarSelection = (carId: string) => {
    setSelectedCars((prev) =>
      prev.includes(carId) ? prev.filter((id) => id !== carId) : prev.length < 3 ? [...prev, carId] : prev
    );
  };

  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى إدخال بريد إلكتروني للاختبار" : "Please enter a test email",
      });
      return;
    }

    setSendingTest(true);
    try {
      // First save as draft then send test
      const { data: campaign, error: saveError } = await supabase
        .from("email_campaigns")
        .insert({
          name: subject,
          name_ar: subject,
          subject: subject,
          subject_ar: subject,
          content: content,
          content_ar: content,
          target_audience: "all",
          status: "draft",
        })
        .select()
        .single();

      if (saveError) throw saveError;

      const { data, error } = await supabase.functions.invoke("send-campaign-email", {
        body: {
          campaignId: campaign.id,
          testEmail: testEmail,
          selectedCars: selectedCars,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: isRTL ? "تم الإرسال" : "Sent",
          description: isRTL ? `تم إرسال البريد التجريبي إلى ${testEmail}` : `Test email sent to ${testEmail}`,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
      });
    } finally {
      setSendingTest(false);
    }
  };

  const generatePreviewHTML = () => {
    const showroomName = settings?.showroom_name || "معرض السيارات";
    const showroomNameEn = settings?.showroom_name_en || "Car Showroom";
    const logoUrl = settings?.logo_url || "";
    const phone = settings?.phone || "";
    const whatsapp = settings?.whatsapp || "";
    const address = settings?.address_ar || "";

    const selectedCarData = cars.filter((car) => selectedCars.includes(car.id));

    const isHtml = content.includes("<") && content.includes(">");
    const formattedContent = isHtml
      ? content
      : content
        .split("\n")
        .filter((p) => p.trim())
        .map((p) => `<p style="margin: 0 0 16px; color: #444444; font-size: 16px; line-height: 1.8;">${p}</p>`)
        .join("");

    // Custom images section
    const customImagesHTML = customImages.length > 0 ? `
      <tr>
        <td style="padding: 20px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              ${customImages.map((img, i) => `
                <td width="${100 / Math.min(customImages.length, 3)}%" style="padding: 5px; vertical-align: top;">
                  <img src="${img}" alt="صورة ${i + 1}" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                </td>
              `).join('')}
            </tr>
          </table>
        </td>
      </tr>
    ` : '';

    const carsHTML =
      selectedCarData.length > 0
        ? `
      <tr>
        <td style="padding: 30px 40px;">
          <h3 style="margin: 0 0 20px; color: #1a1a1a; font-size: 20px; font-weight: 700; text-align: center;">
            ${isRTL ? "🚗 سيارات مميزة" : "🚗 Featured Cars"}
          </h3>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              ${selectedCarData
          .map(
            (car) => `
                <td width="33%" style="padding: 8px; vertical-align: top;">
                  <div style="background: #f8f8f8; border-radius: 12px; overflow: hidden; border: 1px solid #eee;">
                    ${car.main_image
                ? `<img src="${car.main_image}" alt="${car.name}" style="width: 100%; height: 120px; object-fit: cover;">`
                : `<div style="width: 100%; height: 120px; background: linear-gradient(135deg, #1a1a1a, #333); display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 40px;">🚗</span>
                      </div>`
              }
                    <div style="padding: 12px;">
                      <h4 style="margin: 0 0 5px; font-size: 14px; font-weight: 700; color: #1a1a1a;">${isRTL ? car.name_ar : car.name}</h4>
                      <p style="margin: 0 0 8px; font-size: 12px; color: #666;">${car.model} ${car.year}</p>
                      <p style="margin: 0; font-size: 16px; font-weight: 700; color: #D4AF37;">${car.price.toLocaleString()} ${isRTL ? "ر.س" : "SAR"}</p>
                    </div>
                  </div>
                </td>
              `
          )
          .join("")}
            </tr>
          </table>
        </td>
      </tr>
    `
        : "";

    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f5f5f5; direction: rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #1a1a1a 0%, #000000 50%, #f5f5f5 50%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.2);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); padding: 40px; text-align: center;">
              ${logoUrl
        ? `<img src="${logoUrl}" alt="${showroomName}" style="height: 70px; max-width: 200px; margin-bottom: 15px;">`
        : `<div style="font-size: 36px; margin-bottom: 10px;">🚗</div>`
      }
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">${showroomName}</h1>
              <p style="margin: 8px 0 0; color: #D4AF37; font-size: 14px; letter-spacing: 2px;">${showroomNameEn}</p>
            </td>
          </tr>
          
          <!-- Gold Accent Line -->
          <tr>
            <td style="background: linear-gradient(90deg, #D4AF37, #f5e6a3, #D4AF37); height: 4px;"></td>
          </tr>
          
          <!-- Subject Title -->
          <tr>
            <td style="padding: 35px 40px 20px; text-align: center;">
              <h2 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 700; line-height: 1.4;">${subject}</h2>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 10px 40px 35px;">
              <div style="background-color: #fafafa; border-radius: 12px; padding: 25px; border-right: 4px solid #D4AF37;">
                ${formattedContent}
              </div>
            </td>
          </tr>
          
          ${customImagesHTML}
          
          ${carsHTML}
          
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 0 40px 35px;">
              <a href="#" style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #b8942e 100%); color: #1a1a1a; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-size: 17px; font-weight: bold; box-shadow: 0 8px 25px rgba(212, 175, 55, 0.35);">
                🚗 ${isRTL ? "تصفح السيارات الآن" : "Browse Cars Now"}
              </a>
            </td>
          </tr>
          
          <!-- Contact Section -->
          <tr>
            <td style="padding: 30px 40px; background-color: #fafafa;">
              <p style="margin: 0 0 15px; color: #888888; font-size: 14px; text-align: center;">${isRTL ? "للتواصل معنا" : "Contact Us"}</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        ${phone
        ? `
                        <td style="padding: 0 12px;">
                          <a href="tel:${phone}" style="display: inline-block; background-color: #ffffff; color: #1a1a1a; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-size: 14px; border: 1px solid #D4AF37; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                            📞 ${phone}
                          </a>
                        </td>
                        `
        : ""
      }
                        ${whatsapp
        ? `
                        <td style="padding: 0 12px;">
                          <a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-size: 14px; box-shadow: 0 2px 8px rgba(37,211,102,0.3);">
                            💬 ${isRTL ? "واتساب" : "WhatsApp"}
                          </a>
                        </td>
                        `
        : ""
      }
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ${address ? `<p style="margin: 20px 0 0; color: #888888; font-size: 13px; text-align: center;">📍 ${address}</p>` : ""}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 25px 40px; text-align: center;">
              <p style="margin: 0 0 8px; color: rgba(255,255,255,0.7); font-size: 13px;">
                © ${new Date().getFullYear()} ${showroomName} - ${showroomNameEn}
              </p>
              <p style="margin: 0;">
                <a href="#" style="color: #D4AF37; text-decoration: none; font-size: 12px;">${isRTL ? "إلغاء الاشتراك" : "Unsubscribe"}</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            {isRTL ? "معاينة وتحرير البريد الإلكتروني" : "Email Preview & Editor"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[calc(95vh-180px)]">
          {/* Left Panel - Editor */}
          <div className="w-1/2 border-l p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Subject */}
              <div className="space-y-2">
                <Label>{isRTL ? "عنوان البريد" : "Email Subject"}</Label>
                <Input value={subject} onChange={(e) => onSubjectChange(e.target.value)} placeholder={isRTL ? "أدخل عنوان البريد..." : "Enter email subject..."} />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label>{isRTL ? "محتوى البريد" : "Email Content"}</Label>
                <Textarea value={content} onChange={(e) => onContentChange(e.target.value)} rows={10} placeholder={isRTL ? "أدخل محتوى البريد..." : "Enter email content..."} className="resize-none" />
              </div>

              {/* Cars Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    {isRTL ? "إضافة سيارات (اختياري)" : "Add Cars (Optional)"}
                  </Label>
                  <Button variant="ghost" size="sm" onClick={fetchFeaturedCars} disabled={loadingCars}>
                    <RefreshCw className={`w-4 h-4 ${loadingCars ? "animate-spin" : ""}`} />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{isRTL ? "اختر حتى 3 سيارات لعرضها في البريد" : "Select up to 3 cars to display in the email"}</p>

                {loadingCars ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {cars.map((car) => (
                      <div
                        key={car.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${selectedCars.includes(car.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                          }`}
                        onClick={() => toggleCarSelection(car.id)}
                      >
                        <Checkbox checked={selectedCars.includes(car.id)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{isRTL ? car.name_ar : car.name}</p>
                          <p className="text-xs text-muted-foreground">{car.price.toLocaleString()} {isRTL ? "ر.س" : "SAR"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedCars.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {selectedCars.map((carId) => {
                      const car = cars.find((c) => c.id === carId);
                      return car ? (
                        <Badge key={carId} variant="secondary" className="gap-1">
                          {isRTL ? car.name_ar : car.name}
                          <button onClick={() => toggleCarSelection(carId)} className="ml-1 hover:text-destructive">×</button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Custom Images Upload */}
              <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    {isRTL ? "صور إضافية (اختياري)" : "Custom Images (Optional)"}
                  </Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage || customImages.length >= 3}
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 ml-1" />
                        {isRTL ? "رفع صورة" : "Upload"}
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? "رفع حتى 3 صور (الحد الأقصى 5MB لكل صورة)" : "Upload up to 3 images (max 5MB each)"}
                </p>

                {customImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {customImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Custom ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => removeCustomImage(index)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Test Email */}
              <div className="space-y-2 p-4 rounded-lg bg-muted/50 border">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {isRTL ? "إرسال تجريبي" : "Send Test Email"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder={isRTL ? "أدخل بريدك الإلكتروني..." : "Enter your email..."}
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={sendTestEmail} disabled={sendingTest}>
                    {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-1/2 bg-muted/30 flex flex-col">
            {/* Preview Controls */}
            <div className="flex items-center justify-between p-3 border-b bg-background">
              <span className="text-sm font-medium">{isRTL ? "معاينة" : "Preview"}</span>
              <div className="flex gap-1">
                <Button
                  variant={previewMode === "desktop" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewMode("desktop")}
                  title={isRTL ? "سطح المكتب" : "Desktop"}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={previewMode === "mobile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewMode("mobile")}
                  title={isRTL ? "الجوال" : "Mobile"}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                  title={darkMode ? (isRTL ? "الوضع الفاتح" : "Light Mode") : (isRTL ? "الوضع المظلم" : "Dark Mode")}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatePreviewHTML());
                    toast({
                      title: isRTL ? "تم النسخ" : "Copied",
                      description: isRTL ? "تم نسخ كود HTML" : "HTML code copied",
                    });
                  }}
                  title={isRTL ? "نسخ HTML" : "Copy HTML"}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Preview Frame */}
            <div className={`flex-1 p-4 overflow-auto flex items-start justify-center transition-colors ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
              <div
                className={`bg-white shadow-xl rounded-lg overflow-hidden transition-all ${previewMode === "mobile" ? "w-[375px]" : "w-full max-w-[620px]"
                  }`}
              >
                <iframe
                  key={previewKey}
                  srcDoc={generatePreviewHTML()}
                  className="w-full h-[600px] border-0"
                  title="Email Preview"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t">
          <div className="flex gap-3 w-full justify-end">
            <Button variant="outline" onClick={onSave}>
              <Save className="w-4 h-4 ml-2" />
              {isRTL ? "حفظ كمسودة" : "Save as Draft"}
            </Button>
            <Button onClick={onSend} disabled={sending}>
              {sending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Send className="w-4 h-4 ml-2" />}
              {isRTL ? "حفظ وإرسال للجميع" : "Save & Send to All"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailPreviewDialog;
