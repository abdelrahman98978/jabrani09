import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestDriveNotificationRequest {
  bookingId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  carName: string;
  bookingDate: string;
  bookingTime: string;
  language?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      bookingId,
      customerEmail,
      customerName,
      customerPhone,
      carName,
      bookingDate,
      bookingTime,
      language = "ar",
    }: TestDriveNotificationRequest = await req.json();

    console.log(`Sending test drive notification for booking: ${bookingId}`);

    // Fetch settings from database
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
    const whatsapp = settings?.whatsapp || phone;

    // Send email to customer
    const customerHtml = isArabic ? `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 40px 20px; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 28px; }
          .header .emoji { font-size: 50px; display: block; margin-bottom: 15px; }
          .content { padding: 40px; }
          .info-box { background: #f0fdf4; border: 2px solid #10b981; border-radius: 16px; padding: 25px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #d1fae5; }
          .info-row:last-child { border-bottom: none; }
          .info-label { color: #666; }
          .info-value { color: #1a1a1a; font-weight: 700; }
          .footer { background: #1a1a1a; padding: 25px; text-align: center; color: #888; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="emoji">🚗</span>
            <h1>تم تأكيد حجز تجربة القيادة!</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #333;">مرحباً ${customerName}،</p>
            <p style="color: #666; line-height: 1.8;">شكراً لحجز تجربة قيادة معنا! إليك تفاصيل موعدك:</p>
            
            <div class="info-box">
              <div class="info-row">
                <span class="info-label">السيارة</span>
                <span class="info-value">${carName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">التاريخ</span>
                <span class="info-value">${bookingDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">الوقت</span>
                <span class="info-value">${bookingTime}</span>
              </div>
              <div class="info-row">
                <span class="info-label">رقم الحجز</span>
                <span class="info-value">${bookingId.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>
            
            <p style="color: #666; line-height: 1.8;">
              سيتواصل معك فريقنا قريباً لتأكيد الموعد. في حال رغبتك في إعادة الجدولة، يرجى التواصل معنا.
            </p>
            
            ${phone ? `<p style="text-align: center; color: #10b981; font-size: 18px; font-weight: 700;">📞 ${phone}</p>` : ""}
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
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 28px; }
          .header .emoji { font-size: 50px; display: block; margin-bottom: 15px; }
          .content { padding: 40px; }
          .info-box { background: #f0fdf4; border: 2px solid #10b981; border-radius: 16px; padding: 25px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #d1fae5; }
          .info-row:last-child { border-bottom: none; }
          .info-label { color: #666; }
          .info-value { color: #1a1a1a; font-weight: 700; }
          .footer { background: #1a1a1a; padding: 25px; text-align: center; color: #888; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="emoji">🚗</span>
            <h1>Test Drive Booking Confirmed!</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #333;">Hello ${customerName},</p>
            <p style="color: #666; line-height: 1.8;">Thank you for booking a test drive with us! Here are your appointment details:</p>
            
            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Car</span>
                <span class="info-value">${carName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date</span>
                <span class="info-value">${bookingDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Time</span>
                <span class="info-value">${bookingTime}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Booking ID</span>
                <span class="info-value">${bookingId.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>
            
            <p style="color: #666; line-height: 1.8;">
              Our team will contact you shortly to confirm the appointment. If you need to reschedule, please contact us.
            </p>
            
            ${phone ? `<p style="text-align: center; color: #10b981; font-size: 18px; font-weight: 700;">📞 ${phone}</p>` : ""}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${showroomName}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to customer if email provided
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
          subject: isArabic ? `🚗 تأكيد حجز تجربة القيادة - ${carName}` : `🚗 Test Drive Confirmed - ${carName}`,
          html: customerHtml,
        }),
      });

      if (!customerRes.ok) {
        const error = await customerRes.text();
        console.error("Failed to send customer email:", error);
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
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; }
            .header h1 { color: #fff; margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .info-box { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 15px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #fde68a; }
            .info-row:last-child { border-bottom: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 حجز تجربة قيادة جديد!</h1>
            </div>
            <div class="content">
              <div class="info-box">
                <div class="info-row"><span>العميل</span><strong>${customerName}</strong></div>
                <div class="info-row"><span>الهاتف</span><strong>${customerPhone}</strong></div>
                <div class="info-row"><span>البريد</span><strong>${customerEmail || "-"}</strong></div>
                <div class="info-row"><span>السيارة</span><strong>${carName}</strong></div>
                <div class="info-row"><span>التاريخ</span><strong>${bookingDate}</strong></div>
                <div class="info-row"><span>الوقت</span><strong>${bookingTime}</strong></div>
              </div>
              <p style="text-align: center; color: #666;">يرجى التواصل مع العميل لتأكيد الموعد</p>
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
          subject: `🚗 حجز تجربة قيادة جديد - ${customerName}`,
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
    console.error("Error in send-test-drive-notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
