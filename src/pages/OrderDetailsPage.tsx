import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Printer,
  Clock,
  Truck,
  Package,
  MessageCircle,
  Phone,
  User,
  FileText,
  Check,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import InvoicePDF from "@/components/InvoicePDF";
import { useSettings } from "@/hooks/useSettings";
import WhatsAppButton from "@/components/WhatsAppButton";

const OrderDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const { toast } = useToast();
  const { data: settings } = useSettings();

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (data?.some((r) => r.role === "admin")) {
        setIsAdmin(true);
      }
    };
    checkRole();
  }, []);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-details", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          customer:customers(*),
          car:cars(*)
        `)
        .eq("id", orderId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: statusHistory } = useQuery({
    queryKey: ["order-status-history", orderId],
    enabled: !!orderId && isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_status_history")
        .select("*")
        .eq("order_id", orderId)
        .order("changed_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const statusSteps = [
    { id: "new", labelAr: "جديد", labelEn: "New", descAr: "تم استلام طلبك", descEn: "Your order has been received" },
    { id: "processing", labelAr: "قيد المعالجة", labelEn: "Processing", descAr: "نقوم بمراجعة البيانات", descEn: "We are reviewing your details" },
    { id: "reserved", labelAr: "محجوز", labelEn: "Reserved", descAr: "تم حجز السيارة لك", descEn: "The car is reserved for you" },
    { id: "completed", labelAr: "مكتمل", labelEn: "Completed", descAr: "تم إنهاء إجراءات البيع", descEn: "Sale procedures completed" },
  ];

  const getStatusLabel = (status: string | null) => {
    const map: Record<string, string> = {
      new: isRTL ? "جديد" : "New",
      processing: isRTL ? "قيد المعالجة" : "Processing",
      reserved: isRTL ? "محجوز" : "Reserved",
      completed: isRTL ? "مكتمل" : "Completed",
      cancelled: isRTL ? "ملغى" : "Cancelled",
    };
    return map[status || ""] || (status || "-");
  };

  const isStatusCompleted = (currentStatus: string, stepId: string) => {
    const order = ["new", "processing", "reserved", "completed"];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepId);
    return currentIndex >= stepIndex;
  };

  // Realtime toast when status changes
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel("order-status-update")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => {
          const oldStatus = (payload.old as any)?.status;
          const newStatus = (payload.new as any)?.status;
          if (newStatus && newStatus !== oldStatus) {
            toast({
              title: isRTL ? "تحديث حالة الطلب" : "Order Status Update",
              description: `${isRTL ? "الحالة الجديدة:" : "New status:"} ${getStatusLabel(newStatus)}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, isRTL, toast]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">{t.order.details}</h2>
        <p className="mt-4 text-muted-foreground">{isRTL ? "الطلب غير موجود" : "Order not found"}</p>
        <Button className="mt-6" onClick={() => navigate("/")}>
          {t.common.backHome}
        </Button>
      </div>
    );
  }

  const paymentIsBank = order.payment_method === "bank_transfer";
  const deliveryIsShipping = order.delivery_method === "delivery";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-foreground">
              {t.order.details}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {t.order.number}: <span className="font-mono text-primary font-bold">{order.order_number}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <InvoicePDF order={order} />
            <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              {t.common.print}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Status Timeline */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  {t.order.timeline}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {statusSteps.map((step, index) => {
                    const isCompleted = isStatusCompleted(order.status || "new", step.id);
                    const isCurrent = order.status === step.id;

                    return (
                      <div key={step.id} className="relative flex gap-4">
                        {index !== statusSteps.length - 1 && (
                          <div
                            className={`absolute left-[19px] top-10 h-full w-0.5 ${isCompleted ? "bg-primary" : "bg-border"
                              }`}
                          />
                        )}
                        <div
                          className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300 ${isCompleted || isCurrent
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-muted-foreground"
                            }`}
                        >
                          {isCompleted && !isCurrent ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <span className="text-sm font-bold">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span
                            className={`font-bold ${isCurrent ? "text-primary" : "text-foreground"
                              }`}
                          >
                            {isRTL ? step.labelAr : step.labelEn}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {isRTL ? step.descAr : step.descEn}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Order Items/Car */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl">{isRTL ? "السيارة المطلوبة" : "Ordered Car"}</CardTitle>
              </CardHeader>
              <CardContent>
                {order.car ? (
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <div className="h-24 w-40 overflow-hidden rounded-lg border border-border">
                      <img
                        src={order.car.main_image || "/placeholder.svg"}
                        alt={isRTL ? order.car.name_ar : order.car.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">
                        {isRTL ? order.car.name_ar : order.car.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {order.car.model} • {order.car.year} • {isRTL ? order.car.color_ar : order.car.color}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-primary">
                        {Number(order.total_amount).toLocaleString()} {isRTL ? "ر.س" : "SAR"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground py-4 text-center italic">
                    {isRTL ? "بيانات السيارة غير متوفرة" : "Car details not available"}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Status Change History (Admin Only) */}
            {isAdmin && (
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">{isRTL ? "تاريخ التحديثات" : "Update History"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!statusHistory || statusHistory.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        {isRTL ? "لا يوجد تاريخ متاح" : "No history available"}
                      </p>
                    ) : (
                      statusHistory.map((history: any) => (
                        <div key={history.id} className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="text-sm font-medium">
                              {isRTL ? "تغيير الحالة من" : "Status changed from"}{" "}
                              <span className="text-muted-foreground">
                                {getStatusLabel(history.old_status)}
                              </span>{" "}
                              {isRTL ? "إلى" : "to"}{" "}
                              <span className="text-primary font-bold">
                                {getStatusLabel(history.new_status)}
                              </span>
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(history.changed_at).toLocaleString(isRTL ? "ar-SA" : "en-US")}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Payment Summary */}
            <Card className="border-primary/20 bg-primary/5 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">{t.order.summary}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.common.price}</span>
                  <span className="font-medium">{Number(order.total_amount).toLocaleString()} {isRTL ? "ر.س" : "SAR"}</span>
                </div>
                <div className="flex justify-between border-t border-primary/10 pt-4">
                  <span className="font-bold">{t.order.total}</span>
                  <span className="text-xl font-black text-primary">
                    {Number(order.total_amount).toLocaleString()} {isRTL ? "ر.س" : "SAR"}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {paymentIsBank ? <Package className="h-4 w-4 text-primary" /> : <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-muted-foreground uppercase">{t.order.paymentMethod}</p>
                      <p className="font-bold">{paymentIsBank ? t.order.bankTransfer : t.order.cashOnDelivery}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-muted-foreground uppercase">{t.order.paymentStatus}</p>
                      <p className={`font-bold ${order.payment_status === "paid" ? "text-green-600" : "text-amber-600"}`}>
                        {order.payment_status === "paid" ? (isRTL ? "مدفوع" : "Paid") : (isRTL ? "انتظار الدفع" : "Pending")}
                      </p>
                    </div>
                  </div>
                </div>

                {paymentIsBank && (
                  <div className="mt-4 rounded-xl border border-primary/20 bg-background p-4 text-sm shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="h-4 w-4 text-primary" />
                      <p className="font-bold">{t.order.bankDetails}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-xs">{t.order.bankName}</span>
                        <span className="font-medium">{isRTL ? settings?.bank_name : (settings?.bank_name_en || settings?.bank_name)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-xs">{t.order.accountName}</span>
                        <span className="font-medium">{settings?.bank_account_holder}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground text-xs">{t.order.accountNumber}</span>
                        <span className="font-mono bg-secondary/50 p-2 rounded text-center">{settings?.bank_account_number}</span>
                      </div>
                      {settings?.bank_iban && (
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground text-xs">IBAN</span>
                          <span className="font-mono text-[10px] bg-secondary/50 p-2 rounded text-center break-all">{settings?.bank_iban}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer & Delivery Info */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">{t.order.customerInfo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="pt-0.5">
                    <p className="font-bold text-foreground">{order.customer?.name}</p>
                    <p className="text-sm text-muted-foreground">{order.customer?.phone}</p>
                    {order.customer?.email && <p className="text-sm text-muted-foreground">{order.customer?.email}</p>}
                  </div>
                </div>

                <div className="flex items-start gap-4 border-t border-border/50 pt-6">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-secondary flex items-center justify-center">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="pt-0.5">
                    <p className="font-bold text-foreground">{t.order.deliveryMethod}</p>
                    <p className="text-sm text-muted-foreground">
                      {deliveryIsShipping ? t.order.delivery : t.order.pickup}
                    </p>
                    {deliveryIsShipping && (
                      <div className="mt-2 p-3 rounded-lg bg-secondary/30 text-xs shadow-inner">
                        <p className="font-semibold text-primary mb-1">{t.order.deliveryAddress}</p>
                        <p>{order.delivery_city}</p>
                        <p>{order.delivery_address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {order.notes && (
                  <div className="flex items-start gap-4 border-t border-border/50 pt-6">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-secondary flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="pt-0.5 w-full">
                      <p className="font-bold text-foreground">{t.order.notes}</p>
                      <p className="text-sm text-muted-foreground mt-1 bg-secondary/30 p-2 rounded border border-border/30 whitespace-pre-line">{order.notes}</p>
                    </div>
                  </div>
                )}

                {/* Contact Actions */}
                <div className="flex flex-col gap-2 pt-4">
                  <Button asChild className="gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white">
                    <a href={`https://wa.me/${order.customer?.phone?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      {isRTL ? "تواصل عبر واتساب" : "WhatsApp Customer"}
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="gap-2 border-primary/20">
                    <a href={`tel:${order.customer?.phone}`}>
                      <Phone className="h-4 w-4" />
                      {isRTL ? "اتصال هاتفي" : "Call Customer"}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default OrderDetailsPage;
