import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShoppingCart, Search, Loader2, Eye, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const OrdersManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("*, customers(name, phone, email), cars(name_ar, main_image, price)")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data } = await query;

      if (searchTerm) {
        return data?.filter(order =>
          order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];
      }

      return data || [];
    },
  });

  const { data: statusHistory, isLoading: statusHistoryLoading } = useQuery({
    queryKey: ["order-status-history", selectedOrder?.id],
    enabled: !!selectedOrder?.id,
    queryFn: async () => {
      if (!selectedOrder?.id) return [];

      const { data, error } = await supabase
        .from("order_status_history")
        .select("order_id, old_status, new_status, changed_by, changed_at")
        .eq("order_id", selectedOrder.id)
        .order("changed_at", { ascending: true });

      if (error) throw error;

      const userIds = Array.from(new Set((data || []).map((h: any) => h.changed_by).filter(Boolean)));

      let profilesMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds as string[]);

        if (profilesError) throw profilesError;
        (profiles || []).forEach((p: any) => {
          profilesMap[p.user_id] = p.full_name || "";
        });
      }

      return (data || []).map((h: any) => ({
        ...h,
        changed_by_name: profilesMap[h.changed_by] || h.changed_by?.slice(0, 8) || "-",
      }));
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status, payment_status, payment_method, admin_notes, bank_transfer_proof }: { id: string; status?: string; payment_status?: string; payment_method?: string; admin_notes?: string; bank_transfer_proof?: string }) => {
      const updates: any = {};
      if (status) updates.status = status;
      if (payment_status) updates.payment_status = payment_status;
      if (payment_method) updates.payment_method = payment_method;
      if (admin_notes !== undefined) updates.admin_notes = admin_notes;
      if (bank_transfer_proof !== undefined) updates.bank_transfer_proof = bank_transfer_proof;

      const { error } = await supabase.from("orders").update(updates).eq("id", id);
      if (error) throw error;

      // Send status email notification if status changed
      if (status) {
        try {
          await supabase.functions.invoke("send-order-status-email", {
            body: { order_id: id, new_status: status },
          });
        } catch (emailError) {
          console.error("Failed to send status email:", emailError);
        }

        // Send WhatsApp notification
        try {
          const { data: whatsappData } = await supabase.functions.invoke("send-whatsapp-notification", {
            body: { order_id: id, new_status: status },
          });

          if (whatsappData?.whatsapp_link) {
            // Open WhatsApp in new tab
            window.open(whatsappData.whatsapp_link, "_blank");
          }
        } catch (whatsappError) {
          console.error("Failed to prepare WhatsApp notification:", whatsappError);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({ title: isRTL ? "تم تحديث الطلب" : "Order updated" });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string; icon: any }> = {
      new: { label: isRTL ? "جديد" : "New", class: "bg-blue-500/20 text-blue-400", icon: AlertCircle },
      processing: { label: isRTL ? "قيد المعالجة" : "Processing", class: "bg-amber-500/20 text-amber-400", icon: Clock },
      reserved: { label: isRTL ? "محجوز" : "Reserved", class: "bg-purple-500/20 text-purple-400", icon: Clock },
      completed: { label: isRTL ? "مكتمل" : "Completed", class: "bg-green-500/20 text-green-400", icon: CheckCircle },
      cancelled: { label: isRTL ? "ملغى" : "Cancelled", class: "bg-red-500/20 text-red-400", icon: XCircle },
    };
    return statusMap[status] || { label: status, class: "bg-muted text-muted-foreground", icon: AlertCircle };
  };

  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      pending: { label: isRTL ? "معلق" : "Pending", class: "bg-amber-500/20 text-amber-400" },
      partial: { label: isRTL ? "جزئي" : "Partial", class: "bg-blue-500/20 text-blue-400" },
      paid: { label: isRTL ? "مدفوع" : "Paid", class: "bg-green-500/20 text-green-400" },
      refunded: { label: isRTL ? "مسترد" : "Refunded", class: "bg-red-500/20 text-red-400" },
    };
    return statusMap[status] || { label: status, class: "bg-muted text-muted-foreground" };
  };

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleBankProofUpload = async (orderId: string, file: File) => {
    setIsUploadingProof(true);
    try {
      const extension = file.name.split(".").pop() || "jpg";
      const path = `order-${orderId}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("bank-transfers")
        .upload(path, file);

      if (uploadError) throw uploadError;

      updateOrderStatus.mutate({ id: orderId, bank_transfer_proof: path });

      toast({
        title: isRTL ? "تم رفع إيصال التحويل" : "Bank transfer proof uploaded",
      });
    } catch (error: any) {
      console.error("Bank proof upload error", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ في رفع الإيصال" : "Error uploading proof",
        description: error.message,
      });
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleViewBankProof = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("bank-transfers")
        .download(path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      window.open(url, "_blank");
    } catch (error: any) {
      console.error("View bank proof error", error);
      toast({
        variant: "destructive",
        title: isRTL ? "تعذر فتح الإيصال" : "Cannot open receipt",
        description: error.message,
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {isRTL ? "إدارة الطلبات" : "Orders Management"}
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
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? "الكل" : "All"}</SelectItem>
                <SelectItem value="new">{isRTL ? "جديد" : "New"}</SelectItem>
                <SelectItem value="processing">{isRTL ? "قيد المعالجة" : "Processing"}</SelectItem>
                <SelectItem value="reserved">{isRTL ? "محجوز" : "Reserved"}</SelectItem>
                <SelectItem value="completed">{isRTL ? "مكتمل" : "Completed"}</SelectItem>
                <SelectItem value="cancelled">{isRTL ? "ملغى" : "Cancelled"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            </div>
          ) : (
            <div className="space-y-3">
              {orders?.map(order => {
                const status = getStatusBadge(order.status);
                const payment = getPaymentBadge(order.payment_status);
                const StatusIcon = status.icon;

                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => openOrderDetails(order)}
                  >
                    <div className="p-3 rounded-lg bg-primary/10">
                      <StatusIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{order.order_number}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.class}`}>
                          {status.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${payment.class}`}>
                          {payment.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.customers?.name || (isRTL ? "عميل غير معروف" : "Unknown Customer")}
                        {order.cars?.name_ar && ` • ${order.cars.name_ar}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(order.created_at), "PPp", { locale: isRTL ? ar : undefined })}
                      </p>
                    </div>
                    <div className="text-left space-y-1">
                      <p className="font-bold text-primary text-lg">
                        {Number(order.total_amount).toLocaleString()} {isRTL ? "ر.س" : "SAR"}
                      </p>
                      {order.paid_amount > 0 && order.paid_amount < order.total_amount && (
                        <p className="text-xs text-muted-foreground">
                          {isRTL ? "المدفوع:" : "Paid:"} {Number(order.paid_amount).toLocaleString()}
                        </p>
                      )}
                      {order.bank_transfer_proof && (
                        <p className="text-[11px] text-muted-foreground">
                          {isRTL ? "إيصال بنكي مرفوع" : "Bank receipt uploaded"}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
              {(!orders || orders.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  {isRTL ? "لا توجد طلبات" : "No orders found"}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isRTL ? "تفاصيل الطلب" : "Order Details"} - {selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Car Info */}
              {selectedOrder.cars && (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30">
                  <img
                    src={selectedOrder.cars.main_image || "/placeholder.svg"}
                    alt=""
                    className="h-20 w-28 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{selectedOrder.cars.name_ar}</h4>
                    <p className="text-lg font-bold text-primary">
                      {Number(selectedOrder.cars.price).toLocaleString()} {isRTL ? "ر.س" : "SAR"}
                    </p>
                  </div>
                </div>
              )}

              {/* Customer & Payment Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/30">
                  <h5 className="font-semibold mb-2">{isRTL ? "معلومات العميل" : "Customer Info"}</h5>
                  <p className="text-sm">{selectedOrder.customers?.name || "-"}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customers?.phone || "-"}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customers?.email || "-"}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 space-y-2">
                  <h5 className="font-semibold mb-2">{isRTL ? "معلومات الدفع" : "Payment Info"}</h5>
                  <p className="text-sm">{isRTL ? "الإجمالي:" : "Total:"} {Number(selectedOrder.total_amount).toLocaleString()} {isRTL ? "ر.س" : "SAR"}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "المدفوع:" : "Paid:"} {Number(selectedOrder.paid_amount || 0).toLocaleString()} {isRTL ? "ر.س" : "SAR"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "طريقة الدفع:" : "Method:"} {selectedOrder.payment_method || "-"}
                  </p>
                  <div className="mt-3 space-y-2">
                    <Label>{isRTL ? "إيصال التحويل البنكي" : "Bank Transfer Receipt"}</Label>
                    {selectedOrder.bank_transfer_proof ? (
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewBankProof(selectedOrder.bank_transfer_proof)}
                        >
                          {isRTL ? "عرض الإيصال" : "View Receipt"}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {isRTL
                          ? "لا يوجد إيصال مرفوع بعد. يمكنك رفعه من الأسفل."
                          : "No receipt uploaded yet. You can upload it below."}
                      </p>
                    )}
                    <div className="space-y-1">
                      <Input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingProof}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && selectedOrder) {
                            handleBankProofUpload(selectedOrder.id, file);
                            e.target.value = "";
                          }
                        }}
                      />
                      {isUploadingProof && (
                        <p className="text-xs text-muted-foreground">
                          {isRTL ? "جاري رفع الإيصال..." : "Uploading receipt..."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Update Status & Payment */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>{isRTL ? "حالة الطلب" : "Order Status"}</Label>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => {
                      updateOrderStatus.mutate({ id: selectedOrder.id, status: value });
                      setSelectedOrder({ ...selectedOrder, status: value });
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">{isRTL ? "جديد" : "New"}</SelectItem>
                      <SelectItem value="processing">{isRTL ? "قيد المعالجة" : "Processing"}</SelectItem>
                      <SelectItem value="reserved">{isRTL ? "محجوز" : "Reserved"}</SelectItem>
                      <SelectItem value="completed">{isRTL ? "مكتمل" : "Completed"}</SelectItem>
                      <SelectItem value="cancelled">{isRTL ? "ملغى" : "Cancelled"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isRTL ? "حالة الدفع" : "Payment Status"}</Label>
                  <Select
                    value={selectedOrder.payment_status}
                    onValueChange={(value) => {
                      updateOrderStatus.mutate({ id: selectedOrder.id, payment_status: value });
                      setSelectedOrder({ ...selectedOrder, payment_status: value });
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{isRTL ? "معلق" : "Pending"}</SelectItem>
                      <SelectItem value="partial">{isRTL ? "جزئي" : "Partial"}</SelectItem>
                      <SelectItem value="paid">{isRTL ? "مدفوع" : "Paid"}</SelectItem>
                      <SelectItem value="refunded">{isRTL ? "مسترد" : "Refunded"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isRTL ? "طريقة الدفع" : "Payment Method"}</Label>
                  <Select
                    value={selectedOrder.payment_method || ""}
                    onValueChange={(value) => {
                      updateOrderStatus.mutate({ id: selectedOrder.id, payment_method: value });
                      setSelectedOrder({ ...selectedOrder, payment_method: value });
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder={isRTL ? "اختر طريقة الدفع" : "Select method"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">{isRTL ? "تحويل بنكي" : "Bank Transfer"}</SelectItem>
                      <SelectItem value="cash">{isRTL ? "نقدًا" : "Cash"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="mt-6 space-y-3">
                <Label>{isRTL ? "تسلسل حالة الطلب" : "Order Status Timeline"}</Label>
                {statusHistoryLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isRTL ? "جاري تحميل السجل..." : "Loading history..."}
                  </div>
                ) : statusHistory && statusHistory.length > 0 ? (
                  <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                    {statusHistory.map((h: any, index: number) => {
                      const statusInfo = getStatusBadge(h.new_status);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <div key={`${h.changed_at}-${index}`} className="flex items-start gap-3">
                          <div className="mt-1 h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                            <StatusIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold">{statusInfo.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(h.changed_at), "PPp", { locale: isRTL ? ar : undefined })}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {isRTL ? "بواسطة" : "By"} {h.changed_by_name}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {isRTL
                      ? "لم يتم تغيير حالة الطلب بعد."
                      : "No status changes recorded yet."}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div>
                  <Label>{isRTL ? "ملاحظات العميل" : "Customer Notes"}</Label>
                  <p className="text-sm p-3 rounded-lg bg-secondary/30 min-h-[60px]">
                    {selectedOrder.notes || (isRTL ? "لا توجد ملاحظات" : "No notes")}
                  </p>
                </div>
                <div>
                  <Label>{isRTL ? "ملاحظات الإدارة" : "Admin Notes"}</Label>
                  <Textarea
                    defaultValue={selectedOrder.admin_notes || ""}
                    placeholder={isRTL ? "أضف ملاحظات..." : "Add notes..."}
                    onBlur={(e) => {
                      if (e.target.value !== selectedOrder.admin_notes) {
                        updateOrderStatus.mutate({ id: selectedOrder.id, admin_notes: e.target.value });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrdersManagement;
