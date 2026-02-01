import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Package, Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface Accessory {
  id: string;
  name: string;
  name_ar: string;
  description?: string;
  description_ar?: string;
  price: number;
  original_price?: number;
  image_url?: string;
  category?: string;
  is_active: boolean;
  stock: number;
}

const AccessoriesManagement = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    name_ar: "",
    description: "",
    description_ar: "",
    price: "",
    original_price: "",
    image_url: "",
    category: "",
    stock: "0"
  });

  useEffect(() => {
    fetchAccessories();
  }, []);

  const fetchAccessories = async () => {
    try {
      const { data, error } = await supabase
        .from("accessories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccessories(data || []);
    } catch (error: any) {
      console.error("Error fetching accessories:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const saveData = {
        name: formData.name,
        name_ar: formData.name_ar,
        description: formData.description,
        description_ar: formData.description_ar,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        image_url: formData.image_url,
        category: formData.category,
        stock: parseInt(formData.stock)
      };

      if (editingId) {
        const { error } = await supabase
          .from("accessories")
          .update(saveData)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("accessories")
          .insert(saveData);
        if (error) throw error;
      }

      toast({
        title: isRTL ? "تم الحفظ" : "Saved",
        description: isRTL ? "تم حفظ الإكسسوار بنجاح" : "Accessory saved successfully"
      });

      setIsDialogOpen(false);
      resetForm();
      fetchAccessories();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message
      });
    }
  };

  const handleEdit = (accessory: Accessory) => {
    setEditingId(accessory.id);
    setFormData({
      name: accessory.name,
      name_ar: accessory.name_ar,
      description: accessory.description || "",
      description_ar: accessory.description_ar || "",
      price: accessory.price.toString(),
      original_price: accessory.original_price?.toString() || "",
      image_url: accessory.image_url || "",
      category: accessory.category || "",
      stock: accessory.stock.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("accessories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: isRTL ? "تم الحذف" : "Deleted",
        description: isRTL ? "تم حذف الإكسسوار" : "Accessory deleted"
      });

      fetchAccessories();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("accessories")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      fetchAccessories();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      name_ar: "",
      description: "",
      description_ar: "",
      price: "",
      original_price: "",
      image_url: "",
      category: "",
      stock: "0"
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            {isRTL ? "إدارة الإكسسوارات" : "Accessories Management"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isRTL ? "إضافة وإدارة إكسسوارات السيارات" : "Add and manage car accessories"}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {isRTL ? "إضافة إكسسوار" : "Add Accessory"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId
                  ? (isRTL ? "تعديل الإكسسوار" : "Edit Accessory")
                  : (isRTL ? "إضافة إكسسوار جديد" : "Add New Accessory")}
              </DialogTitle>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{isRTL ? "الاسم (عربي)" : "Name (Arabic)"}</label>
                <Input
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder={isRTL ? "اسم الإكسسوار بالعربية" : "Accessory name in Arabic"}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{isRTL ? "الاسم (إنجليزي)" : "Name (English)"}</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isRTL ? "اسم الإكسسوار بالإنجليزية" : "Accessory name in English"}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{isRTL ? "السعر" : "Price"}</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{isRTL ? "السعر الأصلي" : "Original Price"}</label>
                <Input
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{isRTL ? "الفئة" : "Category"}</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder={isRTL ? "فئة الإكسسوار" : "Accessory category"}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{isRTL ? "المخزون" : "Stock"}</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">{isRTL ? "رابط الصورة" : "Image URL"}</label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{isRTL ? "الوصف (عربي)" : "Description (Arabic)"}</label>
                <Textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{isRTL ? "الوصف (إنجليزي)" : "Description (English)"}</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button onClick={handleSave}>
                {isRTL ? "حفظ" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isRTL ? "الصورة" : "Image"}</TableHead>
                <TableHead>{isRTL ? "الاسم" : "Name"}</TableHead>
                <TableHead>{isRTL ? "الفئة" : "Category"}</TableHead>
                <TableHead>{isRTL ? "السعر" : "Price"}</TableHead>
                <TableHead>{isRTL ? "المخزون" : "Stock"}</TableHead>
                <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                <TableHead>{isRTL ? "إجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessories.map((accessory) => (
                <TableRow key={accessory.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded overflow-hidden bg-muted">
                      <img
                        src={accessory.image_url || "/placeholder.svg"}
                        alt={accessory.name_ar}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{accessory.name_ar}</TableCell>
                  <TableCell>{accessory.category || "-"}</TableCell>
                  <TableCell>{formatPrice(accessory.price)}</TableCell>
                  <TableCell>{accessory.stock}</TableCell>
                  <TableCell>
                    <Badge
                      variant={accessory.is_active ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleStatus(accessory.id, accessory.is_active)}
                    >
                      {accessory.is_active
                        ? (isRTL ? "نشط" : "Active")
                        : (isRTL ? "غير نشط" : "Inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(accessory)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(accessory.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {accessories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {isRTL ? "لا توجد إكسسوارات" : "No accessories found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessoriesManagement;
