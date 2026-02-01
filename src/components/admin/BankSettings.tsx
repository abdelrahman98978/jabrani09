import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Building2, Loader2, Save, CreditCard, Landmark, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";

const BankSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const isRTL = language === "ar";

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
      toast({ title: isRTL ? "تم حفظ إعدادات البنك" : "Bank settings saved" });
    },
    onError: () => {
      toast({ 
        variant: "destructive",
        title: isRTL ? "فشل حفظ الإعدادات" : "Failed to save settings" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    saveSettings.mutate({
      bank_name: formData.get("bank_name"),
      bank_name_en: formData.get("bank_name_en"),
      bank_account_name: formData.get("bank_account_name"),
      bank_account_number: formData.get("bank_account_number"),
      bank_iban: formData.get("bank_iban"),
    });
  };

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
        <Building2 className="h-6 w-6" />
        {isRTL ? "إعدادات الحساب البنكي" : "Bank Account Settings"}
      </h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            {isRTL ? "معلومات الحساب البنكي" : "Bank Account Information"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isRTL 
              ? "تظهر هذه البيانات في الفواتير وصفحة الطلب للتحويل البنكي"
              : "This information appears in invoices and order pages for bank transfers"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-medium text-primary flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {isRTL 
                  ? "💳 أدخل بيانات حسابك البنكي ليتمكن العملاء من التحويل مباشرة"
                  : "💳 Enter your bank details so customers can transfer directly"}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Landmark className="h-4 w-4" />
                  {isRTL ? "اسم البنك بالعربي" : "Bank Name (Arabic)"}
                </Label>
                <Input 
                  name="bank_name" 
                  defaultValue={settings?.bank_name || ""} 
                  placeholder={isRTL ? "مثال: بنك الراجحي" : "Example: Al Rajhi Bank"}
                  className="text-right"
                />
              </div>
              <div>
                <Label>{isRTL ? "اسم البنك بالإنجليزي" : "Bank Name (English)"}</Label>
                <Input 
                  name="bank_name_en" 
                  defaultValue={settings?.bank_name_en || ""} 
                  placeholder="Example: Al Rajhi Bank"
                />
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {isRTL ? "اسم صاحب الحساب" : "Account Holder Name"}
              </Label>
              <Input 
                name="bank_account_name" 
                defaultValue={settings?.bank_account_name || ""} 
                placeholder={isRTL ? "الاسم كما يظهر في الحساب" : "Name as it appears on the account"}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? "رقم الحساب" : "Account Number"}</Label>
                <Input 
                  name="bank_account_number" 
                  defaultValue={settings?.bank_account_number || ""} 
                  placeholder="XXXXXXXXXX"
                  dir="ltr"
                />
              </div>
              <div>
                <Label>{isRTL ? "رقم الآيبان (IBAN)" : "IBAN Number"}</Label>
                <Input 
                  name="bank_iban" 
                  defaultValue={settings?.bank_iban || ""} 
                  placeholder="SA0000000000000000000000"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" variant="default" disabled={saveSettings.isPending}>
                {saveSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
                {isRTL ? "حفظ إعدادات البنك" : "Save Bank Settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview */}
      {(settings?.bank_name || settings?.bank_iban) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isRTL ? "معاينة بيانات التحويل" : "Transfer Details Preview"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
              {settings?.bank_name && (
                <p><span className="font-medium">{isRTL ? "البنك:" : "Bank:"}</span> {settings.bank_name}</p>
              )}
              {settings?.bank_account_name && (
                <p><span className="font-medium">{isRTL ? "صاحب الحساب:" : "Account Holder:"}</span> {settings.bank_account_name}</p>
              )}
              {settings?.bank_account_number && (
                <p><span className="font-medium">{isRTL ? "رقم الحساب:" : "Account #:"}</span> {settings.bank_account_number}</p>
              )}
              {settings?.bank_iban && (
                <p><span className="font-medium">IBAN:</span> {settings.bank_iban}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BankSettings;
