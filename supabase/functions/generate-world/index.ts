import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MARBLE_API_BASE = "https://api.worldlabs.ai/marble/v1";

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { bookId, prompt, sourceType, displayName, model, imageUrl, mediaAssetId } =
      await req.json();

    const WORLD_LABS_API_KEY = Deno.env.get("WORLD_LABS_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!WORLD_LABS_API_KEY) {
      console.log("No WORLD_LABS_API_KEY — running in demo mode");
      if (bookId) {
        await supabase
          .from("books")
          .update({
            world_id: `demo-${Date.now()}`,
            world_marble_url: null,
          })
          .eq("id", bookId);
      }
      return new Response(
        JSON.stringify({ success: true, demo: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the request body for Marble API
    let worldPrompt: Record<string, unknown>;

    if (sourceType === "image" && imageUrl) {
      worldPrompt = {
        type: "image",
        image_prompt: { source: "uri", uri: imageUrl },
        text_prompt: prompt || undefined,
      };
    } else if (sourceType === "image" && mediaAssetId) {
      worldPrompt = {
        type: "image",
        image_prompt: { source: "media_asset", media_asset_id: mediaAssetId },
        text_prompt: prompt || undefined,
      };
    } else {
      worldPrompt = {
        type: "text",
        text_prompt: prompt,
      };
    }

    const body = {
      display_name: displayName || prompt?.substring(0, 50) || "World",
      world_prompt: worldPrompt,
      model: model || "Marble 0.1-mini",
    };

    // Step 1: Start generation
    const genRes = await fetch(`${MARBLE_API_BASE}/worlds:generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "WLT-Api-Key": WORLD_LABS_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!genRes.ok) {
      const errText = await genRes.text();
      throw new Error(`Marble generation failed [${genRes.status}]: ${errText}`);
    }

    const operation = await genRes.json();
    const operationId = operation.operation_id;

    console.log(`Generation started, operation_id: ${operationId}`);

    // Step 2: Poll for completion (up to 7 minutes for plus model)
    const maxAttempts = 90;
    const pollInterval = 5000;
    let result = operation;

    for (let i = 0; i < maxAttempts; i++) {
      if (result.done) break;

      await new Promise((r) => setTimeout(r, pollInterval));

      const pollRes = await fetch(
        `${MARBLE_API_BASE}/operations/${operationId}`,
        {
          headers: { "WLT-Api-Key": WORLD_LABS_API_KEY },
        }
      );

      if (!pollRes.ok) {
        console.error(`Poll failed [${pollRes.status}]`);
        continue;
      }

      result = await pollRes.json();
      console.log(
        `Poll ${i + 1}: done=${result.done}, status=${result.metadata?.progress?.status}`
      );
    }

    if (!result.done) {
      throw new Error("World generation timed out after polling");
    }

    if (result.error) {
      throw new Error(`World generation error: ${JSON.stringify(result.error)}`);
    }

    const world = result.response;

    // Step 3: Update the book record with world data
    if (bookId) {
      await supabase
        .from("books")
        .update({
          world_id: world.id,
          world_marble_url: world.world_marble_url || null,
          thumbnail_url: world.assets?.thumbnail_url || null,
          pano_url: world.assets?.imagery?.pano_url || null,
          splat_url: world.assets?.splats?.spz_urls?.["500k"] || null,
        })
        .eq("id", bookId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        worldId: world.id,
        worldMarbleUrl: world.world_marble_url,
        thumbnail: world.assets?.thumbnail_url,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-world error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
