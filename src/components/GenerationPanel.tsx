import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Type, ImagePlus, Wand2, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface GenerationPanelProps {
  onWorldCreated: (world: any) => void;
}

const GenerationPanel = ({ onWorldCreated }: GenerationPanelProps) => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePrompt, setImagePrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFromText = async () => {
    if (!prompt.trim() || !user) return;
    setLoading(true);

    try {
      // Create world record
      const { data: world, error: dbError } = await supabase
        .from("worlds")
        .insert({ user_id: user.id, prompt, source_type: "text", status: "processing" })
        .select()
        .single();

      if (dbError) throw dbError;

      // Call edge function to generate via World Labs
      const { error: fnError } = await supabase.functions.invoke("generate-world", {
        body: { worldId: world.id, prompt, sourceType: "text" },
      });

      if (fnError) throw fnError;

      toast.success("World generation started!");
      onWorldCreated(world);
      setPrompt("");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate world");
    } finally {
      setLoading(false);
    }
  };

  const generateFromImage = async () => {
    if (!selectedFile || !user) return;
    setLoading(true);

    try {
      // Upload image to storage
      const filePath = `${user.id}/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("world-uploads")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Create media asset record
      const { data: asset, error: assetError } = await supabase
        .from("media_assets")
        .insert({ user_id: user.id, file_name: selectedFile.name, kind: "image", upload_status: "uploaded" })
        .select()
        .single();

      if (assetError) throw assetError;

      // Create world record
      const worldPrompt = imagePrompt || `World generated from image: ${selectedFile.name}`;
      const { data: world, error: dbError } = await supabase
        .from("worlds")
        .insert({
          user_id: user.id,
          prompt: worldPrompt,
          source_type: "image",
          media_asset_id: asset.id,
          status: "processing",
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Call edge function
      const { error: fnError } = await supabase.functions.invoke("generate-world", {
        body: {
          worldId: world.id,
          prompt: worldPrompt,
          sourceType: "image",
          mediaAssetId: asset.id,
          storagePath: filePath,
        },
      });

      if (fnError) throw fnError;

      toast.success("World generation from image started!");
      onWorldCreated(world);
      setSelectedFile(null);
      setImagePrompt("");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate world");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <Tabs defaultValue="text">
        <TabsList className="grid grid-cols-2 w-full bg-muted/50">
          <TabsTrigger value="text" className="gap-2 font-display">
            <Type className="w-4 h-4" /> Text Prompt
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-2 font-display">
            <ImagePlus className="w-4 h-4" /> Image Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-4 space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your world… e.g. 'A floating island with crystal waterfalls and bioluminescent trees'"
            className="bg-input border-border min-h-[120px] resize-none"
          />
          <Button
            variant="glow"
            className="w-full gap-2"
            onClick={generateFromText}
            disabled={loading || !prompt.trim()}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {loading ? "Manifesting…" : "Manifest World"}
          </Button>
        </TabsContent>

        <TabsContent value="image" className="mt-4 space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            {selectedFile ? (
              <div className="space-y-2">
                <ImagePlus className="w-8 h-8 text-primary mx-auto" />
                <p className="text-sm text-foreground">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">Click to change</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Drop an image or click to upload</p>
              </div>
            )}
          </div>
          <Textarea
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            placeholder="Optional: describe modifications for the image-based world…"
            className="bg-input border-border min-h-[80px] resize-none"
          />
          <Button
            variant="glow"
            className="w-full gap-2"
            onClick={generateFromImage}
            disabled={loading || !selectedFile}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {loading ? "Manifesting…" : "Manifest from Image"}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GenerationPanel;
