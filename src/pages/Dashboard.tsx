import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import GenerationPanel from "@/components/GenerationPanel";
import WorldViewer from "@/components/WorldViewer";
import ChatPanel from "@/components/ChatPanel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type World = Tables<"worlds">;

const Dashboard = () => {
  const { user } = useAuth();
  const [activeWorld, setActiveWorld] = useState<World | null>(null);

  // Poll for world status updates
  useEffect(() => {
    if (!activeWorld || activeWorld.status === "completed" || activeWorld.status === "failed") return;

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("worlds")
        .select("*")
        .eq("id", activeWorld.id)
        .single();

      if (data && data.status !== activeWorld.status) {
        setActiveWorld(data);
        if (data.status === "completed") {
          toast.success("Your world is ready!");
        } else if (data.status === "failed") {
          toast.error("World generation failed.");
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeWorld]);

  const handleRefinement = async (newPrompt: string) => {
    if (!activeWorld || !user) return;

    try {
      const { data: world, error: dbError } = await supabase
        .from("worlds")
        .insert({
          user_id: user.id,
          prompt: newPrompt,
          source_type: "text",
          status: "processing",
        })
        .select()
        .single();

      if (dbError) throw dbError;

      const { error: fnError } = await supabase.functions.invoke("generate-world", {
        body: { worldId: world.id, prompt: newPrompt, sourceType: "text" },
      });

      if (fnError) throw fnError;

      setActiveWorld(world);
      toast.success("Refinement started!");
    } catch (err: any) {
      toast.error(err.message || "Refinement failed");
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-57px)]">
        {/* Left: Generation + Chat */}
        <div className="w-full lg:w-[380px] flex flex-col border-r border-border overflow-hidden">
          <div className="overflow-y-auto p-4">
            <GenerationPanel onWorldCreated={setActiveWorld} />
          </div>
          <div className="flex-1 min-h-0 border-t border-border">
            <ChatPanel
              worldPrompt={activeWorld?.prompt || ""}
              onRefinement={handleRefinement}
            />
          </div>
        </div>

        {/* Right: World Viewer */}
        <div className="flex-1 p-4 min-h-[400px]">
          <div className="glass-card w-full h-full overflow-hidden">
            <WorldViewer
              sceneUrl={activeWorld?.scene_url || null}
              status={activeWorld?.status || "idle"}
              prompt={activeWorld?.prompt || ""}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
