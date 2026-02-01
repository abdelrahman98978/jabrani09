import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 1x1 transparent GIF pixel
const TRANSPARENT_GIF = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
  0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
  0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
  0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
]);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const campaignId = url.searchParams.get("cid");
    const email = url.searchParams.get("email");

    console.log(`Tracking email open: campaign=${campaignId}, email=${email}`);

    if (campaignId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Update campaign open count
      const { data: campaign, error: fetchError } = await supabase
        .from("email_campaigns")
        .select("total_opened")
        .eq("id", campaignId)
        .single();

      if (!fetchError && campaign) {
        const { error: updateError } = await supabase
          .from("email_campaigns")
          .update({ total_opened: (campaign.total_opened || 0) + 1 })
          .eq("id", campaignId);

        if (updateError) {
          console.error("Error updating campaign open count:", updateError);
        } else {
          console.log(`Successfully tracked open for campaign ${campaignId}`);
        }
      }

      // Log the open event
      try {
        await supabase.from("email_tracking_logs").insert({
          campaign_id: campaignId,
          email: email || "unknown",
          event_type: "open",
          user_agent: req.headers.get("user-agent") || "unknown",
          ip_address: req.headers.get("x-forwarded-for") || "unknown",
        });
      } catch (logError) {
        // Silently fail if tracking_logs table doesn't exist
        console.log("Could not log tracking event:", logError);
      }
    }

    // Return transparent GIF pixel
    return new Response(TRANSPARENT_GIF, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in track-email-open:", error);
    
    // Still return the pixel even on error
    return new Response(TRANSPARENT_GIF, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        ...corsHeaders,
      },
    });
  }
};

serve(handler);
