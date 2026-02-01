import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
  language?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, language = "ar" }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to: ${email}, name: ${fullName}, language: ${language}`);

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
    const whatsapp = settings?.whatsapp || "";
    const address = isArabic ? (settings?.address_ar || "") : (settings?.address || "");
    
    const htmlContent = isArabic ? `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d1f1f 100%);
            margin: 0;
            padding: 40px 20px;
            direction: rtl;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }
          .header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            padding: 50px 40px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            font-size: 32px;
            margin: 0;
            font-weight: 800;
          }
          .header .emoji {
            font-size: 60px;
            display: block;
            margin-bottom: 20px;
          }
          .content {
            padding: 50px 40px;
          }
          .welcome-text {
            color: #1a1a1a;
            font-size: 24px;
            margin-bottom: 20px;
            font-weight: 700;
          }
          .description {
            color: #4a4a4a;
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 30px;
          }
          .features {
            background: #f8f8f8;
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
          }
          .feature {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            color: #2d2d2d;
          }
          .feature:last-child {
            margin-bottom: 0;
          }
          .feature-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 15px;
            font-size: 20px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 18px 40px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 700;
            text-align: center;
            box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);
          }
          .footer {
            background: #1a1a1a;
            padding: 30px 40px;
            text-align: center;
          }
          .footer p {
            color: #888888;
            font-size: 14px;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="emoji">🚗</span>
            <h1>${showroomName}</h1>
          </div>
          <div class="content">
            <p class="welcome-text">أهلاً وسهلاً ${fullName}! 🎉</p>
            <p class="description">
              يسعدنا انضمامك إلى عائلة ${showroomName}! أنت الآن جزء من مجتمع يضم آلاف العملاء الذين يثقون بنا للحصول على أفضل السيارات.
            </p>
            
            <div class="features">
              <div class="feature">
                <div class="feature-icon">🚙</div>
                <span>تشكيلة واسعة من أفخم السيارات</span>
              </div>
              <div class="feature">
                <div class="feature-icon">💰</div>
                <span>أسعار منافسة وعروض حصرية</span>
              </div>
              <div class="feature">
                <div class="feature-icon">🛡️</div>
                <span>ضمان شامل وخدمة ما بعد البيع</span>
              </div>
              <div class="feature">
                <div class="feature-icon">📱</div>
                <span>دعم فني على مدار الساعة</span>
              </div>
            </div>
            
            ${phone ? `<p style="text-align: center; color: #666; margin-top: 20px;">📞 للتواصل: ${phone}</p>` : ""}
            ${address ? `<p style="text-align: center; color: #666;">📍 ${address}</p>` : ""}
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://lgyyvyhrzgksmxkgmhae.lovable.app/cars" class="cta-button">
                تصفح السيارات الآن
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${showroomName} - جميع الحقوق محفوظة</p>
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
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d1f1f 100%);
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }
          .header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            padding: 50px 40px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            font-size: 32px;
            margin: 0;
            font-weight: 800;
          }
          .header .emoji {
            font-size: 60px;
            display: block;
            margin-bottom: 20px;
          }
          .content {
            padding: 50px 40px;
          }
          .welcome-text {
            color: #1a1a1a;
            font-size: 24px;
            margin-bottom: 20px;
            font-weight: 700;
          }
          .description {
            color: #4a4a4a;
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 30px;
          }
          .features {
            background: #f8f8f8;
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
          }
          .feature {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            color: #2d2d2d;
          }
          .feature:last-child {
            margin-bottom: 0;
          }
          .feature-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-size: 20px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 18px 40px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 700;
            text-align: center;
            box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);
          }
          .footer {
            background: #1a1a1a;
            padding: 30px 40px;
            text-align: center;
          }
          .footer p {
            color: #888888;
            font-size: 14px;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="emoji">🚗</span>
            <h1>${showroomName}</h1>
          </div>
          <div class="content">
            <p class="welcome-text">Welcome ${fullName}! 🎉</p>
            <p class="description">
              We're thrilled to have you join the ${showroomName} family! You're now part of a community of thousands of customers who trust us for the best cars.
            </p>
            
            <div class="features">
              <div class="feature">
                <div class="feature-icon">🚙</div>
                <span>Wide selection of premium cars</span>
              </div>
              <div class="feature">
                <div class="feature-icon">💰</div>
                <span>Competitive prices and exclusive offers</span>
              </div>
              <div class="feature">
                <div class="feature-icon">🛡️</div>
                <span>Comprehensive warranty and after-sales service</span>
              </div>
              <div class="feature">
                <div class="feature-icon">📱</div>
                <span>24/7 technical support</span>
              </div>
            </div>
            
            ${phone ? `<p style="text-align: center; color: #666; margin-top: 20px;">📞 Contact: ${phone}</p>` : ""}
            ${address ? `<p style="text-align: center; color: #666;">📍 ${address}</p>` : ""}
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://lgyyvyhrzgksmxkgmhae.lovable.app/cars" class="cta-button">
                Browse Cars Now
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${showroomName} - All Rights Reserved</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${showroomName} <onboarding@resend.dev>`,
        to: [email],
        subject: isArabic ? `🚗 مرحباً بك في ${showroomName}!` : `🚗 Welcome to ${showroomName}!`,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const data = await res.json();
    console.log("Welcome email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
