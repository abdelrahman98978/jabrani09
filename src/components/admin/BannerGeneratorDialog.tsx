import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, Loader2, Download, ImageIcon, RefreshCw, Upload } from "lucide-react";

interface BannerGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBannerGenerated?: (imageUrl: string) => void;
  onUseAsHero?: (imageBase64: string) => void;
}

const BannerGeneratorDialog = ({ 
  open, 
  onOpenChange, 
  onBannerGenerated,
  onUseAsHero 
}: BannerGeneratorDialogProps) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("luxury");
  const [size, setSize] = useState("wide");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const styles = [
    { value: "luxury", labelAr: "فاخر", labelEn: "Luxury" },
    { value: "modern", labelAr: "عصري", labelEn: "Modern" },
    { value: "classic", labelAr: "كلاسيكي", labelEn: "Classic" },
    { value: "sporty", labelAr: "رياضي", labelEn: "Sporty" },
    { value: "professional", labelAr: "احترافي", labelEn: "Professional" },
  ];

  const sizes = [
    { value: "square", labelAr: "مربع (1:1)", labelEn: "Square (1:1)" },
    { value: "wide", labelAr: "عريض (16:9)", labelEn: "Wide (16:9)" },
    { value: "tall", labelAr: "طويل (9:16)", labelEn: "Tall (9:16)" },
  ];

  const generateBanner = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى إدخال وصف البانر" : "Please enter banner description",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-banner", {
        body: { prompt, style, size, language },
      });

      if (error) throw error;

      if (data?.imageBase64) {
        setGeneratedImage(data.imageBase64);
        onBannerGenerated?.(data.imageBase64);
        toast({
          title: isRTL ? "تم التوليد بنجاح" : "Banner generated",
          description: isRTL ? "تم إنشاء البانر بنجاح" : "Banner has been generated successfully",
        });
      } else {
        throw new Error("No image received");
      }
    } catch (error: any) {
      console.error("Error generating banner:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message || (isRTL ? "فشل توليد البانر" : "Failed to generate banner"),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBanner = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `banner-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: isRTL ? "تم التحميل" : "Downloaded",
      description: isRTL ? "تم تحميل البانر" : "Banner downloaded successfully",
    });
  };

  const useAsHeroImage = async () => {
    if (!generatedImage || !onUseAsHero) return;

    setIsUploading(true);
    try {
      // Convert base64 to blob
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      
      // Upload to storage
      const fileName = `hero-ai-${Date.now()}.png`;
      const filePath = `settings/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("car-images")
        .upload(filePath, blob, { contentType: "image/png" });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("car-images")
        .getPublicUrl(filePath);

      // Update settings with new hero image
      const { data: settings } = await supabase
        .from("settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (settings?.id) {
        await supabase
          .from("settings")
          .update({ hero_image_url: publicUrl })
          .eq("id", settings.id);
      } else {
        await supabase
          .from("settings")
          .insert({ hero_image_url: publicUrl });
      }

      onUseAsHero(publicUrl);
      onOpenChange(false);
      
      toast({
        title: isRTL ? "تم التحديث" : "Updated",
        description: isRTL ? "تم تحديث صورة الهيرو بنجاح" : "Hero image updated successfully",
      });
    } catch (error) {
      console.error("Error uploading hero image:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل رفع الصورة" : "Failed to upload image",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setPrompt("");
    setGeneratedImage(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {isRTL ? "توليد بانر بالذكاء الاصطناعي" : "AI Banner Generator"}
          </DialogTitle>
          <DialogDescription>
            {isRTL 
              ? "أنشئ بانرات تسويقية احترافية بالذكاء الاصطناعي" 
              : "Create professional marketing banners with AI"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{isRTL ? "وصف البانر" : "Banner Description"}</Label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isRTL 
                ? "مثال: سيارات فاخرة في معرض حديث مع إضاءة ذهبية..." 
                : "Example: Luxury cars in a modern showroom with golden lighting..."}
              className={isRTL ? "text-right" : ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isRTL ? "النمط" : "Style"}</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {isRTL ? s.labelAr : s.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? "الحجم" : "Size"}</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {isRTL ? s.labelAr : s.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateBanner} 
            disabled={isGenerating} 
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isRTL ? "جاري التوليد..." : "Generating..."}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {isRTL ? "توليد البانر" : "Generate Banner"}
              </>
            )}
          </Button>

          {/* Generated Image Preview */}
          {generatedImage && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border bg-muted">
                <img 
                  src={generatedImage} 
                  alt="Generated banner" 
                  className="w-full h-auto"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadBanner}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isRTL ? "تحميل" : "Download"}
                </Button>

                {onUseAsHero && (
                  <Button 
                    variant="gold" 
                    size="sm" 
                    onClick={useAsHeroImage}
                    disabled={isUploading}
                    className="gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {isRTL ? "استخدام كصورة هيرو" : "Use as Hero Image"}
                  </Button>
                )}

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetForm}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {isRTL ? "توليد جديد" : "Generate New"}
                </Button>
              </div>
            </div>
          )}

          {/* Placeholder when no image */}
          {!generatedImage && !isGenerating && (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-muted/50">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                {isRTL 
                  ? "أدخل وصف البانر واضغط على توليد لرؤية النتيجة" 
                  : "Enter banner description and click generate to see the result"}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BannerGeneratorDialog;
