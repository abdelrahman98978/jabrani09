import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { prompt, style, size, language } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build enhanced prompt based on style
    const stylePrompts: Record<string, string> = {
      luxury: "luxurious, premium, gold accents, elegant, high-end, sophisticated lighting, black and gold color scheme",
      modern: "modern, minimalist, clean lines, sleek design, contemporary, white and blue tones",
      classic: "classic, timeless, warm colors, vintage feel, traditional elegance, brown and cream tones",
      sporty: "dynamic, energetic, bold colors, racing vibes, red and black, speed motion blur",
      professional: "professional, corporate, trustworthy, clean, business-like, navy and silver",
    };

    const sizeAspects: Record<string, string> = {
      square: "square format, 1:1 aspect ratio",
      wide: "wide banner format, 16:9 aspect ratio, panoramic",
      tall: "tall format, 9:16 aspect ratio, vertical banner",
    };

    const languageContext = language === "ar" 
      ? "for Arabic/Middle Eastern car showroom market" 
      : "for international car showroom market";

    const enhancedPrompt = `Create a professional car showroom marketing banner image. ${prompt}. 
Style: ${stylePrompts[style] || stylePrompts.luxury}. 
Format: ${sizeAspects[size] || sizeAspects.wide}. 
Context: ${languageContext}.
Requirements: High quality, photorealistic, suitable for website hero banner or marketing materials, no text overlays, luxury automotive dealership aesthetic, professional photography style. Ultra high resolution.`;

    console.log("Generating banner with prompt:", enhancedPrompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: enhancedPrompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI Gateway response received");

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("No image generated");
    }

    return new Response(
      JSON.stringify({ 
        imageBase64: imageUrl,
        message: data.choices?.[0]?.message?.content || "Banner generated successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating banner:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate banner" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
