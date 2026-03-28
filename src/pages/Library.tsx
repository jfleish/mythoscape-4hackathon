import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import BookWorld from "@/components/library/BookWorld";
import AddBookDialog from "@/components/library/AddBookDialog";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const LIBRARY_MARBLE_URL =
  "https://marble.worldlabs.ai/viewer.html?splatUrl=https%3A%2F%2Fcdn.marble.worldlabs.ai%2Fffb39a1e-74c1-45d7-b8f9-40049a5d9d44%2F9c8eee69-8fcc-4f12-8e15-b82a3f10c70c_sand.spz&mobileUrl=https%3A%2F%2Fcdn.marble.worldlabs.ai%2Fffb39a1e-74c1-45d7-b8f9-40049a5d9d44%2F288067c7-82dc-484f-a7de-703923780192_sand_500k.spz&marbleWorldId=ffb39a1e-74c1-45d7-b8f9-40049a5d9d44";

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
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const fetchBooks = useCallback(async () => {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

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

            {/* Book shelf overlay at the bottom */}
            {iframeLoaded && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute bottom-0 left-0 right-0 z-10 p-4"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="bg-black/70 backdrop-blur-lg border border-border/30 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        Library Collection
                      </h2>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAddDialogOpen(true)}
                        className="gap-1.5 bg-primary/10 border-primary/30 hover:bg-primary/20 text-primary"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Book
                      </Button>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                      {books.map((book) => {
                        const isGenerating = !book.world_marble_url && !book.pano_url;
                        return (
                          <motion.button
                            key={book.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedBookId(book.id)}
                            className="flex-shrink-0 w-40 bg-background/40 border border-border/30 rounded-xl p-3 text-left hover:border-primary/50 transition-colors group"
                          >
                            {/* Thumbnail or placeholder */}
                            <div className="w-full h-20 rounded-lg mb-2 overflow-hidden bg-muted/20 flex items-center justify-center">
                              {book.thumbnail_url ? (
                                <img
                                  src={book.thumbnail_url}
                                  alt={book.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : isGenerating ? (
                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                              ) : (
                                <BookOpen className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <h3 className="font-display text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {book.title}
                            </h3>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {book.author}
                            </p>
                            {isGenerating && (
                              <p className="text-[9px] text-primary/70 mt-1 uppercase tracking-wider">
                                Generating…
                              </p>
                            )}
                          </motion.button>
                        );
                      })}

                      {books.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 px-2">
                          No books yet. Add one to get started!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
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
