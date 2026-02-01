import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Processing scheduled campaigns...");

    // Find campaigns that are scheduled and due to be sent
    const now = new Date().toISOString();
    const { data: scheduledCampaigns, error: fetchError } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_at", now);

    if (fetchError) {
      console.error("Error fetching scheduled campaigns:", fetchError);
      throw fetchError;
    }

    if (!scheduledCampaigns || scheduledCampaigns.length === 0) {
      console.log("No scheduled campaigns to process");
      return new Response(
        JSON.stringify({ success: true, message: "No campaigns to process", processed: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${scheduledCampaigns.length} campaigns to process`);

    let processedCount = 0;
    let errorCount = 0;

    for (const campaign of scheduledCampaigns) {
      try {
        console.log(`Processing campaign: ${campaign.id} - ${campaign.name}`);

        // Invoke the send-campaign-email function
        const { data: sendResult, error: sendError } = await supabase.functions.invoke(
          "send-campaign-email",
          {
            body: { campaignId: campaign.id },
          }
        );

        if (sendError) {
          console.error(`Error sending campaign ${campaign.id}:`, sendError);
          errorCount++;
          
          // Update campaign status to failed
          await supabase
            .from("email_campaigns")
            .update({ status: "failed" })
            .eq("id", campaign.id);
        } else if (sendResult?.success) {
          console.log(`Successfully sent campaign ${campaign.id}`);
          processedCount++;
        } else {
          console.error(`Campaign ${campaign.id} send failed:`, sendResult?.error);
          errorCount++;
          
          await supabase
            .from("email_campaigns")
            .update({ status: "failed" })
            .eq("id", campaign.id);
        }
      } catch (campaignError) {
        console.error(`Error processing campaign ${campaign.id}:`, campaignError);
        errorCount++;
      }
    }

    const summary = {
      success: true,
      message: `Processed ${processedCount} campaigns successfully, ${errorCount} failed`,
      processed: processedCount,
      failed: errorCount,
      total: scheduledCampaigns.length,
    };

    console.log("Processing complete:", summary);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in process-scheduled-campaigns:", error);
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
