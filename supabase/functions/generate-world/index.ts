import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { worldId, prompt, sourceType, mediaAssetId, storagePath } = await req.json();
    const WORLD_LABS_API_KEY = Deno.env.get("WORLD_LABS_API_KEY");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!WORLD_LABS_API_KEY) {
      // If no API key, simulate for development
      console.log("No WORLD_LABS_API_KEY set — running in demo mode");

      // Simulate a delay then mark as completed with a placeholder
      await supabase
        .from("worlds")
        .update({
          status: "completed",
          world_labs_id: `demo-${Date.now()}`,
          scene_url: null, // No real scene in demo mode
        })
        .eq("id", worldId);

      return new Response(JSON.stringify({ success: true, demo: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: Record<string, unknown>;

    if (sourceType === "image" && storagePath) {
      // Step 1: Prepare upload via World Labs
      const prepareRes = await fetch("https://api.worldlabs.ai/v1/media-assets:prepare_upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WORLD_LABS_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ kind: "image" }),
      });

      if (!prepareRes.ok) {
        const errText = await prepareRes.text();
        throw new Error(`World Labs prepare_upload failed: ${errText}`);
      }

      const prepareData = await prepareRes.json();
      const { upload_url, id: assetId } = prepareData;

      // Download image from Supabase storage
      const { data: fileData, error: downloadErr } = await supabase.storage
        .from("world-uploads")
        .download(storagePath);

      if (downloadErr) throw new Error(`Failed to download file: ${downloadErr.message}`);

      // Upload to World Labs
      const uploadRes = await fetch(upload_url, {
        method: "PUT",
        body: fileData,
        headers: { "Content-Type": "application/octet-stream" },
      });

      if (!uploadRes.ok) throw new Error("Failed to upload to World Labs");

      // Update media asset with World Labs ID
      if (mediaAssetId) {
        await supabase
          .from("media_assets")
          .update({ worldlabs_asset_id: assetId, upload_status: "completed" })
          .eq("id", mediaAssetId);
      }

      body = { type: "image", image_asset_id: assetId, prompt };
    } else {
      body = { type: "text", prompt };
    }

    // Generate world
    const genRes = await fetch("https://api.worldlabs.ai/v1/worlds:generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WORLD_LABS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!genRes.ok) {
      const errText = await genRes.text();
      await supabase.from("worlds").update({ status: "failed" }).eq("id", worldId);
      throw new Error(`World Labs generation failed: ${errText}`);
    }

    const genData = await genRes.json();

    await supabase
      .from("worlds")
      .update({
        status: genData.status === "completed" ? "completed" : "processing",
        world_labs_id: genData.id,
        scene_url: genData.scene_url || null,
      })
      .eq("id", worldId);

    return new Response(JSON.stringify({ success: true, worldLabsId: genData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-world error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
