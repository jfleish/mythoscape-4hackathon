import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import BookWorld from "@/components/library/BookWorld";
import AddBookDialog from "@/components/library/AddBookDialog";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const LIBRARY_MARBLE_URL =
  "https://marble.worldlabs.ai/viewer.html?splatUrl=https%3A%2F%2Fcdn.marble.worldlabs.ai%2Fffb39a1e-74c1-45d7-b8f9-40049a5d9d44%2F9c8eee69-8fcc-4f12-8e15-b82a3f10c70c_sand.spz&mobileUrl=https%3A%2F%2Fcdn.marble.worldlabs.ai%2Fffb39a1e-74c1-45d7-b8f9-40049a5d9d44%2F288067c7-82dc-484f-a7de-703923780192_sand_500k.spz&marbleWorldId=ffb39a1e-74c1-45d7-b8f9-40049a5d9d44";

// Generate hotspot positions dynamically across the scene
function getHotspotPositions(count: number) {
  const positions: { left: string; top: string; width: string; height: string }[] = [];
  const hotspotWidth = Math.min(12, 60 / Math.max(count, 1));
  const startLeft = 5;
  const endLeft = 95 - hotspotWidth;
  const spacing = count > 1 ? (endLeft - startLeft) / (count - 1) : 0;

  for (let i = 0; i < count; i++) {
    positions.push({
      left: `${startLeft + i * spacing}%`,
      top: "30%",
      width: `${hotspotWidth}%`,
      height: "35%",
    });
  }
  return positions;
}

interface Passage {
  id: number;
  title: string;
  text: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  dewey_label: string;
  world_marble_url: string | null;
  pano_url: string | null;
  thumbnail_url: string | null;
  passages: Passage[];
  audio_url: string | null;
}

export default function Library() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const fetchBooks = useCallback(async () => {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setBooks(
        data.map((b: any) => ({
          ...b,
          passages: Array.isArray(b.passages) ? b.passages : [],
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const selectedBook = books.find((b) => b.id === selectedBookId);
  const hotspots = getHotspotPositions(books.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
          <p className="text-muted-foreground font-display">Opening the library…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      <AnimatePresence mode="wait">
        {selectedBook ? (
          <motion.div
            key="book-world"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <BookWorld book={selectedBook} onBack={() => setSelectedBookId(null)} />
          </motion.div>
        ) : (
          <motion.div
            key="library"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full relative"
          >
            {/* Marble 3D Library World as background */}
            <iframe
              src={LIBRARY_MARBLE_URL}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; gyroscope; xr-spatial-tracking"
              title="Library 3D World"
              onLoad={() => setIframeLoaded(true)}
            />

            {/* Loading overlay */}
            <AnimatePresence>
              {!iframeLoaded && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 z-20 bg-black flex items-center justify-center"
                >
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
                    <p className="text-muted-foreground font-display">Entering the library…</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bookshelf hotspot overlays */}
            {iframeLoaded &&
              books.map((book, index) => {
                const pos = hotspots[index];
                const isHovered = hoveredIndex === index;
                const isGenerating = !book.world_marble_url && !book.pano_url;

                return (
                  <div
                    key={book.id}
                    className="absolute z-10 cursor-pointer"
                    style={{
                      left: pos.left,
                      top: pos.top,
                      width: pos.width,
                      height: pos.height,
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setSelectedBookId(book.id)}
                  >
                    {/* Invisible hover zone with visible border on hover */}
                    <motion.div
                      className="w-full h-full rounded-xl border-2 transition-colors duration-300 relative"
                      style={{
                        borderColor: isHovered
                          ? "hsl(var(--primary) / 0.7)"
                          : "transparent",
                        background: isHovered
                          ? "radial-gradient(ellipse at center, hsl(var(--primary) / 0.12) 0%, transparent 70%)"
                          : "transparent",
                      }}
                      animate={{
                        boxShadow: isHovered
                          ? "0 0 40px 8px hsl(var(--primary) / 0.3), inset 0 0 30px hsl(var(--primary) / 0.08)"
                          : "0 0 0px 0px transparent",
                      }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Hover tooltip */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-1/2 -translate-x-1/2 -bottom-2 translate-y-full pointer-events-none"
                        >
                          <div className="bg-black/85 backdrop-blur-lg border border-primary/40 rounded-xl px-4 py-3 min-w-[180px] text-center shadow-lg shadow-primary/10">
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                              <BookOpen className="w-3.5 h-3.5 text-primary" />
                              <h3 className="font-display font-semibold text-sm text-foreground whitespace-nowrap">
                                {book.title}
                              </h3>
                            </div>
                            <p className="text-xs text-muted-foreground">{book.author}</p>
                            {isGenerating ? (
                              <p className="text-[10px] text-primary/70 mt-1.5 uppercase tracking-wider flex items-center justify-center gap-1">
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                Generating world…
                              </p>
                            ) : (
                              <p className="text-[10px] text-primary/70 mt-1.5 uppercase tracking-wider">
                                Click to enter world →
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

            {/* Add Book button — top right corner */}
            {iframeLoaded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute top-4 right-4 z-20"
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAddDialogOpen(true)}
                  className="gap-1.5 bg-black/60 backdrop-blur-md border-primary/30 hover:bg-black/80 text-primary"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Book
                </Button>
              </motion.div>
            )}

            {/* Add Book Dialog */}
            <AddBookDialog
              open={addDialogOpen}
              onOpenChange={setAddDialogOpen}
              onBookAdded={fetchBooks}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
