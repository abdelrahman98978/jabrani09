import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateEmailRequest {
  mode?: 'suggest_titles' | 'simple_template' | 'professional_template' | 'legacy';
  campaignType?: string;
  targetAudience?: string;
  language?: string;
  customPrompt?: string;
  topic?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: GenerateEmailRequest = await req.json();
    const { mode = 'legacy', campaignType, targetAudience, language = 'ar', customPrompt, topic } = requestData;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch site settings for personalization
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select("showroom_name, showroom_name_en, phone, whatsapp, address, address_ar, email")
      .limit(1)
      .maybeSingle();

    const showroomNameAr = settings?.showroom_name || "الجبراني للسيارات";
    const showroomNameEn = settings?.showroom_name_en || "AL JABRANI CARS";
    const phone = settings?.phone || "";
    const whatsapp = settings?.whatsapp || "";
    const addressAr = settings?.address_ar || "";
    const addressEn = settings?.address || "";
    const email = settings?.email || "";

    const isArabic = language === "ar";
    const showroomName = isArabic ? showroomNameAr : showroomNameEn;

    console.log(`Generating email content - mode: ${mode}, type: ${campaignType}, language: ${language}`);

    let systemPrompt = '';
    let userMessage = '';

    // NEW MODE: Suggest Titles
    if (mode === 'suggest_titles') {
      systemPrompt = isArabic
        ? `أنت خبير تسويق بالبريد الإلكتروني لمعرض "${showroomNameAr}".
           قم بإنشاء 5 عناوين بريد إلكتروني جذابة ومقنعة.
           العناوين يجب أن تكون قصيرة (أقل من 60 حرف) ومؤثرة.
           أجب بصيغة JSON فقط: {"titles": ["عنوان 1", "عنوان 2", "عنوان 3", "عنوان 4", "عنوان 5"]}`
        : `You are an email marketing expert for "${showroomNameEn}".
           Generate 5 catchy and persuasive email subject lines.
           Subjects should be short (under 60 characters) and impactful.
           Respond in JSON only: {"titles": ["title 1", "title 2", "title 3", "title 4", "title 5"]}`;

      userMessage = isArabic
        ? `الموضوع: ${topic || campaignType || 'عرض ترويجي للسيارات'}
           نوع الحملة: ${campaignType || 'ترويجي'}
           الجمهور المستهدف: ${targetAudience || 'جميع العملاء'}`
        : `Topic: ${topic || campaignType || 'Car promotional offer'}
           Campaign type: ${campaignType || 'promotional'}
           Target audience: ${targetAudience || 'all customers'}`;

    // NEW MODE: Simple Template
    } else if (mode === 'simple_template') {
      systemPrompt = isArabic
        ? `أنت خبير تسويق لمعرض "${showroomNameAr}".
           أنشئ محتوى بريد إلكتروني بسيط ومباشر بدون HTML معقد.
           المحتوى يجب أن يكون نص عادي مع فقرات واضحة.
           تضمين معلومات التواصل: ${phone} | ${whatsapp}
           أجب بصيغة JSON: {"subject": "عنوان البريد", "content": "محتوى نصي بسيط"}`
        : `You are a marketing expert for "${showroomNameEn}".
           Create simple, direct email content without complex HTML.
           Content should be plain text with clear paragraphs.
           Include contact info: ${phone} | ${whatsapp}
           Respond in JSON: {"subject": "Email subject", "content": "Simple text content"}`;

      userMessage = isArabic
        ? `أنشئ بريد إلكتروني بسيط عن: ${topic || 'عرض خاص على السيارات'}
           نوع الحملة: ${campaignType || 'ترويجي'}
           الجمهور: ${targetAudience || 'جميع العملاء'}
           ${customPrompt ? `ملاحظات إضافية: ${customPrompt}` : ''}`
        : `Create a simple email about: ${topic || 'special car offer'}
           Campaign type: ${campaignType || 'promotional'}
           Audience: ${targetAudience || 'all customers'}
           ${customPrompt ? `Additional notes: ${customPrompt}` : ''}`;

    // NEW MODE: Professional Template with HTML
    } else if (mode === 'professional_template') {
      systemPrompt = isArabic
        ? `أنت خبير تصميم بريد إلكتروني احترافي لمعرض "${showroomNameAr}".
           
           معلومات المعرض:
           - الاسم العربي: ${showroomNameAr}
           - الاسم الإنجليزي: ${showroomNameEn}
           - الهاتف: ${phone}
           - واتساب: ${whatsapp}
           - البريد: ${email}
           - العنوان: ${addressAr}
           
           أنشئ محتوى بريد إلكتروني تسويقي احترافي وجذاب.
           
           المتطلبات:
           1. اكتب عنوان بريد قصير وجذاب (أقل من 60 حرف)
           2. اكتب محتوى نصي منظم ومقنع يتضمن:
              - تحية ترحيبية
              - العرض أو الرسالة الرئيسية مع تفاصيل مغرية
              - مميزات أو فوائد واضحة
              - دعوة قوية لاتخاذ إجراء
           3. استخدم إيموجي مناسبة لجذب الانتباه 🚗 ✨ 💎
           4. اجعل المحتوى مختصراً ومؤثراً
           
           أجب بصيغة JSON فقط:
           {"subject": "عنوان البريد", "content": "محتوى البريد النصي"}`
        : `You are a professional email marketing expert for "${showroomNameEn}".
           
           Showroom info:
           - Arabic Name: ${showroomNameAr}
           - English Name: ${showroomNameEn}
           - Phone: ${phone}
           - WhatsApp: ${whatsapp}
           - Email: ${email}
           - Address: ${addressEn}
           
           Create professional and engaging email marketing content.
           
           Requirements:
           1. Write a short, catchy subject line (under 60 characters)
           2. Write organized, persuasive text content including:
              - Welcome greeting
              - Main offer or message with enticing details
              - Clear features or benefits
              - Strong call to action
           3. Use appropriate emojis to grab attention 🚗 ✨ 💎
           4. Keep content concise and impactful
           
           Respond in JSON only:
           {"subject": "Email subject", "content": "Email text content"}`;

      userMessage = isArabic
        ? `أنشئ محتوى بريد إلكتروني احترافي عن: ${topic || 'عرض مميز على السيارات الفاخرة'}
           نوع الحملة: ${campaignType || 'ترويجي'}
           الجمهور المستهدف: ${targetAudience || 'جميع العملاء'}
           ${customPrompt ? `تعليمات إضافية: ${customPrompt}` : ''}`
        : `Create professional email content about: ${topic || 'special offer on luxury cars'}
           Campaign type: ${campaignType || 'promotional'}
           Target audience: ${targetAudience || 'all customers'}
           ${customPrompt ? `Additional instructions: ${customPrompt}` : ''}`;

    // LEGACY MODE: Original functionality for backward compatibility
    } else {
      const campaignPrompts: Record<string, { ar: string; en: string }> = {
        new_arrivals: {
          ar: "اكتب رسالة بريد إلكتروني للإعلان عن وصول سيارات جديدة فاخرة للمعرض",
          en: "Write an email announcing new luxury car arrivals at the showroom"
        },
        promotions: {
          ar: "اكتب رسالة بريد إلكتروني للإعلان عن عروض وخصومات حصرية على السيارات",
          en: "Write an email announcing exclusive car promotions and discounts"
        },
        promotional: {
          ar: "اكتب رسالة بريد إلكتروني ترويجية جذابة للسيارات",
          en: "Write an engaging promotional email for cars"
        },
        seasonal: {
          ar: "اكتب رسالة بريد إلكتروني للعروض الموسمية والمناسبات الخاصة",
          en: "Write a seasonal promotional email for special occasions"
        },
        test_drive: {
          ar: "اكتب رسالة بريد إلكتروني لدعوة العملاء لتجربة قيادة السيارات الجديدة",
          en: "Write an email inviting customers for a test drive of new cars"
        },
        loyalty: {
          ar: "اكتب رسالة بريد إلكتروني لبرنامج الولاء ومكافآت العملاء المميزين",
          en: "Write an email about the loyalty program and VIP customer rewards"
        },
        reminder: {
          ar: "اكتب رسالة تذكير للعملاء",
          en: "Write a customer reminder email"
        },
        newsletter: {
          ar: "اكتب نشرة إخبارية شهرية للمعرض",
          en: "Write a monthly newsletter for the showroom"
        },
        custom: {
          ar: customPrompt || "اكتب رسالة تسويقية جذابة",
          en: customPrompt || "Write an engaging marketing email"
        }
      };

      const audienceContext: Record<string, { ar: string; en: string }> = {
        all: { ar: "جميع العملاء", en: "all customers" },
        new: { ar: "العملاء الجدد", en: "new customers" },
        vip: { ar: "العملاء المميزين VIP", en: "VIP customers" },
        inactive: { ar: "العملاء غير النشطين", en: "inactive customers" },
        active: { ar: "العملاء النشطين", en: "active customers" }
      };

      systemPrompt = isArabic 
        ? `أنت خبير تسويق محترف متخصص في كتابة رسائل البريد الإلكتروني التسويقية لـ "${showroomNameAr}".
           معلومات المعرض:
           - الاسم: ${showroomNameAr}
           - الهاتف: ${phone}
           - واتساب: ${whatsapp}
           - العنوان: ${addressAr}
           
           يجب أن تكون الرسائل:
           - جذابة ومحترفة
           - تتضمن عنوان مؤثر
           - تحتوي على محتوى مقنع
           - تذكر اسم المعرض في المحتوى
           - تنتهي بدعوة لاتخاذ إجراء واضحة مع معلومات التواصل
           قم بالرد بصيغة JSON فقط بالشكل التالي:
           {"subject": "عنوان الرسالة", "content": "محتوى الرسالة"}`
        : `You are a professional marketing expert specializing in writing marketing emails for "${showroomNameEn}".
           Showroom information:
           - Name: ${showroomNameEn}
           - Phone: ${phone}
           - WhatsApp: ${whatsapp}
           - Address: ${addressEn}
           
           Emails should be:
           - Engaging and professional
           - Include an impactful subject line
           - Contain persuasive content
           - Mention the showroom name in the content
           - End with a clear call to action with contact information
           Reply only in JSON format:
           {"subject": "Email subject", "content": "Email content"}`;

      const prompt = campaignPrompts[campaignType || 'custom'] || campaignPrompts.custom;
      const audience = audienceContext[targetAudience || 'all'] || audienceContext.all;
      
      userMessage = isArabic
        ? `${prompt.ar}. الجمهور المستهدف: ${audience.ar}. اجعل الرسالة مناسبة لـ "${showroomNameAr}". أجب بصيغة JSON فقط.`
        : `${prompt.en}. Target audience: ${audience.en}. Make it suitable for "${showroomNameEn}". Reply only in JSON format.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: isArabic ? "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً" : "Rate limit exceeded, please try again later." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: isArabic ? "يرجى إضافة رصيد للمتابعة" : "Payment required, please add credits." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("AI response received, length:", content?.length);

    // Parse JSON from response
    let result: any;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch =
        content.match(/```json\s*([\s\S]*?)\s*```/) ||
        content.match(/```\s*([\s\S]*?)\s*```/) ||
        content.match(/\{[\s\S]*\}/);

      let jsonStr = content;
      if (jsonMatch) {
        jsonStr = jsonMatch[1] || jsonMatch[0];
      }

      // Clean up the JSON string
      jsonStr = jsonStr.trim();
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/```json?\s*/g, "").replace(/```\s*$/g, "");
      }

      result = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", e);
      // Fallback based on mode
      if (mode === 'suggest_titles') {
        result = { 
          titles: [
            isArabic ? "عرض حصري على السيارات الفاخرة" : "Exclusive Offer on Luxury Cars",
            isArabic ? "اكتشف سياراتنا الجديدة" : "Discover Our New Cars",
            isArabic ? "خصومات لا تُفوت هذا الأسبوع" : "Don't Miss This Week's Discounts",
            isArabic ? "تجربة قيادة مجانية بانتظارك" : "Free Test Drive Awaits You",
            isArabic ? "عروض نهاية الموسم" : "End of Season Offers"
          ] 
        };
      } else {
        result = {
          subject: isArabic ? "عرض خاص من " + showroomNameAr : "Special Offer from " + showroomNameEn,
          content: content?.replace(/```json?\s*/g, "").replace(/```\s*$/g, "").trim() || 
                   (isArabic ? "محتوى البريد الإلكتروني" : "Email content")
        };
      }
    }

    // For suggest_titles mode, return titles array
    if (mode === 'suggest_titles') {
      return new Response(JSON.stringify({
        success: true,
        titles: result.titles || []
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For other modes, return subject and content
    return new Response(JSON.stringify({
      success: true,
      data: {
        subject: result.subject || (isArabic ? "عرض خاص" : "Special Offer"),
        content: result.content || ""
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error generating email content:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "حدث خطأ أثناء التوليد",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
