import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTenant } from "@/contexts/TenantContext";
import { Tag, Plus, Pencil, Trash2, Loader2, Percent, Gift, Star, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const PromotionsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const { tenant } = useTenant();
  const isRTL = language === "ar";

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);

  const { data: promotions, isLoading } = useQuery({
    queryKey: ["admin-promotions", tenant?.id],
    enabled: !!tenant?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("promotions")
        .select("*")
        .eq("tenant_id", tenant!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const savePromotion = useMutation({
    mutationFn: async (promotionData: any) => {
      if (editingPromotion) {
        const { error } = await supabase.from("promotions").update(promotionData).eq("id", editingPromotion.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("promotions").insert({ ...promotionData, tenant_id: tenant?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promotions", tenant?.id] });
      setIsDialogOpen(false);
      setEditingPromotion(null);
      toast({ title: editingPromotion ? (isRTL ? "تم تحديث العرض" : "Promotion updated") : (isRTL ? "تم إضافة العرض" : "Promotion added") });
    },
  });

  const deletePromotion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promotions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      toast({ title: isRTL ? "تم حذف العرض" : "Promotion deleted" });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("promotions").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    savePromotion.mutate({
      name: formData.get("name"),
      name_ar: formData.get("name_ar"),
      description: formData.get("description") || null,
      description_ar: formData.get("description_ar") || null,
      type: formData.get("type"),
      discount_type: formData.get("discount_type") || null,
      discount_value: formData.get("discount_value") ? Number(formData.get("discount_value")) : null,
      coupon_code: formData.get("coupon_code") || null,
      usage_limit: formData.get("usage_limit") ? Number(formData.get("usage_limit")) : null,
      start_date: formData.get("start_date") || null,
      end_date: formData.get("end_date") || null,
      min_price: formData.get("min_price") ? Number(formData.get("min_price")) : null,
      max_price: formData.get("max_price") ? Number(formData.get("max_price")) : null,
      is_active: true,
    });
  };

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; class: string; icon: any }> = {
      discount: { label: isRTL ? "خصم" : "Discount", class: "bg-green-500/20 text-green-400", icon: Percent },
      coupon: { label: isRTL ? "كوبون" : "Coupon", class: "bg-blue-500/20 text-blue-400", icon: Tag },
      featured: { label: isRTL ? "مميز" : "Featured", class: "bg-amber-500/20 text-amber-400", icon: Star },
      special_offer: { label: isRTL ? "عرض خاص" : "Special Offer", class: "bg-purple-500/20 text-purple-400", icon: Gift },
    };
    return typeMap[type] || { label: type, class: "bg-muted text-muted-foreground", icon: Tag };
  };

  const openEditDialog = (promotion: any) => {
    setEditingPromotion(promotion);
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 flex-wrap">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          {isRTL ? "العروض والتسويق" : "Promotions & Marketing"}
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingPromotion(null);
        }}>
          <DialogTrigger asChild>
            <Button variant="gold" size="sm">
              <Plus className="h-4 w-4 ml-1" />
              {isRTL ? "إضافة عرض" : "Add Promotion"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingPromotion ? (isRTL ? "تعديل العرض" : "Edit Promotion") : (isRTL ? "إضافة عرض جديد" : "Add New Promotion")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isRTL ? "الاسم بالعربي *" : "Name (Arabic) *"}</Label>
                  <Input name="name_ar" defaultValue={editingPromotion?.name_ar} required />
                </div>
                <div>
                  <Label>{isRTL ? "الاسم بالإنجليزي *" : "Name (English) *"}</Label>
                  <Input name="name" defaultValue={editingPromotion?.name} required />
                </div>
              </div>
              <div>
                <Label>{isRTL ? "نوع العرض *" : "Promotion Type *"}</Label>
                <Select name="type" defaultValue={editingPromotion?.type || "discount"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">{isRTL ? "خصم" : "Discount"}</SelectItem>
                    <SelectItem value="coupon">{isRTL ? "كوبون" : "Coupon"}</SelectItem>
                    <SelectItem value="featured">{isRTL ? "مميز" : "Featured"}</SelectItem>
                    <SelectItem value="special_offer">{isRTL ? "عرض خاص" : "Special Offer"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isRTL ? "نوع الخصم" : "Discount Type"}</Label>
                  <Select name="discount_type" defaultValue={editingPromotion?.discount_type || "percentage"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">{isRTL ? "نسبة مئوية" : "Percentage"}</SelectItem>
                      <SelectItem value="fixed">{isRTL ? "مبلغ ثابت" : "Fixed Amount"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isRTL ? "قيمة الخصم" : "Discount Value"}</Label>
                  <Input name="discount_value" type="number" defaultValue={editingPromotion?.discount_value} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isRTL ? "كود الكوبون" : "Coupon Code"}</Label>
                  <Input name="coupon_code" defaultValue={editingPromotion?.coupon_code} placeholder="SALE2024" />
                </div>
                <div>
                  <Label>{isRTL ? "حد الاستخدام" : "Usage Limit"}</Label>
                  <Input name="usage_limit" type="number" defaultValue={editingPromotion?.usage_limit} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isRTL ? "تاريخ البداية" : "Start Date"}</Label>
                  <Input name="start_date" type="datetime-local" defaultValue={editingPromotion?.start_date?.slice(0, 16)} />
                </div>
                <div>
                  <Label>{isRTL ? "تاريخ الانتهاء" : "End Date"}</Label>
                  <Input name="end_date" type="datetime-local" defaultValue={editingPromotion?.end_date?.slice(0, 16)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isRTL ? "الحد الأدنى للسعر" : "Min Price"}</Label>
                  <Input name="min_price" type="number" defaultValue={editingPromotion?.min_price} />
                </div>
                <div>
                  <Label>{isRTL ? "الحد الأقصى للسعر" : "Max Price"}</Label>
                  <Input name="max_price" type="number" defaultValue={editingPromotion?.max_price} />
                </div>
              </div>
              <div>
                <Label>{isRTL ? "الوصف بالعربي" : "Description (Arabic)"}</Label>
                <Textarea name="description_ar" defaultValue={editingPromotion?.description_ar} />
              </div>
              <div>
                <Label>{isRTL ? "الوصف بالإنجليزي" : "Description (English)"}</Label>
                <Textarea name="description" defaultValue={editingPromotion?.description} />
              </div>
              <Button type="submit" variant="gold" className="w-full" disabled={savePromotion.isPending}>
                {savePromotion.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (isRTL ? "حفظ" : "Save")}
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
          <div className="space-y-4">
            {promotions?.map(promotion => {
              const type = getTypeBadge(promotion.type);
              const TypeIcon = type.icon;
              const isExpired = promotion.end_date && new Date(promotion.end_date) < new Date();
              
              return (
                <div
                  key={promotion.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    promotion.is_active && !isExpired
                      ? "bg-secondary/30 border-border/50 hover:border-primary/30"
                      : "bg-muted/30 border-muted opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${promotion.is_active ? "bg-primary/10" : "bg-muted"}`}>
                        <TypeIcon className={`h-6 w-6 ${promotion.is_active ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{isRTL ? promotion.name_ar : promotion.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${type.class}`}>
                            {type.label}
                          </span>
                          {isExpired && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                              {isRTL ? "منتهي" : "Expired"}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {promotion.discount_value && (
                            <>
                              {promotion.discount_type === "percentage" ? `${promotion.discount_value}%` : `${promotion.discount_value} ${isRTL ? "ر.س" : "SAR"}`}
                              {" "}
                            </>
                          )}
                          {promotion.coupon_code && (
                            <span className="font-mono bg-muted px-2 py-0.5 rounded">{promotion.coupon_code}</span>
                          )}
                        </p>
                        {promotion.usage_limit && (
                          <p className="text-xs text-muted-foreground">
                            {isRTL ? "الاستخدام:" : "Usage:"} {promotion.usage_count || 0}/{promotion.usage_limit}
                          </p>
                        )}
                        {(promotion.start_date || promotion.end_date) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {promotion.start_date && format(new Date(promotion.start_date), "PP", { locale: isRTL ? ar : undefined })}
                            {promotion.start_date && promotion.end_date && " - "}
                            {promotion.end_date && format(new Date(promotion.end_date), "PP", { locale: isRTL ? ar : undefined })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">{isRTL ? "مفعل" : "Active"}</Label>
                        <Switch
                          checked={promotion.is_active}
                          onCheckedChange={(checked) => toggleActive.mutate({ id: promotion.id, is_active: checked })}
                        />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(promotion)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(isRTL ? "هل أنت متأكد من حذف هذا العرض؟" : "Are you sure you want to delete this promotion?")) {
                            deletePromotion.mutate(promotion.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {(!promotions || promotions.length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                {isRTL ? "لا توجد عروض" : "No promotions found"}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromotionsManagement;
