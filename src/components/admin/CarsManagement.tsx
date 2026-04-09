import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTenant } from "@/contexts/TenantContext";
import { Plus, Pencil, Trash2, Loader2, Search, Upload, X, Eye, Car, RotateCw, Video } from "lucide-react";
import { Label } from "@/components/ui/label";

const CarsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const { tenant } = useTenant();
  const isRTL = language === "ar";

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo360, setUploadingVideo360] = useState(false);
  const [uploadingHeroVideo, setUploadingHeroVideo] = useState(false);
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [video360Url, setVideo360Url] = useState("");
  const [video360Type, setVideo360Type] = useState("equirectangular");
  const [heroVideoUrl, setHeroVideoUrl] = useState("");
  const [heroVideoOverlay, setHeroVideoOverlay] = useState("medium");

  const { data: brands } = useQuery({
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

  const { data: cars, isLoading } = useQuery({
    queryKey: ["admin-cars", searchTerm, statusFilter, tenant?.id],
    queryFn: async () => {
      if (!tenant) return [];
      
      let query = supabase
        .from("cars")
        .select("*, brands(name_ar, name)")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data } = await query;

      if (searchTerm) {
        return data?.filter(car =>
          car.name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.model?.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];
      }

      return data || [];
    },
  });

  const handleImageUpload = async (file: File, isMain: boolean = true) => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `cars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('car-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('car-images')
        .getPublicUrl(filePath);

      if (isMain) {
        setMainImageUrl(publicUrl);
      } else {
        setAdditionalImages(prev => [...prev, publicUrl]);
      }

      toast({ title: isRTL ? "تم رفع الصورة بنجاح" : "Image uploaded successfully" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: isRTL ? "فشل رفع الصورة" : "Image upload failed",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVideo360Upload = async (file: File) => {
    setUploadingVideo360(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `360-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `cars/360/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('car-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('car-images')
        .getPublicUrl(filePath);

      setVideo360Url(publicUrl);
      toast({ title: isRTL ? "تم رفع فيديو 360° بنجاح" : "360° video uploaded successfully" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: isRTL ? "فشل رفع فيديو 360°" : "360° video upload failed",
      });
    } finally {
      setUploadingVideo360(false);
    }
  };

  const handleHeroVideoUpload = async (file: File) => {
    setUploadingHeroVideo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `cars/hero/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('car-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('car-images')
        .getPublicUrl(filePath);

      setHeroVideoUrl(publicUrl);
      toast({ title: isRTL ? "تم رفع فيديو Hero بنجاح" : "Hero video uploaded successfully" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: isRTL ? "فشل رفع فيديو Hero" : "Hero video upload failed",
      });
    } finally {
      setUploadingHeroVideo(false);
    }
  };

  const deleteCar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cars").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cars"] });
      toast({ title: isRTL ? "تم حذف السيارة بنجاح" : "Car deleted successfully" });
    },
  });

  const saveCar = useMutation({
    mutationFn: async (carData: any) => {
      if (editingCar) {
        const { error } = await supabase.from("cars").update(carData).eq("id", editingCar.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cars").insert({
          ...carData,
          tenant_id: tenant?.id
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cars"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setIsDialogOpen(false);
      setEditingCar(null);
      setMainImageUrl("");
      setAdditionalImages([]);
      setVideo360Url("");
      setVideo360Type("equirectangular");
      setHeroVideoUrl("");
      setHeroVideoOverlay("medium");
      toast({ title: editingCar ? (isRTL ? "تم تحديث السيارة" : "Car updated") : (isRTL ? "تم إضافة السيارة" : "Car added") });
    },
  });

  const handleCarSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    saveCar.mutate({
      brand_id: formData.get("brand_id") || null,
      name_ar: formData.get("name_ar"),
      name: formData.get("name") || formData.get("name_ar"),
      model: formData.get("model"),
      year: Number(formData.get("year")),
      price: Number(formData.get("price")),
      original_price: formData.get("original_price") ? Number(formData.get("original_price")) : null,
      mileage: formData.get("mileage") ? Number(formData.get("mileage")) : 0,
      fuel_type: formData.get("fuel_type"),
      transmission: formData.get("transmission"),
      engine_size: formData.get("engine_size"),
      color: formData.get("color"),
      color_ar: formData.get("color_ar"),
      main_image: mainImageUrl || formData.get("main_image_url"),
      images: additionalImages.length > 0 ? additionalImages : null,
      description: formData.get("description"),
      description_ar: formData.get("description_ar"),
      status: formData.get("status"),
      is_new: formData.get("is_new") === "true",
      is_featured: formData.get("is_featured") === "true",
      has_discount: formData.get("has_discount") === "true",
      has_test_drive: formData.get("has_test_drive") === "true",
      view_360_url: formData.get("view_360_url") || null,
      video_360_url: video360Url || null,
      video_360_type: video360Type,
      video_url: heroVideoUrl || null,
      video_overlay_opacity: heroVideoOverlay,
    });
  };

  const openEditDialog = (car: any) => {
    setEditingCar(car);
    setMainImageUrl(car.main_image || "");
    setAdditionalImages(car.images || []);
    setVideo360Url(car.video_360_url || "");
    setVideo360Type(car.video_360_type || "equirectangular");
    setHeroVideoUrl(car.video_url || "");
    setHeroVideoOverlay(car.video_overlay_opacity || "medium");
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      available: { label: isRTL ? "متاحة" : "Available", class: "bg-green-500/20 text-green-400" },
      reserved: { label: isRTL ? "محجوزة" : "Reserved", class: "bg-amber-500/20 text-amber-400" },
      sold: { label: isRTL ? "مباعة" : "Sold", class: "bg-red-500/20 text-red-400" },
    };
    return statusMap[status] || { label: status, class: "bg-muted text-muted-foreground" };
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 flex-wrap">
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          {isRTL ? "إدارة السيارات" : "Cars Management"}
        </CardTitle>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isRTL ? "بحث..." : "Search..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 w-48"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? "الكل" : "All"}</SelectItem>
              <SelectItem value="available">{isRTL ? "متاحة" : "Available"}</SelectItem>
              <SelectItem value="reserved">{isRTL ? "محجوزة" : "Reserved"}</SelectItem>
              <SelectItem value="sold">{isRTL ? "مباعة" : "Sold"}</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingCar(null);
              setMainImageUrl("");
              setAdditionalImages([]);
              setVideo360Url("");
              setVideo360Type("equirectangular");
              setHeroVideoUrl("");
              setHeroVideoOverlay("medium");
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="gold" size="sm">
                <Plus className="h-4 w-4 ml-1" />
                {isRTL ? "إضافة سيارة" : "Add Car"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCar ? (isRTL ? "تعديل السيارة" : "Edit Car") : (isRTL ? "إضافة سيارة جديدة" : "Add New Car")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCarSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label>{isRTL ? "اسم السيارة بالعربي *" : "Car Name (Arabic) *"}</Label>
                    <Input name="name_ar" defaultValue={editingCar?.name_ar} required />
                  </div>
                  <div>
                    <Label>{isRTL ? "اسم السيارة بالإنجليزي" : "Car Name (English)"}</Label>
                    <Input name="name" defaultValue={editingCar?.name} />
                  </div>
                  <div>
                    <Label>{isRTL ? "الموديل *" : "Model *"}</Label>
                    <Input name="model" defaultValue={editingCar?.model} required />
                  </div>
                  <div>
                    <Label>{isRTL ? "السنة *" : "Year *"}</Label>
                    <Input name="year" type="number" defaultValue={editingCar?.year} required />
                  </div>
                  <div>
                    <Label>{isRTL ? "الماركة" : "Brand"}</Label>
                    <Select name="brand_id" defaultValue={editingCar?.brand_id}>
                      <SelectTrigger><SelectValue placeholder={isRTL ? "اختر الماركة" : "Select brand"} /></SelectTrigger>
                      <SelectContent>
                        {brands?.map(b => <SelectItem key={b.id} value={b.id}>{b.name_ar}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>{isRTL ? "السعر *" : "Price *"}</Label>
                    <Input name="price" type="number" defaultValue={editingCar?.price} required />
                  </div>
                  <div>
                    <Label>{isRTL ? "السعر قبل الخصم" : "Original Price"}</Label>
                    <Input name="original_price" type="number" defaultValue={editingCar?.original_price} />
                  </div>
                  <div>
                    <Label>{isRTL ? "الكيلومترات" : "Mileage"}</Label>
                    <Input name="mileage" type="number" defaultValue={editingCar?.mileage} />
                  </div>
                  <div>
                    <Label>{isRTL ? "حجم المحرك" : "Engine Size"}</Label>
                    <Input name="engine_size" defaultValue={editingCar?.engine_size} placeholder="2.0L" />
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>{isRTL ? "الوقود" : "Fuel Type"}</Label>
                    <Select name="fuel_type" defaultValue={editingCar?.fuel_type || "petrol"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="petrol">{isRTL ? "بنزين" : "Petrol"}</SelectItem>
                        <SelectItem value="diesel">{isRTL ? "ديزل" : "Diesel"}</SelectItem>
                        <SelectItem value="electric">{isRTL ? "كهربائي" : "Electric"}</SelectItem>
                        <SelectItem value="hybrid">{isRTL ? "هايبرد" : "Hybrid"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{isRTL ? "ناقل الحركة" : "Transmission"}</Label>
                    <Select name="transmission" defaultValue={editingCar?.transmission || "automatic"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">{isRTL ? "أوتوماتيك" : "Automatic"}</SelectItem>
                        <SelectItem value="manual">{isRTL ? "عادي" : "Manual"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{isRTL ? "اللون بالعربي" : "Color (Arabic)"}</Label>
                    <Input name="color_ar" defaultValue={editingCar?.color_ar} />
                  </div>
                  <div>
                    <Label>{isRTL ? "اللون بالإنجليزي" : "Color (English)"}</Label>
                    <Input name="color" defaultValue={editingCar?.color} />
                  </div>
                </div>

                {/* Status & Flags */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <Label>{isRTL ? "الحالة" : "Status"}</Label>
                    <Select name="status" defaultValue={editingCar?.status || "available"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">{isRTL ? "متاحة" : "Available"}</SelectItem>
                        <SelectItem value="reserved">{isRTL ? "محجوزة" : "Reserved"}</SelectItem>
                        <SelectItem value="sold">{isRTL ? "مباعة" : "Sold"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{isRTL ? "جديدة/مستعملة" : "New/Used"}</Label>
                    <Select name="is_new" defaultValue={editingCar?.is_new ? "true" : "false"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">{isRTL ? "جديدة" : "New"}</SelectItem>
                        <SelectItem value="false">{isRTL ? "مستعملة" : "Used"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{isRTL ? "مميزة" : "Featured"}</Label>
                    <Select name="is_featured" defaultValue={editingCar?.is_featured ? "true" : "false"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">{isRTL ? "نعم" : "Yes"}</SelectItem>
                        <SelectItem value="false">{isRTL ? "لا" : "No"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{isRTL ? "خصم" : "Discount"}</Label>
                    <Select name="has_discount" defaultValue={editingCar?.has_discount ? "true" : "false"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">{isRTL ? "نعم" : "Yes"}</SelectItem>
                        <SelectItem value="false">{isRTL ? "لا" : "No"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{isRTL ? "تجربة قيادة" : "Test Drive"}</Label>
                    <Select name="has_test_drive" defaultValue={editingCar?.has_test_drive ? "true" : "false"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">{isRTL ? "نعم" : "Yes"}</SelectItem>
                        <SelectItem value="false">{isRTL ? "لا" : "No"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <Label>{isRTL ? "الصور" : "Images"}</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Main Image */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{isRTL ? "الصورة الرئيسية" : "Main Image"}</p>
                      {mainImageUrl ? (
                        <div className="relative">
                          <img src={mainImageUrl} alt="" className="w-full h-40 object-cover rounded-lg" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 left-2"
                            onClick={() => setMainImageUrl("")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="main-image"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], true)}
                          />
                          <label htmlFor="main-image" className="cursor-pointer">
                            {uploadingImage ? (
                              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                            ) : (
                              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                            )}
                            <p className="text-sm text-muted-foreground mt-2">
                              {isRTL ? "اضغط لرفع صورة" : "Click to upload"}
                            </p>
                          </label>
                        </div>
                      )}
                      <Input name="main_image_url" placeholder={isRTL ? "أو أدخل رابط الصورة" : "Or enter image URL"} value={mainImageUrl} onChange={(e) => setMainImageUrl(e.target.value)} />
                    </div>

                    {/* Additional Images */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{isRTL ? "صور إضافية" : "Additional Images"}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {additionalImages.map((img, idx) => (
                          <div key={idx} className="relative">
                            <img src={img} alt="" className="w-full h-20 object-cover rounded" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -left-2 h-6 w-6"
                              onClick={() => setAdditionalImages(prev => prev.filter((_, i) => i !== idx))}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <div className="border-2 border-dashed border-border rounded p-2 text-center">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="additional-image"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], false)}
                          />
                          <label htmlFor="additional-image" className="cursor-pointer">
                            <Plus className="h-6 w-6 mx-auto text-muted-foreground" />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 360 Video Section */}
                <div className="space-y-4 border-2 border-dashed border-primary/30 rounded-lg p-4 bg-primary/5">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <RotateCw className="h-5 w-5 text-primary" />
                    {isRTL ? "فيديو 360 درجة" : "360° Video"}
                  </Label>

                  {/* Video Preview */}
                  {video360Url && (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary">
                      <video
                        src={video360Url}
                        className="w-full h-full object-cover"
                        controls
                        muted
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 left-2"
                        onClick={() => setVideo360Url("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold">
                        360°
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Upload Video */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? "رفع فيديو 360°" : "Upload 360° Video"}
                      </p>
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          className="hidden"
                          id="video-360"
                          onChange={(e) => e.target.files?.[0] && handleVideo360Upload(e.target.files[0])}
                        />
                        <label htmlFor="video-360" className="cursor-pointer">
                          {uploadingVideo360 ? (
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                          ) : (
                            <Video className="h-8 w-8 mx-auto text-muted-foreground" />
                          )}
                          <p className="text-sm text-muted-foreground mt-2">
                            {isRTL ? "MP4 أو WebM بتنسيق Equirectangular" : "MP4 or WebM in Equirectangular format"}
                          </p>
                        </label>
                      </div>
                    </div>

                    {/* Video URL Input */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? "أو أدخل رابط فيديو" : "Or enter video URL"}
                      </p>
                      <Input
                        placeholder="https://example.com/360-video.mp4"
                        value={video360Url}
                        onChange={(e) => setVideo360Url(e.target.value)}
                      />

                      {/* Projection Type */}
                      <div className="pt-2">
                        <Label className="text-sm">{isRTL ? "نوع الإسقاط" : "Projection Type"}</Label>
                        <Select value={video360Type} onValueChange={setVideo360Type}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equirectangular">
                              {isRTL ? "Equirectangular (الأكثر شيوعاً)" : "Equirectangular (Most common)"}
                            </SelectItem>
                            <SelectItem value="cubemap">Cubemap</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {isRTL
                      ? "💡 نصيحة: يُفضل استخدام فيديو بدقة 4K للحصول على أفضل تجربة 360°"
                      : "💡 Tip: Use 4K resolution video for the best 360° experience"}
                  </p>

                  {/* External 360 View URL */}
                  <div className="pt-4 mt-4 border-t border-border/50">
                    <Label className="mb-2 block">{isRTL ? "رابط عرض 360° خارجي (وكالة أو مشغل ويب)" : "External 360° View URL (Agency or Web Player)"}</Label>
                    <Input
                      name="view_360_url"
                      defaultValue={editingCar?.view_360_url || ""}
                      placeholder="https://example.com/360-view-iframe"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {isRTL ? "سيتم استخدام هذا الرابط لعرض مشغل 360 درجة عبر iframe إذا تم توفيره." : "This URL will be used to display a 360 player via iframe if provided."}
                    </p>
                  </div>
                </div>

                {/* Hero Video Section */}
                <div className="space-y-4 border-2 border-dashed border-amber-500/30 rounded-lg p-4 bg-amber-500/5">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <Video className="h-5 w-5 text-amber-500" />
                    {isRTL ? "فيديو Hero (صفحة التفاصيل)" : "Hero Video (Details Page)"}
                  </Label>

                  <p className="text-sm text-muted-foreground">
                    {isRTL
                      ? "هذا الفيديو سيظهر كخلفية سينمائية في أعلى صفحة تفاصيل السيارة مع نصوص متحركة"
                      : "This video will appear as a cinematic background at the top of the car details page with animated text"}
                  </p>

                  {/* Video Preview */}
                  {heroVideoUrl && (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary">
                      <video
                        src={heroVideoUrl}
                        className="w-full h-full object-cover"
                        controls
                        muted
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 left-2"
                        onClick={() => setHeroVideoUrl("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        Hero
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Upload Video */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? "رفع فيديو Hero" : "Upload Hero Video"}
                      </p>
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          className="hidden"
                          id="video-hero"
                          onChange={(e) => e.target.files?.[0] && handleHeroVideoUpload(e.target.files[0])}
                        />
                        <label htmlFor="video-hero" className="cursor-pointer">
                          {uploadingHeroVideo ? (
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500" />
                          ) : (
                            <Video className="h-8 w-8 mx-auto text-muted-foreground" />
                          )}
                          <p className="text-sm text-muted-foreground mt-2">
                            {isRTL ? "MP4 أو WebM (يُفضل 1080p أو أعلى)" : "MP4 or WebM (1080p or higher recommended)"}
                          </p>
                        </label>
                      </div>
                    </div>

                    {/* Video URL Input */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? "أو أدخل رابط فيديو" : "Or enter video URL"}
                      </p>
                      <Input
                        placeholder="https://example.com/hero-video.mp4"
                        value={heroVideoUrl}
                        onChange={(e) => setHeroVideoUrl(e.target.value)}
                      />

                      {/* Overlay Opacity */}
                      <div className="pt-2">
                        <Label className="text-sm">{isRTL ? "شفافية الغلاف" : "Overlay Opacity"}</Label>
                        <Select value={heroVideoOverlay} onValueChange={setHeroVideoOverlay}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">
                              {isRTL ? "خفيف (للفيديوهات الداكنة)" : "Light (for dark videos)"}
                            </SelectItem>
                            <SelectItem value="medium">
                              {isRTL ? "متوسط (الافتراضي)" : "Medium (default)"}
                            </SelectItem>
                            <SelectItem value="dark">
                              {isRTL ? "داكن (للفيديوهات الفاتحة)" : "Dark (for bright videos)"}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {isRTL
                      ? "🎬 نصيحة: استخدم فيديو قصير (5-15 ثانية) مع حلقة تكرار للحصول على أفضل تجربة"
                      : "🎬 Tip: Use a short looping video (5-15 seconds) for the best experience"}
                  </p>
                </div>

                {/* Description */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>{isRTL ? "الوصف بالعربي" : "Description (Arabic)"}</Label>
                    <Textarea name="description_ar" defaultValue={editingCar?.description_ar} rows={4} />
                  </div>
                  <div>
                    <Label>{isRTL ? "الوصف بالإنجليزي" : "Description (English)"}</Label>
                    <Textarea name="description" defaultValue={editingCar?.description} rows={4} />
                  </div>
                </div>

                <Button type="submit" variant="gold" className="w-full" disabled={saveCar.isPending}>
                  {saveCar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (isRTL ? "حفظ" : "Save")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          </div>
        ) : (
          <div className="space-y-3">
            {cars?.map(car => {
              const status = getStatusBadge(car.status || "available");
              return (
                <div
                  key={car.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <img
                    src={car.main_image || "/placeholder.svg"}
                    alt=""
                    className="h-20 w-28 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold truncate">{car.name_ar}</h4>
                      {car.is_featured && (
                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                          {isRTL ? "مميزة" : "Featured"}
                        </span>
                      )}
                      {car.has_discount && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                          {isRTL ? "خصم" : "Discount"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {car.brands?.name_ar} • {car.model} • {car.year}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Eye className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{car.views_count || 0}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.class}`}>
                    {status.label}
                  </span>
                  <div className="text-left">
                    {car.original_price && car.original_price > car.price && (
                      <p className="text-xs text-muted-foreground line-through">
                        {car.original_price.toLocaleString()}
                      </p>
                    )}
                    <p className="font-bold text-primary">
                      {car.price?.toLocaleString()} {isRTL ? "ج.س" : "SDG"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(car)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(isRTL ? "هل أنت متأكد من حذف هذه السيارة؟" : "Are you sure you want to delete this car?")) {
                          deleteCar.mutate(car.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {(!cars || cars.length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                {isRTL ? "لا توجد سيارات" : "No cars found"}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CarsManagement;
