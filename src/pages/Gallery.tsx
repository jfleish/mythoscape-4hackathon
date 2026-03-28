import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Globe, Share2, ExternalLink, Clock, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type World = Tables<"worlds">;

const Gallery = () => {
  const { user } = useAuth();
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchWorlds = async () => {
      const { data, error } = await supabase
        .from("worlds")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load worlds");
      } else {
        setWorlds(data || []);
      }
      setLoading(false);
    };
    fetchWorlds();
  }, [user]);

  const toggleShare = async (world: World) => {
    try {
      if (world.is_public) {
        await supabase
          .from("worlds")
          .update({ is_public: false, share_token: null })
          .eq("id", world.id);
        setWorlds((prev) =>
          prev.map((w) => (w.id === world.id ? { ...w, is_public: false, share_token: null } : w))
        );
        toast.success("World is now private");
      } else {
        const token = crypto.randomUUID().slice(0, 12);
        await supabase
          .from("worlds")
          .update({ is_public: true, share_token: token })
          .eq("id", world.id);
        setWorlds((prev) =>
          prev.map((w) => (w.id === world.id ? { ...w, is_public: true, share_token: token } : w))
        );
        toast.success("World is now shareable!");
      }
    } catch {
      toast.error("Failed to update sharing");
    }
  };

  const copyShareLink = (world: World) => {
    const link = `${window.location.origin}/world/${world.share_token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(world.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Link copied!");
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: "bg-primary/20 text-primary",
      processing: "bg-secondary/20 text-secondary",
      pending: "bg-muted text-muted-foreground",
      failed: "bg-destructive/20 text-destructive",
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold gradient-text">Your Worlds</h1>
          <p className="text-muted-foreground mt-1">{worlds.length} world{worlds.length !== 1 ? "s" : ""} created</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card h-64 animate-pulse" />
            ))}
          </div>
        ) : worlds.length === 0 ? (
          <div className="text-center py-20">
            <Globe className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4 animate-float" />
            <p className="text-muted-foreground font-display text-lg">No worlds yet</p>
            <p className="text-muted-foreground text-sm mt-1">Go to Create to manifest your first world</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {worlds.map((world, i) => (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card-hover overflow-hidden group"
              >
                {/* Thumbnail / preview */}
                <div className="h-40 bg-muted/30 relative overflow-hidden">
                  {world.thumbnail_url ? (
                    <img src={world.thumbnail_url} alt={world.prompt} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Globe className="w-12 h-12 text-muted-foreground/20" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">{statusBadge(world.status)}</div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-sm text-foreground line-clamp-2 font-medium">{world.prompt}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {format(new Date(world.created_at), "MMM d, yyyy")}
                  </div>
                  <div className="flex gap-2">
                    {world.scene_url && (
                      <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
                        <a href={world.scene_url} target="_blank" rel="noreferrer">
                          <ExternalLink className="w-3 h-3" /> View
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => toggleShare(world)}
                    >
                      <Share2 className="w-3 h-3" />
                      {world.is_public ? "Unshare" : "Share"}
                    </Button>
                    {world.is_public && world.share_token && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => copyShareLink(world)}
                      >
                        {copiedId === world.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        Copy Link
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Gallery;
