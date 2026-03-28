import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import WorldViewer from "@/components/WorldViewer";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const SharedWorld = () => {
  const { token } = useParams<{ token: string }>();
  const [world, setWorld] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!token) { setNotFound(true); setLoading(false); return; }

      const { data, error } = await supabase
        .from("worlds")
        .select("*")
        .eq("share_token", token)
        .eq("is_public", true)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setWorld(data);
      }
      setLoading(false);
    };
    fetch();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-display">Loading world…</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground font-display text-lg">World not found or is private</p>
        <Link to="/">
          <Button variant="glow" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Go Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-display font-bold gradient-text">Mind to Manifest</span>
        </div>
        <p className="text-sm text-muted-foreground truncate max-w-md">{world.prompt}</p>
      </header>
      <div className="flex-1 p-4">
        <div className="glass-card w-full h-full min-h-[70vh]">
          <WorldViewer sceneUrl={world.scene_url} status={world.status} prompt={world.prompt} />
        </div>
      </div>
    </div>
  );
};

export default SharedWorld;
