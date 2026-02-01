import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Please log in to use the AI assistant' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messages, language = 'ar' } = await req.json();
    
    // Input validation
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Limit message count and length
    const MAX_MESSAGES = 20;
    const MAX_MESSAGE_LENGTH = 2000;
    const validatedMessages = messages.slice(-MAX_MESSAGES).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: typeof msg.content === 'string' ? msg.content.slice(0, MAX_MESSAGE_LENGTH) : '',
    }));

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompts: Record<string, string> = {
      ar: `أنت مساعد ذكي في معرض سيارات فاخر. مهمتك مساعدة العملاء في:
- اختيار السيارة المناسبة لاحتياجاتهم وميزانيتهم
- تقديم معلومات عن الماركات والموديلات المتاحة
- الإجابة عن أسئلة حول مواصفات السيارات
- تقديم نصائح حول الصيانة والعناية بالسيارة
كن ودوداً ومحترفاً، وقدم إجابات موجزة ومفيدة.`,
      en: `You are a smart assistant at a luxury car showroom. Your task is to help customers:
- Choose the right car for their needs and budget
- Provide information about available brands and models
- Answer questions about car specifications
- Provide maintenance and car care tips
Be friendly and professional, and provide concise and helpful answers.`,
      fr: `Vous êtes un assistant intelligent dans un showroom de voitures de luxe. Votre mission est d'aider les clients à:
- Choisir la voiture adaptée à leurs besoins et budget
- Fournir des informations sur les marques et modèles disponibles
- Répondre aux questions sur les spécifications des voitures
- Donner des conseils d'entretien
Soyez amical et professionnel, et fournissez des réponses concises et utiles.`,
      de: `Sie sind ein intelligenter Assistent in einem Luxus-Autohaus. Ihre Aufgabe ist es, Kunden zu helfen bei:
- Auswahl des richtigen Autos für ihre Bedürfnisse und Budget
- Informationen über verfügbare Marken und Modelle
- Beantwortung von Fragen zu Fahrzeugspezifikationen
- Wartungs- und Pflegetipps
Seien Sie freundlich und professionell und geben Sie prägnante und hilfreiche Antworten.`,
    };

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompts[language] || systemPrompts.ar },
          ...validatedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const text = await response.text();
      console.error('AI gateway error:', response.status, text);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
