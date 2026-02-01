import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  FileText,
  MessageCircle,
  Package,
  Loader2,
  Truck,
  Building2
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import WhatsAppButton from "@/components/WhatsAppButton";

const OrderConfirmationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const { data: settings } = useSettings();

  useEffect(() => {
    document.title = isRTL
      ? "تأكيد الطلب - معرض السيارات"
      : "Order Confirmation - Car Showroom";
  }, [isRTL]);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-confirmation", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          customer:customers(*),
          car:cars(*)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">{t.order.details} - {id}</h2>
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
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-foreground">
            {t.order.confirmationTitle}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t.order.confirmationSubtitle}
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {/* Order Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">{t.order.details}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between border-b pb-4">
                  <span className="text-muted-foreground">{t.order.number}</span>
                  <span className="font-mono font-bold text-primary">{order.order_number}</span>
                </div>

                {order.car && (
                  <div className="flex items-center gap-4">
                    <img
                      src={order.car.main_image || "/placeholder.svg"}
                      alt={isRTL ? order.car.name_ar : order.car.name}
                      className="h-20 w-32 rounded-lg object-cover border"
                    />
                    <div>
                      <h3 className="font-bold">{isRTL ? order.car.name_ar : order.car.name}</h3>
                      <p className="text-sm text-muted-foreground">{order.car.model} • {order.car.year}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t.order.paymentMethod}</p>
                    <p className="font-bold flex items-center gap-2">
                      {paymentIsBank ? <Building2 className="h-4 w-4 text-primary" /> : <Package className="h-4 w-4 text-primary" />}
                      {paymentIsBank ? t.order.bankTransfer : t.order.cashOnDelivery}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.order.deliveryMethod}</p>
                    <p className="font-bold flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      {deliveryIsShipping ? t.order.delivery : t.order.pickup}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {t.order.nextSteps}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentIsBank ? (
                  <>
                    <div className="rounded-lg bg-background p-4 border border-primary/20">
                      <p className="font-bold mb-2">{t.order.bankDetails}</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">{t.order.bankName}:</span>
                          <span className="font-medium">{isRTL ? settings?.bank_name : (settings?.bank_name_en || settings?.bank_name)}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">{t.order.accountName}:</span>
                          <span className="font-medium">{settings?.bank_account_holder}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">{t.order.accountNumber}:</span>
                          <span className="font-mono font-bold">{settings?.bank_account_number}</span>
                        </li>
                        {settings?.bank_iban && (
                          <li className="flex flex-col gap-1 border-t pt-2 mt-2">
                            <span className="text-muted-foreground text-xs">IBAN:</span>
                            <span className="font-mono text-xs bg-secondary/50 p-2 rounded text-center break-all">{settings.bank_iban}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                      {isRTL
                        ? "بعد إتمام التحويل، يرجى إرسال الإيصال عبر واتساب لتأكيد طلبك."
                        : "After completing the transfer, please send the receipt via WhatsApp to confirm your order."}
                    </p>
                  </>
                ) : (
                  <p className="text-sm">
                    {isRTL
                      ? "سيقوم فريقنا بالتواصل معك قريباً لتأكيد موعد استلام السيارة وإتمام عملية الدفع."
                      : "Our team will contact you soon to confirm the pickup time and complete the payment process."}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button asChild className="flex-1 gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white">
                    <a href={`https://wa.me/${settings?.whatsapp?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      {isRTL ? "إرسال الإيصال عبر واتساب" : "Send Receipt via WhatsApp"}
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="flex-1 gap-2">
                    <Link to={`/orders/${order.id}`}>
                      <FileText className="h-4 w-4" />
                      {t.order.details}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Summary */}
          <div className="space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t.order.customerInfo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">{isRTL ? "الاسم" : "Name"}</p>
                  <p className="font-bold">{order.customer?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">{isRTL ? "رقم الهاتف" : "Phone"}</p>
                  <p className="font-bold">{order.customer?.phone}</p>
                </div>
                {deliveryIsShipping && (
                  <div>
                    <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">{t.order.deliveryAddress}</p>
                    <p className="font-bold">{order.delivery_city}</p>
                    <p className="font-normal">{order.delivery_address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t.order.summary}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">{t.common.price}</span>
                  <span className="font-medium">{Number(order.total_amount).toLocaleString()} {isRTL ? "ر.س" : "SAR"}</span>
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="font-bold">{t.order.total}</span>
                  <span className="text-xl font-black text-primary">{Number(order.total_amount).toLocaleString()} {isRTL ? "ر.س" : "SAR"}</span>
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

export default OrderConfirmationPage;
