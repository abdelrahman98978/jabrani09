import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendCampaignRequest {
  campaignId: string;
  testEmail?: string;
  selectedCars?: string[];
}

interface Car {
  id: string;
  name: string;
  name_ar: string;
  model: string;
  year: number;
  price: number;
  main_image: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId, testEmail, selectedCars = [] }: SendCampaignRequest = await req.json();
    
    console.log(`Processing campaign: ${campaignId}, test email: ${testEmail || 'none'}, cars: ${selectedCars.length}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error("Campaign not found");
    }

    // Fetch showroom settings
    const { data: settings } = await supabase
      .from("settings")
      .select("showroom_name, showroom_name_en, logo_url, phone, whatsapp, email, address_ar, hero_image_url")
      .limit(1)
      .single();

    const showroomName = settings?.showroom_name || "معرض السيارات";
    const showroomNameEn = settings?.showroom_name_en || "Car Showroom";
    const logoUrl = settings?.logo_url || "";
    const phone = settings?.phone || "";
    const whatsapp = settings?.whatsapp || "";
    const email = settings?.email || "";
    const address = settings?.address_ar || "";

    // Fetch selected cars or featured cars
    let carsData: Car[] = [];
    if (selectedCars.length > 0) {
      const { data: cars } = await supabase
        .from("cars")
        .select("id, name, name_ar, model, year, price, main_image")
        .in("id", selectedCars);
      carsData = cars || [];
    } else {
      // Auto-fetch featured cars if none selected
      const { data: cars } = await supabase
        .from("cars")
        .select("id, name, name_ar, model, year, price, main_image")
        .eq("is_featured", true)
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(3);
      carsData = cars || [];
    }

    let recipients: string[] = [];

    if (testEmail) {
      // Test mode: send only to test email
      recipients = [testEmail];
    } else {
      // Production mode: fetch subscribers based on target audience
      const { data: subscribers, error: subError } = await supabase
        .from("newsletter_subscribers")
        .select("email")
        .eq("is_active", true);

      if (subError) throw subError;
      recipients = subscribers?.map(s => s.email) || [];
    }

    if (recipients.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "No recipients found" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Sending to ${recipients.length} recipients`);

    // Update campaign status
    if (!testEmail) {
      await supabase
        .from("email_campaigns")
        .update({ 
          status: "sending",
          total_recipients: recipients.length 
        })
        .eq("id", campaignId);
    }

    let sentCount = 0;
    const errors: string[] = [];

    // Send emails (in batches for production)
    for (const recipientEmail of recipients) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: `${showroomName} <onboarding@resend.dev>`,
            to: [recipientEmail],
            subject: campaign.subject_ar || campaign.subject,
            html: generateEmailHTML(
              campaign.content_ar || campaign.content, 
              campaign.subject_ar || campaign.subject,
              showroomName,
              showroomNameEn,
              logoUrl,
              phone,
              whatsapp,
              email,
              address,
              carsData
            ),
          }),
        });

        if (res.ok) {
          sentCount++;
        } else {
          const errorData = await res.text();
          console.error(`Failed to send to ${recipientEmail}:`, errorData);
          errors.push(`${recipientEmail}: ${errorData}`);
        }
      } catch (e: any) {
        console.error(`Error sending to ${recipientEmail}:`, e.message);
        errors.push(`${recipientEmail}: ${e.message}`);
      }
    }

    // Update campaign status after sending
    if (!testEmail) {
      await supabase
        .from("email_campaigns")
        .update({ 
          status: sentCount > 0 ? "sent" : "failed",
          total_sent: sentCount,
          sent_at: new Date().toISOString()
        })
        .eq("id", campaignId);
    }

    console.log(`Campaign sent: ${sentCount}/${recipients.length} successful`);

    return new Response(JSON.stringify({ 
      success: true, 
      data: {
        totalRecipients: recipients.length,
        sentCount,
        errors: errors.length > 0 ? errors.slice(0, 5) : undefined
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending campaign:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateEmailHTML(
  content: string, 
  subject: string, 
  showroomName: string, 
  showroomNameEn: string,
  logoUrl: string,
  phone: string,
  whatsapp: string,
  email: string,
  address: string,
  cars: Car[] = []
): string {
  // Check if content is already HTML
  const isHtml = content.includes('<') && content.includes('>');
  
  // Format content - if it's plain text, convert to paragraphs
  const formattedContent = isHtml 
    ? content 
    : content.split('\n').filter(p => p.trim()).map(p => `<p style="margin: 0 0 16px; color: #444444; font-size: 16px; line-height: 1.8;">${p}</p>`).join('');

  // Generate cars HTML if available
  const carsHTML = cars.length > 0 ? `
          <!-- Featured Cars Section -->
          <tr>
            <td style="padding: 30px 40px;">
              <h3 style="margin: 0 0 20px; color: #1a1a1a; font-size: 20px; font-weight: 700; text-align: center;">
                🚗 سيارات مميزة
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  ${cars.slice(0, 3).map(car => `
                  <td width="33%" style="padding: 8px; vertical-align: top;">
                    <div style="background: #f8f8f8; border-radius: 12px; overflow: hidden; border: 1px solid #eee;">
                      ${car.main_image 
                        ? `<img src="${car.main_image}" alt="${car.name}" style="width: 100%; height: 120px; object-fit: cover;">`
                        : `<div style="width: 100%; height: 120px; background: linear-gradient(135deg, #8B0000, #5c0000); text-align: center; padding-top: 40px;">
                            <span style="font-size: 40px;">🚗</span>
                          </div>`
                      }
                      <div style="padding: 12px;">
                        <h4 style="margin: 0 0 5px; font-size: 14px; font-weight: 700; color: #1a1a1a;">${car.name_ar || car.name}</h4>
                        <p style="margin: 0 0 8px; font-size: 12px; color: #666;">${car.model} ${car.year}</p>
                        <p style="margin: 0; font-size: 16px; font-weight: 700; color: #8B0000;">${car.price.toLocaleString()} ر.س</p>
                      </div>
                    </div>
                  </td>
                  `).join('')}
                </tr>
              </table>
            </td>
          </tr>
  ` : '';

  // Generate unique tracking ID
  const trackingId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse: collapse;}
    .mso-padding {padding: 20px 30px !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f5f5f5; direction: rtl; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <!-- Wrapper Table -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <!-- Main Container -->
        <table role="presentation" align="center" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.15);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B0000 0%, #5c0000 100%); padding: 35px 30px; text-align: center;">
              ${logoUrl 
                ? `<img src="${logoUrl}" alt="${showroomName}" style="height: 60px; max-width: 180px; margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto;">`
                : `<div style="font-size: 32px; margin-bottom: 8px;">🚗</div>`
              }
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">${showroomName}</h1>
              <p style="margin: 6px 0 0; color: #D4AF37; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">${showroomNameEn}</p>
            </td>
          </tr>
          
          <!-- Gold Accent Line -->
          <tr>
            <td style="background: linear-gradient(90deg, #D4AF37, #f5e6a3, #D4AF37); height: 4px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          
          <!-- Subject Title -->
          <tr>
            <td style="padding: 30px 30px 15px; text-align: center;">
              <h2 style="margin: 0; color: #1a1a1a; font-size: 22px; font-weight: 700; line-height: 1.4; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">${subject}</h2>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 10px 30px 30px;">
              <div style="background-color: #fafafa; border-radius: 10px; padding: 20px; border-right: 4px solid #D4AF37;">
                ${formattedContent}
              </div>
            </td>
          </tr>

          ${carsHTML}
          
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 10px 30px 30px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #D4AF37 0%, #b8942e 100%); border-radius: 10px;">
                    <a href="https://lgyyvyhrzgksmxkgmhae.lovable.app/cars" style="display: inline-block; color: #1a1a1a; text-decoration: none; padding: 16px 40px; font-size: 16px; font-weight: bold; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
                      🚗 تصفح السيارات الآن
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Social Media Section -->
          <tr>
            <td style="padding: 0 30px 25px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 12px; color: #888888; font-size: 13px;">تابعونا على</p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 0 6px;">
                          <a href="#" style="display: inline-block; width: 36px; height: 36px; background: #1877f2; border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none; font-size: 16px;">📘</a>
                        </td>
                        <td style="padding: 0 6px;">
                          <a href="#" style="display: inline-block; width: 36px; height: 36px; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none; font-size: 16px;">📷</a>
                        </td>
                        <td style="padding: 0 6px;">
                          <a href="#" style="display: inline-block; width: 36px; height: 36px; background: #1da1f2; border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none; font-size: 16px;">🐦</a>
                        </td>
                        <td style="padding: 0 6px;">
                          <a href="#" style="display: inline-block; width: 36px; height: 36px; background: #000000; border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none; font-size: 16px;">🎵</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Contact Section -->
          <tr>
            <td style="padding: 25px 30px; background-color: #fafafa;">
              <p style="margin: 0 0 12px; color: #888888; font-size: 14px; text-align: center;">للتواصل معنا</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        ${phone ? `
                        <td style="padding: 0 8px;">
                          <a href="tel:${phone}" style="display: inline-block; background-color: #ffffff; color: #8B0000; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-size: 13px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
                            📞 ${phone}
                          </a>
                        </td>
                        ` : ''}
                        ${whatsapp ? `
                        <td style="padding: 0 8px;">
                          <a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-size: 13px; box-shadow: 0 2px 6px rgba(37,211,102,0.3); font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
                            💬 واتساب
                          </a>
                        </td>
                        ` : ''}
                        ${email ? `
                        <td style="padding: 0 8px;">
                          <a href="mailto:${email}" style="display: inline-block; background-color: #ffffff; color: #8B0000; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-size: 13px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
                            ✉️ ${email}
                          </a>
                        </td>
                        ` : ''}
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ${address ? `<p style="margin: 15px 0 0; color: #888888; font-size: 12px; text-align: center;">📍 ${address}</p>` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 20px 30px; text-align: center;">
              <p style="margin: 0 0 10px; color: rgba(255,255,255,0.7); font-size: 12px; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
                © ${new Date().getFullYear()} ${showroomName} - ${showroomNameEn}
              </p>
              <p style="margin: 0 0 10px; color: rgba(255,255,255,0.5); font-size: 11px;">
                تم إرسال هذا البريد لأنك مشترك في النشرة البريدية
              </p>
              <p style="margin: 0;">
                <a href="https://lgyyvyhrzgksmxkgmhae.lovable.app/unsubscribe" style="color: #D4AF37; text-decoration: none; font-size: 11px; padding: 8px 16px; border: 1px solid #D4AF37; border-radius: 4px; display: inline-block;">إلغاء الاشتراك</a>
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Tracking Pixel (invisible) -->
        <img src="https://lgyyvyhrzgksmxkgmhae.lovable.app/api/track?id=${trackingId}" width="1" height="1" style="display: none; visibility: hidden;" alt="" />
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
