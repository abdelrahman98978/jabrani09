import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  order_id: string;
  new_status: string;
}

const statusTranslations: Record<string, { ar: string; en: string }> = {
  new: { ar: "جديد", en: "New" },
  processing: { ar: "قيد المعالجة", en: "Processing" },
  reserved: { ar: "محجوز", en: "Reserved" },
  completed: { ar: "مكتمل", en: "Completed" },
  cancelled: { ar: "ملغى", en: "Cancelled" },
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-whatsapp-notification function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { order_id, new_status }: Payload = await req.json();

    if (!order_id || !new_status) {
      console.error("Missing order_id or new_status");
      return new Response(
        JSON.stringify({ error: "Missing order_id or new_status" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch order details with customer and car info
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, customers(name, phone, whatsapp), cars(name_ar)")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get customer phone number
    const customerPhone = order.customers?.whatsapp || order.customers?.phone;
    if (!customerPhone) {
      console.error("No phone number found for customer");
      return new Response(
        JSON.stringify({ error: "No phone number for customer" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get showroom settings
    const { data: settings } = await supabase
      .from("settings")
      .select("showroom_name, phone, whatsapp")
      .limit(1)
      .single();

    const showroomName = settings?.showroom_name || "معرض الجبراني";
    const showroomPhone = settings?.whatsapp || settings?.phone || "";

    // Build WhatsApp message
    const statusAr = statusTranslations[new_status]?.ar || new_status;
    const statusEn = statusTranslations[new_status]?.en || new_status;
    const carName = order.cars?.name_ar || "";
    const orderNumber = order.order_number || "";

    const message = `
🚗 ${showroomName}

مرحباً ${order.customers?.name || "عزيزي العميل"},

تم تحديث حالة طلبك رقم: ${orderNumber}
السيارة: ${carName}
الحالة الجديدة: ${statusAr} (${statusEn})

${new_status === 'completed' ? '🎉 تهانينا! تم اكتمال طلبك.' : ''}
${new_status === 'reserved' ? '✅ تم حجز السيارة لك.' : ''}
${new_status === 'processing' ? '⏳ جاري معالجة طلبك.' : ''}
${new_status === 'cancelled' ? '❌ تم إلغاء الطلب. للاستفسار تواصل معنا.' : ''}

للتواصل معنا: ${showroomPhone}

شكراً لثقتكم بنا 🙏
    `.trim();

    // Format phone number for WhatsApp
    let formattedPhone = customerPhone.replace(/[\s\-\(\)]/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "966" + formattedPhone.slice(1);
    }
    if (!formattedPhone.startsWith("+") && !formattedPhone.startsWith("966")) {
      formattedPhone = "966" + formattedPhone;
    }

    // Generate WhatsApp link
    const whatsappLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    console.log("WhatsApp notification prepared successfully");
    console.log("WhatsApp Link:", whatsappLink);

    return new Response(
      JSON.stringify({
        success: true,
        whatsapp_link: whatsappLink,
        message: message,
        phone: formattedPhone,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-whatsapp-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
