import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

interface Payload {
  order_id: string;
  new_status?: string;
}

// Status colors and labels
const statusConfig: Record<string, { colorAr: string; colorEn: string; labelAr: string; labelEn: string; bgColor: string; textColor: string }> = {
  new: { colorAr: "جديد", colorEn: "New", labelAr: "جديد", labelEn: "New", bgColor: "#3b82f6", textColor: "#ffffff" },
  processing: { colorAr: "قيد المعالجة", colorEn: "Processing", labelAr: "قيد المعالجة", labelEn: "Processing", bgColor: "#f59e0b", textColor: "#ffffff" },
  reserved: { colorAr: "محجوز", colorEn: "Reserved", labelAr: "محجوز", labelEn: "Reserved", bgColor: "#8b5cf6", textColor: "#ffffff" },
  completed: { colorAr: "مكتمل", colorEn: "Completed", labelAr: "مكتمل", labelEn: "Completed", bgColor: "#10b981", textColor: "#ffffff" },
  cancelled: { colorAr: "ملغى", colorEn: "Cancelled", labelAr: "ملغى", labelEn: "Cancelled", bgColor: "#ef4444", textColor: "#ffffff" },
};

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { order_id, new_status }: Payload = await req.json();

    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch order with customer and car details
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*, customers(name, email, phone), cars(name_ar, name, model, year, price, main_image)")
      .eq("id", order_id)
      .maybeSingle();

    if (orderError) {
      console.error("Error fetching order in send-order-status-email:", orderError);
      throw orderError;
    }

    if (!order || !order.customers?.email) {
      console.log("No order or customer email found, skipping email.");
      return new Response(JSON.stringify({ message: "No email to send" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch showroom settings
    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select("showroom_name, showroom_name_en, phone, whatsapp, email, address_ar, logo_url, currency, currency_symbol")
      .limit(1)
      .maybeSingle();

    const showroomNameAr = settings?.showroom_name || "معرض السيارات";
    const showroomNameEn = settings?.showroom_name_en || "Car Showroom";
    const showroomPhone = settings?.phone || "";
    const showroomWhatsapp = settings?.whatsapp || "";
    const showroomEmail = settings?.email || "";
    const logoUrl = settings?.logo_url || "";
    const currencySymbol = settings?.currency_symbol || "ج.س";

    const status = new_status || order.status || "new";
    const config = statusConfig[status] || statusConfig.new;

    const carNameAr = order.cars?.name_ar || "سيارة";
    const carNameEn = order.cars?.name || "Car";
    const carModel = order.cars?.model || "";
    const carYear = order.cars?.year || "";
    const carPrice = Number(order.cars?.price || order.total_amount || 0);
    const carImage = order.cars?.main_image || "";
    const orderDate = new Date(order.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

    const subject = `${showroomNameAr} - تحديث حالة طلبك #${order.order_number}`;

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تحديث حالة الطلب</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f5f5f5; direction: rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Status Badge -->
          <tr>
            <td align="center" style="padding: 30px 40px 20px;">
              <div style="display: inline-block; background-color: ${config.bgColor}; color: ${config.textColor}; padding: 12px 32px; border-radius: 50px; font-size: 18px; font-weight: bold;">
                ${config.labelAr}
              </div>
            </td>
          </tr>
          
          <!-- Order Number -->
          <tr>
            <td align="center" style="padding: 10px 40px 30px;">
              <p style="margin: 0; color: #666666; font-size: 14px;">رقم الطلب</p>
              <p style="margin: 5px 0 0; color: #1a1a1a; font-size: 24px; font-weight: bold;">${order.order_number}</p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #e5e5e5;"></div>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="margin: 0 0 15px; color: #1a1a1a; font-size: 20px;">عزيزي ${order.customers.name || "العميل الكريم"} 👋</h2>
              <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.8;">
                شكراً لتعاملك مع <strong>${showroomNameAr}</strong>. نود إعلامك بأن حالة طلبك قد تم تحديثها.
              </p>
            </td>
          </tr>
          
          <!-- Invoice Section -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; border-radius: 12px; overflow: hidden; border: 1px solid #e5e5e5;">
                
                <!-- Invoice Header -->
                <tr>
                  <td style="padding: 20px; background: linear-gradient(135deg, #8B0000 0%, #5c0000 100%);">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="text-align: right;">
                          ${logoUrl ? `<img src="${logoUrl}" alt="${showroomNameAr}" style="height: 50px; max-width: 150px;">` : `<span style="color: #ffffff; font-size: 24px; font-weight: bold;">${showroomNameAr}</span>`}
                        </td>
                        <td style="text-align: left;">
                          <span style="color: #D4AF37; font-size: 22px; font-weight: bold;">فاتورة</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Invoice Details -->
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;">
                          <span style="color: #888888; font-size: 13px;">العميل</span><br>
                          <span style="color: #1a1a1a; font-size: 15px; font-weight: 600;">${order.customers.name || "-"}</span>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; text-align: left;">
                          <span style="color: #888888; font-size: 13px;">تاريخ الطلب</span><br>
                          <span style="color: #1a1a1a; font-size: 15px; font-weight: 600;">${orderDate}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Product Table Header -->
                <tr>
                  <td style="padding: 0 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr style="background-color: #f0f0f0;">
                        <td style="padding: 12px; font-size: 13px; color: #666666; font-weight: 600; border-radius: 8px 0 0 0;">المنتج</td>
                        <td style="padding: 12px; font-size: 13px; color: #666666; font-weight: 600; text-align: center;">الكمية</td>
                        <td style="padding: 12px; font-size: 13px; color: #666666; font-weight: 600; text-align: center;">السعر</td>
                        <td style="padding: 12px; font-size: 13px; color: #666666; font-weight: 600; text-align: left; border-radius: 0 8px 0 0;">الإجمالي</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Product Row -->
                <tr>
                  <td style="padding: 0 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 15px 12px; border-bottom: 1px solid #e5e5e5;">
                          <div style="display: flex; align-items: center; gap: 12px;">
                            ${carImage ? `<img src="${carImage}" alt="${carNameAr}" style="width: 60px; height: 45px; object-fit: cover; border-radius: 6px;">` : ''}
                            <div>
                              <span style="color: #1a1a1a; font-size: 15px; font-weight: 600; display: block;">${carNameAr}</span>
                              <span style="color: #888888; font-size: 13px;">${carModel} - ${carYear}</span>
                            </div>
                          </div>
                        </td>
                        <td style="padding: 15px 12px; border-bottom: 1px solid #e5e5e5; text-align: center; color: #1a1a1a; font-size: 15px;">1</td>
                        <td style="padding: 15px 12px; border-bottom: 1px solid #e5e5e5; text-align: center; color: #1a1a1a; font-size: 15px;">${carPrice.toLocaleString()} ${currencySymbol}</td>
                        <td style="padding: 15px 12px; border-bottom: 1px solid #e5e5e5; text-align: left; color: #1a1a1a; font-size: 15px; font-weight: 600;">${carPrice.toLocaleString()} ${currencySymbol}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Total -->
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 10px;">
                      <tr>
                        <td style="padding: 18px 20px;">
                          <span style="color: rgba(255,255,255,0.9); font-size: 14px;">الإجمالي الكلي</span>
                        </td>
                        <td style="padding: 18px 20px; text-align: left;">
                          <span style="color: #ffffff; font-size: 22px; font-weight: bold;">${Number(order.total_amount).toLocaleString()} ${currencySymbol}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 0 40px 30px;">
              <a href="https://lgyyvyhrzgksmxkgmhae.lovable.app/order/${order.id}" style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #b8942e 100%); color: #1a1a1a; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);">
                عرض تفاصيل الطلب
              </a>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #e5e5e5;"></div>
            </td>
          </tr>
          
          <!-- Contact Info -->
          <tr>
            <td style="padding: 25px 40px; text-align: center;">
              <p style="margin: 0 0 10px; color: #888888; font-size: 14px;">شكراً لتعاملكم مع</p>
              <p style="margin: 0 0 15px; color: #1a1a1a; font-size: 18px; font-weight: bold;">${showroomNameAr}</p>
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  ${showroomPhone ? `<td style="padding: 0 10px;"><a href="tel:${showroomPhone}" style="color: #8B0000; text-decoration: none; font-size: 14px;">📞 ${showroomPhone}</a></td>` : ''}
                  ${showroomWhatsapp ? `<td style="padding: 0 10px;"><a href="https://wa.me/${showroomWhatsapp.replace(/[^0-9]/g, '')}" style="color: #25D366; text-decoration: none; font-size: 14px;">💬 واتساب</a></td>` : ''}
                  ${showroomEmail ? `<td style="padding: 0 10px;"><a href="mailto:${showroomEmail}" style="color: #8B0000; text-decoration: none; font-size: 14px;">✉️ ${showroomEmail}</a></td>` : ''}
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 20px 40px; text-align: center;">
              <p style="margin: 0 0 5px; color: rgba(255,255,255,0.6); font-size: 12px;">
                Your order <strong style="color: #ffffff;">${order.order_number}</strong> status is now: <strong style="color: #D4AF37;">${config.labelEn}</strong>
              </p>
              <p style="margin: 0; color: rgba(255,255,255,0.4); font-size: 11px;">
                © ${new Date().getFullYear()} ${showroomNameEn}. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${showroomNameEn} <no-reply@resend.dev>`,
        to: [order.customers.email],
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Resend API error: ${resendResponse.status}`);
    }

    console.log("Status email sent for order", order_id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-order-status-email error:", error);
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
