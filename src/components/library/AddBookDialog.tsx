import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const HARDCODED_TITLE = "Beowulf";
const HARDCODED_AUTHOR = "Anonymous";
const HARDCODED_WORLD_PROMPT =
  "Beowulf battles a fire-breathing dragon in a dark mountainous cave";
const BEOWULF_WORLD_ID = "28cfee07-d04c-4564-966c-02b943f512de";
const HARDCODED_WORLD_MARBLE_URL =
  `https://marble.worldlabs.ai/viewer.html?splatUrl=${encodeURIComponent("https://cdn.marble.worldlabs.ai/" + BEOWULF_WORLD_ID + "/4a548821-c633-47a4-a787-2d49b5511af9_sand.spz")}&mobileUrl=${encodeURIComponent("https://cdn.marble.worldlabs.ai/" + BEOWULF_WORLD_ID + "/744348b1-6e63-4fe8-910c-b3442d87f456_sand_500k.spz")}&marbleWorldId=${BEOWULF_WORLD_ID}`;
const HARDCODED_THUMBNAIL_URL =
  "https://cdn.marble.worldlabs.ai/28cfee07-d04c-4564-966c-02b943f512de/fca4f423-ea8b-4fa3-8510-311792e26953_sand_mpi/thumbnail.webp";
const HARDCODED_PANO_URL =
  "https://cdn.marble.worldlabs.ai/28cfee07-d04c-4564-966c-02b943f512de/73a95597-8512-417d-aa0d-044117f9fb90_pano/rgb_0.png";
const HARDCODED_SPLAT_URL =
  "https://cdn.marble.worldlabs.ai/28cfee07-d04c-4564-966c-02b943f512de/744348b1-6e63-4fe8-910c-b3442d87f456_sand_500k.spz";

interface AddBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookAdded: () => void;
  onBookIdCreated?: (id: string) => void;
}

export default function AddBookDialog({ open, onOpenChange, onBookAdded, onBookIdCreated }: AddBookDialogProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [scene, setScene] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Insert book with hardcoded values (user input is ignored)
      const { data: book, error } = await supabase
        .from("books")
        .insert({
          title: HARDCODED_TITLE,
          author: HARDCODED_AUTHOR,
          world_prompt: HARDCODED_WORLD_PROMPT,
          world_marble_url: HARDCODED_WORLD_MARBLE_URL,
          world_id: BEOWULF_WORLD_ID,
          thumbnail_url: HARDCODED_THUMBNAIL_URL,
          pano_url: HARDCODED_PANO_URL,
          splat_url: HARDCODED_SPLAT_URL,
          user_id: null,
          is_active: true,
        })
        .select("id")
        .single();

      if (error) throw error;

      toast.success("Book added!");
      onBookIdCreated?.(book.id);
      onOpenChange(false);
      setTitle("");
      setAuthor("");
      setScene("");
      onBookAdded();
    } catch (err: any) {
      console.error("Failed to add book:", err);
      toast.error("Failed to add book");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/95 border-primary/20 backdrop-blur-xl max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">Add a Book</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new book to the library with an immersive 360° world.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Title</label>
            <Input
              placeholder="Enter a title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background/50 border-border/50"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Author</label>
            <Input
              placeholder="Enter the author…"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="bg-background/50 border-border/50"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Scene</label>
            <Textarea
              placeholder="Describe the scene…"
              value={scene}
              onChange={(e) => setScene(e.target.value)}
              className="bg-background/50 border-border/50 min-h-[80px]"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Book
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
