import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreditCard, Plus, Loader2, FileText, Mail, CheckCircle, Clock, XCircle, DollarSign } from "lucide-react";
import { Label } from "@/components/ui/label";

const PaymentsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null);

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["admin-payments", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("payments")
        .select("*, orders(order_number, customers(name))")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data } = await query;
      return data || [];
    },
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["admin-invoices"],
    queryFn: async () => {
      const { data } = await supabase
        .from("invoices")
        .select("*, orders(order_number), customers(name, email)")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: pendingOrders } = useQuery({
    queryKey: ["pending-orders-for-payment"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, customers(name), cars(name_ar)")
        .in("payment_status", ["pending", "partial"])
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["payments-stats"],
    queryFn: async () => {
      const { data: payments } = await supabase.from("payments").select("amount, status");
      
      const totalReceived = payments?.filter(p => p.status === "completed").reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
      const pending = payments?.filter(p => p.status === "pending").reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
      const refunded = payments?.filter(p => p.status === "refunded").reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

      return { totalReceived, pending, refunded };
    },
  });

  const createPayment = useMutation({
    mutationFn: async (paymentData: any) => {
      const { error } = await supabase.from("payments").insert(paymentData);
      if (error) throw error;

      // Update order paid amount
      const { data: order } = await supabase
        .from("orders")
        .select("paid_amount, total_amount")
        .eq("id", paymentData.order_id)
        .single();

      if (order) {
        const newPaidAmount = Number(order.paid_amount || 0) + Number(paymentData.amount);
        const paymentStatus = newPaidAmount >= Number(order.total_amount) ? "paid" : "partial";

        await supabase.from("orders").update({
          paid_amount: newPaidAmount,
          payment_status: paymentStatus,
        }).eq("id", paymentData.order_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      queryClient.invalidateQueries({ queryKey: ["pending-orders-for-payment"] });
      queryClient.invalidateQueries({ queryKey: ["payments-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setIsPaymentDialogOpen(false);
      toast({ title: isRTL ? "تم تسجيل الدفعة" : "Payment recorded" });
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (orderId: string) => {
      const { data: order } = await supabase
        .from("orders")
        .select("*, customers(id)")
        .eq("id", orderId)
        .single();

      if (!order) throw new Error("Order not found");

      const taxRate = 0.15; // 15% VAT
      const amount = Number(order.total_amount);
      const taxAmount = amount * taxRate;
      const totalAmount = amount + taxAmount;
      
      // Generate invoice number
      const invoiceNumber = 'INV-' + new Date().toISOString().slice(0,10).replace(/-/g, '') + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');

      const { error } = await supabase.from("invoices").insert({
        invoice_number: invoiceNumber,
        order_id: orderId,
        customer_id: order.customer_id,
        amount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: "draft",
      } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      toast({ title: isRTL ? "تم إنشاء الفاتورة" : "Invoice created" });
    },
  });

  const updateInvoiceStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === "paid") {
        updates.paid_at = new Date().toISOString();
      }
      const { error } = await supabase.from("invoices").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      toast({ title: isRTL ? "تم تحديث الفاتورة" : "Invoice updated" });
    },
  });

  const sendInvoiceEmail = useMutation({
    mutationFn: async (invoiceId: string) => {
      setSendingInvoiceId(invoiceId);
      
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: { invoice_id: invoiceId, language }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      toast({ 
        title: isRTL ? "تم إرسال الفاتورة" : "Invoice Sent",
        description: isRTL ? "تم إرسال الفاتورة إلى بريد العميل بنجاح" : "Invoice has been sent to customer's email"
      });
      setSendingInvoiceId(null);
    },
    onError: (error: any) => {
      toast({ 
        variant: "destructive",
        title: isRTL ? "خطأ في الإرسال" : "Send Failed",
        description: error.message
      });
      setSendingInvoiceId(null);
    },
  });

  const handlePaymentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    createPayment.mutate({
      order_id: formData.get("order_id"),
      amount: Number(formData.get("amount")),
      payment_method: formData.get("payment_method"),
      status: "completed",
      transaction_id: formData.get("transaction_id") || null,
      notes: formData.get("notes") || null,
    });
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string; icon: any }> = {
      pending: { label: isRTL ? "معلق" : "Pending", class: "bg-amber-500/20 text-amber-400", icon: Clock },
      completed: { label: isRTL ? "مكتمل" : "Completed", class: "bg-green-500/20 text-green-400", icon: CheckCircle },
      failed: { label: isRTL ? "فشل" : "Failed", class: "bg-red-500/20 text-red-400", icon: XCircle },
      refunded: { label: isRTL ? "مسترد" : "Refunded", class: "bg-purple-500/20 text-purple-400", icon: XCircle },
    };
    return statusMap[status] || { label: status, class: "bg-muted text-muted-foreground", icon: Clock };
  };

  const getInvoiceStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      draft: { label: isRTL ? "مسودة" : "Draft", class: "bg-muted text-muted-foreground" },
      sent: { label: isRTL ? "مرسلة" : "Sent", class: "bg-blue-500/20 text-blue-400" },
      paid: { label: isRTL ? "مدفوعة" : "Paid", class: "bg-green-500/20 text-green-400" },
      cancelled: { label: isRTL ? "ملغاة" : "Cancelled", class: "bg-red-500/20 text-red-400" },
    };
    return statusMap[status] || { label: status, class: "bg-muted text-muted-foreground" };
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: isRTL ? "نقداً" : "Cash",
      bank_transfer: isRTL ? "تحويل بنكي" : "Bank Transfer",
      credit_card: isRTL ? "بطاقة ائتمان" : "Credit Card",
      financing: isRTL ? "تمويل" : "Financing",
    };
    return methods[method] || method;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? "المحصل" : "Received"}</p>
                <p className="text-lg font-bold">{(stats?.totalReceived || 0).toLocaleString()} {isRTL ? "ر.س" : "SAR"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? "معلق" : "Pending"}</p>
                <p className="text-lg font-bold">{(stats?.pending || 0).toLocaleString()} {isRTL ? "ر.س" : "SAR"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <XCircle className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? "مسترد" : "Refunded"}</p>
                <p className="text-lg font-bold">{(stats?.refunded || 0).toLocaleString()} {isRTL ? "ر.س" : "SAR"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Payments */}
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {isRTL ? "المدفوعات" : "Payments"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? "الكل" : "All"}</SelectItem>
                  <SelectItem value="completed">{isRTL ? "مكتمل" : "Completed"}</SelectItem>
                  <SelectItem value="pending">{isRTL ? "معلق" : "Pending"}</SelectItem>
                  <SelectItem value="refunded">{isRTL ? "مسترد" : "Refunded"}</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="gold" size="sm">
                    <Plus className="h-4 w-4 ml-1" />
                    {isRTL ? "تسجيل دفعة" : "Record Payment"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{isRTL ? "تسجيل دفعة جديدة" : "Record New Payment"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div>
                      <Label>{isRTL ? "الطلب *" : "Order *"}</Label>
                      <Select name="order_id" required>
                        <SelectTrigger><SelectValue placeholder={isRTL ? "اختر الطلب" : "Select Order"} /></SelectTrigger>
                        <SelectContent>
                          {pendingOrders?.map(order => (
                            <SelectItem key={order.id} value={order.id}>
                              {order.order_number} - {order.customers?.name} ({Number(order.total_amount - (order.paid_amount || 0)).toLocaleString()} {isRTL ? "ر.س" : "SAR"})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{isRTL ? "المبلغ *" : "Amount *"}</Label>
                        <Input name="amount" type="number" required />
                      </div>
                      <div>
                        <Label>{isRTL ? "طريقة الدفع *" : "Payment Method *"}</Label>
                        <Select name="payment_method" required>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">{isRTL ? "نقداً" : "Cash"}</SelectItem>
                            <SelectItem value="bank_transfer">{isRTL ? "تحويل بنكي" : "Bank Transfer"}</SelectItem>
                            <SelectItem value="credit_card">{isRTL ? "بطاقة ائتمان" : "Credit Card"}</SelectItem>
                            <SelectItem value="financing">{isRTL ? "تمويل" : "Financing"}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>{isRTL ? "رقم المعاملة" : "Transaction ID"}</Label>
                      <Input name="transaction_id" />
                    </div>
                    <Button type="submit" variant="gold" className="w-full" disabled={createPayment.isPending}>
                      {createPayment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (isRTL ? "تسجيل" : "Record")}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {payments?.map(payment => {
                  const status = getPaymentStatusBadge(payment.status);
                  const StatusIcon = status.icon;
                  
                  return (
                    <div key={payment.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <StatusIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{payment.orders?.order_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.orders?.customers?.name} • {getPaymentMethodLabel(payment.payment_method)}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-primary">{Number(payment.amount).toLocaleString()}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.class}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {(!payments || payments.length === 0) && (
                  <p className="text-center text-muted-foreground py-4">{isRTL ? "لا توجد مدفوعات" : "No payments"}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isRTL ? "الفواتير" : "Invoices"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {invoices?.map(invoice => {
                  const status = getInvoiceStatusBadge(invoice.status);
                  const hasEmail = !!invoice.customers?.email;
                  const isSending = sendingInvoiceId === invoice.id;
                  
                  return (
                    <div key={invoice.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{invoice.invoice_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {invoice.customers?.name} • {invoice.orders?.order_number}
                        </p>
                        {invoice.customers?.email && (
                          <p className="text-xs text-muted-foreground truncate">
                            {invoice.customers.email}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-left">
                          <p className="font-bold text-primary">{Number(invoice.total_amount).toLocaleString()}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.class}`}>
                            {status.label}
                          </span>
                        </div>
                        
                        {/* Send Email Button */}
                        {hasEmail && invoice.status !== "cancelled" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            disabled={isSending}
                            onClick={() => sendInvoiceEmail.mutate(invoice.id)}
                            title={isRTL ? "إرسال بالبريد" : "Send by Email"}
                          >
                            {isSending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Mail className="h-4 w-4" />
                            )}
                          </Button>
                        )}

                        <Select
                          value={invoice.status}
                          onValueChange={(value) => updateInvoiceStatus.mutate({ id: invoice.id, status: value })}
                        >
                          <SelectTrigger className="w-20 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">{isRTL ? "مسودة" : "Draft"}</SelectItem>
                            <SelectItem value="sent">{isRTL ? "مرسلة" : "Sent"}</SelectItem>
                            <SelectItem value="paid">{isRTL ? "مدفوعة" : "Paid"}</SelectItem>
                            <SelectItem value="cancelled">{isRTL ? "ملغاة" : "Cancelled"}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
                {(!invoices || invoices.length === 0) && (
                  <p className="text-center text-muted-foreground py-4">{isRTL ? "لا توجد فواتير" : "No invoices"}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentsManagement;
