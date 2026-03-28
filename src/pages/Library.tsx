import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BookWorld from "@/components/library/BookWorld";
import AddBookDialog from "@/components/library/AddBookDialog";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, BookOpen, Plus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedShelfIndex, setSelectedShelfIndex] = useState(0);

  const fetchBooks = useCallback(async () => {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("is_active", true);

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

  // Paginate books into groups of 3 for the shelf display
  const totalPages = Math.ceil(books.length / 3);
  const visibleBooks = books.slice(selectedShelfIndex * 3, selectedShelfIndex * 3 + 3);

  // Hotspot positions
  const HOTSPOT_POSITIONS = [
    { left: "18%", top: "35%", width: "14%", height: "30%" },
    { left: "43%", top: "30%", width: "14%", height: "35%" },
    { left: "72%", top: "35%", width: "14%", height: "30%" },
  ];

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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

            {/* Top bar: Add Book + Auth */}
            {iframeLoaded && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute top-4 right-4 z-30 flex items-center gap-2"
              >
                {user ? (
                  <Button
                    onClick={() => setShowAddDialog(true)}
                    size="sm"
                    className="gap-2 bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20"
                  >
                    <Plus className="w-4 h-4" />
                    Add Book
                  </Button>
                ) : (
                  <Link to="/auth">
                    <Button size="sm" variant="outline" className="gap-2 bg-background/80 backdrop-blur-sm">
                      <LogIn className="w-4 h-4" />
                      Sign in to add books
                    </Button>
                  </Link>
                )}
              </motion.div>
            )}

            {/* Bookshelf hotspot overlays */}
            {iframeLoaded &&
              visibleBooks.map((book, index) => {
                const pos = HOTSPOT_POSITIONS[index];
                const isHovered = hoveredIndex === index;

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
                    <motion.div
                      className="w-full h-full rounded-xl border-2 transition-colors duration-300 relative"
                      style={{
                        borderColor: isHovered ? "hsl(var(--primary) / 0.7)" : "transparent",
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
                            {!book.world_marble_url && (
                              <p className="text-[10px] text-amber-400/80 mt-1">⏳ World generating…</p>
                            )}
                            <p className="text-[10px] text-primary/70 mt-1.5 uppercase tracking-wider">
                              Click to enter world →
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

            {/* Shelf pagination (if more than 3 books) */}
            {iframeLoaded && totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3"
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedShelfIndex === 0}
                  onClick={() => setSelectedShelfIndex((i) => Math.max(0, i - 1))}
                  className="bg-black/70 backdrop-blur-sm border-border/40 text-foreground"
                >
                  ← Prev
                </Button>
                <span className="text-xs text-muted-foreground font-display">
                  {selectedShelfIndex + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedShelfIndex >= totalPages - 1}
                  onClick={() => setSelectedShelfIndex((i) => Math.min(totalPages - 1, i + 1))}
                  className="bg-black/70 backdrop-blur-sm border-border/40 text-foreground"
                >
                  Next →
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Book Dialog */}
      <AddBookDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onBookAdded={fetchBooks}
      />
    </div>
  );
}
