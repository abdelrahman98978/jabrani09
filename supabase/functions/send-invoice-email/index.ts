import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceEmailRequest {
  invoice_id: string;
  language?: "ar" | "en";
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoice_id, language = "ar" }: InvoiceEmailRequest = await req.json();
    const isRTL = language === "ar";

    console.log("Processing invoice email request:", { invoice_id, language });

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch invoice with related data
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        *,
        orders(
          order_number,
          total_amount,
          payment_method,
          payment_status,
          cars(name, name_ar, model, year)
        ),
        customers(name, email, phone)
      `)
      .eq("id", invoice_id)
      .single();

    if (invoiceError || !invoice) {
      console.error("Invoice not found:", invoiceError);
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const customerEmail = invoice.customers?.email;
    if (!customerEmail) {
      console.error("Customer email not found");
      return new Response(
        JSON.stringify({ error: "Customer email not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch showroom settings
    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .single();

    const showroomName = isRTL 
      ? (settings?.showroom_name || "معرض السيارات")
      : (settings?.showroom_name_en || "Car Showroom");
    const showroomPhone = settings?.phone || "";
    const showroomEmail = settings?.email || "";

    // Format amounts
    const amount = Number(invoice.amount || 0);
    const taxAmount = Number(invoice.tax_amount || 0);
    const totalAmount = Number(invoice.total_amount || 0);

    const carName = isRTL 
      ? (invoice.orders?.cars?.name_ar || invoice.orders?.cars?.name || "سيارة")
      : (invoice.orders?.cars?.name || "Car");

    const paymentMethodLabels: Record<string, { ar: string; en: string }> = {
      bank_transfer: { ar: "تحويل بنكي", en: "Bank Transfer" },
      cash: { ar: "نقداً", en: "Cash" },
      credit_card: { ar: "بطاقة ائتمان", en: "Credit Card" },
      financing: { ar: "تمويل", en: "Financing" },
    };

    const paymentMethod = invoice.orders?.payment_method || "cash";
    const paymentMethodLabel = isRTL 
      ? paymentMethodLabels[paymentMethod]?.ar || paymentMethod
      : paymentMethodLabels[paymentMethod]?.en || paymentMethod;

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${isRTL ? 'ar' : 'en'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f4f4f4; direction: ${isRTL ? 'rtl' : 'ltr'}; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 10px 0 0; opacity: 0.9; }
    .content { padding: 30px; }
    .invoice-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .invoice-info h2 { margin: 0 0 15px; font-size: 18px; color: #1e40af; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; font-size: 14px; }
    .info-value { font-weight: 600; color: #1e293b; }
    .car-section { background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .car-section h3 { margin: 0 0 10px; color: #92400e; }
    .totals { background: #1e40af; color: white; padding: 20px; border-radius: 8px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .total-row.grand { font-size: 20px; font-weight: bold; border-top: 2px solid rgba(255,255,255,0.3); padding-top: 15px; margin-top: 10px; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
    .footer p { margin: 5px 0; }
    .btn { display: inline-block; padding: 12px 30px; background: #1e40af; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${showroomName}</h1>
      <p>${isRTL ? 'فاتورة رقم' : 'Invoice'}: ${invoice.invoice_number}</p>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; color: #374151;">
        ${isRTL ? `مرحباً ${invoice.customers?.name || 'عميلنا العزيز'}،` : `Hello ${invoice.customers?.name || 'Valued Customer'},`}
      </p>
      <p style="color: #6b7280;">
        ${isRTL 
          ? 'نشكركم على ثقتكم بنا. يرجى الاطلاع على تفاصيل فاتورتكم أدناه.'
          : 'Thank you for your trust. Please find your invoice details below.'}
      </p>
      
      <div class="invoice-info">
        <h2>${isRTL ? 'معلومات الفاتورة' : 'Invoice Information'}</h2>
        <div class="info-row">
          <span class="info-label">${isRTL ? 'رقم الفاتورة' : 'Invoice Number'}</span>
          <span class="info-value">${invoice.invoice_number}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${isRTL ? 'رقم الطلب' : 'Order Number'}</span>
          <span class="info-value">${invoice.orders?.order_number || '-'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${isRTL ? 'التاريخ' : 'Date'}</span>
          <span class="info-value">${new Date(invoice.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${isRTL ? 'طريقة الدفع' : 'Payment Method'}</span>
          <span class="info-value">${paymentMethodLabel}</span>
        </div>
      </div>
      
      <div class="car-section">
        <h3>🚗 ${isRTL ? 'تفاصيل السيارة' : 'Car Details'}</h3>
        <p style="margin: 5px 0; font-weight: 600;">${carName}</p>
        <p style="margin: 5px 0; color: #92400e;">
          ${invoice.orders?.cars?.model || ''} ${invoice.orders?.cars?.year || ''}
        </p>
      </div>
      
      <div class="totals">
        <div class="total-row">
          <span>${isRTL ? 'المبلغ' : 'Amount'}</span>
          <span>${amount.toLocaleString()} ${isRTL ? 'ر.س' : 'SAR'}</span>
        </div>
        <div class="total-row">
          <span>${isRTL ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)'}</span>
          <span>${taxAmount.toLocaleString()} ${isRTL ? 'ر.س' : 'SAR'}</span>
        </div>
        <div class="total-row grand">
          <span>${isRTL ? 'الإجمالي' : 'Total'}</span>
          <span>${totalAmount.toLocaleString()} ${isRTL ? 'ر.س' : 'SAR'}</span>
        </div>
      </div>
      
      ${settings?.bank_name ? `
      <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; border-right: 4px solid #1e40af;">
        <h4 style="margin: 0 0 10px; color: #1e40af;">${isRTL ? 'معلومات التحويل البنكي' : 'Bank Transfer Details'}</h4>
        <p style="margin: 5px 0; font-size: 14px; color: #374151;">
          ${isRTL ? 'البنك' : 'Bank'}: ${isRTL ? settings.bank_name : (settings.bank_name_en || settings.bank_name)}
        </p>
        ${settings.bank_account_name ? `<p style="margin: 5px 0; font-size: 14px; color: #374151;">${isRTL ? 'صاحب الحساب' : 'Account Holder'}: ${settings.bank_account_name}</p>` : ''}
        ${settings.bank_iban ? `<p style="margin: 5px 0; font-size: 14px; color: #374151;">IBAN: ${settings.bank_iban}</p>` : ''}
      </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <p><strong>${showroomName}</strong></p>
      ${showroomPhone ? `<p>📞 ${showroomPhone}</p>` : ''}
      ${showroomEmail ? `<p>✉️ ${showroomEmail}</p>` : ''}
      <p style="margin-top: 15px;">
        ${isRTL 
          ? 'شكراً لتعاملكم معنا. نتطلع لخدمتكم دائماً.'
          : 'Thank you for your business. We look forward to serving you again.'}
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: `${showroomName} <onboarding@resend.dev>`,
      to: [customerEmail],
      subject: isRTL 
        ? `فاتورة رقم ${invoice.invoice_number} - ${showroomName}`
        : `Invoice ${invoice.invoice_number} - ${showroomName}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    // Update invoice status to 'sent'
    await supabase
      .from("invoices")
      .update({ status: "sent" })
      .eq("id", invoice_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: isRTL ? "تم إرسال الفاتورة بنجاح" : "Invoice sent successfully",
        email_id: emailResponse.data?.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-invoice-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
