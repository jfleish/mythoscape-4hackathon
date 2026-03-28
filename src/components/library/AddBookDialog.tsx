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
const HARDCODED_IMAGE_URL =
  "https://khoahgmxayiajxnenzlv.supabase.co/storage/v1/object/public/world-uploads/beowulf-reference.jpg";
const HARDCODED_PROMPT =
  "A dramatic wide zoomed-out aerial 360 panoramic view of Beowulf battling a fire-breathing dragon in a dark mountainous cave, epic fantasy scene with flames and smoke, ancient Norse mythology";
const HARDCODED_WORLD_PROMPT =
  "Beowulf battles a fire-breathing dragon in a dark mountainous cave";

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
          user_id: null,
          is_active: true,
        })
        .select("id")
        .single();

      if (error) throw error;

      toast.success("Book added! Generating 360° world…");
      onBookIdCreated?.(book.id);
      onOpenChange(false);
      setTitle("");
      setAuthor("");
      setScene("");
      onBookAdded();

      // Fire-and-forget: trigger world generation
      supabase.functions.invoke("generate-world", {
        body: {
          bookId: book.id,
          sourceType: "image",
          imageUrl: HARDCODED_IMAGE_URL,
          prompt: HARDCODED_PROMPT,
          displayName: HARDCODED_TITLE,
          model: "Marble 0.1-mini",
        },
      }).then(({ error: fnError }) => {
        if (fnError) {
          console.error("World generation failed:", fnError);
          toast.error("World generation failed — you can still view the book");
        }
      });
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
