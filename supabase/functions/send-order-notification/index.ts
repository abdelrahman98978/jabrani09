import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderNotificationRequest {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  carName: string;
  totalAmount: number;
  paymentMethod: string;
  language?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      orderId,
      orderNumber,
      customerEmail,
      customerName,
      customerPhone,
      carName,
      totalAmount,
      paymentMethod,
      language = "ar",
    }: OrderNotificationRequest = await req.json();

    console.log(`Sending order notification for order: ${orderNumber}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    const isArabic = language === "ar";
    const showroomName = isArabic
      ? (settings?.showroom_name || "معرض السيارات")
      : (settings?.showroom_name_en || "Car Showroom");
    const phone = settings?.phone || "";

    const currencySymbol = settings?.currency_symbol || (isArabic ? "ج.س" : "SDG");

    const formatPrice = (price: number) => {
      const formatted = new Intl.NumberFormat(isArabic ? "ar-SD" : "en-US", {
        maximumFractionDigits: 0,
      }).format(price);
      return `${formatted} ${currencySymbol}`;
    };

    const paymentLabels: Record<string, Record<string, string>> = {
      ar: { cash: "نقداً", bank_transfer: "تحويل بنكي", installment: "تقسيط" },
      en: { cash: "Cash", bank_transfer: "Bank Transfer", installment: "Installment" },
    };

    const paymentLabel = paymentLabels[language]?.[paymentMethod] || paymentMethod;

    // Send email to customer
    const customerHtml = isArabic ? `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 40px 20px; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 28px; }
          .header .emoji { font-size: 50px; display: block; margin-bottom: 15px; }
          .content { padding: 40px; }
          .order-box { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #dc2626; border-radius: 16px; padding: 25px; margin: 20px 0; }
          .order-number { font-size: 24px; font-weight: 800; color: #dc2626; text-align: center; margin-bottom: 20px; }
          .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #fecaca; }
          .info-row:last-child { border-bottom: none; }
          .info-label { color: #666; }
          .info-value { color: #1a1a1a; font-weight: 700; }
          .total-row { background: #dc2626; color: #fff; padding: 15px; border-radius: 10px; text-align: center; margin-top: 15px; }
          .total-row .amount { font-size: 28px; font-weight: 800; }
          .footer { background: #1a1a1a; padding: 25px; text-align: center; color: #888; font-size: 14px; }
          .steps { background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .step { display: flex; align-items: center; gap: 15px; padding: 10px 0; }
          .step-number { width: 30px; height: 30px; background: #dc2626; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="emoji">🎉</span>
            <h1>تم استلام طلبك بنجاح!</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #333;">مرحباً ${customerName}،</p>
            <p style="color: #666; line-height: 1.8;">شكراً لاختيارك ${showroomName}! تم استلام طلبك وسيتم التواصل معك قريباً.</p>
            
            <div class="order-box">
              <div class="order-number">طلب رقم: ${orderNumber}</div>
              <div class="info-row">
                <span class="info-label">السيارة</span>
                <span class="info-value">${carName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">طريقة الدفع</span>
                <span class="info-value">${paymentLabel}</span>
              </div>
              <div class="total-row">
                <div>المبلغ الإجمالي</div>
                <div class="amount">${formatPrice(totalAmount)}</div>
              </div>
            </div>
            
            <div class="steps">
              <h3 style="margin-top: 0; color: #333;">الخطوات التالية:</h3>
              <div class="step">
                <div class="step-number">1</div>
                <span>سيتواصل معك فريقنا خلال 24 ساعة</span>
              </div>
              <div class="step">
                <div class="step-number">2</div>
                <span>تأكيد تفاصيل الطلب والدفع</span>
              </div>
              <div class="step">
                <div class="step-number">3</div>
                <span>تسليم السيارة في الموعد المتفق عليه</span>
              </div>
            </div>
            
            ${phone ? `<p style="text-align: center; color: #dc2626; font-size: 18px; font-weight: 700;">📞 للاستفسار: ${phone}</p>` : ""}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${showroomName}</p>
          </div>
        </div>
      </body>
      </html>
    ` : `
      <!DOCTYPE html>
      <html dir="ltr" lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 28px; }
          .header .emoji { font-size: 50px; display: block; margin-bottom: 15px; }
          .content { padding: 40px; }
          .order-box { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #dc2626; border-radius: 16px; padding: 25px; margin: 20px 0; }
          .order-number { font-size: 24px; font-weight: 800; color: #dc2626; text-align: center; margin-bottom: 20px; }
          .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #fecaca; }
          .info-row:last-child { border-bottom: none; }
          .info-label { color: #666; }
          .info-value { color: #1a1a1a; font-weight: 700; }
          .total-row { background: #dc2626; color: #fff; padding: 15px; border-radius: 10px; text-align: center; margin-top: 15px; }
          .total-row .amount { font-size: 28px; font-weight: 800; }
          .footer { background: #1a1a1a; padding: 25px; text-align: center; color: #888; font-size: 14px; }
          .steps { background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .step { display: flex; align-items: center; gap: 15px; padding: 10px 0; }
          .step-number { width: 30px; height: 30px; background: #dc2626; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="emoji">🎉</span>
            <h1>Order Received Successfully!</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #333;">Hello ${customerName},</p>
            <p style="color: #666; line-height: 1.8;">Thank you for choosing ${showroomName}! Your order has been received and we will contact you soon.</p>
            
            <div class="order-box">
              <div class="order-number">Order #${orderNumber}</div>
              <div class="info-row">
                <span class="info-label">Car</span>
                <span class="info-value">${carName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Method</span>
                <span class="info-value">${paymentLabel}</span>
              </div>
              <div class="total-row">
                <div>Total Amount</div>
                <div class="amount">${formatPrice(totalAmount)}</div>
              </div>
            </div>
            
            <div class="steps">
              <h3 style="margin-top: 0; color: #333;">Next Steps:</h3>
              <div class="step">
                <div class="step-number">1</div>
                <span>Our team will contact you within 24 hours</span>
              </div>
              <div class="step">
                <div class="step-number">2</div>
                <span>Confirm order details and payment</span>
              </div>
              <div class="step">
                <div class="step-number">3</div>
                <span>Car delivery at the agreed time</span>
              </div>
            </div>
            
            ${phone ? `<p style="text-align: center; color: #dc2626; font-size: 18px; font-weight: 700;">📞 For inquiries: ${phone}</p>` : ""}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${showroomName}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to customer
    if (customerEmail) {
      const customerRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `${showroomName} <onboarding@resend.dev>`,
          to: [customerEmail],
          subject: isArabic ? `🎉 تأكيد الطلب ${orderNumber}` : `🎉 Order Confirmation ${orderNumber}`,
          html: customerHtml,
        }),
      });

      if (!customerRes.ok) {
        console.error("Failed to send customer email:", await customerRes.text());
      } else {
        console.log("Customer email sent successfully");
      }
    }

    // Send notification to admin
    const adminEmail = settings?.email;
    if (adminEmail) {
      const adminHtml = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center; }
            .header h1 { color: #fff; margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .info-box { background: #fef2f2; border: 2px solid #dc2626; border-radius: 12px; padding: 20px; margin: 15px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #fecaca; }
            .info-row:last-child { border-bottom: none; }
            .total { background: #dc2626; color: #fff; padding: 15px; border-radius: 10px; text-align: center; font-size: 24px; font-weight: 800; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 طلب جديد - ${orderNumber}</h1>
            </div>
            <div class="content">
              <div class="info-box">
                <div class="info-row"><span>العميل</span><strong>${customerName}</strong></div>
                <div class="info-row"><span>الهاتف</span><strong>${customerPhone}</strong></div>
                <div class="info-row"><span>البريد</span><strong>${customerEmail || "-"}</strong></div>
                <div class="info-row"><span>السيارة</span><strong>${carName}</strong></div>
                <div class="info-row"><span>طريقة الدفع</span><strong>${paymentLabel}</strong></div>
              </div>
              <div class="total">${formatPrice(totalAmount)}</div>
              <p style="text-align: center; color: #666; margin-top: 20px;">يرجى التواصل مع العميل لتأكيد الطلب</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `${showroomName} <onboarding@resend.dev>`,
          to: [adminEmail],
          subject: `🚗 طلب جديد ${orderNumber} - ${formatPrice(totalAmount)}`,
          html: adminHtml,
        }),
      });
      console.log("Admin notification sent");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-order-notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
