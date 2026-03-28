import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, BookOpen, Sparkles, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AddBookDialogProps {
  open: boolean;
  onClose: () => void;
  onBookAdded: () => void;
}

export default function AddBookDialog({ open, onClose, onBookAdded }: AddBookDialogProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [worldPrompt, setWorldPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to add a book");
      return;
    }
    if (!title.trim() || !author.trim() || !worldPrompt.trim()) {
      toast.error("Please fill in title, author, and world prompt");
      return;
    }

    setSubmitting(true);

    try {
      // Upload image if provided
      let imageUrl: string | undefined;
      if (imageFile) {
        const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("world-uploads")
          .upload(fileName, imageFile, { contentType: imageFile.type });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("world-uploads")
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      // Insert the book
      const { data: book, error: insertError } = await supabase
        .from("books")
        .insert({
          title: title.trim(),
          author: author.trim(),
          description: description.trim() || null,
          world_prompt: worldPrompt.trim(),
          user_id: user.id,
          is_active: true,
          cover_image_url: imageUrl || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success("Book added! Generating 360° world…");

      // Trigger world generation in the background
      const genPayload: Record<string, unknown> = {
        bookId: book.id,
        prompt: `Wide, zoomed-out aerial 360-degree panoramic view. ${worldPrompt.trim()}. Expansive scale, ultra-wide perspective to ensure all details remain sharp without pixelation.`,
        displayName: title.trim(),
        model: "Marble 0.1-mini",
        sourceType: imageUrl ? "image" : "text",
      };
      if (imageUrl) genPayload.imageUrl = imageUrl;

      supabase.functions.invoke("generate-world", { body: genPayload }).then(({ error }) => {
        if (error) {
          console.error("World generation error:", error);
          toast.error("World generation failed – you can retry later");
        } else {
          toast.success(`360° world for "${title}" is ready!`);
          onBookAdded(); // refresh list
        }
      });

      // Reset form and close
      setTitle("");
      setAuthor("");
      setDescription("");
      setWorldPrompt("");
      setImageFile(null);
      setImagePreview(null);
      onClose();
      onBookAdded();
    } catch (err: any) {
      console.error("Add book error:", err);
      toast.error(err.message || "Failed to add book");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="w-full max-w-lg bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/30">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">Add a Book</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs text-muted-foreground">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. The Great Gatsby"
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="author" className="text-xs text-muted-foreground">Author *</Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. F. Scott Fitzgerald"
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs text-muted-foreground">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief synopsis of the book…"
                  rows={2}
                  className="bg-background/50 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="worldPrompt" className="text-xs text-muted-foreground">
                  World Prompt * <span className="text-primary/70">— describe the 360° scene</span>
                </Label>
                <Textarea
                  id="worldPrompt"
                  value={worldPrompt}
                  onChange={(e) => setWorldPrompt(e.target.value)}
                  placeholder="e.g. A lavish 1920s Art Deco mansion with golden chandeliers, a grand ballroom overlooking Long Island Sound at sunset, with vintage cars parked in the driveway…"
                  rows={3}
                  className="bg-background/50 resize-none"
                />
              </div>

              {/* Image upload */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Reference Image <span className="text-primary/70">(optional — improves world quality)</span>
                </Label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border/60 bg-background/30 cursor-pointer hover:bg-background/50 transition-colors text-sm text-muted-foreground">
                    <Upload className="w-4 h-4" />
                    {imageFile ? imageFile.name : "Choose image…"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-border/40" />
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border/40 bg-muted/20 flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Add & Generate World
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
