import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTenant } from "@/contexts/TenantContext";
import { Tag, Plus, Pencil, Trash2, Loader2, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const BrandsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const { tenant } = useTenant();
  const isRTL = language === "ar";

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: brands, isLoading } = useQuery({
    queryKey: ["admin-brands", tenant?.id],
    queryFn: async () => {
      if (!tenant) return [];
      const { data } = await supabase
        .from("brands")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("sort_order");
      return data || [];
    },
    enabled: !!tenant,
  });

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `brand-${Date.now()}.${fileExt}`;
      const filePath = `brands/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('car-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('car-images')
        .getPublicUrl(filePath);

      setLogoUrl(publicUrl);
      toast({ title: isRTL ? "تم رفع الشعار" : "Logo uploaded" });
    } catch (error) {
      toast({ variant: "destructive", title: isRTL ? "فشل رفع الشعار" : "Logo upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const saveBrand = useMutation({
    mutationFn: async (brandData: any) => {
      if (editingBrand) {
        const { error } = await supabase.from("brands").update(brandData).eq("id", editingBrand.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("brands").insert({
          ...brandData,
          tenant_id: tenant?.id
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      setIsDialogOpen(false);
      setEditingBrand(null);
      setLogoUrl("");
      toast({ title: editingBrand ? (isRTL ? "تم تحديث الماركة" : "Brand updated") : (isRTL ? "تم إضافة الماركة" : "Brand added") });
    },
  });

  const deleteBrand = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("brands").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      toast({ title: isRTL ? "تم حذف الماركة" : "Brand deleted" });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("brands").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    saveBrand.mutate({
      name: formData.get("name"),
      name_ar: formData.get("name_ar"),
      logo_url: logoUrl || null,
      sort_order: formData.get("sort_order") ? Number(formData.get("sort_order")) : 0,
      is_active: true,
    });
  };

  const openEditDialog = (brand: any) => {
    setEditingBrand(brand);
    setLogoUrl(brand.logo_url || "");
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          {isRTL ? "إدارة الماركات" : "Brands Management"}
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingBrand(null);
            setLogoUrl("");
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="gold" size="sm">
              <Plus className="h-4 w-4 ml-1" />
              {isRTL ? "إضافة ماركة" : "Add Brand"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? (isRTL ? "تعديل الماركة" : "Edit Brand") : (isRTL ? "إضافة ماركة جديدة" : "Add New Brand")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isRTL ? "الاسم بالعربي *" : "Name (Arabic) *"}</Label>
                  <Input name="name_ar" defaultValue={editingBrand?.name_ar} required />
                </div>
                <div>
                  <Label>{isRTL ? "الاسم بالإنجليزي *" : "Name (English) *"}</Label>
                  <Input name="name" defaultValue={editingBrand?.name} required />
                </div>
              </div>
              <div>
                <Label>{isRTL ? "ترتيب العرض" : "Sort Order"}</Label>
                <Input name="sort_order" type="number" defaultValue={editingBrand?.sort_order || 0} />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "الشعار" : "Logo"}</Label>
                {logoUrl ? (
                  <div className="relative w-24">
                    <img src={logoUrl} alt="" className="w-24 h-24 object-contain rounded-lg bg-secondary" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -left-2 h-6 w-6"
                      onClick={() => setLogoUrl("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="brand-logo"
                      onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                    />
                    <label htmlFor="brand-logo" className="cursor-pointer">
                      {uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                      ) : (
                        <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                      )}
                      <p className="text-sm text-muted-foreground mt-1">{isRTL ? "رفع شعار" : "Upload logo"}</p>
                    </label>
                  </div>
                )}
              </div>
              <Button type="submit" variant="gold" className="w-full" disabled={saveBrand.isPending}>
                {saveBrand.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (isRTL ? "حفظ" : "Save")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {brands?.map(brand => (
              <div
                key={brand.id}
                className={`p-4 rounded-lg border transition-colors ${
                  brand.is_active ? "bg-secondary/30 border-border/50" : "bg-muted/30 border-muted opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  {brand.logo_url ? (
                    <div className="h-12 w-24 rounded bg-secondary flex items-center justify-center">
                      <img
                        src={brand.logo_url}
                        alt={brand.name_ar}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                        className="max-h-10 max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-24 rounded bg-secondary flex items-center justify-center">
                      <Tag className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(brand)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(isRTL ? "هل أنت متأكد؟" : "Are you sure?")) {
                          deleteBrand.mutate(brand.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <h4 className="font-semibold">{brand.name_ar}</h4>
                <p className="text-sm text-muted-foreground">{brand.name}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">{isRTL ? "الترتيب:" : "Order:"} {brand.sort_order}</span>
                  <Switch
                    checked={brand.is_active}
                    onCheckedChange={(checked) => toggleActive.mutate({ id: brand.id, is_active: checked })}
                  />
                </div>
              </div>
            ))}
            {(!brands || brands.length === 0) && (
              <p className="text-center text-muted-foreground py-8 col-span-full">
                {isRTL ? "لا توجد ماركات" : "No brands found"}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BrandsManagement;
