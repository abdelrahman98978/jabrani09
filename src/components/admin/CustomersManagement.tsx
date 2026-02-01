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
import { Users, Search, Loader2, Plus, Pencil, Trash2, Phone, Mail, MapPin, Crown, Star, UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const CustomersManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  const { data: customers, isLoading } = useQuery({
    queryKey: ["admin-customers", typeFilter],
    queryFn: async () => {
      let query = supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (typeFilter !== "all") {
        query = query.eq("customer_type", typeFilter);
      }

      const { data } = await query;
      
      if (searchTerm) {
        return data?.filter(customer => 
          customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.includes(searchTerm) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];
      }
      
      return data || [];
    },
  });

  const saveCustomer = useMutation({
    mutationFn: async (customerData: any) => {
      if (editingCustomer) {
        const { error } = await supabase.from("customers").update(customerData).eq("id", editingCustomer.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("customers").insert(customerData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      setIsDialogOpen(false);
      setEditingCustomer(null);
      toast({ title: editingCustomer ? (isRTL ? "تم تحديث العميل" : "Customer updated") : (isRTL ? "تم إضافة العميل" : "Customer added") });
    },
  });

  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      toast({ title: isRTL ? "تم حذف العميل" : "Customer deleted" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    saveCustomer.mutate({
      name: formData.get("name"),
      email: formData.get("email") || null,
      phone: formData.get("phone"),
      whatsapp: formData.get("whatsapp") || null,
      city: formData.get("city") || null,
      customer_type: formData.get("customer_type"),
      notes: formData.get("notes") || null,
    });
  };

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; class: string; icon: any }> = {
      new: { label: isRTL ? "جديد" : "New", class: "bg-blue-500/20 text-blue-400", icon: UserPlus },
      potential: { label: isRTL ? "محتمل" : "Potential", class: "bg-amber-500/20 text-amber-400", icon: Star },
      regular: { label: isRTL ? "دائم" : "Regular", class: "bg-green-500/20 text-green-400", icon: Users },
      vip: { label: isRTL ? "VIP" : "VIP", class: "bg-purple-500/20 text-purple-400", icon: Crown },
    };
    return typeMap[type] || { label: type, class: "bg-muted text-muted-foreground", icon: Users };
  };

  const openEditDialog = (customer: any) => {
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 flex-wrap">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {isRTL ? "إدارة العملاء" : "Customers Management"}
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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? "الكل" : "All"}</SelectItem>
              <SelectItem value="new">{isRTL ? "جديد" : "New"}</SelectItem>
              <SelectItem value="potential">{isRTL ? "محتمل" : "Potential"}</SelectItem>
              <SelectItem value="regular">{isRTL ? "دائم" : "Regular"}</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingCustomer(null);
          }}>
            <DialogTrigger asChild>
              <Button variant="gold" size="sm">
                <Plus className="h-4 w-4 ml-1" />
                {isRTL ? "إضافة عميل" : "Add Customer"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingCustomer ? (isRTL ? "تعديل العميل" : "Edit Customer") : (isRTL ? "إضافة عميل جديد" : "Add New Customer")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>{isRTL ? "الاسم *" : "Name *"}</Label>
                  <Input name="name" defaultValue={editingCustomer?.name} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{isRTL ? "رقم الهاتف *" : "Phone *"}</Label>
                    <Input name="phone" defaultValue={editingCustomer?.phone} required />
                  </div>
                  <div>
                    <Label>{isRTL ? "واتساب" : "WhatsApp"}</Label>
                    <Input name="whatsapp" defaultValue={editingCustomer?.whatsapp} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{isRTL ? "البريد الإلكتروني" : "Email"}</Label>
                    <Input name="email" type="email" defaultValue={editingCustomer?.email} />
                  </div>
                  <div>
                    <Label>{isRTL ? "المدينة" : "City"}</Label>
                    <Input name="city" defaultValue={editingCustomer?.city} />
                  </div>
                </div>
                <div>
                  <Label>{isRTL ? "تصنيف العميل" : "Customer Type"}</Label>
                  <Select name="customer_type" defaultValue={editingCustomer?.customer_type || "new"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">{isRTL ? "جديد" : "New"}</SelectItem>
                      <SelectItem value="potential">{isRTL ? "محتمل" : "Potential"}</SelectItem>
                      <SelectItem value="regular">{isRTL ? "دائم" : "Regular"}</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isRTL ? "ملاحظات" : "Notes"}</Label>
                  <Textarea name="notes" defaultValue={editingCustomer?.notes} />
                </div>
                <Button type="submit" variant="gold" className="w-full" disabled={saveCustomer.isPending}>
                  {saveCustomer.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (isRTL ? "حفظ" : "Save")}
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers?.map(customer => {
              const type = getTypeBadge(customer.customer_type);
              const TypeIcon = type.icon;
              
              return (
                <div
                  key={customer.id}
                  className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <TypeIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{customer.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${type.class}`}>
                          {type.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(customer)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(isRTL ? "هل أنت متأكد من حذف هذا العميل؟" : "Are you sure you want to delete this customer?")) {
                            deleteCustomer.mutate(customer.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    {customer.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{customer.city}</span>
                      </div>
                    )}
                  </div>
                  {customer.total_purchases > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-sm">
                        {isRTL ? "إجمالي المشتريات:" : "Total Purchases:"}{" "}
                        <span className="font-bold text-primary">
                          {Number(customer.total_purchases).toLocaleString()} {isRTL ? "ر.س" : "SAR"}
                        </span>
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {isRTL ? "آخر تفاعل:" : "Last interaction:"}{" "}
                    {format(new Date(customer.last_interaction || customer.created_at), "PP", { locale: isRTL ? ar : undefined })}
                  </p>
                </div>
              );
            })}
            {(!customers || customers.length === 0) && (
              <p className="text-center text-muted-foreground py-8 col-span-full">
                {isRTL ? "لا يوجد عملاء" : "No customers found"}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomersManagement;
